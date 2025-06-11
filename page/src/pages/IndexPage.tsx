// @ts-nocheck
import { useEffect, useState } from "react";
import PageComp from "./PageComp";

export function modelToTranscriptFile(note: any) {
  return {
    ...note,
    id: note.id,
    transcodeAudio: !!note.transcodeAudio,
    metadata: note.metadata ? JSON.parse(note.metadata) : null,
    transcriptSettings: note.transcriptSettings
      ? JSON.parse(note.transcriptSettings)
      : null,
    convertResult: JSON.parse(note.convertResult),
    multiTranslateResult: note.multiTranslateResult
      ? JSON.parse(note.multiTranslateResult)
      : null,
    translateResult: note.translateResult
      ? JSON.parse(note.translateResult)
      : null,
    summary: note.summary ? JSON.parse(note.summary) : null,
    canplayVideo: !!note.canplayVideo,
    hasAudio: !!note.hasAudio,
    hasVideo: !!note.hasVideo,
  };
}

export function transcriptFileToModel(transcriptFile: any) {
  return {
    ...transcriptFile,
    transcriptSettings: transcriptFile.transcriptSettings
      ? JSON.stringify(transcriptFile.transcriptSettings)
      : undefined,
    summary: transcriptFile.summary
      ? JSON.stringify(transcriptFile.summary)
      : undefined,
    multiTranslateResult: transcriptFile.multiTranslateResult
      ? JSON.stringify(transcriptFile.multiTranslateResult)
      : undefined,
    translateResult: transcriptFile.translateResult
      ? JSON.stringify(transcriptFile.translateResult)
      : undefined,
    metadata: JSON.stringify(transcriptFile.metadata),
    convertResult: JSON.stringify(transcriptFile.convertResult || []),
  };
}

function IndexPage() {
  const [data, setData] = useState<any>(null)
  const queryParams = new URLSearchParams(window.location.search);
  const nId = queryParams.get('noteId');
  const fId = queryParams.get('folderId');
  const wId = queryParams.get('workspaceId');

  console.log("noteId", nId, "folderId", fId, "workspaceId", wId);
  useEffect(() => {
    if (nId) {
      window.AIM.noteData('detail', { id: nId || undefined, workspaceId: wId || undefined, folderId: fId || undefined }).then(res => {
        console.log(res);
        
        if (res) {
          setData(modelToTranscriptFile(res))
        }
      })
    }
  }, [nId, wId, fId])


  return (
    <div className="h-full">
      {data && <PageComp currentFile={data} />}
    </div>
  )
}

export default IndexPage