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

export interface ThemeErrorEventHandler {
  (event: ThemeErrorEvent): void
}

export interface ThemeChangeEvent {
  type: 'change'
  data: { current: string; previous: string }
}

export interface ThemeChangeEventHandler {
  (event: ThemeChangeEvent): void
}

export type ThemeEventHandler = ThemeErrorEventHandler | ThemeChangeEventHandler

export default class ThemeEventManager {
  private readonly _events = {} as { [p: string]: ThemeEventHandler[] }

  protected _dispatchEvent(event: ThemeChangeEvent): this
  protected _dispatchEvent(event: ThemeErrorEvent): this
  protected _dispatchEvent(event: any) {
    const { type } = event
    const listeners = this.getAllListeners(type)
    for (const handler of listeners) {
      try {
        handler({ ...event })
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
  getAllListeners(eventName: 'change'): ThemeChangeEventHandler[]
  getAllListeners(eventName: 'error'): ThemeErrorEventHandler[]
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
   * @param handler 处理函数
   */
  addEventListener(eventName: 'change', handler: ThemeChangeEventHandler): this
  addEventListener(eventName: 'error', handler: ThemeErrorEventHandler): this
  addEventListener(eventName: any, handler: any) {
    if (typeof handler !== 'function') {
      throw new Error('handler must be a function')
    }
    const listeners = this.getAllListeners(eventName)
    if (listeners.indexOf(handler) === -1) {
      listeners.push(handler)
    }
    return this
  }

  on(eventName: 'change', handler: ThemeChangeEventHandler): this
  on(eventName: 'error', handler: ThemeErrorEventHandler): this
  on(eventName: any, handler: any) {
    return this.addEventListener(eventName, handler)
  }

  /**
   * 订阅主题事件，返回一个取消订阅的函数
   * @param eventName 事件名
   * @param handler 处理函数
   */
  subscribe(eventName: 'error', handler: ThemeErrorEventHandler): () => void
  subscribe(eventName: 'change', handler: ThemeChangeEventHandler): () => void
  subscribe(eventName: any, handler: any) {
    this.on(eventName, handler)
    return () => {
      this.off(eventName, handler)
    }
  }

  /**
   * 移除事件处理函数
   * @param eventName 事件名
   * @param handler 处理函数
   */
  removeEventListener(eventName: 'change', handler: ThemeChangeEventHandler): this
  removeEventListener(eventName: 'error', handler: ThemeErrorEventHandler): this
  removeEventListener(eventName: any, handler: any) {
    const listeners = this.getAllListeners(eventName)
    if (typeof handler === 'function') {
      const index = listeners.indexOf(handler)
      if (index !== -1) {
        listeners.splice(index, 1)
      }
    }
    return this
  }

  off(eventName: 'change', handler: ThemeChangeEventHandler): this
  off(eventName: 'error', handler: ThemeErrorEventHandler): this
  off(eventName: any, handler: any) {
    return this.removeEventListener(eventName, handler)
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

  once(eventName: 'change', handler: ThemeChangeEventHandler): this
  once(eventName: 'error', handler: ThemeErrorEventHandler): this
  once(eventName: any, handler: any) {
    if (typeof handler !== 'function') {
      throw new Error('handler must be a function')
    }
    const listener: any = (event: any) => {
      this.off(eventName, listener)
      handler(event)
    }
    return this.on(eventName, listener)
  }
}
