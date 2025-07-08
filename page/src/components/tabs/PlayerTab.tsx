import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { TbCamera } from "react-icons/tb";

export function PlayerTab() {
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [isTakingScreenshot, setIsTakingScreenshot] = useState(false);

  const handleScreenshotsData = useCallback((event: any, msg: any) => {
    if (msg.type === 'send:file:completed') {
      setScreenshotUrl('aim:///' + msg.data);
      setIsTakingScreenshot(false);
    }
  }, []);

  useEffect(() => {
    // 监听截图完成事件
    window.AIM.handleMessage(handleScreenshotsData, 'ScreenshotsData');
    
    // 清理函数
    return () => {
      window.AIM.removeHandler('ScreenshotsData');
    };
  }, [handleScreenshotsData]);

  const handleScreenshot = async () => {
    try {
      setIsTakingScreenshot(true);
      await window.AIM.player.screenshot();
    } catch (error) {
      console.error('截图失败:', error);
      setIsTakingScreenshot(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={() => window.AIM.player.play()}>播放</Button>
        <Button onClick={() => window.AIM.player.pause()}>暂停</Button>
        <Button 
          onClick={handleScreenshot} 
          disabled={isTakingScreenshot}
          className="flex items-center gap-2"
        >
          <TbCamera className="w-4 h-4" />
          {isTakingScreenshot ? '截图中...' : '截图'}
        </Button>
      </div>
      
      {screenshotUrl && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">最新截图</h3>
          <div className="border rounded-lg overflow-hidden">
            <img 
              src={screenshotUrl} 
              alt="播放器截图" 
              className="w-full h-auto max-h-64 object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
} 