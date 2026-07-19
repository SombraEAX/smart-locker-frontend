import { defineStore } from 'pinia'
import type { SizeKey } from './api'

export type ActionType = 'begin' | 'extend' | 'complete' | ''

export interface AppState {
  phone: string
  cellid: number | null
  size: SizeKey | null
  priceTotal: number
  time: number | string | null
  caption: string
  action: ActionType
  text: string
  back: string
  mainpage: { occupied: boolean; freeCells: number } | null
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    phone: '',
    cellid: null,
    size: null,
    priceTotal: 0,
    time: null,
    caption: '',
    action: '',
    text: '',
    back: '',
    mainpage: null,
  }),
})
