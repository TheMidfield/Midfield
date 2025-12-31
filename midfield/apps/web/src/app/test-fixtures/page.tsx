import { checkFixtureData } from '@/app/actions/check-fixture-data';

export default async function TestFixturesPage() {
    const data = await checkFixtureData();

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Fixture Data Analysis</h1>

            {'error' in data ? (
                <div className="text-red-600">Error: {data.error}</div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-4">
                        <h2 className="font-bold mb-3">Overview</h2>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div><span className="font-semibold">Total Fixtures:</span> {data.total}</div>
                            <div><span className="font-semibold">Past Fixtures:</span> {data.past}</div>
                            <div><span className="font-semibold">Future Fixtures:</span> {data.future}</div>
                            <div><span className="font-semibold">Today's Fixtures:</span> {data.today}</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-4">
                        <h2 className="font-bold mb-3">Date Range</h2>
                        <div className="space-y-2 text-sm">
                            <div><span className="font-semibold">Earliest:</span> {data.earliest}</div>
                            <div><span className="font-semibold">Latest:</span> {data.latest}</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-4">
                        <h2 className="font-bold mb-3">Sample Past Fixtures (Last 5)</h2>
                        <ul className="text-sm space-y-1">
                            {data.samplePast.map((date, i) => (
                                <li key={i}>{date}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-4">
                        <h2 className="font-bold mb-3">Sample Future Fixtures (Next 5)</h2>
                        <ul className="text-sm space-y-1">
                            {data.sampleFuture.map((date, i) => (
                                <li key={i}>{date}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-4">
                        <h2 className="font-bold mb-3">Recent Club Updates (Top 5)</h2>
                        <ul className="text-sm space-y-1">
                            {data.recentUpdates.map((date, i) => (
                                <li key={i}>{date}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
