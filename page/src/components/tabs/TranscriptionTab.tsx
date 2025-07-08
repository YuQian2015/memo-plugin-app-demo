import { useCallback, useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import type { ITranscriptFile } from "@aim-packages/iframe-ipc/dist/types";
import { modelToTranscriptFile } from "@/lib";

interface TranscriptionTabProps {
  nId?: string;
  fId?: string;
  wId?: string;
}

export function TranscriptionTab({ nId, fId, wId }: TranscriptionTabProps) {
  const [transcriptionData, setTranscriptionData] = useState<ITranscriptFile | null>(null);
  const [loading, setLoading] = useState(false);

  const getTranscriptionData = useCallback(() => {
    if (!nId) return;
    
    setLoading(true);
    window.AIM.transcriptionData('detail', {
      id: nId,
      workspaceId: wId,
      folderId: fId
    }).then(res => {
      console.log(res);

      if (res) {
        setTranscriptionData(modelToTranscriptFile(res))
      }
    }).finally(() => {
      setLoading(false);
    })
  }, [nId, wId, fId]);

  // 组件渲染时自动获取数据
  useEffect(() => {
    getTranscriptionData();
  }, [getTranscriptionData]);

  return (
    <div className="space-y-4">
      <Button 
        size={"sm"} 
        variant={"outline"} 
        onClick={getTranscriptionData}
        disabled={loading}
      >
        {loading ? "获取中..." : "重新获取转写内容"}
      </Button>
      {transcriptionData && (
        <ScrollArea className="h-40 border rounded-md p-2">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
            {JSON.stringify(transcriptionData, null, 2)}
          </pre>
        </ScrollArea>
      )}
    </div>
  );
} 