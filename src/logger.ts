export type LogLevel = 'info' | 'warn' | 'error'

export interface LogEntry {
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  timestamp: number
}

const buffer: LogEntry[] = []
const MAX_BUFFER = 50

export function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  const entry: LogEntry = { level, message, context, timestamp: Date.now() }
  buffer.push(entry)
  if (buffer.length > MAX_BUFFER) buffer.shift()

  const prefix = `[${new Date().toISOString()}] [${level.toUpperCase()}]`
  if (level === 'error') console.error(prefix, message, context)
  else if (level === 'warn') console.warn(prefix, message, context)
  else console.log(prefix, message, context)
}

export function getLogs(): LogEntry[] {
  return [...buffer]
}
