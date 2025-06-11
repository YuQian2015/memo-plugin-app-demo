import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TbChevronLeft, TbChevronRight, TbListDetails, TbX } from "react-icons/tb";
import { Button } from "@/components/ui/button";

interface WordInfo {
  word: string;
  count: number;
  phonetic?: string;
  meaning?: string;
  partOfSpeech?: string;
  derivatives?: {
    en: string;
    zh: string;
  }[];
  examples?: {
    en: string;
    zh: string;
  }[];
  mnemonics?: string;
  collocations?: {
    en: string;
    zh: string;
  }[];
  timestamps: { startTime: string; endTime: string; text: string }[];
  level?: string;
  category?: string;
}

interface FlashcardModeProps {
  words: WordInfo[];
  onExit: () => void;
  onSelectWord: (word: WordInfo) => void;
}

export function FlashcardMode({ words, onExit, onSelectWord }: FlashcardModeProps) {
  const { t } = useTranslation();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // 翻转卡片
  const flipCard = () => {
    setIsCardFlipped(!isCardFlipped);
  };

  // 下一张卡片
  const nextCard = () => {
    if (currentCardIndex < words.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsCardFlipped(false);
    }
  };

  // 上一张卡片
  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsCardFlipped(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b shrink-0">
        <h3 className="font-semibold">{t("单词卡片模式") || ""} ({currentCardIndex + 1}/{words.length})</h3>
        <Button variant="ghost" size="icon" onClick={onExit}>
          <TbX className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        {words.length > 0 && (
          <div
            className="relative w-full max-w-md aspect-[4/3] cursor-pointer"
            onClick={flipCard}
            style={{ perspective: "1000px" }}
          >
            <div
              className={`w-full h-full shadow-xl rounded-xl border-2 transition-all duration-500`}
              style={{
                transformStyle: "preserve-3d",
                transform: isCardFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
              }}
            >
              {/* 卡片正面 - 单词 */}
              <div
                className="absolute w-full h-full bg-card rounded-xl flex flex-col items-center justify-center p-6"
                style={{ backfaceVisibility: "hidden" }}
              >
                <h2 className="text-4xl font-bold mb-6">{words[currentCardIndex].word}</h2>
                {words[currentCardIndex].phonetic && (
                  <div className="text-xl text-muted-foreground">{words[currentCardIndex].phonetic}</div>
                )}
                <div className="mt-auto text-sm text-muted-foreground">
                  {t("点击卡片查看详情") || ""}
                </div>
              </div>

              {/* 卡片背面 - 释义和记忆技巧 */}
              <div
                className="absolute w-full h-full bg-card rounded-xl flex flex-col items-center p-6"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <div className="self-start w-full">
                  <h3 className="text-lg font-semibold mb-2">{t("释义") || ""}</h3>
                  <p className="text-md mb-4">{words[currentCardIndex].meaning || t("暂无释义") || ""}</p>

                  {words[currentCardIndex]?.mnemonics && (
                    <>
                      <h3 className="text-lg font-semibold mb-2">{t("记忆技巧") || ""}</h3>
                      <p className="text-sm">{words[currentCardIndex]?.mnemonics}</p>
                    </>
                  )}
                </div>

                <div className="mt-auto self-start w-full">
                  {words[currentCardIndex]?.examples &&
                    words[currentCardIndex].examples.length > 0 && (
                      <>
                        <h3 className="text-lg font-semibold mb-1">{t("示例") || ""}</h3>
                        <p className="text-sm italic">{words[currentCardIndex].examples[0].en}</p>
                        <p className="text-sm text-muted-foreground">{words[currentCardIndex].examples[0].zh}</p>
                      </>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center p-4 border-t shrink-0">
        <Button
          variant="outline"
          onClick={prevCard}
          disabled={currentCardIndex === 0}
          className="w-24"
        >
          <TbChevronLeft className="mr-1" /> {t("上一个") || ""}
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            onExit();
            onSelectWord(words[currentCardIndex]);
          }}
          className="gap-1"
        >
          <TbListDetails className="h-4 w-4" />
          {t("查看详情") || ""}
        </Button>

        <Button
          variant="outline"
          onClick={nextCard}
          disabled={currentCardIndex >= words.length - 1}
          className="w-24"
        >
          {t("下一个") || ""} <TbChevronRight className="ml-1" />
        </Button>
      </div>
    </div>
  );
} 