"use client";

import React, { useEffect, useState } from "react";
import { ContentCard } from "./ContentCard";
import ReadOut from "./ReadOut";
import { Button } from "@/components/ui/button";

export default function ReadableContentCard({ contentEn, contentBn, textEn, textBn }: { contentEn: React.ReactNode, contentBn: React.ReactNode, textEn: string, textBn: string }) {
  const [language, setLanguage] = useState("en-US");
  const [content, setContent] = useState<React.ReactNode>(contentEn);
  const [text, setText] = useState<string>(textEn);

  useEffect(() => {
    if (language === "en-US") {
      setContent(contentEn);
      setText(textEn);
    } else {
      setContent(contentBn);
      setText(textBn);
    }
  }, [language]);

  return (
    <div className="flex flex-col gap-6 mx-6 my-3 w-full">
      <div className="flex items-center justify-between w-full">
        <div></div>
        <div className="flex items-center gap-2 w-full">
          <Button onClick={() => setLanguage(language === "en-US" ? "bn-BD" : "en-US")}>
            {language === "en-US" ? "en" : "bn"}
          </Button>          
          <ReadOut content={text} language={language} />
        </div>
      </div>
      <ContentCard content={content} language={language} />
    </div>
  );
}
