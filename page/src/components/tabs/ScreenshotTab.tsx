import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TbCamera, TbDownload, TbClock, TbFile } from "react-icons/tb";
import type { ITranscriptFile } from "@aim-packages/iframe-ipc/dist/types";
import { modelToTranscriptFile } from "@/lib";

interface ScreenshotTabProps {
  nId?: string;
  fId?: string;
  wId?: string;
}

interface ScreenshotResult {
  id: string;
  timestamp: number;
  size: number;
  duration: number;
  dataUrl: string;
}

// 定义截图API返回结果的类型
interface ScreenshotApiResult {
  size?: number;
  dataUrl?: string;
  url?: string;
}

export function ScreenshotTab({ nId, fId, wId }: ScreenshotTabProps) {
  const [screenshots, setScreenshots] = useState<ScreenshotResult[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [transcriptionData, setTranscriptionData] = useState<ITranscriptFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalScreenshots: 0,
    totalSize: 0,
    averageTime: 0,
  });

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

  const captureScreenshot = async () => {
    if (!transcriptionData) {
      console.error('转写数据未加载');
      return;
    }

    setIsCapturing(true);
    const startTime = performance.now();

    try {
      // 使用window.AIM.video.screenshots进行截图
      // 使用类型断言来处理video属性
      const screenshotResults = await (window.AIM as any).video.screenshots({
        timestamps: [10, 20, 30], // 在10秒、20秒、30秒处截图
        transcriptFile: transcriptionData
      });

      console.log(screenshotResults);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 处理返回的截图结果
      if (screenshotResults && screenshotResults.length > 0) {
        const newScreenshots: ScreenshotResult[] = screenshotResults.map((result: ScreenshotApiResult, index: number) => ({
          id: `${Date.now()}-${index}`,
          timestamp: Date.now(),
          size: result.size || 0, // 假设返回结果包含size字段
          duration: duration / screenshotResults.length, // 平均分配耗时
          dataUrl: result || '', // 假设返回结果包含dataUrl或url字段
        }));

        setScreenshots(prev => [...newScreenshots, ...prev]);
        updateStats([...newScreenshots, ...screenshots]);
      } else {
        console.log('未获取到截图结果');
      }

    } catch (error) {
      console.error('截图失败:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const updateStats = (currentScreenshots: ScreenshotResult[]) => {
    const totalScreenshots = currentScreenshots.length;
    const totalSize = currentScreenshots.reduce((sum, ss) => sum + ss.size, 0);
    const averageTime = totalScreenshots > 0
      ? currentScreenshots.reduce((sum, ss) => sum + ss.duration, 0) / totalScreenshots
      : 0;

    setStats({ totalScreenshots, totalSize, averageTime });
  };

  const downloadScreenshot = (screenshot: ScreenshotResult) => {
    const link = document.createElement('a');
    link.download = `screenshot-${screenshot.id}.png`;
    link.href = screenshot.dataUrl;
    link.click();
  };

  const clearScreenshots = () => {
    setScreenshots([]);
    setStats({ totalScreenshots: 0, totalSize: 0, averageTime: 0 });
  };

  return (
    <div className="space-y-4">
      {/* 控制面板 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TbCamera className="h-5 w-5" />
            截图控制
          </CardTitle>
          <CardDescription>
            测试截图功能和性能监控
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={captureScreenshot}
              disabled={isCapturing || !transcriptionData}
              className="flex items-center gap-2"
            >
              <TbCamera className="h-4 w-4" />
              {isCapturing ? '截图中...' : '截图'}
            </Button>
            <Button
              variant="outline"
              onClick={clearScreenshots}
              disabled={screenshots.length === 0}
            >
              清空截图
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={getTranscriptionData}
              disabled={loading}
            >
              {loading ? "获取中..." : "重新获取转写数据"}
            </Button>
          </div>

          {/* 转写数据状态 */}
          <div className="text-sm text-muted-foreground">
            转写数据状态: {transcriptionData ? '已加载' : '未加载'}
            {!transcriptionData && nId && (
              <span className="text-red-500 ml-2">需要先获取转写数据才能截图</span>
            )}
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <TbFile className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{stats.totalScreenshots}</div>
                <div className="text-xs text-muted-foreground">总截图数</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TbFile className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{(stats.totalSize / 1024).toFixed(1)}KB</div>
                <div className="text-xs text-muted-foreground">总大小</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TbClock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{stats.averageTime.toFixed(1)}ms</div>
                <div className="text-xs text-muted-foreground">平均耗时</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 截图列表 */}
      {screenshots.length > 0 && (
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
                      <div className="text-xs text-muted-foreground">
                        {new Date(screenshot.timestamp).toLocaleString()}
                      </div>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {(screenshot.size / 1024).toFixed(1)}KB
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {screenshot.duration.toFixed(1)}ms
                        </Badge>
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
      )}

      {/* 性能测试说明 */}
      <Card>
        <CardHeader>
          <CardTitle>性能测试说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• 截图功能测试：验证截图功能是否正常工作</p>
          <p>• 性能监控：记录每次截图的时间和文件大小</p>
          <p>• 内存管理：监控截图数据的内存占用</p>
          <p>• 批量测试：可以连续截图测试性能稳定性</p>
        </CardContent>
      </Card>
    </div>
  );
} 