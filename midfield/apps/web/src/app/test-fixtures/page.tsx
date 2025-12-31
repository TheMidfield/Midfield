import { checkFixtureScores } from '@/app/actions/check-fixture-data';

export default async function TestScoresPage() {
    const data = await checkFixtureScores();

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Fixture Score Data Check</h1>

            {'error' in data ? (
                <div className="text-red-600">Error: {data.error}</div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-4">
                        <h2 className="font-bold mb-3">Overview</h2>
                        <div className="space-y-2 text-sm">
                            <div><span className="font-semibold">Past Fixtures Checked:</span> {data.total}</div>
                            <div><span className="font-semibold">Has Score Fields:</span> {data.hasScores ? '✅ Yes' : '❌ No'}</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-4">
                        <h2 className="font-bold mb-3">Available Fields</h2>
                        <div className="text-sm">
                            <code className="bg-slate-100 dark:bg-neutral-800 p-2 rounded block overflow-x-auto">
                                {data.fields.join(', ')}
                            </code>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-4">
                        <h2 className="font-bold mb-3">Sample Past Fixtures (Recent 3)</h2>
                        <div className="space-y-4">
                            {data.sample.map((fixture: any, i: number) => (
                                <div key={i} className="border-l-4 border-emerald-500 pl-3 text-sm">
                                    <div className="font-semibold mb-1">{fixture.date}</div>
                                    <pre className="text-xs bg-slate-50 dark:bg-neutral-800 p-2 rounded overflow-x-auto">
                                        {JSON.stringify(fixture, null, 2)}
                                    </pre>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
