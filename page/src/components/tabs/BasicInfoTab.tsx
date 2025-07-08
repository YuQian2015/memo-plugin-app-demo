import manifest from "../../../../main/manifest.json";
import { getLanguage } from "@/lib";

interface BasicInfoTabProps {
  nId?: string;
  fId?: string;
  wId?: string;
}

export function BasicInfoTab({ nId, fId, wId }: BasicInfoTabProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground">当前转写ID：{nId}</div>
      <div className="text-sm text-muted-foreground">当前文件夹ID：{fId}</div>
      <div className="text-sm text-muted-foreground">当前空间ID：{wId}</div>
      <div className="text-sm text-muted-foreground">当前插件ID：{manifest.pluginId}</div>
      <div className="text-sm text-muted-foreground">当前语言：{getLanguage()}</div>
    </div>
  );
} 