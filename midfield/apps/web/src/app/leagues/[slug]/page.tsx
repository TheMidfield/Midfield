import { redirect } from "next/navigation";

/**
 * Legacy /leagues/[slug] page - redirects to /topic/[slug]
 * All entity pages now use the unified /topic route
 */
export default async function LeagueSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/topic/${slug}`);
}
