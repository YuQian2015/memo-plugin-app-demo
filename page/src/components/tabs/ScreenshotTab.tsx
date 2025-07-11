import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TbCamera, TbDownload } from "react-icons/tb";
import type { ITranscriptFile } from "@aim-packages/iframe-ipc/dist/types";
import { modelToTranscriptFile } from "@/lib";
import { ScrollArea } from "../ui/scroll-area";

interface ScreenshotTabProps {
  nId?: string;
  fId?: string;
  wId?: string;
}

interface ScreenshotResult {
  id: string;
  dataUrl: string;
}

export function ScreenshotTab({ nId, fId, wId }: ScreenshotTabProps) {
  const [screenshots, setScreenshots] = useState<ScreenshotResult[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [transcriptionData, setTranscriptionData] = useState<ITranscriptFile | null>(null);

  const getTranscriptionData = useCallback(() => {
    if (!nId) return;

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
  }, [nId, wId, fId]);

  // 组件渲染时自动获取数据
  useEffect(() => {
    getTranscriptionData();
  }, [getTranscriptionData]);

  const captureScreenshot = async () => {
    if (!transcriptionData) {
      console.error('转写数据未加载');
      return;
    }

    setIsCapturing(true);

    try {
      const screenshotResults = await window.AIM.video.screenshots({
        timestamps: [10, 20, 30], // 在10秒、20秒、30秒处截图
        transcriptFile: transcriptionData
      });

      console.log(screenshotResults);

      // 处理返回的截图结果
      if (screenshotResults && screenshotResults.length > 0) {
        const newScreenshots: ScreenshotResult[] = screenshotResults.map((result, index: number) => ({
          id: `${Date.now()}-${index}`,
          dataUrl: result, // 直接使用返回的图片地址
        }));

        setScreenshots(prev => [...newScreenshots, ...prev]);
      } else {
        console.log('未获取到截图结果');
      }

    } catch (error) {
      console.error('截图失败:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const downloadScreenshot = (screenshot: ScreenshotResult) => {
    const link = document.createElement('a');
    link.download = `screenshot-${screenshot.id}.png`;
    link.href = screenshot.dataUrl;
    link.click();
  };

  const clearScreenshots = () => {
    setScreenshots([]);
  };

  return (
    <ScrollArea className="space-y-4 h-full px-4">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={captureScreenshot}
            disabled={isCapturing || !transcriptionData}
            className="flex items-center gap-2"
            size="sm"
          >
            <TbCamera className="h-4 w-4" />
            {isCapturing ? '截图中...' : '截图'}
          </Button>
          <Button
            variant="outline"
            onClick={clearScreenshots}
            disabled={screenshots.length === 0}
            size="sm"
          >
            清空截图
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>截图历史</CardTitle>
          <CardDescription>
            最近截图的列表，点击下载按钮保存到本地
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {screenshots.map((screenshot) => (
              <div key={screenshot.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <img
                    src={'aim:///' + screenshot.dataUrl}
                    alt="截图预览"
                    className="w-16 h-12 object-cover rounded border"
                  />
                  <div>
                    <div className="text-sm font-medium">
                      截图 #{screenshot.id.slice(-6)}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadScreenshot(screenshot)}
                  className="flex items-center gap-1"
                >
                  <TbDownload className="h-3 w-3" />
                  下载
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </ScrollArea>
  );
} 