'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { IconButton } from './IconButton'

export function ThemeToggle() {
    const { theme, toggleTheme, mounted } = useTheme()

    // Prevent hydration mismatch by rendering a placeholder until mounted
    if (!mounted) {
        return (
            <div className="w-10 h-10 rounded-md bg-slate-100 dark:bg-neutral-800 animate-pulse" />
        )
    }

    return (
        <IconButton
            icon={theme === 'dark' ? Sun : Moon}
            variant="ghost"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        />
    )
}
