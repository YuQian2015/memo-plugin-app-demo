import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BasicInfoTab, 
  TranscriptionTab, 
  ChatTab, 
  PlayerTab, 
  StorageTab,
  FFmpegTab,
  ScreenshotTab
} from "@/components/tabs";

function IndexPage() {
  const queryParams = new URLSearchParams(window.location.search);
  const nId = queryParams.get('noteId') || undefined;
  const fId = queryParams.get('folderId') || undefined;
  const wId = queryParams.get('workspaceId') || undefined;

  return (
    <div className="h-full p-4">
      <Tabs defaultValue="basic" className="h-full">
        <TabsList>
          <TabsTrigger value="basic">基本信息</TabsTrigger>
          <TabsTrigger value="transcription">转写</TabsTrigger>
          <TabsTrigger value="chat">聊天</TabsTrigger>
          <TabsTrigger value="player">播放器</TabsTrigger>
          <TabsTrigger value="storage">存储</TabsTrigger>
          <TabsTrigger value="ffmpeg">FFmpeg</TabsTrigger>
          <TabsTrigger value="screenshot">截图</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-4">
          <BasicInfoTab nId={nId} fId={fId} wId={wId} />
        </TabsContent>

        <TabsContent value="transcription" className="mt-4">
          <TranscriptionTab nId={nId} fId={fId} wId={wId} />
        </TabsContent>

        <TabsContent value="chat" className="mt-4">
          <ChatTab />
        </TabsContent>

        <TabsContent value="storage" className="mt-4">
          <StorageTab />
        </TabsContent>

        <TabsContent value="player" className="mt-4">
          <PlayerTab />
        </TabsContent>

        <TabsContent value="ffmpeg" className="mt-4">
          <FFmpegTab nId={nId} fId={fId} wId={wId} />
        </TabsContent>

        <TabsContent value="screenshot" className="mt-4">
          <ScreenshotTab nId={nId} fId={fId} wId={wId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default IndexPage