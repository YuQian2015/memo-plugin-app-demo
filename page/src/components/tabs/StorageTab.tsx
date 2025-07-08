import { Button } from "@/components/ui/button";

interface StorageTabProps {
  generatedText: string;
}

export function StorageTab({ generatedText }: StorageTabProps) {
  return (
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
  );
} 