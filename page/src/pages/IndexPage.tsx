import { useCallback, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import manifest from "../../../main/manifest.json";
import type { ITranscriptFile } from "@aim-packages/iframe-ipc/dist/types";

export function modelToTranscriptFile(note: any) {
  return {
    ...note,
    id: note.id,
    transcodeAudio: !!note.transcodeAudio,
    metadata: note.metadata ? JSON.parse(note.metadata) : null,
    transcriptSettings: note.transcriptSettings
      ? JSON.parse(note.transcriptSettings)
      : null,
    convertResult: JSON.parse(note.convertResult),
    multiTranslateResult: note.multiTranslateResult
      ? JSON.parse(note.multiTranslateResult)
      : null,
    translateResult: note.translateResult
      ? JSON.parse(note.translateResult)
      : null,
    summary: note.summary ? JSON.parse(note.summary) : null,
    canplayVideo: !!note.canplayVideo,
    hasAudio: !!note.hasAudio,
    hasVideo: !!note.hasVideo,
  };
}

export function transcriptFileToModel(transcriptFile: any) {
  return {
    ...transcriptFile,
    transcriptSettings: transcriptFile.transcriptSettings
      ? JSON.stringify(transcriptFile.transcriptSettings)
      : undefined,
    summary: transcriptFile.summary
      ? JSON.stringify(transcriptFile.summary)
      : undefined,
    multiTranslateResult: transcriptFile.multiTranslateResult
      ? JSON.stringify(transcriptFile.multiTranslateResult)
      : undefined,
    translateResult: transcriptFile.translateResult
      ? JSON.stringify(transcriptFile.translateResult)
      : undefined,
    metadata: JSON.stringify(transcriptFile.metadata),
    convertResult: JSON.stringify(transcriptFile.convertResult || []),
  };
}

function IndexPage() {
  const [transcriptionData, setTranscriptionData] = useState<ITranscriptFile | null>(null)

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
  const [generatedText, setGeneratedText] = useState<string>("");
  const queryParams = new URLSearchParams(window.location.search);
  const nId = queryParams.get('noteId') || undefined;
  const fId = queryParams.get('folderId') || undefined;
  const wId = queryParams.get('workspaceId') || undefined;

  const getTranscriptionData = useCallback(() => {
    window.AIM.transcriptionData('detail', {
      id: nId,
      workspaceId: wId,
      folderId: fId
    }).then(res => {
      console.log(res);

      if (res) {
        setTranscriptionData(modelToTranscriptFile(res))
      }
    })
  }, [nId, wId, fId])

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
        setGeneratedText((prev) => {
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
  }, []);

  return (
    <div className="h-full p-4">
      <Tabs defaultValue="basic" className="h-full">
        <TabsList>
          <TabsTrigger value="basic">基本信息</TabsTrigger>
          <TabsTrigger value="transcription">转写</TabsTrigger>
          <TabsTrigger value="chat">聊天</TabsTrigger>
          <TabsTrigger value="player">播放器</TabsTrigger>
          <TabsTrigger value="storage">存储</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-4">
          <div className="text-sm text-muted-foreground">当前转写ID：{nId}</div>
          <div className="text-sm text-muted-foreground">当前文件夹ID：{fId}</div>
          <div className="text-sm text-muted-foreground">当前空间ID：{wId}</div>
          <div className="text-sm text-muted-foreground">当前插件ID：{manifest.pluginId}</div>
        </TabsContent>

        <TabsContent value="transcription" className="mt-4">
          <Button size={"sm"} variant={"outline"} onClick={getTranscriptionData}>
            获取转写内容
          </Button>
          {transcriptionData && (
            <ScrollArea className="h-40 border rounded-md p-2">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                {JSON.stringify(transcriptionData, null, 2)}
              </pre>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="chat" className="mt-4">

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
        </TabsContent>

        <TabsContent value="storage" className="mt-4">
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">本地存储</div>
            <div className="flex gap-2">
              <Button size={"sm"} onClick={() => {
                window.AIM.storage.setItem("data", {
                  text: generatedText || "test"
                }).then(() => {
                  alert("保存成功")
                })
              }}>
                保存数据
              </Button>
              <Button size={"sm"} onClick={() => {
                window.AIM.storage.getItem("data").then((res: any) => {
                  alert(res.text)
                })
              }}>
                获取数据
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="player" className="mt-4">
          <Button onClick={() => window.AIM.player.play()}>播放</Button>
          <Button onClick={() => window.AIM.player.pause()}>暂停</Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default IndexPage