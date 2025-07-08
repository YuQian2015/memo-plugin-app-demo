import { Button } from "@/components/ui/button";

export function PlayerTab() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={() => window.AIM.player.play()}>播放</Button>
        <Button onClick={() => window.AIM.player.pause()}>暂停</Button>
      </div>
    </div>
  );
} 