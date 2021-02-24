// theme模块由构建插件生成
import themes from './theme'
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
  get theme() {
    const theme = themes.filter((theme) => theme.activated)[0]
    return theme ? theme.name : ''
  }

  set theme(name: string) {
    this.changeTheme(name).catch((err) => {
      throw err
    })
  }

  get themeList() {
    return themes.map((theme) => theme.name)
  }

  /**
   * 切换主题
   * @param name 主题名
   */
  changeTheme(name: string) {
    let theme: Theme | undefined
    if (!name || !(theme = themes.filter((theme) => theme.name === name)[0])) {
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
