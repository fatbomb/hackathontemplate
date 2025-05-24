'use client';

import { useRouter } from 'next/navigation';
import { Lock, MapPin, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GameLevel {
  id: number;
  name: string;
  unlocked: boolean;
  link: string;
}

// interface Points {
//   points: number;
//   level: number;
// }

export default function WorldMap({ levels }: { levels: GameLevel[][] }) {
  const router = useRouter();

  return (
    <div className="space-y-8 mx-auto py-8 container">
      {/* Game Levels */}
      <div className="space-y-12">
        {levels.map((games, levelIdx) => (
          <div key={levelIdx} className="relative">
            <div className="flex items-center mb-6">
              <div className="flex justify-center items-center bg-primary shadow-md rounded-full w-12 h-12 font-bold text-primary-foreground">
                {levelIdx + 1}
              </div>
              <h2 className="ml-3 font-bold text-2xl">Level {levelIdx + 1}</h2>
            </div>
            
            {/* Connection line between levels */}
            {levelIdx < levels.length - 1 && (
              <div className="top-12 bottom-0 left-6 z-0 absolute bg-gradient-to-b from-primary to-transparent -mb-8 w-0.5"></div>
            )}
            
            <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 ml-10">
              {games.map((game) => (
                <Card
                  key={game.id}
                  className={cn(
                    "transition-all cursor-pointer select-none w-full overflow-hidden shadow-md hover:shadow-xl",
                    game.unlocked
                      ? "border-accent hover:border-accent/80 border-2"
                      : "bg-muted border-border opacity-75 pointer-events-none"
                  )}
                  onClick={() => game.unlocked && router.push(game.link)}
                >
                  <CardHeader className={cn(
                    "flex flex-col items-center py-6",
                    game.unlocked ? "bg-accent/20" : "bg-muted"
                  )}>
                    <div className={cn(
                      "rounded-full p-3 mb-3",
                      game.unlocked ? "bg-accent/30" : "bg-muted-foreground/20"
                    )}>
                      <MapPin className={cn(
                        "h-6 w-6",
                        game.unlocked ? "text-accent-foreground" : "text-muted-foreground"
                      )} />
                    </div>
                    <CardTitle className="font-semibold text-base">{game.name}</CardTitle>
                  </CardHeader>
                  <CardContent className={cn(
                    "flex justify-center text-sm text-center py-4",
                    game.unlocked ? "text-accent-foreground" : "text-muted-foreground"
                  )}>
                    {game.unlocked ? <Play /> : <Lock />}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
