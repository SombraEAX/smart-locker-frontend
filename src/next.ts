import { useAppStore } from './store'
import { getTimes } from './api'
import { gracePeriod } from './config'
import { log } from './logger'
import type { Ui } from './types'

export default async function (ui: Ui): Promise<void> {
  const store = useAppStore()
  if (store.action === 'extend') {
    ui.jump('SelectTimeStorage', 'left')
  } else {
    if (store.cellid === null) {
      ui.jump('InternalError')
      return
    }
    try {
      const { start } = await getTimes(store.cellid)

      const now = new Date()
      const delta = now.getTime() - start.getTime()

      if (delta > gracePeriod * 60 * 1000) {
        ui.jump('Warning', 'left')
      } else {
        ui.jump('OpenCell', 'left')
      }
    } catch (e) {
      log('error', 'next() getTimes failed', { cellid: store.cellid, error: String(e) })
      ui.jump('InternalError')
    }
  }
}
