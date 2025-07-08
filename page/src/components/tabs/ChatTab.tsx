import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChatTabProps {
  generatedText: string;
  setGeneratedText: React.Dispatch<React.SetStateAction<string>>;
}

export function ChatTab({ generatedText, setGeneratedText }: ChatTabProps) {
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");
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
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    window.AIM.chat.getProviders().then((providers) => {
      setChatProvider(providers)
    });
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
    const m = llmModels.find((item) => item.value === model);
    if (!m) {
      setModel(llmModels[0]?.value || "");
    }
  }, [llmModels, model]);

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

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">聊天服务</div>
        <Select
          value={provider}
          onValueChange={(value) => {
            setProvider(value);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择AI服务" />
          </SelectTrigger>
          <SelectContent>
            {chatProvider.map((m) => (
              <SelectItem key={m.value} value={m.value} disabled={m.disabled}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">AI模型</div>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择AI模型" />
          </SelectTrigger>
          <SelectContent>
            {llmModels.map((m) => (
              <SelectItem key={m.value} value={m.value} disabled={m.disabled}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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