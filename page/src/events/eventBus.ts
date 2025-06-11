import mitt, { type Emitter } from 'mitt'

import { PlayerTimeUpdate, WhisperSegments } from '@/types'

export const customEvents = {
  PlayerSeekTo: 'player:seek:to',
  PlayerTimeupdate: 'player:timeupdate',
  PlayerRegionUpdate: 'player:region:update',
  PlayerRegionUpdateEnd: 'player:region:update:end',
  SearchIndexChange: 'search:index:change',
  SubtitleSettingShow: 'subtitle:setting:show',
  CancelTranscript: 'cancel:transcript',
  Develop: 'under:development',
  CopyText: 'copy:text',
  CopyMD: 'copy:md',
  CopyHTML: 'copy:html',
  SaveMD: 'save:md',
  SaveNotion: 'save:notion',
  ShowWelcome: 'show:welcome',
} as const

type CustomEvents = typeof customEvents

type ValueOf = CustomEvents[keyof CustomEvents]

export type ActionData = WhisperSegments | PlayerTimeUpdate | Record<string, any>

export type EmitterEvents = Record<ValueOf, ActionData>

export const eventBus: Emitter<EmitterEvents> = mitt<EmitterEvents>()
