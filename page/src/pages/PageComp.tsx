// @ts-nocheck

import axios from "axios";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { TbLoader2, TbSearch, TbVolume, TbCards, TbChevronLeft, TbChevronRight, TbPlayerPlay, TbChevronDown, TbChevronUp, TbList, TbPlayerPause, TbRepeat, TbRepeatOnce, TbX } from "react-icons/tb";
import { jsonrepair } from 'jsonrepair';

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// @ts-ignore
import { JsonOutputParser } from "@langchain/core/output_parsers";

import manifest from "../../../main/manifest.json";
import { convertToSeconds } from "@/lib/time";
import { FlashcardMode } from "../components/FlashcardMode";

interface PageCompProps {
  currentFile: any;
}

// 单词信息接口
interface WordInfo {
  word: string;
  count: number;
  phonetic?: string; // 音标
  meaning?: string; // 释义
  partOfSpeech?: string; // 词性
  derivatives?: {
    en: string;
    zh: string;
  }[]; // 衍生词
  examples?: {
    en: string;
    zh: string;
  }[]; // 例句
  mnemonics?: string; // 记忆技巧
  collocations?: {
    en: string;
    zh: string;
  }[]; // 常用搭配
  timestamps: { startTime: string; endTime: string; text: string }[]; // 关联的字幕时间戳
  level?: string; // 词汇等级
  category?: string; // 词汇类别
}

// type PolishStyle = "professional" | "casual" | "academic";

// 添加高亮样式组件
const HighlightedWord = ({ word, className = "" }: { word: string, className?: string }) => {
  return (
    <span className={`relative inline-block ${className}`}>
      {word}
      <span className="absolute bottom-[0.1em] left-0 right-0 h-[0.5em] bg-primary/60 -rotate-1" />
    </span>
  );
};

function generateUUID(): string {
  let d = performance.now();
  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);

      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    },
  );

  return uuid;
}

function PageComp({ currentFile }: PageCompProps) {
  const settings = {
    language: "zh",
  }
  const [chatProvider, setChatProvider] = useState<Array<{
    value: string,
    label: string,
    disabled?: boolean
  }>>([]);
  const [llmModels, setLlmModels] = useState<Array<{
    value: string,
    label: string,
    disabled?: boolean
  }>>([]);
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<string>("");
  const { t } = useTranslation();
  const [searchWord, setSearchWord] = useState(""); // 单词搜索
  const [selectedWord, setSelectedWord] = useState<WordInfo | null>(null); // 选中的单词
  const [isLoadingPhonetic, setIsLoadingPhonetic] = useState(false); // 加载音标状态
  const [isFlashcardMode, setIsFlashcardMode] = useState(false); // 卡片模式
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isWordListExpanded, setIsWordListExpanded] = useState(true);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isFollowMode, setIsFollowMode] = useState(false);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [wordsInfo, setWordsInfo] = useState({});
  const [recommendedWords, setRecommendedWords] = useState<WordInfo[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysisUUID, setCurrentAnalysisUUID] = useState<string | null>(null);
  const [isAllWordsExpanded, setIsAllWordsExpanded] = useState(true);
  const [isRecommendedExpanded, setIsRecommendedExpanded] = useState(true);
  const [accumulatedText, setAccumulatedText] = useState<string>("");
  const [showModelGuide, setShowModelGuide] = useState(false);

  const options = chatProvider.filter((item) =>
    settings.language === "zh"
      ? true
      : item.value !== "Ernie" &&
      item.value !== "ZhipuAI",
  );
  const transcriptText = currentFile?.convertResult?.map((item: any) => item.text).join("\n") || "";
  useEffect(() => {
    window.AIM.chat.getProviders().then((providers) => {
      setChatProvider(providers)
    });

    window.AIM.storage.getItem("data", manifest.pluginId).then((res: any) => {
      if (res?.text) {
        setIsGenerating(false);
        setGeneratedText(res.text);
      }
    })
  }, []);

  useEffect(() => {
    if (provider) {
      window.AIM.chat.getModels(provider as any).then((models) => {
        if (models.length > 0) {
          setLlmModels(models);
        } else {
          setLlmModels([]);
        }
      }
      ).catch((err) => {
        console.error(err);
      });
    }
  }, [provider]);

  useEffect(() => {
    const currentSummary = options.find((item) => item.value === provider);
    if (!currentSummary) {
      setProvider(options[0]?.value || "");
    }
  }, [setProvider, provider, options]);

  useEffect(() => {
    const m = llmModels.find((item) => item.value === model);
    if (!m) {
      setModel(llmModels[0]?.value || "");
    }
  }, [llmModels, model]);

  useEffect(() => {
    // @ts-ignore
    function handleConvertProgress(e: any, data: any) {

      const parser = new JsonOutputParser();
      if (data.type === "llm:chat:stream:start") {
        setGeneratedText(data.data.text);
      }
      if (data.type === "llm:chat:stream:message") {
        setGeneratedText((prev) => {
          const accumulatedData = prev + data.data.text
          parser.parsePartialResult([{ text: accumulatedData }]).then((result) => {
            if (result) {
              setSelectedWord((word) => {
                if (word) {
                  word.mnemonics = result.mnemonics || word.mnemonics
                  word.derivatives = result.derivatives || word.derivatives
                  word.examples = result.examples || word.examples
                  word.collocations = result.collocations || word.collocations
                }
                return word
              });
            }
          });
          return accumulatedData
        });
      }
      if (data.type === "llm:chat:stream:completed") {
        setIsGenerating(false);
        setGeneratedText(data.data.text);

        window.AIM.storage.setItem("data", {
          text: data.data.text
        }, manifest.pluginId).then((res: any) => {
          console.log(res);
        })
      }
    }
    window.AIM.handleMessage(handleConvertProgress, "AppPlugins");

    return () => {
      window.AIM.removeHandler("AppPlugins");
    };
  }, []);

  // 修改自动滚动效果
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [generatedText]);

  // 从字幕中提取单词并计算频率
  const extractWords = useMemo(() => {
    if (!currentFile?.convertResult) return [];

    // 定义排除的常见词和标点符号
    const commonWords = new Set(['the', 'and', 'a', 'to', 'of', 'in', 'that', 'is', 'it', 'for', 'i', 'you', 'are', 'on', 'with', 'as', 'this', 'be', 'at', 'by', 'was', 'have', 'or', 'from', 'an', 'they', 'we', 'but']);
    // @ts-ignore
    // const punctuation = /[.,\/#!$%\^&\*;:{}=\-_`~()?\[\]""]/g;
    const punctuation = /[.,/#!$%^&*;:{}=\-_`~()?[\]""]/g;

    const wordMap = new Map<string, WordInfo>();

    currentFile.convertResult.forEach((item: any) => {
      // 清理文本，转为小写，移除标点符号
      const text = item.text.toLowerCase().replace(punctuation, '');

      // 分割成单词并去重
      const uniqueWords = new Set<string>(text.split(/\s+/).filter((word: string) =>
        word.length > 1 && // 排除单个字符
        !commonWords.has(word) && // 排除常见词
        !/^\d+$/.test(word) // 排除纯数字
      ));

      // 统计单词在不同句子中出现的次数
      uniqueWords.forEach((word: string) => {
        if (wordMap.has(word)) {
          const wordInfo = wordMap.get(word)!;
          wordInfo.count += 1;
          wordInfo.timestamps.push({
            startTime: item.st || "00:00:00",
            endTime: item.et || "00:00:00",
            text: item.text
          });
        } else {
          wordMap.set(word, {
            word,
            count: 1,
            timestamps: [{
              startTime: item.st || "00:00:00",
              endTime: item.et || "00:00:00",
              text: item.text
            }]
          });
        }
      });
    });

    // 转换为数组并按出现频率排序
    return Array.from(wordMap.values())
      .sort((a, b) => b.count - a.count);
  }, [currentFile?.convertResult]);

  // 根据搜索词过滤单词列表
  const filteredWords = useMemo(() => {
    if (!searchWord) return extractWords;
    return extractWords.filter(item =>
      item.word.toLowerCase().includes(searchWord.toLowerCase())
    );
  }, [extractWords, searchWord]);

  // 根据搜索词过滤AI推荐的词汇
  const filteredRecommendedWords = useMemo(() => {
    if (!searchWord) return recommendedWords;
    return recommendedWords.filter(item =>
      item.word.toLowerCase().includes(searchWord.toLowerCase())
    );
  }, [recommendedWords, searchWord]);

  // 获取单词音标和释义
  const fetchWordDetails = async (word: string) => {
    setIsLoadingPhonetic(true);
    try {
      // 使用免费的词典API
      const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const data = response.data[0];

      if (data) {
        const phonetic = data.phonetic || (data.phonetics.length > 0 ? data.phonetics[0].text : '');
        const partOfSpeech = data.meanings.length > 0 ? data.meanings[0].partOfSpeech : '';
        const meaning = data.meanings.length > 0
          ? `${partOfSpeech}: ${data.meanings[0].definitions[0].definition}`
          : '';

        return {
          phonetic,
          meaning,
          partOfSpeech
        };
      }
    } catch (error) {
      console.error("获取单词详情失败", error);
    } finally {
      setIsLoadingPhonetic(false);
    }

    return { phonetic: '', meaning: '', partOfSpeech: '' };
  };

  // 使用AI生成单词辅助信息（记忆技巧、衍生词、搭配等）
  const generateWordAIContent = async (word: string, partOfSpeech: string) => {
    if (!transcriptText || transcriptText.trim() === "") {
      setError(t("没有可用的字幕内容"));
      return;
    }

    setError(null);
    setIsGenerating(true);
    try {
      const prompt = `作为英语教学专家，请为单词 "${word}" (${partOfSpeech || '未知词性'}) 提供以下信息，格式为JSON:
1. mnemonics: 记忆技巧和联想方法（字符串）
2. examples: 2个实用例句（数组）
3. collocations: 3个常用搭配（数组）
4. derivatives: 3个衍生词（数组）

为了避免你出错，我已经将模板创建好, 你只需要将内容填进去就行，不要修改JSON的逗号、双引号等等结构，也不要修改JSON的格式，JSON格式如下：
{
  "mnemonics": "记忆技巧和联想方法",
  "examples": [{
      "en": "example1",
      "zh": "例句1"
  }, {
      "en": "example2",
      "zh": "例句2"
  }],
  "collocations": [{
      "en": "collocation1",
      "zh": "常用搭配1"
  }, {
      "en": "collocation2",
      "zh": "常用搭配2"
  }, {
      "en": "collocation3",
      "zh": "常用搭配3"
  }],
  "derivatives": [{
      "en": "derivative1",
      "zh": "衍生词1"
  }, {
      "en": "derivative2",
      "zh": "衍生词2"
  }, {
      "en": "derivative3",
      "zh": "衍生词3"
  }]
}

为了保证显示顺序，按照这个顺序返回：mnemonics, examples, collocations, derivatives

回复必须是严格的JSON格式，不要有任何其他文字。`;

      let aiResponse = "";
      aiResponse = await window.AIM.chat.chat({
        prompt: "你是一个专业的内容专家",
        model,
        provider,
        messages: [{
          role: "user",
          content: prompt
        }]
      });

      console.log(aiResponse);

      // 使用 LangChain 的 JSON 解析器
      const parser = new JsonOutputParser();
      try {
        const result = await parser.parse(aiResponse);
        const d = {
          derivatives: result.derivatives || [],
          examples: result.examples || [],
          mnemonics: result.mnemonics || "",
          collocations: result.collocations || []
        }

        window.AIM.storage.setItem(currentFile.uuid + ":words", { ...wordsInfo, [word]: d }, manifest.pluginId).then((res: any) => {
          console.log(res);
          setWordsInfo(value => {
            value[word] = d
            return value
          })
        })

        return d;
      } catch (error) {
        console.error("解析AI响应失败", error);
        // 如果解析失败，尝试使用 jsonrepair 修复
        try {
          setError(t("正在修复JSON格式..."));

          // 使用 jsonrepair 修复 JSON
          const repairedJson = jsonrepair(aiResponse);
          console.log("修复后的JSON:", repairedJson);

          const result = await parser.parse(repairedJson);
          const d = {
            derivatives: result.derivatives || [],
            examples: result.examples || [],
            mnemonics: result.mnemonics || "",
            collocations: result.collocations || []
          }

          window.AIM.storage.setItem(currentFile.uuid + ":words", { ...wordsInfo, [word]: d }, manifest.pluginId).then((res: any) => {
            console.log(res);
            setWordsInfo(value => {
              value[word] = d
              return value
            })
          })

          setError(null);
          return d;
        } catch (fixError) {
          console.error("修复JSON失败", fixError);
          // 如果 jsonrepair 也失败了，再尝试使用 AI 修复
          try {
            const fixPrompt = `我在使用JSON.parse解析JSON时收到错误信息是：${error.message}
  
原始内容是：
${aiResponse}

请帮我分析这个报错信息，理解我原始内容中的错误，并修复这个JSON的内容，可能是由于丢失的逗号、双引号等等结构，
或者错误使用的逗号、双引号等，请只返回修复后的JSON，不要有任何其他文字。`;

            console.log(fixPrompt);

            const fixedResponse = await window.AIM.chat.chat({
              prompt: "你是一个专业的JSON修复专家",
              model,
              provider,
              messages: [{
                role: "user",
                content: fixPrompt
              }]
            });

            console.log(fixedResponse);

            const fixedResult = await parser.parse(fixedResponse);
            const d = {
              derivatives: fixedResult.derivatives || [],
              examples: fixedResult.examples || [],
              mnemonics: fixedResult.mnemonics || "",
              collocations: fixedResult.collocations || []
            }

            window.AIM.storage.setItem(currentFile.uuid + ":words", { ...wordsInfo, [word]: d }, manifest.pluginId).then((res: any) => {
              console.log(res);
              setWordsInfo(value => {
                value[word] = d
                return value
              })
            })

            setError(null);
            return d;
          } catch (aiFixError) {
            console.error("AI修复JSON失败", aiFixError);
            setError(t("修复JSON失败，请重试"));
            return {
              derivatives: [],
              examples: [],
              mnemonics: t("暂无记忆技巧"),
              collocations: []
            };
          }
        }
      }
    } catch (error) {
      console.error("生成AI内容失败", error);
      setError(t("生成AI内容失败，请重试"));
      return {
        derivatives: [],
        examples: [],
        mnemonics: t("暂无记忆技巧"),
        collocations: []
      };
    } finally {
      setIsGenerating(false);
    }
  };

  // 选择单词，获取详情
  const handleSelectWord = async (word: WordInfo) => {

    const data = await window.AIM.storage.getItem(currentFile.uuid + ":words", manifest.pluginId)

    setSelectedWord(word);
    setIsWordListExpanded(false);

    if (data?.[word.word]) {
      word = { ...word, ...data[word.word] };
    }

    // 获取基本词典信息
    if (!word.phonetic || !word.meaning) {
      const details = await fetchWordDetails(word.word);
      word.phonetic = details.phonetic;
      word.meaning = details.meaning;
      word.partOfSpeech = details.partOfSpeech;
      setSelectedWord({ ...word }); // 更新单词信息
    }

    // 获取AI辅助内容（如果尚未获取）
    if (!word.derivatives || !word.mnemonics) {
      const aiContent = await generateWordAIContent(word.word, word.partOfSpeech || '');
      word.derivatives = aiContent?.derivatives;
      word.examples = aiContent?.examples;
      word.mnemonics = aiContent?.mnemonics;
      word.collocations = aiContent?.collocations;
      setSelectedWord({ ...word }); // 更新单词信息
    }
  };

  // 播放单词发音
  const playWordPronunciation = async (word: string) => {
    try {
      const audio = new Audio(`https://api.dictionaryapi.dev/media/pronunciations/en/${word}-us.mp3`);
      audio.play();
    } catch (error) {
      console.error("播放单词发音失败", error);
    }
  };

  // 切换到卡片浏览模式
  const enterFlashcardMode = () => {
    setIsFlashcardMode(true);
    setCurrentCardIndex(0);
    setIsCardFlipped(false);
  };

  // 重置例句索引
  useEffect(() => {
    setCurrentExampleIndex(0);
  }, [selectedWord]);

  // 播放所有例句
  const playAllExamples = () => {
    if (!selectedWord?.timestamps) return;
    setIsPlayingAll(true);
    setCurrentPlayingIndex(0);
    playExample(0);
  };

  // 停止播放所有例句
  const stopPlayingAll = () => {
    setIsPlayingAll(false);
    setCurrentPlayingIndex(null);
    window.AIM.browser.windowPostMessage({
      type: 'window:player:pause:req',
      data: {}
    });
  };

  // 播放单个例句
  const playExample = (index: number) => {
    if (!selectedWord?.timestamps) return;
    setCurrentPlayingIndex(index);
    window.AIM.browser.windowPostIndex(selectedWord.timestamps[index].startTime);
  };

  const handleWindowMessage = useCallback((event: any, msg: any) => {
    if (msg.type === 'window:player:play:res') {
      // 播放器开始播放
    }
    if (msg.type === 'window:player:pause:res') {
      // 播放器暂停播放
      if (isPlayingAll) {
        stopPlayingAll();
      }
    }
    if (msg.type === 'window:player:timeupdate:res') {
      // 播放器时间变更
      const time = msg.data;
      setCurrentTime(time);

      // 根据当前播放时间找到对应的例句索引
      if (selectedWord?.timestamps) {
        const currentIndex = selectedWord.timestamps.findIndex((timestamp) => {
          const startTime = convertToSeconds(timestamp.startTime);
          const endTime = convertToSeconds(timestamp.endTime);
          return time >= startTime && time <= endTime;
        });

        if (currentIndex !== -1 && currentIndex !== currentExampleIndex) {
          setCurrentExampleIndex(currentIndex);
        }
      }

      if (isPlayingAll && currentPlayingIndex !== null && selectedWord?.timestamps && isFollowMode) {
        const currentTimestamp = selectedWord.timestamps[currentPlayingIndex];
        const endTime = convertToSeconds(currentTimestamp.endTime);

        // 如果当前时间超过了当前例句的结束时间
        if (time >= endTime) {
          if (isLooping) {
            // 单句循环模式：重新播放当前句子
            playExample(currentPlayingIndex);
          } else {
            // 列表循环模式：播放下一句
            const nextIndex = currentPlayingIndex + 1;
            if (nextIndex < selectedWord.timestamps.length) {
              playExample(nextIndex);
            } else {
              // 播放完最后一句，从头开始
              playExample(0);
            }
          }
        }
      }
    }
  }, [isPlayingAll, currentPlayingIndex, selectedWord?.timestamps, isLooping, isFollowMode, currentExampleIndex]);

  useEffect(() => {
    window.AIM.handleWindowMessage(handleWindowMessage, 'WindowMessage_player')

    return () => {
      window.AIM.removeWindowHandler('WindowMessage_player')
    }
  }, [handleWindowMessage]);

  // 加载存储的AI推荐词汇
  useEffect(() => {
    if (currentFile?.uuid) {
      window.AIM.storage.getItem(currentFile.uuid + ":recommendedWords", manifest.pluginId).then((res: any) => {
        if (res?.words) {
          setRecommendedWords(res.words);
        }
      });
    }
  }, [currentFile?.uuid]);

  // 分析文本并提取有价值的词汇
  const analyzeTextForValuableWords = async () => {
    if (!transcriptText || transcriptText.trim() === "") {
      setError(t("没有可用的字幕内容"));
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setRecommendedWords([]);
    const uuid = generateUUID();
    setCurrentAnalysisUUID(uuid);

    try {
      const prompt = `作为英语教学专家，请分析以下文本，提取出具有学习价值的词汇。请特别关注：
1. 四六级词汇
2. 专业领域词汇
3. 高级表达词汇
4. 常用搭配词汇

请直接返回一个数组，每个元素是一个对象，格式如下：
[
  {
    "word": "单词",
    "level": "词汇等级（如：CET-4/CET-6/专业/高级）",
    "category": "词汇类别（如：学术/商务/日常/专业）",
    "reason": "为什么这个单词值得学习"
  }
]

文本内容：
${transcriptText}

请只返回JSON数组，不要有任何其他文字。`;

      const aiResponse = await window.AIM.chat.chat({
        prompt: "你是一个专业的英语词汇分析专家",
        model,
        provider,
        messages: [{
          role: "user",
          content: prompt
        }],
        uuid
      });

      try {
        const parser = new JsonOutputParser();
        const result = await parser.parse(aiResponse);

        // 将AI推荐的词汇与现有词汇信息合并
        const recommendedWordsWithDetails = result.map((word: any) => {
          const existingWord = extractWords.find(w => w.word.toLowerCase() === word.word.toLowerCase());
          return {
            ...existingWord,
            level: word.level,
            category: word.category,
            reason: word.reason
          };
        });

        setRecommendedWords(recommendedWordsWithDetails);

        // 存储AI推荐的词汇
        window.AIM.storage.setItem(currentFile.uuid + ":recommendedWords", {
          words: recommendedWordsWithDetails,
          timestamp: new Date().toISOString()
        }, manifest.pluginId);

      } catch (error) {
        console.error("解析AI响应失败", error);
        setError(t("解析AI响应失败，请重试"));
      }
    } catch (error) {
      console.error("分析文本失败", error);
      setError(t("分析文本失败，请重试"));
    } finally {
      setIsAnalyzing(false);
      setCurrentAnalysisUUID(null);
    }
  };

  // 处理流式响应
  useEffect(() => {
    // @ts-ignore
    function handleConvertProgress(e: any, data: any) {
      if (data.type === "llm:chat:stream:message" && data?.data?.uuid === currentAnalysisUUID) {
        try {
          // 累积文本
          setAccumulatedText(prev => {
            const newText = prev + data.data.text;

            // 使用累积的完整文本进行解析
            const parser = new JsonOutputParser();
            parser.parsePartialResult([{ text: newText }]).then((result) => {

              if (Array.isArray(result)) {

                console.log(result);
                const newWords = result.map((word: any) => {
                  const existingWord = extractWords.find(w => w.word?.toLowerCase() === word.word?.toLowerCase());
                  return {
                    ...existingWord,
                    level: word.level,
                    category: word.category,
                    reason: word.reason
                  };
                });

                setRecommendedWords(prev => {
                  // 合并新单词，避免重复
                  const existingWords = new Set(prev.map(w => w.word?.toLowerCase()));
                  const uniqueNewWords = newWords.filter(w => !existingWords.has(w.word?.toLowerCase()));
                  return [...prev, ...uniqueNewWords];
                });
              }
            });

            return newText;
          });
        } catch (error) {
          console.error("解析流式响应失败", error);
        }
      }
    }

    window.AIM.handleMessage(handleConvertProgress, "AppPlugins2");

    return () => {
      window.AIM.removeHandler("AppPlugins2");
    };
  }, [currentAnalysisUUID, extractWords]);

  // 在 PageComp 组件中添加清除函数
  const clearRecommendedWords = async () => {
    if (currentFile?.uuid) {
      await window.AIM.storage.setItem(currentFile.uuid + ":recommendedWords", null, manifest.pluginId);
      setRecommendedWords([]);
    }
  };

  // 在 useEffect 中添加加载存储的模型设置
  useEffect(() => {
    window.AIM.chat.getProviders().then((providers) => {
      setChatProvider(providers);
    });

    // 加载存储的模型设置
    window.AIM.storage.getItem("modelSettings", manifest.pluginId).then((res: any) => {
      if (res?.provider && res?.model) {
        setProvider(res.provider);
        setModel(res.model);
      } else {
        setShowModelGuide(true);
      }
    });
  }, []);

  // 修改模型选择的处理函数
  const handleModelSelect = (newProvider: string, newModel: string) => {
    setProvider(newProvider);
    setModel(newModel);
    setShowModelGuide(false);
    
    // 存储模型设置
    window.AIM.storage.setItem("modelSettings", {
      provider: newProvider,
      model: newModel
    }, manifest.pluginId);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden p-4">
      {/* 顶部操作区 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1"
            onClick={clearRecommendedWords}
            disabled={recommendedWords.length === 0}
          >
            <TbX className="h-4 w-4" />
            {t("清除推荐")}
          </Button>
          <div className="relative">
            <Select 
              value={provider} 
              onValueChange={(value) => {
                setShowModelGuide(true);
                setProvider(value);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("选择AI模型")} />
              </SelectTrigger>
              <SelectContent>
                {
                  chatProvider.map((m) => (
                    <SelectItem key={m.value} value={m.value} disabled={m.disabled}>
                      {m.label}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
            {showModelGuide && (
              <div className="absolute top-full left-0 mt-2 w-[300px] p-4 bg-card border rounded-lg shadow-lg z-50">
                <h3 className="font-semibold mb-2">{t("选择你的AI学习助手")}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("我是你的AI学习助手，请选择一个适合你的AI模型，这将作为你的专属学习助手。")}
                </p>
                <div className="space-y-2">
                  {llmModels.map((m) => (
                    <Button
                      key={m.value}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleModelSelect(provider, m.value)}
                      disabled={m.disabled}
                    >
                      {m.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Select 
            value={model} 
            onValueChange={setModel}
            disabled={showModelGuide}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("选择AI模型")} />
            </SelectTrigger>
            <SelectContent>
              {
                llmModels.map((m) => (
                  <SelectItem key={m.value} value={m.value} disabled={m.disabled}>
                    {m.label}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 错误信息展示 */}
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      {/* 内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!transcriptText ? (
          <div className="text-center text-muted-foreground py-8">
            {t("没有可用的字幕内容") || ""}
          </div>
        ) : isFlashcardMode ? (
          <FlashcardMode
            words={filteredWords}
            onExit={() => setIsFlashcardMode(false)}
            onSelectWord={(word) => {
              setSelectedWord(word);
              setIsFlashcardMode(false);
            }}
          />
        ) : (
          <div className="h-full grid grid-cols-3 gap-4 max-h-full overflow-hidden">
            {/* 单词列表区域 */}
            {isWordListExpanded && (
              <div className="col-span-1 flex flex-col h-full border rounded-md overflow-hidden">
                <div className="p-3 border-b shrink-0">
                  <div className="flex items-center gap-2">
                    <TbSearch className="text-muted-foreground" />
                    <Input
                      placeholder={t("搜索单词...") || ""}
                      value={searchWord}
                      onChange={(e) => setSearchWord(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-muted-foreground">
                      {`共找到 ${filteredWords.length} 个单词${recommendedWords.length > 0 ? `，其中 ${filteredRecommendedWords.length} 个推荐词汇` : ''}`}
                    </div>
                    {filteredWords.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={enterFlashcardMode}
                      >
                        <TbCards className="h-3.5 w-3.5" />
                        {t("卡片模式") || ""}
                      </Button>
                    )}
                  </div>
                </div>
                <ScrollArea className="flex-1 overflow-y-auto">
                  <div className="space-y-1.5 p-3">
                    {/* AI推荐词汇部分 */}
                    <div className="space-y-1.5">
                      <div
                        className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted rounded-md"
                        onClick={() => setIsRecommendedExpanded(!isRecommendedExpanded)}
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium">{t("AI推荐词汇")}</h3>
                          {recommendedWords.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {filteredRecommendedWords.length}/{recommendedWords.length}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!isAnalyzing && recommendedWords.length === 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                analyzeTextForValuableWords();
                              }}
                            >
                              {t("开始分析")}
                            </Button>
                          )}
                          {isAnalyzing && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <TbLoader2 className="h-3.5 w-3.5 animate-spin" />
                              {t("分析中...")}
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            {isRecommendedExpanded ? (
                              <TbChevronUp className="h-4 w-4" />
                            ) : (
                              <TbChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      {isRecommendedExpanded && (
                        <div className="space-y-1.5 pl-2">
                          {
                            filteredRecommendedWords.map((word) => (
                              <div
                                key={word.word}
                                className={`flex flex-col p-2 rounded-md cursor-pointer hover:bg-muted ${selectedWord?.word === word.word ? 'bg-muted' : ''}`}
                                onClick={() => handleSelectWord(word)}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="font-medium">{word.word}</div>
                                  <Badge variant="outline">{word.count}</Badge>
                                </div>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">{word.level}</Badge>
                                  <Badge variant="secondary" className="text-xs">{word.category}</Badge>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">{word.reason}</div>
                              </div>
                            ))
                          }
                        </div>
                      )}
                    </div>

                    {/* 全部词汇部分 */}
                    <div className="space-y-1.5">
                      <div
                        className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted rounded-md"
                        onClick={() => setIsAllWordsExpanded(!isAllWordsExpanded)}
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium">{t("全部词汇")}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {filteredWords.length}/{extractWords.length}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          {isAllWordsExpanded ? (
                            <TbChevronUp className="h-4 w-4" />
                          ) : (
                            <TbChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {isAllWordsExpanded && (
                        <div className="space-y-1.5 pl-2">
                          {filteredWords.map((word) => (
                            <div
                              key={word.word}
                              className={`flex justify-between items-center p-2 rounded-md cursor-pointer hover:bg-muted ${selectedWord?.word === word.word ? 'bg-muted' : ''}`}
                              onClick={() => handleSelectWord(word)}
                            >
                              <div className="font-medium">{word.word}</div>
                              <Badge variant="outline">{word.count}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* 单词详情区域 */}
            <div className={`border rounded-md flex flex-col h-full overflow-hidden ${isWordListExpanded ? 'col-span-2' : 'col-span-3'}`}>
              {selectedWord ? (
                <>
                  <div className="p-2 px-4 border-b shrink-0 flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 shrink-0"
                      onClick={() => setIsWordListExpanded(!isWordListExpanded)}
                    >
                      {isWordListExpanded ? <TbChevronLeft className="h-4 w-4" /> : <TbChevronRight className="h-4 w-4" />}
                    </Button>
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold">{selectedWord.word}</h3>
                          {selectedWord.phonetic && <span className="text-xs text-muted-foreground">{selectedWord.phonetic}</span>}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => playWordPronunciation(selectedWord.word)}
                            disabled={isLoadingPhonetic}
                          >
                            {isLoadingPhonetic ? <TbLoader2 className="animate-spin" /> : <TbVolume />}
                          </Button>
                        </div>
                      </div>
                      {selectedWord.meaning && <div className="rounded-md text-sm">{selectedWord.meaning}</div>}
                    </div>
                  </div>

                  {/* 详情标签页 */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <ScrollArea ref={scrollRef} className="flex-1 overflow-y-auto p-2">
                      <div className="mt-0">
                        <div className="mt-0 space-y-2 px-2">
                          {selectedWord.partOfSpeech && (
                            <>
                              <h4 className="font-medium">{t("词性分析")}</h4>
                              <div className="p-3 bg-muted rounded-md">
                                <Badge variant="outline" className="capitalize">{selectedWord.partOfSpeech}</Badge>
                              </div>
                            </>
                          )}

                          {selectedWord.mnemonics && (
                            <>
                              <h4 className="font-medium">{t("记忆技巧")}</h4>
                              <div className="p-3 bg-muted rounded-md">
                                {selectedWord.mnemonics}
                              </div>
                            </>
                          )}


                          {selectedWord.examples && selectedWord.examples.length > 0 && (
                            <>
                              <h4 className="font-medium">{t("实用例句")}</h4>

                              {selectedWord.timestamps && selectedWord.timestamps.length > 0 && (
                                <>
                                  <div className="relative">
                                    <div className="p-3 bg-muted rounded-md">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs text-muted-foreground">视频原文</span>
                                        <div className="ml-auto flex items-center gap-1">
                                          <Button
                                            variant={isFollowMode ? "default" : "outline"}
                                            size="sm"
                                            className="h-7 text-xs gap-1"
                                            onClick={() => setIsFollowMode(!isFollowMode)}
                                            data-state={isFollowMode ? "active" : "inactive"}
                                          >
                                            跟读模式
                                          </Button>
                                          <>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="h-7 text-xs gap-1"
                                              onClick={() => isPlayingAll ? stopPlayingAll() : playAllExamples()}
                                            >
                                              {
                                                isPlayingAll
                                                  ? <TbPlayerPause className="h-3.5 w-3.5" />
                                                  : <TbPlayerPlay className="h-3.5 w-3.5" />
                                              }
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="h-7 text-xs gap-1"
                                              onClick={() => setIsLooping(!isLooping)}
                                              data-state={isLooping ? "active" : "inactive"}
                                            >
                                              {isLooping ? (
                                                <>
                                                  <TbRepeatOnce className="h-3.5 w-3.5" />
                                                  <span>单句循环</span>
                                                </>
                                              ) : (
                                                <>
                                                  <TbRepeat className="h-3.5 w-3.5" />
                                                  <span>列表循环</span>
                                                </>
                                              )}
                                            </Button>
                                          </>
                                          {selectedWord.timestamps.length > 1 && (
                                            <>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => {
                                                  const prevIndex = currentExampleIndex - 1;
                                                  if (prevIndex >= 0) {
                                                    setCurrentExampleIndex(prevIndex);
                                                    playExample(prevIndex);
                                                  }
                                                }}
                                                disabled={currentExampleIndex === 0}
                                              >
                                                <TbChevronLeft className="h-3 w-3" />
                                              </Button>
                                              <Badge variant="outline" className="h-6">
                                                {currentExampleIndex + 1}/{selectedWord.timestamps.length}
                                              </Badge>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => {
                                                  const nextIndex = currentExampleIndex + 1;
                                                  if (nextIndex < selectedWord.timestamps.length) {
                                                    setCurrentExampleIndex(nextIndex);
                                                    playExample(nextIndex);
                                                  }
                                                }}
                                                disabled={currentExampleIndex === selectedWord.timestamps.length - 1}
                                              >
                                                <TbChevronRight className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 gap-1"
                                                onClick={() => {
                                                  setIsExpanded(!isExpanded);
                                                }}
                                              >
                                                {isExpanded ? (
                                                  <>
                                                    <span className="text-xs">收起</span>
                                                    <TbChevronUp className="h-3 w-3" />
                                                  </>
                                                ) : (
                                                  <>
                                                    <span className="text-xs">展开</span>
                                                    <TbChevronDown className="h-3 w-3" />
                                                  </>
                                                )}
                                              </Button>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      <div className="relative overflow-hidden">
                                        <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'space-y-2' : ''}`}>
                                          {selectedWord.timestamps.map((timestamp, index) => (
                                            <div
                                              key={index}
                                              className={`transition-all duration-300 ease-in-out flex items-center gap-2 ${isExpanded
                                                ? 'opacity-100 transform translate-y-0'
                                                : index === currentExampleIndex
                                                  ? 'opacity-100 transform translate-y-0'
                                                  : 'opacity-0 transform -translate-y-4 h-0 overflow-hidden'
                                                }`}
                                            >
                                              <Button
                                                variant={"ghost"}
                                                size={"icon"}
                                                className="shrink-0"
                                                onClick={() => {
                                                  window.AIM.browser.windowPostMessage({
                                                    type: 'window:player:seek:req',
                                                    data: {
                                                      type: 'time',
                                                      time: convertToSeconds(selectedWord.timestamps[index].startTime)
                                                    }
                                                  })
                                                }}>
                                                <TbPlayerPlay />
                                              </Button>
                                              <div
                                                className={`p-2 flex-1 rounded-md ${isExpanded ? 'hover:bg-background/50 cursor-pointer' : ''} ${index === currentExampleIndex ? 'bg-primary/10' : ''}`}
                                                onClick={() => {
                                                  window.AIM.browser.windowPostMessage({
                                                    type: 'window:player:seek:req',
                                                    data: {
                                                      type: 'time',
                                                      time: convertToSeconds(selectedWord.timestamps[index].startTime)
                                                    }
                                                  })
                                                }}
                                              >
                                                {isExpanded && (
                                                  <div className="text-xs text-muted-foreground mb-1">
                                                    [{timestamp.startTime} - {timestamp.endTime}]
                                                  </div>
                                                )}
                                                {timestamp.text.split(/\b/).map((part, i) =>
                                                  part.toLowerCase() === selectedWord.word.toLowerCase() ? (
                                                    <HighlightedWord key={i} word={part} />
                                                  ) : (
                                                    part
                                                  )
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                              <div className="space-y-2">
                                {selectedWord.examples.map((example, index) => (
                                  <div key={index} className="p-3 bg-muted rounded-md">
                                    {example.en?.split(/\b/).map((part, i) =>
                                      part.toLowerCase() === selectedWord.word.toLowerCase() ? (
                                        <HighlightedWord key={i} word={part} />
                                      ) : (
                                        part
                                      )
                                    )}
                                    <span className="text-muted-foreground text-xs">({example.zh})</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}

                          {selectedWord.collocations && selectedWord.collocations.length > 0 && (
                            <>
                              <h4 className="font-medium">{t("常用搭配") || ""}</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedWord.collocations.map((collocation, index) => (
                                  <Badge key={index} variant="secondary">{collocation.en}
                                    <span className="text-muted-foreground text-xs">({collocation.zh})</span>
                                  </Badge>
                                ))}
                              </div>
                            </>
                          )}

                          {selectedWord.derivatives && selectedWord.derivatives.length > 0 && (
                            <>
                              <h4 className="font-medium">{t("词汇派生") || ""}</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedWord.derivatives.map((derivative, index) => (
                                  <Badge key={index} className="px-3 py-1">{derivative.en}
                                    <span className="text-muted-foreground text-xs">({derivative.zh})</span>
                                  </Badge>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </ScrollArea>
                  </div>

                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  {t("请选择一个单词") || ""}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PageComp;

