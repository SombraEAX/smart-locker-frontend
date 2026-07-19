import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from '../store'
import type { Ui } from '../types'

vi.mock('../api', () => ({
  getTimes: vi.fn(),
}))

import next from '../next'
import { getTimes } from '../api'

const getTimesMock = vi.mocked(getTimes)

function makeUi(): Ui {
  return {
    jump: vi.fn(),
    setFooter: vi.fn(),
  }
}

describe('next.ts', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('jumps to SelectTimeStorage when action is extend', async () => {
    const store = useAppStore()
    store.action = 'extend'
    const ui = makeUi()

    await next(ui)

    expect(ui.jump).toHaveBeenCalledWith('SelectTimeStorage', 'left')
    expect(getTimesMock).not.toHaveBeenCalled()
  })

  it('jumps to InternalError when cellid is null in begin mode', async () => {
    const store = useAppStore()
    store.action = 'begin'
    store.cellid = null
    const ui = makeUi()

    await next(ui)

    expect(ui.jump).toHaveBeenCalledWith('InternalError')
    expect(getTimesMock).not.toHaveBeenCalled()
  })

  it('jumps to OpenCell when within grace period', async () => {
    const store = useAppStore()
    store.action = 'begin'
    store.cellid = 5

    const now = Date.now()
    getTimesMock.mockResolvedValue({
      start: new Date(now - 2 * 60 * 1000),
      end: new Date(now + 3600000),
    })

    const ui = makeUi()
    await next(ui)

    expect(getTimesMock).toHaveBeenCalledWith(5)
    expect(ui.jump).toHaveBeenCalledWith('OpenCell', 'left')
  })

  it('jumps to Warning when past grace period', async () => {
    const store = useAppStore()
    store.action = 'begin'
    store.cellid = 5

    const now = Date.now()
    getTimesMock.mockResolvedValue({
      start: new Date(now - 20 * 60 * 1000),
      end: new Date(now + 3600000),
    })

    const ui = makeUi()
    await next(ui)

    expect(getTimesMock).toHaveBeenCalledWith(5)
    expect(ui.jump).toHaveBeenCalledWith('Warning', 'left')
  })

  it('jumps to Warning exactly at grace period boundary', async () => {
    const store = useAppStore()
    store.action = 'begin'
    store.cellid = 5

    const now = Date.now()
    getTimesMock.mockResolvedValue({
      start: new Date(now - 15 * 60 * 1000 - 1),
      end: new Date(now + 3600000),
    })

    const ui = makeUi()
    await next(ui)

    expect(ui.jump).toHaveBeenCalledWith('Warning', 'left')
  })

  it('jumps to OpenCell just before grace period ends', async () => {
    const store = useAppStore()
    store.action = 'begin'
    store.cellid = 5

    const now = Date.now()
    getTimesMock.mockResolvedValue({
      start: new Date(now - 14 * 60 * 1000),
      end: new Date(now + 3600000),
    })

    const ui = makeUi()
    await next(ui)

    expect(ui.jump).toHaveBeenCalledWith('OpenCell', 'left')
  })

  it('handles action complete same as begin', async () => {
    const store = useAppStore()
    store.action = 'complete'
    store.cellid = 1

    const now = Date.now()
    getTimesMock.mockResolvedValue({
      start: new Date(now - 1000),
      end: new Date(now + 3600000),
    })

    const ui = makeUi()
    await next(ui)

    expect(getTimesMock).toHaveBeenCalledWith(1)
    expect(ui.jump).toHaveBeenCalledWith('OpenCell', 'left')
  })
})
