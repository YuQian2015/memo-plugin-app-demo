import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TbPlayerPlay, TbTrash, TbPlayerStop } from "react-icons/tb";
import { v4 as uuidv4 } from 'uuid';
import { ScrollArea } from "../ui/scroll-area";

interface FFmpegTabProps {
  nId?: string;
  fId?: string;
  wId?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function FFmpegTab(_props: FFmpegTabProps) {
  const [command, setCommand] = useState(`ffmpeg -y -i "{input}" "{output}/test_.mp3"`);
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [inputFile, setInputFile] = useState<string>("");
  const [outputFile, setOutputFile] = useState<string>("");
  const [currentUuid, setCurrentUuid] = useState<string>("");

  // 监听FFmpeg执行消息
  useEffect(() => {
    const handleMessage = (event: any, msg: any) => {

      const { type, data } = msg;
      if (type === "ffmpeg:exec:start" && data.uuid === currentUuid) {
        setOutput(prev => prev + "开始执行FFmpeg命令...\n");
      }
      if (type === "ffmpeg:exec:message" && data.uuid === currentUuid) {
        setOutput(prev => prev + data.text + "\n");
      } else if (type === "ffmpeg:exec:error" && data.uuid === currentUuid) {
        setOutput(prev => prev + "错误: " + data.text + "\n");
        setIsExecuting(false);
      } else if (type === "ffmpeg:exec:end" && data.uuid === currentUuid) {
        setOutput(prev => prev + "执行完成！\n");
        setIsExecuting(false);
      }
    };

    window.AIM.handleMessage(handleMessage, "FFmpeg");

    return () => {
      window.AIM.removeHandler("FFmpeg");
    };
  }, [currentUuid]);

  // 生成最终命令，替换占位符
  const getFinalCommand = () => {
    let finalCommand = command;
    if (inputFile) {
      finalCommand = finalCommand.replace(/\{input\}/g, inputFile);
    }
    if (outputFile) {
      finalCommand = finalCommand.replace(/\{output\}/g, outputFile);
    }
    return finalCommand;
  };

  const executeCommand = async () => {
    const finalCommand = getFinalCommand();
    if (!finalCommand.trim()) return;

    // 生成UUID用于标识当前执行
    const uuid = uuidv4();
    setCurrentUuid(uuid);

    setIsExecuting(true);
    setOutput("开始执行FFmpeg命令...\n");

    try {
      // 调用真实的FFmpeg执行函数
      console.log(finalCommand, uuid);

      // @ts-ignore
      await window.AIM.common.execFFmpegCommand(finalCommand, uuid);

      // 命令历史记录会在执行完成后通过消息事件更新
      setCommandHistory(prev => [finalCommand, ...prev.slice(0, 9)]); // 保留最近10条命令
    } catch (error) {
      console.log(error);

      setOutput(prev => prev + `执行失败: ${error}\n`);
      setIsExecuting(false);
    }
  };

  const clearOutput = () => {
    setOutput("");
  };

  const handleHistoryCommandClick = (historyCommand: string) => {
    setCommand(historyCommand);
  };

  const finalCommand = getFinalCommand();

  return (
    <div className="flex gap-4 h-[600px]">
      {/* 左侧：命令输入区域 */}
      <div className="flex-1 space-y-4">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">输入文件</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-2 border rounded-md bg-muted/50 h-8 leading-8 text-sm">
                  {inputFile || "未选择文件"}
                </div>
                <Button size="sm" onClick={() => {
                  // @ts-ignore
                  window.AIM.selectFile().then((files: string[]) => {
                    if (files && files.length > 0) {
                      setInputFile(files[0]);
                    }
                  });
                }}>
                  选择
                </Button>
              </div>
            </div>

            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">输出文件夹</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-2 border rounded-md bg-muted/50 h-8 leading-8 text-sm">
                  {outputFile || "未选择文件夹"}
                </div>
                <Button size="sm" onClick={async () => {
                  // @ts-ignore
                  const folder: string[] = await window.AIM.openDialog("showOpenDialogSync", {
                    properties: ["openDirectory", "createDirectory"]
                  });

                  setOutputFile(folder[0]);
                }}>
                  选择
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">FFmpeg 命令</label>
              <Textarea
                placeholder="例如: ffmpeg -i {input} -c:a aac {output}"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                className="min-h-[100px] font-mono text-sm"
              />
              <div className="text-xs text-muted-foreground">
                使用 {"{input}"} 和 {"{output}"} 作为占位符
              </div>
            </div>

            {/* 最终命令预览 */}
            {finalCommand && (
              <div className="space-y-2">
                <label className="text-sm font-medium">最终命令</label>
                <div className="p-3 border rounded-md bg-muted/30 text-xs">
                  <code className="text-sm font-mono break-all">{finalCommand}</code>
                </div>
                {finalCommand === command && (
                  <div className="text-xs text-muted-foreground">
                    提示：选择输入和输出文件后，占位符将被替换为实际路径
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              {!isExecuting ? (
                <Button
                  onClick={executeCommand}
                  disabled={!finalCommand.trim()}
                  className="flex items-center gap-2"
                >
                  <TbPlayerPlay className="h-4 w-4" />
                  执行命令
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setIsExecuting(false);
                    setOutput(prev => prev + "用户停止执行\n");
                  }}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <TbPlayerStop className="h-4 w-4" />
                  停止执行
                </Button>
              )}

              <Button
                variant="outline"
                onClick={clearOutput}
                disabled={!output}
                className="flex items-center gap-2"
              >
                <TbTrash className="h-4 w-4" />
                清空输出
              </Button>
            </div>

            {commandHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">命令历史</CardTitle>
                  <CardDescription>最近执行的命令</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {commandHistory.map((historyCommand, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleHistoryCommandClick(historyCommand)}
                      >
                        <code className="text-sm flex-1">{historyCommand}</code>
                        <Badge variant="secondary" className="ml-2">
                          #{index + 1}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 右侧：输出显示区域 */}
      <div className="flex-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">执行输出</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-80px)]">
            <ScrollArea className="h-full">
              <div className="bg-muted p-4 rounded-lg min-h-full">
                <pre className="text-sm whitespace-pre-wrap font-mono">{output || "等待执行命令..."}</pre>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 