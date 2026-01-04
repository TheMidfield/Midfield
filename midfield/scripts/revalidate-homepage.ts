// Force revalidation script for homepage
// Run this to clear stale cached data

const PRODUCTION_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-production-domain.com';

async function revalidateHomepage() {
    try {
        const response = await fetch(`${PRODUCTION_URL}/api/revalidate?path=/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            console.log('✅ Homepage cache revalidated successfully');
        } else {
            console.error('❌ Revalidation failed:', await response.text());
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

revalidateHomepage();
