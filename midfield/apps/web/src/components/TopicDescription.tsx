"use client";

export function TopicDescription({ description }: { description: string }) {
    if (!description) return null;

    return (
        <div 
            className="pt-3 sm:pt-4 -mr-2 sm:-mr-3 pr-3 sm:pr-4 overflow-y-auto squad-scroll"
            style={{ maxHeight: '200px' }}
        >
            <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
                {description}
            </p>
        </div>
    );
}
