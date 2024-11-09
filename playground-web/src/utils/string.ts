export function msToS(ms: number, fractionDigits: number = 4): string {
  return (ms / 1000).toFixed(fractionDigits) + 's'
}

export function formatNumber(num?: number, fractionDigits: number = 1): string {
  if (num === undefined) return ''
  if (num >= 1_000_000_000_000) {
    return (num / 1_000_000_000_000).toFixed(fractionDigits) + 'T'
  } else if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(fractionDigits) + 'B'
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(fractionDigits) + 'M'
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(fractionDigits) + 'K'
  } else {
    return num.toString()
  }
}

export function formatTime(timeMs: number, withZeroPadding: boolean = true): string {
  let timeSec = Math.max(Math.floor(timeMs / 1000), 0)

  const timeHours = Math.floor(timeSec / 3600)
  timeSec %= 3600

  const timeMin = Math.floor(timeSec / 60)
  timeSec %= 60

  let secPrefix = ''
  let result = ''

  if (timeHours > 0) {
    result += `${timeHours}h`
  }

  if (timeMin > 0 || timeHours > 0) {
    result += `${timeMin}m`
  }

  secPrefix = timeSec < 10 && withZeroPadding ? '0' : ''
  result += `${secPrefix}${timeSec}s`

  return result
}
