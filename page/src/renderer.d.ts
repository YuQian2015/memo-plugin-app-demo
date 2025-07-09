import { IElectronAPI } from "@aim-packages/iframe-ipc/dist/types"



// import { IAimInputFile, IMetadata, IModel, MediaPreviewInfo, NoteModel } from './types'

// import { DocRequestData, DownloadRequestData, WorkspaceRequestData } from './types'
// import { AppSettings, DownloadModel, ITranscriptSetting, LanguageCode, SupportProviders, WindowPostMessage, WorkspaceModel, ChatRequest } from "./types"

// export interface BridgeInterface {
//   isIframe: boolean
//   source: {
//     url: string
//     query: Record<string, string>
//   }
// }

// export interface IElectronAPI extends BridgeInterface {
//   isMac: boolean, isWindows: boolean, isLinux: boolean,
//   platform: 'win32' | 'darwin' | 'linux',

//   localStorage: {
//     setItem: (key: string, value: string) => Promise<void>
//     getItem: (key: string) => Promise<string>
//     removeItem: (key: string) => Promise<void>
//     clear: () => Promise<void>
//   }
//   memoryStorage: {
//     setItem: (key: string, value: any) => Promise<void>
//     getItem: (key: string) => Promise<any>
//     removeItem: (key: string) => Promise<void>
//     clear: () => Promise<void>;
//   }
//   storage: {
//     setItem: (pluginId: string, key: string, value: any) => Promise<void>
//     getItem: (pluginId: string, key: string) => Promise<any>
//     removeItem: (pluginId: string, key: string) => Promise<void>
//     clear: (pluginId: string) => Promise<void>;
//   }

//   openDialog: (method: string, config: Record<string, any>) => Promise<string[]>,
//   audioToText: (transcriptSetting: ITranscriptSetting, inputFile: IAimInputFile) => Promise<string[]>
//   stopAudioToText: () => Promise<boolean>

//   convertInputFile: (inputFile: IAimInputFile) => Promise<IAimInputFile>
//   convertInputFileVideo: (inputFile: IAimInputFile) => Promise<IAimInputFile>,
//   cancelEncodeInputFileVideo: () => Promise<any>,

//   // 获取文件的元信息，生成本地.info文件
//   getFileMetadata: (inputPath: string, outputName: string) => Promise<{ metadata: IMetadata, ogFilename: string }>
//   // 截取视频文件的封面图并保存，并返回封面地址
//   getFileScreenshots: (inputPath: string, outputName: string) => Promise<any>

//   getMachineId: () => Promise<string>,
//   checkDevice: () => Promise<boolean>,
//   registerCDKey: (code: string) => Promise<any>,

//   chat: {
//     chat: (data: ChatRequest) => Promise<string>;
//   };

//   // Update
//   checkUpdate: () => Promise<any>,
//   startDownload: () => Promise<any>,
//   quitAndInstall: () => Promise<any>,
//   checkVersion: () => Promise<{ version: string }>,

//   // OpenAI
//   createOpenAiKey: (key: string, host?: string) => Promise<any>,
//   gptCompletions: (content: string) => Promise<any>,

//   // Translate
//   translateContent: (content: string | string[], lang: { label: string, value: string }) => Promise<{ status: boolean, content: string | string[] }>,
//   translateLine: (content: string, lang: { label: string, value: string }) => Promise<{ status: boolean, content: string }>,
//   getSupportTranslateLanguage: (lang?: SupportProviders) => Promise<{
//     name: SupportProviders;
//     supportLanguage: Partial<Record<LanguageCode, string>>;
//   }>,

//   // setting
//   changeSetting: (key: keyof AppSettings, value: any) => Promise<Record<string, any>>,
//   getSetting: (key?: keyof AppSettings) => Promise<AppSettings[key]>,
//   checkSetting: (key?: string) => Promise<boolean>,
//   checkSystemProxy: () => Promise<any>,
//   testProxy: () => Promise<any>,

//   // model
//   downloadModel: (name: string) => Promise<any>,
//   cancelDownloadModel: (name: string) => Promise<any>,
//   checkModelExist: (value: string) => Promise<boolean>
//   getModelList: () => Promise<IModel[]>
//   openModelFolder: () => Promise<any>,
//   moveModel: (dest: string) => Promise<boolean>,

//   // video
//   downloadYoutubeVideo: (data: DownloadModel) => Promise<any>,
//   downloadXyzVideo: (data: DownloadModel) => Promise<any>,
//   downloadMedia: (data: DownloadModel) => Promise<any>,
//   getMediaInfo: (url: string) => Promise<MediaPreviewInfo>,
//   getYoutubeVideoInfo: (url: string) => Promise<videoInfo | null>,
//   getXiaoyuzhoufmInfo: (url: string) => Promise<MediaPreviewInfo>,
//   downloadThumbnail: (url: string, filename: string) => Promise<boolean>,
//   exportVideo: (data: string, fileInfo: string, subtitle: string, extensions: string[], filename?: string) => Promise<boolean>,

//   // Recorder
//   startRecord: () => Promise<any>,
//   getDesktopSources: () => Promise<{
//     id: string,
//     name: string,
//     icon?: string,
//     thumbnail: string
//   }>,

//   readAudio: (audioPath: string) => Promise<any>
//   selectFile: (type?: 'resource' | 'model') => Promise<string[] | undefined>
//   saveFile: (extensions: string[], result: any, filename?: string) => Promise<boolean>,
//   checkModelsFolder: () => Promise<boolean>,
//   createModelsFolder: () => Promise<boolean>,
//   importModels: (modelPaths: Array<string>, onProgress?: (progress: number) => any) => Promise<false | string>
//   saveNote: (data: Omit<NoteModel, 'id'>) => Promise<any>
//   updateNote: (data: Partial<NoteModel>) => Promise<any>,

//   searchNote: (data: { keyword: string }) => Promise<NoteModel[]>
//   findNoteDetail: (id: number) => Promise<NoteModel | undefined>
//   removeNote: (id: number) => Promise<boolean>,
//   findNote: (data: Partial<NoteModel>) => Promise<NoteModel[]>,
//   findDelete: (data: Partial<NoteModel>) => Promise<NoteModel[]>,

//   clearAllNote: () => Promise<Record<string, any>>
//   copyText: (str: string) => Promise<any>,
//   selectSubtitle: () => Promise<{
//     path: string
//     data: WhisperSegments[]
//   }>,

//   recreateTable: () => Promise<Record<string, any>>
//   noteData: <T extends keyof NoteRequestData>(method: T, data: NoteRequestData[T]) => Promise<NoteModel[]>,
//   downloadData: <T extends keyof DownloadRequestData>(method: T, data: DownloadRequestData[T]) => Promise<DownloadModel[]>,
//   workspaceData: <T extends keyof WorkspaceRequestData>(method: T, data: WorkspaceRequestData[T]) => Promise<WorkspaceModel[]>,
//   docData: <T extends keyof DocRequestData>(method: T, data: DocRequestData[T]) => Promise<DocModel[]>,

//   // Publish
//   publishToNotion: (title: string, segments?: Array<[string, string, string]>) => Promise<any>,

//   // file
//   checkFileExist: (path: string) => Promise<boolean>,

//   // window
//   closeWindow: () => Promise<boolean>,
//   openChildWindow: (data: {
//     type: "doc",
//     query: {
//       docId?: number | string
//       noteId?: number | string
//     }
//   }) => Promise<boolean>;
//   openChildWindow: (data: {
//     type: string,
//     query: Record<string, any>
//   }) => Promise<boolean>;
//   sendToChildWindow: (data: any) => Promise<unknown>,
//   windowPostMessage: (data: WindowPostMessage) => Promise<unknown>,

//   sendFile: (fileBlob: ArrayBuffer) => Promise<string | undefined>,

//   // Store
//   getStoreValue: (key: string) => Promise<any>,
//   setStoreValue: (key: string, value: any) => Promise<any>,

//   handleMessage: (handleFunction: (event: IpcRendererEvent, data: MessageData) => any, name: string) => Promise<void>
//   removeHandler: (name?: string) => Promise<void>

//   handleWindowMessage: (handleFunction: (event: IpcRendererEvent, data: MessageData) => any, name: string) => Promise<void>
//   removeWindowHandler: (name?: string) => Promise<void>
// }

declare global {
  interface Window {
    AIM: IElectronAPI
  }
}