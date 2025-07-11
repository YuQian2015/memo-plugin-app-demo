import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TbCamera, TbDownload, TbClock, TbPlus, TbX } from "react-icons/tb";
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

// 时间格式化函数
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.round((seconds % 1) * 1000);
  
  // 毫秒部分，如果为000则不显示
  const msPart = milliseconds > 0 ? `.${milliseconds.toString().padStart(3, '0')}` : '';
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}${msPart}`;
  }
  if (minutes > 0) {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}${msPart}`;
  }
  return `${secs}${msPart}`;
};

// 解析时间输入（支持 MM:SS.mmm 或 SS.mmm 格式）
const parseTimeInput = (input: string): number | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;
  
  // 检查是否是 MM:SS.mmm 格式
  if (trimmed.includes(':')) {
    const parts = trimmed.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0]);
      const secondsPart = parts[1];
      
      // 分离秒和毫秒
      const secondsParts = secondsPart.split('.');
      const seconds = parseInt(secondsParts[0]);
      const milliseconds = secondsParts.length > 1 ? parseInt(secondsParts[1]) : 0;
      
      if (!isNaN(minutes) && !isNaN(seconds) && minutes >= 0 && seconds >= 0 && seconds < 60 && milliseconds >= 0 && milliseconds < 1000) {
        return minutes * 60 + seconds + milliseconds / 1000;
      }
    }
  } else {
    // 纯数字，可能是 SS.mmm 格式
    const parts = trimmed.split('.');
    const seconds = parseInt(parts[0]);
    const milliseconds = parts.length > 1 ? parseInt(parts[1]) : 0;
    
    if (!isNaN(seconds) && seconds >= 0 && milliseconds >= 0 && milliseconds < 1000) {
      return seconds + milliseconds / 1000;
    }
  }
  
  return null;
};

export function ScreenshotTab({ nId, fId, wId }: ScreenshotTabProps) {
  const [screenshots, setScreenshots] = useState<ScreenshotResult[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [transcriptionData, setTranscriptionData] = useState<ITranscriptFile | null>(null);
  const [timestamps, setTimestamps] = useState<number[]>([10, 20, 30]);
  const [timeInput, setTimeInput] = useState<string>('');

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

  const addTimestamp = () => {
    const parsedTime = parseTimeInput(timeInput);
    if (parsedTime !== null && !timestamps.includes(parsedTime)) {
      setTimestamps(prev => [...prev, parsedTime].sort((a, b) => a - b));
      setTimeInput('');
    }
  };

  const removeTimestamp = (timestampToRemove: number) => {
    setTimestamps(prev => prev.filter(t => t !== timestampToRemove));
  };

  const handleTimeInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTimestamp();
    }
  };

  const captureScreenshot = async () => {
    if (!transcriptionData) {
      console.error('转写数据未加载');
      return;
    }

    if (timestamps.length === 0) {
      console.error('请至少添加一个截图时间点');
      return;
    }

    setIsCapturing(true);

    console.log(timestamps);
    
    try {
      const screenshotResults = await window.AIM.video.screenshots({
        timestamps,
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
        {/* 显示截图时间点 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TbClock className="h-5 w-5" />
              截图时间点
            </CardTitle>
            <CardDescription>
              添加想要截图的时间点（格式：MM:SS.mmm 或 SS.mmm，如 1:23.456 或 6.231）
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 添加时间点输入 */}
            <div className="flex gap-2">
              <Input
                placeholder="输入时间，如 1:23.456 或 6.231"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
                onKeyPress={handleTimeInputKeyPress}
                className="flex-1"
              />
              <Button
                onClick={addTimestamp}
                size="sm"
                className="flex items-center gap-1"
              >
                <TbPlus className="h-4 w-4" />
                添加
              </Button>
            </div>
            
            {/* 时间点列表 */}
            <div className="flex flex-wrap gap-2">
              {timestamps.map((timestamp, index) => (
                <div
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium flex items-center gap-1"
                >
                  {formatTime(timestamp)}
                  <button
                    onClick={() => removeTimestamp(timestamp)}
                    className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <TbX className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {timestamps.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  暂无时间点，请添加至少一个时间点
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button
            onClick={captureScreenshot}
            disabled={isCapturing || !transcriptionData || timestamps.length === 0}
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