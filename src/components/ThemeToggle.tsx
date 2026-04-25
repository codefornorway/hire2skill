'use client'

import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative h-9 w-9 flex items-center justify-center rounded-xl border transition-all hover:scale-105"
      style={{
        background: isDark ? '#21262D' : '#F3F4F6',
        borderColor: isDark ? '#30363D' : '#E5E7EB',
      }}
    >
      {/* Sun */}
      <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke={isDark ? '#6E7681' : '#F59E0B'}
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        className="absolute transition-all duration-300"
        style={{ opacity: isDark ? 0 : 1, transform: isDark ? 'rotate(90deg) scale(0.6)' : 'rotate(0deg) scale(1)' }}>
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
      </svg>
      {/* Moon */}
      <svg
        width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke={isDark ? '#C9D1D9' : '#374151'}
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        className="absolute transition-all duration-300"
        style={{ opacity: isDark ? 1 : 0, transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.6)' }}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    </button>
  )
}
