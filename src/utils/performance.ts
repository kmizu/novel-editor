// パフォーマンス計測ユーティリティ
export class PerformanceMonitor {
  private static marks = new Map<string, number>()

  static startMeasure(name: string) {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-start`)
      this.marks.set(name, performance.now())
    }
  }

  static endMeasure(name: string) {
    if (typeof performance !== 'undefined' && this.marks.has(name)) {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)

      const duration = performance.now() - this.marks.get(name)!
      this.marks.delete(name)

      if (import.meta.env.DEV) {
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
      }

      return duration
    }
    return 0
  }

  static logAllMeasures() {
    if (typeof performance !== 'undefined') {
      const measures = performance.getEntriesByType('measure')
      console.table(
        measures.map((entry) => ({
          name: entry.name,
          duration: `${entry.duration.toFixed(2)}ms`,
          startTime: `${entry.startTime.toFixed(2)}ms`,
        }))
      )
    }
  }
}

// デバウンス関数（パフォーマンス最適化）
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = window.setTimeout(later, wait)
  }
}

// スロットル関数（パフォーマンス最適化）
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// メモリ使用量の監視
export function getMemoryUsage(): { used: number; total: number } | null {
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    const memory = (
      performance as Performance & { memory: { usedJSHeapSize: number; totalJSHeapSize: number } }
    ).memory
    return {
      used: memory.usedJSHeapSize / 1048576, // MB単位
      total: memory.totalJSHeapSize / 1048576, // MB単位
    }
  }
  return null
}
