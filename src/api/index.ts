import { log } from '../logger'

const isDev: boolean = import.meta.env.VITE_USE_MOCK === 'true'

const server: string = import.meta.env.VITE_API_SERVER
const dataServer: string = import.meta.env.VITE_DATA_SERVER
const password: string = import.meta.env.VITE_API_PASSWORD

const API_CACHE_HEADERS: Record<string, string> = {
  'Pragma': 'no-cache',
  'Cache-Control': 'no-cache'
}

const OPEN_RETRY_COUNT: number = 4
const OPEN_RETRY_DELAY: number = 500
const REQUEST_TIMEOUT: number = 15000

let _sid: string | null = null
let _sidExpiresAt: number = 0
const SID_TTL: number = 5 * 60 * 1000

export interface HardwareCell {
  bid: number
  section: number
  box: number
  wpos: number[]
  name: string
  size: [number, number]
  user_fi: string
  skey: number
  state: number
  lock_r: number
  disabled: number
  ts: number
  phone?: string
  code?: string
  start?: Date
  end?: Date
  [key: string]: unknown
}

export interface DataCell {
  phone?: string
  code?: string
  start?: number
  end?: number
  [key: string]: unknown
}

export interface CellData extends Partial<HardwareCell> {
  phone: string
  start: Date
  code: string
  end: Date
}

export interface CheckCodeResult {
  status: string
  cell: number
}

export interface PenaltyInfo {
  timeout: string
  penalty: number
}

export interface TimeRange {
  start: Date
  end: Date
}

export interface FreeSizes {
  L: boolean
  XL: boolean
  M: boolean
}

export type SizeKey = 'M' | 'L' | 'XL'

async function ensureSession(): Promise<string | null> {
  const now: number = Date.now()
  if (_sid && now < _sidExpiresAt) return _sid

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const response = await fetch(dataServer + "login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ password }),
      signal: controller.signal
    })
    const data: Record<string, string> = await response.json()
    if (data["sid"] !== undefined && data["sid"] !== '') {
      _sid = data["sid"]
      _sidExpiresAt = now + SID_TTL
      return _sid
    }
    log('error', 'ensureSession: empty sid in response', { data })
  } catch (e) {
    log('error', 'ensureSession failed', { url: dataServer + 'login', error: String(e) })
  } finally {
    clearTimeout(timer)
  }

  return null
}

async function _fetchWithTimeout(path: string, options: RequestInit = {}): Promise<unknown> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const response = await fetch(path, { ...options, signal: controller.signal })
    if (!response.ok) {
      log('error', 'HTTP error', { path, status: response.status, statusText: response.statusText })
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    return response.json()
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      log('error', 'Request timeout', { path, timeout: REQUEST_TIMEOUT })
    } else if (!(e instanceof Error && e.message.startsWith('Error '))) {
      log('error', 'Request failed', { path, error: String(e) })
    }
    throw e
  } finally {
    clearTimeout(timer)
  }
}

function _loadDirect(path: string, extraHeaders?: Record<string, string>): Promise<unknown> {
  return _fetchWithTimeout(path, { headers: { ...API_CACHE_HEADERS, ...extraHeaders } })
}

async function load(path: string): Promise<unknown> {
  const sid = await ensureSession()
  return _loadDirect(dataServer + path, { 'Authorization': `Bearer ${sid ?? ''}` })
}

function loadHardware(path: string): Promise<unknown> {
  return _loadDirect(server + path)
}

async function getData(): Promise<HardwareCell[]> {
  const hardwareData = (await loadHardware('boxs')) as HardwareCell[]
  const data: Record<number, DataCell> = ((await load('get-data')) as { cells: Record<number, DataCell> }).cells
  const result: HardwareCell[] = []

  for (const cell of hardwareData) {
    if (cell.state === 1) {
      result.push(cell)
      if (!data[cell.bid]) continue
      const _cell = data[cell.bid]
      for (const key in _cell) cell[key] = _cell[key]
    }
  }

  return result
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function fsize(cell: HardwareCell): SizeKey {
  if (isDev) return 'XL'
  const [w, h] = cell.size
  if (w === 30 && h === 20) return 'M'
  if (w === 40 && h === 40) return 'L'
  if (w === 50 && h === 50) return 'XL'
  return 'M'
}

export async function getFreeCellsCount(): Promise<number> {
  if (isDev) return (await import('./mock')).mockGetFreeCellsCount()
  const cells = await getData()
  return cells.filter(cell => !cell.code).length
}

export async function getSizeByCellId(cellid: number): Promise<SizeKey> {
  if (isDev) return (await import('./mock')).mockGetSizeByCellId()
  const cells = (await loadHardware('boxs')) as HardwareCell[]
  const cell = cells.find(c => c.bid === cellid)
  if (!cell) return 'M'
  return fsize(cell)
}

export async function getFreeSizes(): Promise<FreeSizes> {
  if (isDev) return (await import('./mock')).mockGetFreeSizes()

  const cells = await getData()
  const ret: FreeSizes = { L: false, XL: false, M: false }

  cells.forEach(cell => {
    const size = fsize(cell)
    if (!cell.code) ret[size] = true
  })

  return ret
}

export async function getPrice(size: SizeKey): Promise<number> {
  if (isDev) return (await import('./mock')).mockGetPrice()
  return load(`get-price/${size}`) as Promise<number>
}

export async function invoice(hours: number | string, size: SizeKey): Promise<number> {
  if (isDev) return (await import('./mock')).mockInvoice()
  return load(`invoice/${hours}/${size}`) as Promise<number>
}

export const isPaid = (function () {
  return async function (orderId: number): Promise<string> {
    if (!isDev) return load('is-paid/' + orderId) as Promise<string>

    const { mockIsPaid } = await import('./mock')
    return mockIsPaid()
  }
})()

export async function getFreeCellId(size: SizeKey): Promise<number | undefined> {
  if (isDev) return (await import('./mock')).mockGetFreeCellId()
  const cells = await getData()

  for (const cell of cells) {
    if (fsize(cell) === size && !cell.code) return cell.bid
  }
}

export async function beginStorage(params: { phone: string; cellid: number; code: string; time: number | string }): Promise<boolean> {
  if (isDev) return (await import('./mock')).mockBeginStorage()
  return load(`begin-storage/${params.phone}/${params.cellid}/${params.code}/${params.time}`) as Promise<boolean>
}

export async function sendSms(params: { phone: string; text: string }): Promise<boolean> {
  if (isDev) return (await import('./mock')).mockSendSms()
  return load(`send-sms/${params.phone}/${params.text}`) as Promise<boolean>
}

export async function getTimes(cellid: number): Promise<TimeRange> {
  if (isDev) return (await import('./mock')).mockGetTimes()
  const data = (await load('get-times/' + cellid)) as { start: number; end: number }
  return {
    start: new Date(data.start * 1000),
    end: new Date(data.end * 1000)
  }
}

export async function getOccupiedCellsList(): Promise<number[]> {
  if (isDev) return (await import('./mock')).mockGetOccupiedCellsList()
  return (await getData())
    .filter(cell => cell.code)
    .map(cell => cell.bid)
}

export async function checkCode(code: string): Promise<CheckCodeResult> {
  if (isDev) return (await import('./mock')).mockCheckCode(code)
  return load(`check-code/${code}`) as Promise<CheckCodeResult>
}

export async function extend(params: { cellid: number; time: number | string }): Promise<boolean> {
  if (isDev) return (await import('./mock')).mockExtend()
  return load(`extend/${params.cellid}/${params.time}`) as Promise<boolean>
}

export async function getCellData(cellid: number): Promise<CellData> {
  if (isDev) return (await import('./mock')).mockGetCellData()

  const cells = (await loadHardware('boxs')) as HardwareCell[]
  const tverCell = cells.find(c => c.bid === cellid)

  const data: Record<number, DataCell> = ((await load('get-data')) as { cells: Record<number, DataCell> }).cells
  const raw = data[cellid]
  if (!raw || !tverCell) throw new Error(`Cell ${cellid} not found`)

  const cell: CellData = {
    ...tverCell,
    ...raw,
    start: new Date((raw.start as number) * 1000),
    end: new Date((raw.end as number) * 1000),
  } as CellData

  return cell
}

export async function endStorage(cellid: number): Promise<boolean> {
  if (isDev) return (await import('./mock')).mockEndStorage()
  return load(`end-storage/${cellid}`) as Promise<boolean>
}

export async function open(cellid: number): Promise<void> {
  if (isDev) return (await import('./mock')).mockOpen()

  let lastError: unknown
  for (let i = 0; i < OPEN_RETRY_COUNT; i++) {
    try {
      await loadHardware(`boxs?bid=${cellid}&cmd=open`)
      return
    } catch (e) {
      log('warn', `open() attempt ${i + 1}/${OPEN_RETRY_COUNT} failed`, { cellid, error: String(e) })
      lastError = e
    }
    await sleep(OPEN_RETRY_DELAY)
  }
  log('error', 'open() exhausted all retries', { cellid, error: String(lastError) })
  throw lastError
}

export async function startScan(): Promise<unknown> {
  if (isDev) return (await import('./mock')).mockStartScan()
  return load('start-scan')
}

export async function stopScan(): Promise<unknown> {
  if (isDev) return (await import('./mock')).mockStopScan()
  return load('stop-scan')
}

export async function scan(): Promise<string | null> {
  if (isDev) return (await import('./mock')).mockScan()
  return load('scan') as Promise<string | null>
}

export async function getPenaltyInfo(cellid: number): Promise<PenaltyInfo> {
  if (isDev) return (await import('./mock')).mockGetPenaltyInfo()
  return load(`get-penalty-info/${cellid}`) as Promise<PenaltyInfo>
}
