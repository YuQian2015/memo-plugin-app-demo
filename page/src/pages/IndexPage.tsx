import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BasicInfoTab,
  TranscriptionTab,
  ChatTab,
  PlayerTab,
  StorageTab,
  FFmpegTab,
  ScreenshotTab
} from "@/components/tabs";
import { useState } from "react";

function IndexPage() {
  const queryParams = new URLSearchParams(window.location.search);
  const nId = queryParams.get('noteId') || undefined;
  const fId = queryParams.get('folderId') || undefined;
  const wId = queryParams.get('workspaceId') || undefined;
  const [tabVal, setTabVal] = useState('basic');

  return (
    <div className="h-full">
      <div className="p-2">
        <Tabs value={tabVal} onValueChange={setTabVal}>
          <TabsList>
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="transcription">转写</TabsTrigger>
            <TabsTrigger value="chat">聊天</TabsTrigger>
            <TabsTrigger value="player">播放器</TabsTrigger>
            <TabsTrigger value="storage">存储</TabsTrigger>
            <TabsTrigger value="ffmpeg">FFmpeg</TabsTrigger>
            <TabsTrigger value="screenshot">截图</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="w-full" style={{ height: 'calc(100% - 52px)' }}>
        {
          tabVal === 'basic' && (
            <BasicInfoTab nId={nId} fId={fId} wId={wId} />
          )
        }
        {
          tabVal === 'transcription' && (
            <TranscriptionTab nId={nId} fId={fId} wId={wId} />
          )
        }

        {
          tabVal === 'chat' && (
            <ChatTab />
          )
        }

        {
          tabVal === 'storage' && (
            <StorageTab />
          )
        }

        {
          tabVal === 'player' && (
            <PlayerTab />
          )
        }

        {
          tabVal === 'ffmpeg' && (
            <FFmpegTab nId={nId} fId={fId} wId={wId} />
          )
        }

        {
          tabVal === 'screenshot' && (
            <ScreenshotTab nId={nId} fId={fId} wId={wId} />
          )
        }
      </div>
    </div>
  )
}

export default IndexPage