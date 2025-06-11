interface Progress {
  percent: number;
  transferredBytes: number;
  totalBytes: number;
}

interface File {
  filename: string;
  path: string;
  fileSize: number;
  mimeType: string;
  url: string;
}

export type PlayerTimeUpdate = {
  currentTime: number
}

export interface WhisperSegments {
  st: string
  et: string
  text: string
  delete?: boolean
  cut?: boolean
}

export interface NoteModel {
  id?: number;
  uuid: string;
  filename: string;
  hasAudio: boolean;
  hasVideo: boolean;
  filePath: string;
  content: string;
  metadata: string;
  convertResult: string;
  translateResult?: string;
  status: 'downloading' | 'ready' | 'waiting' | 'processing' | 'canceled' | 'success' | 'delete';
  downloadUrl?: string;
  downloadType?: DownloadPlatform;
  transcodeAudio?: boolean; // 是否已经转换过音频
  transcriptSettings?: string;
  ogFilename?: string;
  audioPath?: string;
  videoPath?: string;
  thumbnail?: any;
  canplayVideo?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface TagModel {
  id: number;
  name: string;
}

export type DownloadPlatform = 'YouTube' | 'Bilibili' | 'Xiaoyuzhou' | 'ApplePodcast' | 'Other'
export type DownloadStatus = 'ready' | 'waiting' | 'pending' | 'downloading' | 'completed' | 'error'

export interface DownloadModel {
  id?: number;
  title: string;
  filename: string;
  localFilename: string;
  url: string;
  description?: string;
  thumbnail?: string;
  platform?: DownloadPlatform;
  quality?: string;
  qualityLabel?: string;
  ext?: string;
  status?: DownloadStatus;
  progress?: number;
  trackUrl?: string;
  trackType?: string;
  trackLang?: string;
  trackData?: string;
  transcriptSettings?: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface NoteModel {
  id?: number;
  uuid: string;
  filename: string;
  hasAudio: boolean;
  hasVideo: boolean;
  filePath: string;
  content: string;
  metadata: string;
  convertResult: string;
  translateResult?: string;
  status: 'downloading' | 'ready' | 'waiting' | 'processing' | 'canceled' | 'success' | 'delete';
  downloadUrl?: string;
  downloadType?: DownloadPlatform;
  transcodeAudio?: boolean; // 是否已经转换过音频
  transcriptSettings?: string;
  ogFilename?: string;
  audioPath?: string;
  videoPath?: string;
  thumbnail?: any;
  canplayVideo?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface WorkspaceModel {
  id?: number;
  name: string;
  folder: string;
  icon?: string;
  thumbnail?: string;
  description?: string;
  backgroundColor?: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface DocModel {
  id?: number | string;
  title: string;
  localFilename: string;
  workspaceId: number | string;
  noteId?: number | string;
  folderId?: number | string;
  icon?: string;
  thumbnail?: string;
  description?: string;
  content?: string;
  created_at?: string | null;
  updated_at?: string | null;
}


export interface TagModel {
  id: number;
  name: string;
}

export interface AudioToTextProgress {
  type: 'audio:text:progress'
  data: { file: IAimInputFile, text: string }
}

export interface AudioToTextEnd {
  type: 'audio:text:end'
  data: { file: IAimInputFile }
}

export interface AudioToTextError {
  type: 'audio:text:error'
  data: { file: IAimInputFile, message: string }
}

export interface MediaConvertProgress {
  type: 'media:encode:progress'
  data: { progress: number }
}

export interface VideoConvertProgress {
  type: 'media:encode:video:progress'
  data: { progress: number }
}

export interface ModelFolderExist {
  type: 'model:folder:exist'
  data: {
    path: string,
    exist: boolean
  }
}

export interface ModelImportProgress {
  type: 'model:import:progress'
  data: { progress: number }
}

export interface ModelMoveProgress {
  type: 'model:move:progress'
  data: { percent: number, total: number, currentFile?: string }
}

export interface ModelMoveComplete {
  type: 'model:move:complete'
  data: { percent: number, total: number, currentFile?: string }
}

export interface SettingChange {
  type: 'setting:change'
  data: Record<string, any>
}

export interface FileDownloadProgress {
  type: 'file:download:progress'
  data: Progress
}

export interface FileDownloadTotalProgress {
  type: 'file:download:total:progress'
  data: Progress
}

export interface FileDownloadCompleted {
  type: 'file:download:completed'
  data: File
}

export interface VideoDownloadProgress {
  type: 'video:download:progress'
  data: {
    percent?: number
    total?: number
    downloaded?: number
    runningTime?: number
    estimatedTimeLeft?: number
    statusText?: string
    downloadSpeed?: string
    totalSize?: string
    eta?: string
  },
  downloadItem: DownloadModel
}

export interface VideoDownloadCompleted {
  type: 'video:download:completed'
  data: any,
  thumbnails?: string[],
  downloadItem: DownloadModel
  trackData?: Array<WhisperSegments[]>
}

export interface VideoDownloadError {
  type: 'video:download:error'
  data: any,
  downloadItem: DownloadModel
}

export interface VideoCutStart {
  type: 'video:cut:start'
  data: any
}

export interface VideoCutProgress {
  type: 'video:cut:progress'
  data: any
}

export interface VideoCutCompleted {
  type: 'video:cut:completed'
  data: any
}

export interface VideoCutError {
  type: 'video:cut:error'
  data: any
}

export interface VideoMergeStart {
  type: 'video:merge:start'
  data: any
}

export interface VideoMergeProgress {
  type: 'video:merge:progress'
  data: any
}

export interface VideoMergeCompleted {
  type: 'video:merge:completed'
  data: any
}

export interface VideoMergeError {
  type: 'video:merge:error'
  data: any
}

export interface VideoExportComplete {
  type: 'video:export:complete'
  data: any
}

// 视频片段定义
export type VideoClip = {
  start: number // 视频片段开始时间
  end: number // 视频片段结束时间
  isCut: boolean // 是否裁剪
  percent?: number // 所占百分比
}

export interface DesktopSource {
  type: 'desktop:source'
  data: {
    id: string,
    name: string,
    icon?: string,
    thumbnail: string
  }
}

export interface StartCheckSystemProxy {
  type: 'proxy:check:system:start'
  data: any
}

export interface StopCheckSystemProxy {
  type: 'proxy:check:system:stop'
  data: any
}

export type Message = AudioToTextProgress | ModelImportProgress | ModelMoveProgress | ModelMoveComplete | ModelFolderExist
  | MediaConvertProgress | AudioToTextEnd | VideoConvertProgress | SettingChange
  | FileDownloadProgress | FileDownloadTotalProgress | FileDownloadCompleted
  | VideoDownloadProgress | VideoDownloadCompleted | VideoDownloadError
  | VideoCutStart | VideoCutProgress | VideoCutCompleted | VideoCutError
  | VideoMergeStart | VideoMergeProgress | VideoMergeCompleted | VideoMergeError
  | VideoExportComplete
  | StartCheckSystemProxy | StopCheckSystemProxy

export interface MessageData<T extends Message = Message> {
  type: T['type']
  data: T['data']
}

export interface IMetadata {
  chapters: Array<any>
  format: Record<string, any>
  streams: Array<Record<string, any>>
}

export interface IAimInputFile {
  id?: number
  uuid: string
  filename: string
  hasAudio: boolean
  hasVideo: boolean
  filePath: string
  metadata: IMetadata
  ogFilename?: string
  audioPath?: string
  videoPath?: string
  thumbnail?: string
  canplayVideo?: boolean
  content: string
  convertResult: string
  // ready 选择文件完成，已经获取元信息
  // waiting 转换设置完成，等待开始转换
  // processing 转换中
  // canceled 已经取消转换
  // success 转换成功
  status: 'downloading' | 'ready' | 'waiting' | 'processing' | 'canceled' | 'success' | 'delete';
  downloadUrl?: string;
  downloadType?: DownloadPlatform;
  transcodeAudio?: boolean; // 是否已经转换过音频
  transcriptSettings?: ITranscriptSetting
  created_at?: string | null
  updated_at?: string | null
}

export interface ITranscriptSetting {
  transcriptType: 'local' | 'cloud'
  model: string
  language: string
  prompt: string
  maxLen?: number
  enableMaxLen?: boolean
  translateLanguage?: 0 | 1
  mergeAudio?: 0 | 1
}

export interface AppSettings {
  OpenAI?: string
  OpenAIHost?: string
  showWelcome?: "0" | "1"
  darkMode?: "0" | "1"
  translateProvider?: SupportProviders
  language?: string
  httpProxy?: {
    port?: number
    host?: string
  }
  proxy?: {
    type: 'none' | 'system' | 'custom',
    proxy?: Array<{
      type?: 'http' | 'socks5',
      active?: boolean
      port?: number
      hostname?: string
    }>
  }
  volctrans?: {
    accessKeyId: string, secretKey: string
  },
  DeepL?: {

    freeApi: boolean, authKey: string
  }
  notion?: {
    secretKey?: string
    pageId?: string
  }
  modelDir?: string
}

export interface IModel {
  label: string;
  value: string;
  size: string;
  description: string;
  disabled: boolean;
  downloadLink: string;
  speed: number;
  quality: number;
  download: boolean;
  lang?: string;
}

export interface AppFolder {
  basePath: string;
  model: Path;
  temp: Path;
  db: Path;
  conf: Path;
  log: Path;
  migrations: Path;
}

export interface Path {
  path: string;
  exist: boolean;
}

export type NoteFilterTypes = 'all' | 'audio' | 'video'

export type PartialByKey<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredByKey<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type LanguageCode =
  | "auto" // 自动检测
  | "zh_cn" // 简体中文
  | "zh_tw" // 繁体中文
  | "yue" // 粤语
  | "en" // 英语
  | "ja" // 日语
  | "ko" // 韩语
  | "fr" // 法语
  | "es" // 西班牙语
  | "ru" // 俄语
  | "de" // 德语
  | "it" // 意大利语
  | "tr" // 土耳其语
  | "pt" // 葡萄牙语
  | "vi" // 越南语
  | "id" // 印度尼西亚语
  | "th" // 泰语
  | "ms" // 马来西亚语
  | "ar" // 阿拉伯语
  | "hi"; // 印地语(印度的官方语言)

export type SupportProviders = 'Google' | 'OpenAI' | 'Microsoft' | 'Volctrans' | 'DeepL'

export type MediaPreviewInfo = {
  title: string
  url: string
  image: string
  type: DownloadPlatform
  originalUrl: string // 用户输入的原始链接
  ext: string
  quality?: string
  qualityLabel?: string
  trackUrl?: string
  trackType?: string
} | null

export interface DocRequestData {
  find: Partial<DocModel>
  create: Partial<DocModel>
  update: RequiredByKey<Partial<DocModel>, 'id'>
  detail: RequiredByKey<Partial<DocModel>, 'id'>
  delete: RequiredByKey<DocModel, 'id'>
}

export interface DownloadRequestData {
  find: Partial<DownloadModel>
  create: Partial<DownloadModel>
  update: RequiredByKey<Partial<DownloadModel>, 'id'>
  detail: RequiredByKey<DownloadModel, 'id'>
  delete: RequiredByKey<DownloadModel, 'id'>
}
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  prompt?: string;
  model?: string;
  temperature?: number;
  provider?: string;
  uuid?: string;
}

