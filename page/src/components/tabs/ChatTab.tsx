import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ModelSelector } from "@/components/ModelSelector";

interface ModelData {
  value: string;
  label: string;
  description: string;
  price: number;
  currency: string;
  uint: string;
  maxContextToken: number;
  maxOutputToken: number;
  provider: string;
  providerLabel: string;
}

export function ChatTab() {
  const [provider, setProvider] = useState("");
  const [generatedText, setGeneratedText] = useState<string>("");
  const [model, setModel] = useState("");
  const [prompt, setPrompt] = useState("");

  // 从本地存储恢复模型设置
  useEffect(() => {
    const loadModelSettings = async () => {
      try {
        const settings = await window.AIM.storage.getItem("modelSettings");
        if (settings) {
          setProvider(settings.provider || "");
          setModel(settings.model || "");
        }
      } catch (error) {
        console.error("加载模型设置失败:", error);
      }
    };
    loadModelSettings();
  }, []);

  useEffect(() => {
    // @ts-ignore
    function handleConvertProgress(e: any, data: any) {
      if (data.type === "llm:chat:stream:start") {
        setGeneratedText(data.data.text);
      }
      if (data.type === "llm:chat:stream:message") {
        setGeneratedText((prev: string) => {
          const accumulatedData = prev + data.data.text
          return accumulatedData
        });
      }
      if (data.type === "llm:chat:stream:completed") {
        setGeneratedText(data.data.text);
      }
    }
    window.AIM.handleMessage(handleConvertProgress, "AppPlugins");

    return () => {
      window.AIM.removeHandler("AppPlugins");
    };
  }, [setGeneratedText]);

  // 处理模型选择确认
  const handleConfirmModel = useCallback(async (selectedModelData: ModelData) => {
    const newProvider = selectedModelData.provider;
    const newModel = selectedModelData.value;

    setProvider(newProvider);
    setModel(newModel);
    await window.AIM.storage.setItem("modelSettings", {
      provider: newProvider,
      model: newModel
    });
  }, []);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">AI模型</div>
        <ModelSelector
          model={model}
          onModelChange={handleConfirmModel}
        />
      </div>

      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">输入提示词</div>
        <textarea
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value)
          }}
          className="w-full h-20 rounded-md box-border bg-background border outline-none p-2"
          placeholder="请输入您的问题..."
        />
      </div>

      <Button size={"sm"} onClick={() => {
        window.AIM.chat.chat({
          model,
          provider,
          messages: [{
            role: "user",
            content: prompt
          }]
        });
      }}>
        发送聊天内容
      </Button>

      {generatedText && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">AI回复：</div>
          <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
            {generatedText}
          </div>
        </div>
      )}
    </div>
  );
} 