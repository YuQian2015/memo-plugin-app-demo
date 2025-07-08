import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Textarea } from "../ui/textarea";
import { useToast } from "@/components/hooks/use-toast";

export function StorageTab() {
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const { toast } = useToast();
  // 页面加载时获取已保存的内容
  useEffect(() => {
    window.AIM.storage.getItem("data").then((res: any) => {
      if (res && res.text) {
        setSavedContent(res.text);
        setContent(res.text);
      }
    }).catch(() => {
      // 如果没有保存的数据，忽略错误
    });
  }, []);

  const handleSave = () => {
    window.AIM.storage.setItem("data", {
      text: content
    }).then(() => {
      toast({
        title: "保存成功",
        description: "数据已保存到本地",
      });
      setSavedContent(content);
    }).catch(() => {
      toast({
        title: "保存失败",
        description: "数据保存失败",
      });
    });
  };

  const handleLoad = () => {
    window.AIM.storage.getItem("data").then((res: any) => {
      if (res && res.text) {
        setContent(res.text);
        setSavedContent(res.text);
        toast({
          title: "数据已加载",
          description: "数据已加载到本地",
        });
      } else {
        toast({
          title: "没有找到保存的数据",
          description: "没有找到保存的数据",
        });
      }
    }).catch(() => {
      toast({
        title: "获取数据失败",
        description: "获取数据失败",
      });
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">本地存储</div>

      <div className="space-y-2">
        <label className="text-sm font-medium">输入内容：</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="请输入要保存的内容..."
        />
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave}>
          保存数据
        </Button>
        <Button size="sm" onClick={handleLoad}>
          获取数据
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setContent("")}
        >
          清空输入
        </Button>
      </div>

      {savedContent && (
        <div className="space-y-2">
          <label className="text-sm font-medium">已保存的内容：</label>
          {savedContent}
        </div>
      )}
    </div>
  );
} 