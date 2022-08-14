import * as React from 'react'
import { FC, PropsWithChildren, useEffect, useMemo, useState } from 'react'
import themeManager from '../index'

const changeTheme = themeManager.changeTheme.bind(themeManager)

const themeList: readonly string[] = themeManager.themeList

function useTheme(initialTheme?: string | ((themes: readonly string[]) => string)) {
  const [theme, setTheme] = useState(() => {
    const currentTheme = themeManager.theme
    let defaultTheme = typeof initialTheme === 'function' ? initialTheme(themeList) : initialTheme
    if (typeof defaultTheme !== 'string' || !themeList.some((theme) => theme === defaultTheme)) {
      defaultTheme = currentTheme
    }
    if (defaultTheme !== currentTheme) {
      themeManager.changeTheme(defaultTheme).then((theme) => setTheme(theme))
    }
    return currentTheme
  })
  useEffect(() => {
    setTheme(themeManager.theme)
    return themeManager.subscribe('change', ({ data: { current } }) => setTheme(current))
  })
  return [theme, themeList, changeTheme] as readonly [string, typeof themeList, typeof changeTheme]
}

const ThemeContext = React.createContext({
  theme: themeManager.theme,
  themeList,
  changeTheme,
})

type ThemeProviderProps = PropsWithChildren<{
  default?: string | ((themes: readonly string[]) => string)
}>

const ThemeProvider: FC<ThemeProviderProps> = function (props) {
  const [theme, themeList, changeTheme] = useTheme(props.default)
  const context = useMemo(
    () => ({ theme, themeList, changeTheme }),
    [theme, themeList, changeTheme]
  )
  return <ThemeContext.Provider value={context}>{props.children}</ThemeContext.Provider>
}

const ThemeConsumer = ThemeContext.Consumer

export { useTheme, ThemeContext, ThemeConsumer, ThemeProvider, ThemeProviderProps }
