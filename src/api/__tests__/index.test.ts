import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { HardwareCell } from '../index'

const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

describe('api - mock mode (VITE_USE_MOCK=true)', () => {
  beforeEach(async () => {
    vi.stubGlobal('import.meta.env', {
      VITE_USE_MOCK: 'true',
      VITE_API_SERVER: 'http://api.local/',
      VITE_DATA_SERVER: 'http://data.local/',
      VITE_API_PASSWORD: 'secret',
    })
    vi.resetModules()
    fetchMock.mockReset()
  })

  async function loadApi() {
    return await import('../index')
  }

  it('fsize returns XL in mock mode', async () => {
    const api = await loadApi()
    expect(api.fsize({ size: [30, 20] } as HardwareCell)).toBe('XL')
    expect(api.fsize({ size: [40, 40] } as HardwareCell)).toBe('XL')
  })

  it('getFreeCellsCount returns 42', async () => {
    const api = await loadApi()
    expect(await api.getFreeCellsCount()).toBe(42)
  })

  it('getSizeByCellId returns XL', async () => {
    const api = await loadApi()
    expect(await api.getSizeByCellId(1)).toBe('XL')
  })

  it('getFreeSizes returns all true except M', async () => {
    const api = await loadApi()
    expect(await api.getFreeSizes()).toEqual({ XL: true, L: true, M: false })
  })

  it('getPrice returns 1024', async () => {
    const api = await loadApi()
    expect(await api.getPrice('M')).toBe(1024)
  })

  it('invoice returns 69', async () => {
    const api = await loadApi()
    expect(await api.invoice(5, 'L')).toBe(69)
  })

  it('getFreeCellId returns 13', async () => {
    const api = await loadApi()
    expect(await api.getFreeCellId('XL')).toBe(13)
  })

  it('beginStorage returns true', async () => {
    const api = await loadApi()
    expect(await api.beginStorage({ phone: '123', cellid: 1, code: '1111', time: 5 })).toBe(true)
  })

  it('sendSms returns true', async () => {
    const api = await loadApi()
    expect(await api.sendSms({ phone: '123', text: 'hello' })).toBe(true)
  })

  it('endStorage returns true', async () => {
    const api = await loadApi()
    expect(await api.endStorage(1)).toBe(true)
  })

  it('extend returns true', async () => {
    const api = await loadApi()
    expect(await api.extend({ cellid: 1, time: 5 })).toBe(true)
  })

  it('checkCode returns ok for non-0000', async () => {
    const api = await loadApi()
    expect(await api.checkCode('1234')).toEqual({ status: 'ok', cell: 1 })
  })

  it('checkCode returns not found for 0000', async () => {
    const api = await loadApi()
    expect(await api.checkCode('0000')).toEqual({ status: 'not found', cell: 1 })
  })

  it('getOccupiedCellsList returns [1,2,3]', async () => {
    const api = await loadApi()
    expect(await api.getOccupiedCellsList()).toEqual([1, 2, 3])
  })

  it('getCellData returns mock data with Date objects', async () => {
    const api = await loadApi()
    const data = await api.getCellData(1)
    expect(data).toHaveProperty('phone')
    expect(data.start).toBeInstanceOf(Date)
    expect(data.end).toBeInstanceOf(Date)
  })

  it('getTimes returns Date objects', async () => {
    const api = await loadApi()
    const times = await api.getTimes(1)
    expect(times.start).toBeInstanceOf(Date)
    expect(times.end).toBeInstanceOf(Date)
  })

  it('getPenaltyInfo returns mock penalty', async () => {
    const api = await loadApi()
    expect(await api.getPenaltyInfo(1)).toEqual({ timeout: '6h', penalty: 500 })
  })

  it('isPaid returns wait 5 times then success', async () => {
    const api = await loadApi()
    for (let i = 0; i < 5; i++) {
      expect(await api.isPaid(1)).toBe('wait')
    }
    expect(await api.isPaid(1)).toBe('success')
  })

  it('open does nothing in mock mode', async () => {
    const api = await loadApi()
    await expect(api.open(1)).resolves.toBeUndefined()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('scan returns null 5 times then "2022"', async () => {
    const api = await loadApi()
    for (let i = 0; i < 5; i++) {
      expect(await api.scan()).toBeNull()
    }
    expect(await api.scan()).toBe('2022')
  })

  it('mock mode never calls fetch', async () => {
    const api = await loadApi()
    await api.getFreeCellsCount()
    await api.getPrice('M')
    await api.checkCode('1234')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('api - fsize (size detection)', () => {
  beforeEach(async () => {
    vi.stubGlobal('import.meta.env', {
      VITE_USE_MOCK: 'true',
      VITE_API_SERVER: 'http://api.local/',
      VITE_DATA_SERVER: 'http://data.local/',
      VITE_API_PASSWORD: 'secret',
    })
    vi.resetModules()
    fetchMock.mockReset()
  })

  async function loadApi() {
    return await import('../index')
  }

  it('returns XL for 30x20 in mock mode', async () => {
    const api = await loadApi()
    expect(api.fsize({ size: [30, 20] } as HardwareCell)).toBe('XL')
  })

  it('fsize is deterministic', async () => {
    const api = await loadApi()
    const cell = { size: [50, 50] } as HardwareCell
    expect(api.fsize(cell)).toBe('XL')
    expect(api.fsize(cell)).toBe('XL')
  })
})
