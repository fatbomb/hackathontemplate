"use client";

import { useRef, useState, useEffect } from "react";
import { Volume2, VolumeOff, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";

export default function ReadOut({
  content,
  language,
}: {
  content: string;
  language: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioCache = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!content || !language) return;

    let isCancelled = false;
    setLoading(true);

    async function loadAudio() {
      if (audioCache.current[language]) {
        const cachedURL = audioCache.current[language];
        if (!isCancelled) {
          setAudioURL(cachedURL);
          if (audioRef.current) {
            audioRef.current.src = cachedURL;
            audioRef.current.volume = volume;
          }
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch("/api/narrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: content, language }),
        });

        if (!res.ok) throw new Error("Failed to get audio");

        const blob = await res.blob();
        if (isCancelled) return;

        const url = URL.createObjectURL(blob);

        // Cache it and revoke old if needed
        if (audioCache.current[language]) {
          URL.revokeObjectURL(audioCache.current[language]);
        }

        audioCache.current[language] = url;
        setAudioURL(url);

        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.volume = volume;
        }
      } catch (err) {
        if (!isCancelled) alert("Error loading audio");
        console.log(err)
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadAudio();

    return () => {
      isCancelled = true;
    };
  }, [content, language]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => setProgress(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.onended = () => setIsReading(false);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.onended = null;
    };
  }, []);

  const handleReadOut = () => {
    if (!audioRef.current || loading || !audioURL) return;

    if (!audioRef.current.paused) {
      audioRef.current.pause();
      setIsReading(false);
    } else {
      audioRef.current.play();
      setIsReading(true);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
    }
  };

  const handleVolume = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <div className="flex items-center justify-center border border-muted-foreground">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex gap-2">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isReading ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeOff className="w-4 h-4" />
            )}
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="p-2 w-64" align="end">
          <Card className="w-full">
            <CardContent className="flex flex-col gap-4 p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">Audio Progress</span>
                <span className="text-muted-foreground text-xs">
                  {Math.floor(progress)} / {Math.floor(duration)}s
                </span>
              </div>

              <Slider
                min={0}
                max={duration}
                value={[progress]}
                onValueChange={handleSeek}
              />

              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">Volume</span>
                <span className="text-muted-foreground text-xs">
                  {(volume * 100).toFixed(0)}%
                </span>
              </div>

              <Slider
                min={0}
                max={1}
                step={0.01}
                value={[volume]}
                onValueChange={handleVolume}
              />

              <Button onClick={handleReadOut} disabled={loading || !audioURL}>
                {loading ? "Loading..." : isReading ? "Pause" : "Play"}
              </Button>
            </CardContent>
          </Card>
        </DropdownMenuContent>
      </DropdownMenu>

      <audio ref={audioRef} hidden />
    </div>
  );
}
