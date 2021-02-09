//
export type ThemeEventName = 'error' | 'change'
export interface ThemeLoadError extends Error {
  theme: string
}
export interface ThemeEvent {
  type: ThemeEventName
  data: { current: string; previous: string } | ThemeLoadError
}
export interface EventListener {
  (event: ThemeEvent): void
}

export default class ThemeEventManager {
  private readonly _events = {} as { [p: string]: EventListener[] }

  protected _dispatchEvent(event: ThemeEvent) {
    const { type } = event
    const listeners = this.getAllListeners(type)
    for (const listener of listeners) {
      try {
        listener({ ...event })
      } catch (e) {
        console && console.error(e)
      }
    }
    return this
  }

  /**
   * 根据事件名获取所有已注册的事件处理函数
   * @param eventName 事件名
   */
  getAllListeners(eventName: ThemeEventName) {
    const { _events } = this
    if (!_events[eventName]) {
      _events[eventName] = []
    }
    return _events[eventName]
  }

  /**
   * 添加事件处理函数
   * @param eventName 事件名
   * @param listener 处理函数
   */
  addEventListener(eventName: ThemeEventName, listener: EventListener) {
    if (typeof listener !== 'function') {
      throw new Error('listener must be a function')
    }
    const listeners = this.getAllListeners(eventName)
    if (listeners.indexOf(listener) === -1) {
      listeners.push(listener)
    }
    return this
  }

  on(eventName: ThemeEventName, listener: EventListener) {
    return this.addEventListener(eventName, listener)
  }

  /**
   * 移除事件处理函数
   * @param eventName 事件名
   * @param listener 处理函数
   */
  removeEventListener(eventName: ThemeEventName, listener: EventListener) {
    const listeners = this.getAllListeners(eventName)
    if (typeof listener === 'function') {
      const index = listeners.indexOf(listener)
      if (index !== -1) {
        listeners.splice(index, 1)
      }
    }
    return this
  }

  off(eventName: ThemeEventName, listener: EventListener) {
    return this.removeEventListener(eventName, listener)
  }

  /**
   * 清空指定事件名的事件处理函数
   * @param eventName 事件名
   */
  removeAllListeners(eventName: ThemeEventName) {
    const listeners = this.getAllListeners(eventName)
    listeners.length = 0
    return this
  }

  once(eventName: ThemeEventName, listener: EventListener) {
    if (typeof listener !== 'function') {
      throw new Error('listener must be a function')
    }
    const handler: EventListener = (event) => {
      this.off(eventName, handler)
      listener(event)
    }
    return this.on(eventName, handler)
  }
}
