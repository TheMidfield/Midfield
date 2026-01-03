import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-slate-50 dark:bg-neutral-800/50 p-6 rounded-full mb-6">
                <Search className="w-12 h-12 text-slate-400 dark:text-neutral-500" />
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-black text-slate-900 dark:text-neutral-100 mb-4">
                404
            </h1>

            <p
                className="text-lg text-slate-600 dark:text-neutral-400 mb-8"
                style={{ maxWidth: '28rem', margin: '0 auto' }}
            >
                We couldn't find the page you were looking for. It might have been moved, deleted, or never existed.
            </p>

            <Link href="/">
                <Button className="font-bold flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Return Home
                </Button>
            </Link>
        </div>
    );
}
