import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from '../store'

describe('store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('has correct initial state', () => {
    const store = useAppStore()

    expect(store.phone).toBe('')
    expect(store.cellid).toBeNull()
    expect(store.size).toBeNull()
    expect(store.priceTotal).toBe(0)
    expect(store.time).toBeNull()
    expect(store.caption).toBe('')
    expect(store.action).toBe('')
    expect(store.text).toBe('')
    expect(store.back).toBe('')
    expect(store.mainpage).toBeNull()
  })

  it('updates phone', () => {
    const store = useAppStore()
    store.phone = '1234567890'
    expect(store.phone).toBe('1234567890')
  })

  it('updates cellid', () => {
    const store = useAppStore()
    store.cellid = 42
    expect(store.cellid).toBe(42)
  })

  it('updates size with SizeKey', () => {
    const store = useAppStore()
    store.size = 'XL'
    expect(store.size).toBe('XL')
  })

  it('updates priceTotal', () => {
    const store = useAppStore()
    store.priceTotal = 1500
    expect(store.priceTotal).toBe(1500)
  })

  it('updates time', () => {
    const store = useAppStore()
    store.time = 5
    expect(store.time).toBe(5)
    store.time = '3 hours'
    expect(store.time).toBe('3 hours')
  })

  it('updates action with ActionType values', () => {
    const store = useAppStore()
    store.action = 'begin'
    expect(store.action).toBe('begin')
    store.action = 'extend'
    expect(store.action).toBe('extend')
    store.action = 'complete'
    expect(store.action).toBe('complete')
    store.action = ''
    expect(store.action).toBe('')
  })

  it('updates mainpage', () => {
    const store = useAppStore()
    store.mainpage = { occupied: true, freeCells: 5 }
    expect(store.mainpage).toEqual({ occupied: true, freeCells: 5 })
  })

  it('resets state when creating new pinia instance', () => {
    const store = useAppStore()
    store.phone = '999'
    store.cellid = 10
    store.size = 'L'

    setActivePinia(createPinia())
    const freshStore = useAppStore()

    expect(freshStore.phone).toBe('')
    expect(freshStore.cellid).toBeNull()
    expect(freshStore.size).toBeNull()
  })
})
