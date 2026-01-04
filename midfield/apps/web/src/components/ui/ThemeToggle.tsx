'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { IconButton } from './IconButton'

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Prevent hydration mismatch by rendering a placeholder until mounted
    if (!mounted) {
        return (
            <button
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-neutral-800 h-9 w-9"
                disabled
                aria-label="Loading theme toggle"
            >
                <div className="w-5 h-5 rounded bg-slate-200 dark:bg-neutral-700 animate-pulse" />
            </button>
        )
    }

    return (
        <IconButton
            icon={theme === 'dark' ? Sun : Moon}
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        />
    )
}
