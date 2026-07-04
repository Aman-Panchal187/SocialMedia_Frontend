import { useTheme } from '../../context/ThemeContext'
import { SunIcon, MoonIcon } from '../../components/common/icons'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
