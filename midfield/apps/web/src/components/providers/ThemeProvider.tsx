'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
    mounted: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function getInitialTheme(): Theme {
    // This runs on client only after hydration
    if (typeof window === 'undefined') return 'light'

    const stored = localStorage.getItem('midfield-theme')
    if (stored === 'dark' || stored === 'light') {
        return stored
    }

    // Default to dark mode
    return 'dark'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark')
    const [mounted, setMounted] = useState(false)

    // Initialize theme on mount
    useEffect(() => {
        const initialTheme = getInitialTheme()
        setThemeState(initialTheme)
        setMounted(true)
    }, [])

    // Apply theme to DOM and persist
    useEffect(() => {
        if (!mounted) return

        const root = document.documentElement

        // Only the 'dark' class matters for Tailwind's dark: variant
        if (theme === 'dark') {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }

        // Persist to localStorage
        localStorage.setItem('midfield-theme', theme)
    }, [theme, mounted])

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme)
    }, [])

    const toggleTheme = useCallback(() => {
        setThemeState(prev => prev === 'dark' ? 'light' : 'dark')
    }, [])

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, mounted }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within ThemeProvider')
    }
    return context
}
