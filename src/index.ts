// theme模块由构建插件生成
import ThemeEventManager, { ThemeLoadError } from './event'

export {
  ThemeErrorEvent,
  ThemeChangeEvent,
  ThemeErrorEventHandler,
  ThemeChangeEventHandler,
  ThemeEventHandler,
  ThemeLoadError,
} from './event'

export interface Theme {
  readonly name: string
  readonly activated: boolean
  readonly activate: () => Promise<string>
}

class ThemeManager extends ThemeEventManager {
  /**
   * 已注册的主题列表。
   * @private
   */
  private themes: Theme[] = []

  /**
   * 注册主题。主题文件在构建时动态生成。
   * @param themes 主题集。
   */
  registerThemes(themes: Theme[]) {
    this.themes = themes
  }

  /**
   * 获取当前已激活的主题名称。
   */
  get theme() {
    const theme = this.themes.filter((theme) => theme.activated)[0]
    return theme ? theme.name : ''
  }

  /**
   * 激活主题。
   * @param name 主题名。
   */
  set theme(name: string) {
    this.changeTheme(name).catch((err) => {
      throw err
    })
  }

  /**
   * 获取主题名称列表。
   */
  get themeList() {
    return this.themes.map((theme) => theme.name)
  }

  /**
   * 激活主题。
   * @param name 主题名。
   */
  changeTheme(name: string) {
    let theme: Theme | undefined
    if (!name || !(theme = this.themes.filter((theme) => theme.name === name)[0])) {
      return Promise.reject(new Error(`Unknown theme name '${name}'`))
    }
    const prevThemeName = this.theme
    if (prevThemeName === theme.name) {
      return Promise.resolve(name)
    }
    return theme
      .activate()
      .then(() => {
        this._dispatchEvent({ type: 'change', data: { current: name, previous: prevThemeName } })
        return name
      })
      .catch((error: ThemeLoadError) => {
        error.theme = name
        this._dispatchEvent({ type: 'error', data: error })
        throw error
      })
  }
}

const themeManager = new ThemeManager()
export default themeManager
