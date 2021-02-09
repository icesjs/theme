// theme模块由构建插件生成
import themes from './theme'
import ThemeEventManager from './event'

export interface Theme {
  name: string
  activated: boolean
  activate: () => Promise<any>
}

class ThemeManager extends ThemeEventManager {
  get theme() {
    return this.getCurrentTheme()
  }

  set theme(name: string) {
    this.changeTheme(name).then(() => {})
  }

  get themeList() {
    return this.getThemeList()
  }

  /**
   * 获取已注册的主题名称列表
   */
  getThemeList() {
    return themes.map((theme) => theme.name)
  }

  /**
   * 获取当前激活的主题名称
   */
  getCurrentTheme() {
    const theme = themes.filter((theme) => theme.activated)[0]
    return theme ? theme.name : ''
  }

  /**
   * 切换主题
   * @param name 主题名
   */
  changeTheme(name: string) {
    const theme = themes.filter((theme) => theme.name === name)[0]
    if (!theme) {
      return Promise.reject(new Error(`Unknown theme name: ${name}`))
    }
    if (theme.activated) {
      return Promise.resolve(name)
    }
    return theme
      .activate()
      .then(() => {
        let prev = ''
        themes.forEach((theme) => {
          if (theme.activated) {
            prev = theme.name
            theme.activated = false
          }
        })
        theme.activated = true
        this._dispatchEvent({
          type: 'change',
          data: {
            current: name,
            previous: prev,
          },
        })
        return name
      })
      .catch((error) => {
        error.theme = name
        this._dispatchEvent({ type: 'error', data: error })
        throw error
      })
  }
}

const themeManager = new ThemeManager()
export default themeManager
