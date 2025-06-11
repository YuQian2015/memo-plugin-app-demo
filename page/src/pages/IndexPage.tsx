import { useCallback, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import PageComp from "./PageComp";
import { Button } from "@/components/ui/button";

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
  const queryParams = new URLSearchParams(window.location.search);
  const nId = queryParams.get('noteId') || undefined;
  const fId = queryParams.get('folderId') || undefined;
  const wId = queryParams.get('workspaceId') || undefined;

  const getTranscriptionData = useCallback(() => {
    console.log("!23123123");

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


  return (
    <div className="h-full">
      <ScrollArea className="h-full p-2">
        <div className="py-2">基本信息</div>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">当前转写ID：{nId}</div>
          <div className="text-sm text-muted-foreground">当前文件夹ID：{fId}</div>
          <div className="text-sm text-muted-foreground">当前空间ID：{wId}</div>
          <div className="text-sm text-muted-foreground">当前插件ID：{manifest.pluginId}</div>
        </div>

        <div className="py-2">转写</div>
        <Button size={"sm"} variant={"outline"} onClick={getTranscriptionData}>
          获取内容
        </Button>
        {
          transcriptionData && <ScrollArea className="text-sm text-muted-foreground h-40 whitespace-pre border rounded-md box-border my-2">
            {JSON.stringify(transcriptionData, null, 2)}
          </ScrollArea>
        }

        <div className="py-2">聊天</div>
        <textarea className="w-full h-40 rounded-md box-border my-2 bg-background border outline-none"></textarea>

        {transcriptionData && <PageComp currentFile={transcriptionData} />}
      </ScrollArea>
    </div>
  )
}

export default IndexPage