import { Moon, Sun, Monitor } from 'lucide-react';
import { useThemeStore } from '../stores/theme';

export function ThemeToggle() {
    const { theme, setTheme } = useThemeStore();

    return (
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
            <button
                type="button"
                title="Light Mode"
                onClick={() => setTheme('light')}
                className={`p-2 rounded-md transition-colors ${theme === 'light' ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
            >
                <Sun className="w-4 h-4" />
            </button>
            <button
                type="button"
                title="System Theme"
                onClick={() => setTheme('system')}
                className={`p-2 rounded-md transition-colors ${theme === 'system' ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
            >
                <Monitor className="w-4 h-4" />
            </button>
            <button
                type="button"
                title="Dark Mode"
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-md transition-colors ${theme === 'dark' ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
            >
                <Moon className="w-4 h-4" />
            </button>
        </div>
    );
}
