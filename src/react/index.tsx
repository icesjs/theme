import * as React from 'react'
import { FC, useEffect, useState } from 'react'
import themeManager from '../index'

const changeTheme = themeManager.changeTheme.bind(themeManager)

const themeList: readonly string[] = themeManager.themeList

function useTheme(initialTheme?: string | ((themes: string[]) => string)) {
  const [theme, setTheme] = useState(() => {
    let state = typeof initialTheme === 'function' ? initialTheme([...themeList]) : initialTheme
    if (typeof state === 'string' && themeList.some((theme) => state === theme)) {
      themeManager.theme = state
    } else {
      state = themeManager.theme
    }
    return state
  })
  useEffect(() => {
    return themeManager.subscribe('change', ({ data: { current } }) => setTheme(current))
  })
  return [theme, changeTheme] as readonly [string, typeof changeTheme]
}

const ThemeContext = React.createContext(themeManager.theme)

const ThemeProvider: FC = function (props) {
  const [theme] = useTheme()
  return <ThemeContext.Provider value={theme}>{props.children}</ThemeContext.Provider>
}

const ThemeConsumer = ThemeContext.Consumer

export { useTheme, themeList, ThemeContext, ThemeProvider, ThemeConsumer }
