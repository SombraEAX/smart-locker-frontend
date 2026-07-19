import type { HardwareCell, CellData, CheckCodeResult, FreeSizes, SizeKey, TimeRange, PenaltyInfo } from './index'

const MOCK_CELLS: HardwareCell[] = [
  {
    "bid": 1, "section": 1, "box": 1, "wpos": [1, 1], "name": "",
    "size": [30, 20], "user_fi": "", "skey": 1, "state": -1,
    "lock_r": -1, "disabled": 0, "ts": 1632122647
  },
  {
    "bid": 2, "section": 1, "box": 1, "wpos": [1, 1], "name": "",
    "size": [30, 20], "user_fi": "", "skey": 1, "state": -1,
    "lock_r": -1, "disabled": 0, "ts": 1632122647,
    "phone": "+79991234567", "code": "5555",
    "start": new Date(),
    "end": new Date(Date.now() + 5 * 60 * 60 * 1000)
  }
]

export function mockFsize(): SizeKey {
  return 'XL'
}

export function mockGetData(): HardwareCell[] {
  return MOCK_CELLS
}

export function mockGetFreeCellsCount(): number {
  return 42
}

export function mockGetSizeByCellId(): SizeKey {
  return 'XL'
}

export function mockGetFreeSizes(): FreeSizes {
  return { XL: true, L: true, M: false }
}

export function mockGetPrice(): number {
  return 1024
}

export function mockInvoice(): number {
  return 69
}

let _isPaidCount = 0
export function mockIsPaid(): string {
  if (_isPaidCount === 5) {
    _isPaidCount = 0
    return 'success'
  }
  _isPaidCount++
  return 'wait'
}

export function mockGetFreeCellId(): number {
  return 13
}

export function mockBeginStorage(): boolean {
  return true
}

export function mockSendSms(): boolean {
  return true
}

export function mockGetTimes(): TimeRange {
  return {
    start: new Date(Date.now() - 10000000),
    end: new Date()
  }
}

export function mockGetOccupiedCellsList(): number[] {
  return [1, 2, 3]
}

export function mockCheckCode(code: string): CheckCodeResult {
  if (code === '0000') return { status: 'not found', cell: 1 }
  return { status: 'ok', cell: 1 }
}

export function mockExtend(): boolean {
  return true
}

export function mockGetCellData(): CellData {
  const now = new Date()
  return {
    phone: '123456',
    start: new Date(now.getTime() - 20 * 60 * 1000),
    code: "5555",
    end: new Date(now.getTime() - 100)
  }
}

export function mockEndStorage(): boolean {
  return true
}

export function mockOpen(): void {
  return
}

export function mockStartScan(): void {
  return
}

export function mockStopScan(): void {
  return
}

let _scanCount = 0
export function mockScan(): string | null {
  if (_scanCount === 5) {
    _scanCount = 0
    return "2022"
  }
  _scanCount++
  return null
}

export function mockGetPenaltyInfo(): PenaltyInfo {
  return { timeout: '6h', penalty: 500 }
}
