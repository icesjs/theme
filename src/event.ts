//
export interface ThemeLoadError extends Error {
  type: string
  code: string
  theme: string
  request: string
}

export interface ThemeErrorEvent {
  type: 'error'
  data: ThemeLoadError
}

export interface ThemeErrorEventListener {
  (event: ThemeErrorEvent): void
}

export interface ThemeChangeEvent {
  type: 'change'
  data: { current: string; previous: string }
}

export interface ThemeChangeEventListener {
  (event: ThemeChangeEvent): void
}

export type ThemeEventListener = ThemeErrorEventListener | ThemeChangeEventListener

export default class ThemeEventManager {
  private readonly _events = {} as { [p: string]: ThemeEventListener[] }

  protected _dispatchEvent(event: ThemeChangeEvent): this
  protected _dispatchEvent(event: ThemeErrorEvent): this
  protected _dispatchEvent(event: any) {
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
  getAllListeners(eventName: 'change'): ThemeChangeEventListener[]
  getAllListeners(eventName: 'error'): ThemeErrorEventListener[]
  getAllListeners(eventName: any) {
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
  addEventListener(eventName: 'change', listener: ThemeChangeEventListener): this
  addEventListener(eventName: 'error', listener: ThemeErrorEventListener): this
  addEventListener(eventName: any, listener: any) {
    if (typeof listener !== 'function') {
      throw new Error('listener must be a function')
    }
    const listeners = this.getAllListeners(eventName)
    if (listeners.indexOf(listener) === -1) {
      listeners.push(listener)
    }
    return this
  }

  on(eventName: 'change', listener: ThemeChangeEventListener): this
  on(eventName: 'error', listener: ThemeErrorEventListener): this
  on(eventName: any, listener: any) {
    return this.addEventListener(eventName, listener)
  }

  /**
   * 移除事件处理函数
   * @param eventName 事件名
   * @param listener 处理函数
   */
  removeEventListener(eventName: 'change', listener: ThemeChangeEventListener): this
  removeEventListener(eventName: 'error', listener: ThemeErrorEventListener): this
  removeEventListener(eventName: any, listener: any) {
    const listeners = this.getAllListeners(eventName)
    if (typeof listener === 'function') {
      const index = listeners.indexOf(listener)
      if (index !== -1) {
        listeners.splice(index, 1)
      }
    }
    return this
  }

  off(eventName: 'change', listener: ThemeChangeEventListener): this
  off(eventName: 'error', listener: ThemeErrorEventListener): this
  off(eventName: any, listener: any) {
    return this.removeEventListener(eventName, listener)
  }

  /**
   * 清空指定事件名的事件处理函数
   * @param eventName 事件名
   */
  removeAllListeners(eventName: 'change'): this
  removeAllListeners(eventName: 'error'): this
  removeAllListeners(eventName: any) {
    const listeners = this.getAllListeners(eventName)
    listeners.length = 0
    return this
  }

  once(eventName: 'change', listener: ThemeChangeEventListener): this
  once(eventName: 'error', listener: ThemeErrorEventListener): this
  once(eventName: any, listener: any) {
    if (typeof listener !== 'function') {
      throw new Error('listener must be a function')
    }
    const handler: any = (event: any) => {
      this.off(eventName, handler)
      listener(event)
    }
    return this.on(eventName, handler)
  }
}
