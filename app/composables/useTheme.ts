export type ThemePreference = 'light' | 'dark' | 'system'

export const useTheme = () => {
  const colorMode = useColorMode()

  const theme = computed<ThemePreference>(() => {
    return colorMode.preference as ThemePreference
  })

  const isDark = computed(() => colorMode.value === 'dark')

  const setTheme = (preference: ThemePreference) => {
    colorMode.preference = preference
  }

  const toggleTheme = () => {
    if (colorMode.preference === 'system') {
      colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
    } else {
      colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark'
    }
  }

  const cycleTheme = () => {
    const modes: ThemePreference[] = ['light', 'dark', 'system']
    const currentIndex = modes.indexOf(colorMode.preference as ThemePreference)
    const nextIndex = (currentIndex + 1) % modes.length
    colorMode.preference = modes[nextIndex]
  }

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
    cycleTheme
  }
}
