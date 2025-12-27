import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Typography } from "@/components/ui/Typography";
import { Input } from "@/components/ui/Input";
import { SearchInput } from "@/components/ui/SearchInput";
import { Skeleton } from "@/components/ui/Skeleton";
import { Separator } from "@/components/ui/Separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/Dialog";
import { IconButton } from "@/components/ui/IconButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PlayerCard } from "@/components/ui/PlayerCard";
import { ClubCard } from "@/components/ui/ClubCard";
import { ModalShowcase } from "@/components/design-system/ModalShowcase";
import {
    AlertCircle, Check, Terminal, User, ArrowRight, Zap, Search, Shield, Layout, MousePointer2,
    Download, Upload, Plus, Settings, Trash2, Edit, Heart, Share2, Star, TrendingUp, Users,
    Activity, BarChart3, Target, Trophy, Mail, Bell, Filter, Calendar, ExternalLink, Info,
    Eye, Box, Grid, Palette
} from "lucide-react";

export default function DesignSystemPage() {
    return (
        <div className="w-full max-w-[1200px] mx-auto p-4 sm:p-8 lg:p-12 space-y-24 pb-32">

            <header className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Terminal className="w-7 h-7" />
                        </div>
                    </div>
                    <ThemeToggle />
                </div>
                <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-neutral-100">Design System</h1>
                <p className="text-xl text-slate-600 dark:text-neutral-400 leading-relaxed max-w-3xl">
                    A complete reference of components, patterns, and principles. Every element is intentional, standardized, and accessible.
                </p>
            </header>

            <Separator />

            {/* Core Design Principles */}
            <section className="space-y-6">
                <SectionHeader title="Core Design Principles" description="Four immutable laws that govern every element in Midfield." />
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <PrincipleCard
                        icon={MousePointer2}
                        title="Mandatory Hover"
                        description="Every clickable element MUST have visible hover feedback. No exceptions. Elements without hover are forbidden."
                    />
                    <PrincipleCard
                        icon={Layout}
                        title="Visual Congruence"
                        description="Similar elements look similar everywhere. Maximum consistency in styling, spacing, and behavior across all components."
                    />
                    <PrincipleCard
                        icon={Grid}
                        title="Harmonious Spacing"
                        description="All measurements follow a 4px scale. Generous, intentional breathing room. Strong borders (slate-300+) for clarity."
                    />
                    <PrincipleCard
                        icon={Palette}
                        title="Neutral & Emerald"
                        description="Pure neutral grays with emerald as the sole accent. No blue tints, no competing colors, maximum focus."
                    />
                </div>
            </section>

            {/* Typography */}
            <section className="space-y-8">
                <SectionHeader title="Typography" description="Type scale using DM Sans for body and Onest for headings. Clean, geometric, and highly readable." />
                <div className="space-y-6 p-8 border-2 border-slate-300 dark:border-neutral-800 rounded-lg bg-slate-50/50 dark:bg-neutral-900/50">
                    <div className="grid gap-8 items-center md:grid-cols-[200px_1fr]">
                        <span className="text-sm text-slate-400 dark:text-slate-500 font-mono">Display (H1)</span>
                        <Typography variant="h1">The Quick Brown Fox</Typography>
                    </div>
                    <Separator />
                    <div className="grid gap-8 items-center md:grid-cols-[200px_1fr]">
                        <span className="text-sm text-slate-400 dark:text-slate-500 font-mono">Page Title (H2)</span>
                        <Typography variant="h2">Jumps Over The Lazy Dog</Typography>
                    </div>
                    <Separator />
                    <div className="grid gap-8 items-center md:grid-cols-[200px_1fr]">
                        <span className="text-sm text-slate-400 dark:text-slate-500 font-mono">Section (H3)</span>
                        <Typography variant="h3">Midfield Intelligence</Typography>
                    </div>
                    <Separator />
                    <div className="grid gap-8 items-center md:grid-cols-[200px_1fr]">
                        <span className="text-sm text-slate-400 dark:text-slate-500 font-mono">Body</span>
                        <Typography variant="body">
                            Football is a game of spaces. The design system reflects this with generous padding, clear hierarchy, and distinct boundaries defined by strokes, not shadows.
                        </Typography>
                    </div>
                    <Separator />
                    <div className="grid gap-8 items-center md:grid-cols-[200px_1fr]">
                        <span className="text-sm text-slate-400 dark:text-slate-500 font-mono">Tiny & Muted</span>
                        <div className="flex gap-4">
                            <Typography variant="tiny">LEGAL TEXT</Typography>
                            <Typography variant="muted">Metadata text</Typography>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Primitives */}
            <section className="space-y-8">
                <SectionHeader title="Core Primitives" description="Buttons, cards, and inputs that form the foundation." />

                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <Typography variant="h4">Button Variants</Typography>
                        <div className="p-8 border-2 border-slate-300 dark:border-neutral-800 rounded-lg space-y-6 bg-white dark:bg-neutral-900">
                            <div className="space-y-3">
                                <span className="text-xs font-mono text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Solid Variants</span>
                                <div className="flex flex-wrap gap-3">
                                    <Button variant="default">Primary</Button>
                                    <Button variant="feature">Feature</Button>
                                    <Button variant="secondary">Secondary</Button>
                                    <Button variant="destructive">Destructive</Button>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-3">
                                <span className="text-xs font-mono text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Ghost Variants</span>
                                <div className="flex flex-wrap gap-3">
                                    <Button variant="ghost">Ghost</Button>
                                    <Button variant="ghost-dark">Ghost Dark</Button>
                                    <Button variant="subtle">Subtle</Button>
                                    <Button variant="link">Link Style</Button>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-3">
                                <span className="text-xs font-mono text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Outlined</span>
                                <div className="flex flex-wrap gap-3">
                                    <Button variant="outline">Outline</Button>
                                    <Button variant="stroke">Heavy Stroke</Button>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-3">
                                <span className="text-xs font-mono text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Pill Buttons (Rounded)</span>
                                <div className="flex flex-wrap gap-3">
                                    <Button variant="pill" size="pill">Follow</Button>
                                    <Button variant="pill-outline" size="pill">Following</Button>
                                    <Button variant="pill-secondary" size="pill">Subscribe</Button>
                                    <Button variant="pill" size="pill-sm">Small Pill</Button>
                                    <Button variant="pill" size="pill-lg">Large Pill</Button>
                                </div>
                                <p className="text-xs text-slate-400 dark:text-neutral-500">✓ Used for CTAs ✓ Navbar actions ✓ Profile buttons</p>
                            </div>
                        </div>
                    </div>

                    {/* Card Variants */}
                    <div className="space-y-6">
                        <Typography variant="h4">Card Variants</Typography>
                        <div className="space-y-4">
                            <Card variant="interactive" className="p-6">
                                <div className="font-bold text-slate-900 dark:text-neutral-100">Interactive Card</div>
                                <div className="text-sm text-slate-600 dark:text-neutral-400">Hover: Border darkens + subtle bg shift</div>
                            </Card>
                            <Card variant="highlight" className="p-6">
                                <div className="font-bold text-green-900 dark:text-green-100">Highlight Card</div>
                                <div className="text-sm text-green-700 dark:text-green-300">For promoted items. Green tint darkens on hover.</div>
                            </Card>
                            <Card variant="flat" className="p-6">
                                <div className="font-bold text-slate-900 dark:text-neutral-100">Flat Card</div>
                                <div className="text-sm text-slate-600 dark:text-neutral-400">Subtle border appears on hover.</div>
                            </Card>
                            <Card variant="ghost" className="p-6">
                                <div className="font-bold text-slate-900 dark:text-neutral-100">Ghost Card</div>
                                <div className="text-sm text-slate-600 dark:text-neutral-400">Subtle border, perfect for minimal emphasis.</div>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Forms & Inputs */}
                <div className="space-y-6 mt-12">
                    <Typography variant="h4">Forms & Inputs</Typography>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4 p-6 border-2 border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900">
                            <div className="space-y-2">
                                <Typography variant="small">Email Address</Typography>
                                <Input placeholder="name@example.com" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Typography variant="small">Password</Typography>
                                    <Typography variant="tiny" className="text-green-600 dark:text-green-400 cursor-pointer hover:text-green-700 dark:hover:text-green-300 transition-colors">Forgot?</Typography>
                                </div>
                                <Input type="password" placeholder="••••••••" />
                            </div>
                        </div>
                        <div className="p-6 border-2 border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 space-y-4">
                            <Typography variant="small">Search Input</Typography>
                            <SearchInput placeholder="Search players, clubs..." />
                            <p className="text-xs text-slate-400 dark:text-neutral-500">✓ Icon included ✓ No shadow ✓ Green focus</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Status Widgets & Indicators */}
            <section className="space-y-8">
                <SectionHeader title="Status Widgets & Indicators" description="Badges and widgets for activity levels, trending status, and metrics." />

                <div className="p-8 border-2 border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 space-y-6">
                    <div className="space-y-3">
                        <span className="text-xs font-mono text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Trending Badge</span>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-600 dark:text-emerald-400 text-[11px] sm:text-xs md:text-sm font-semibold">
                            <Activity className="w-3.5 sm:w-4 md:w-[18px] h-3.5 sm:h-4 md:h-[18px] shrink-0" />
                            <span className="whitespace-nowrap">#3 Trending</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-neutral-500">Shows trending rank with activity icon - previously used in EntityHeader</p>
                    </div>
                </div>
            </section>

            {/* Domain Components - Player & Club Cards */}
            <section className="space-y-8">
                <SectionHeader title="Domain Components" description="Player and club cards that embody the Midfield aesthetic." />

                <div className="space-y-6">
                    <Typography variant="h4">Player Cards</Typography>
                    <div className="grid md:grid-cols-3 gap-6">
                        <PlayerCard
                            name="Erling Haaland"
                            position="Striker"
                            rating="91"
                            age="23"
                            club={{
                                name: "Man City",
                                slug: "man-city",
                            }}
                            avatarUrl="https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&h=400&fit=crop"
                            followers="4.2M"
                            activityLevel="high"
                        />
                        <PlayerCard
                            name="Kevin De Bruyne"
                            position="Midfielder"
                            rating="89"
                            age="32"
                            club={{
                                name: "Man City",
                                slug: "man-city",
                            }}
                            followers="3.1M"
                            activityLevel="medium"
                            variant="highlight"
                        />
                        <PlayerCard
                            name="Jude Bellingham"
                            position="Midfielder"
                            rating="88"
                            age="20"
                            club={{
                                name: "Real Madrid",
                                slug: "real-madrid",
                            }}
                            followers="2.8M"
                            activityLevel="high"
                        />
                    </div>
                </div>

                <div className="space-y-6 mt-12">
                    <Typography variant="h4">Club Cards (Horizontal Layout)</Typography>
                    <p className="text-sm text-slate-600 dark:text-neutral-400">Clubs use a landscape orientation to differentiate from player cards.</p>
                    <div className="grid gap-4">
                        <ClubCard
                            name="Manchester City"
                            league="Premier League"
                            country="England"
                            followers="52M"
                            activityLevel="high"
                            trophies={34}
                        />
                        <ClubCard
                            name="Real Madrid"
                            league="La Liga"
                            country="Spain"
                            followers="128M"
                            activityLevel="high"
                            trophies={96}
                            variant="highlight"
                        />
                        <ClubCard
                            name="Bayern Munich"
                            league="Bundesliga"
                            country="Germany"
                            followers="45M"
                            activityLevel="medium"
                            trophies={76}
                        />
                    </div>
                </div>
            </section>

            {/* Overlays & Search */}
            <section className="space-y-8">
                <SectionHeader title="Overlays & Search" description="Modals, dialogs, and search interfaces." />
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Dialog */}
                    <div className="p-8 border-2 border-slate-300 dark:border-neutral-800 rounded-lg flex flex-col items-center justify-center space-y-4 text-center bg-white dark:bg-neutral-900">
                        <Typography variant="h3">Modal Dialog</Typography>
                        <p className="text-slate-500 dark:text-neutral-400">Click to see the backdrop blur and animation.</p>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="feature" size="lg">Open Dialog</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Edit Profile</DialogTitle>
                                    <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Typography variant="small">Name</Typography>
                                        <Input id="name" defaultValue="Pedro Duarte" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Typography variant="small">Username</Typography>
                                        <Input id="username" defaultValue="@peduarte" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Save changes</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* System Modals Showcase */}
                    <ModalShowcase />

                    {/* Search Input */}
                    <div className="space-y-6">
                        <Typography variant="h4">Search Input</Typography>
                        <p className="text-sm text-slate-500 dark:text-neutral-400">Two search bar styles for different contexts</p>
                        <div className="p-8 border-2 border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 space-y-6">
                            <div className="space-y-2">
                                <span className="text-xs font-mono text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Default (Forms)</span>
                                <SearchInput placeholder="Search players, clubs..." />
                                <p className="text-xs text-slate-400 dark:text-neutral-500">✓ Rectangular ✓ Form-friendly ✓ Strong borders</p>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <span className="text-xs font-mono text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Pill (Navbar)</span>
                                <SearchInput variant="pill" placeholder="Find player or club..." />
                                <p className="text-xs text-slate-400 dark:text-neutral-500">✓ Rounded ✓ Compact ✓ Clean topbar style</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Icon Buttons & Combinations */}
            <section className="space-y-8">
                <SectionHeader title="Icons & Actions" description="Icon buttons, text+icon combinations, and action states." />

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Icon-Only Buttons */}
                    <div className="space-y-6">
                        <Typography variant="h4">Icon Buttons</Typography>
                        <div className="p-8 border-2 border-slate-300 dark:border-neutral-700 rounded-lg space-y-6 bg-white dark:bg-neutral-900">
                            <div className="space-y-3">
                                <span className="text-xs font-mono text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Ghost (Default)</span>
                                <div className="flex items-center gap-2">
                                    <IconButton icon={Settings} variant="ghost" />
                                    <IconButton icon={Heart} variant="ghost" />
                                    <IconButton icon={Share2} variant="ghost" />
                                    <IconButton icon={Bell} variant="ghost" />
                                    <IconButton icon={Filter} variant="ghost" />
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-3">
                                <span className="text-xs font-mono text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Variants & Sizes</span>
                                <div className="flex items-center gap-2">
                                    <IconButton icon={Trash2} variant="outline" />
                                    <IconButton icon={Edit} variant="subtle" />
                                    <IconButton icon={Plus} variant="default" />
                                    <IconButton icon={Star} variant="ghost" size="sm" />
                                    <IconButton icon={Star} variant="ghost" size="lg" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Text + Icon Buttons */}
                    <div className="space-y-6">
                        <Typography variant="h4">Buttons with Icons</Typography>
                        <div className="p-8 border-2 border-slate-300 dark:border-neutral-700 rounded-lg flex flex-col gap-3 bg-white dark:bg-neutral-900">
                            <Button icon={Download} iconPosition="left">Download Report</Button>
                            <Button icon={Upload} iconPosition="left" variant="outline">Upload Data</Button>
                            <Button icon={Plus} iconPosition="left" variant="secondary">Add New</Button>
                            <Button icon={ArrowRight} iconPosition="right" variant="ghost">Continue</Button>
                            <Button icon={ExternalLink} iconPosition="right" variant="link">View Details</Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Data Visualization */}
            <section className="space-y-8">
                <SectionHeader title="Data Components" description="Stats, metrics, and empty states." />

                <div className="space-y-8">
                    {/* Stats */}
                    <div>
                        <Typography variant="h4" className="mb-4">Stat Cards</Typography>
                        <div className="grid md:grid-cols-3 gap-6">
                            <StatCard
                                label="Total Goals"
                                value="142"
                                icon={Target}
                                trend={{ value: 12, isPositive: true }}
                            />
                            <StatCard
                                label="Active Players"
                                value="2.4K"
                                icon={Users}
                                variant="highlight"
                            />
                            <StatCard
                                label="Win Rate"
                                value="68%"
                                icon={Trophy}
                                trend={{ value: 5, isPositive: true }}
                            />
                        </div>
                    </div>

                    {/* Empty States */}
                    <div>
                        <Typography variant="h4" className="mb-4">Empty States</Typography>
                        <div className="grid md:grid-cols-2 gap-8 items-stretch">
                            <EmptyState
                                icon={Search}
                                title="No results found"
                                description="Try adjusting your search or filter to find what you're looking for."
                                action={<Button variant="outline" icon={Filter}>Change Filters</Button>}
                            />
                            <EmptyState
                                icon={Mail}
                                title="Inbox Zero"
                                description="You're all caught up! No new notifications."
                                variant="muted"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Interaction Patterns */}
            <section className="space-y-8">
                <SectionHeader title="Interaction Patterns" description="Hover feedback through color shifts, never shadows or transforms." />

                <div className="p-8 border-2 border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 space-y-6">
                    <div className="space-y-3">
                        <span className="text-xs font-mono text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Interactive Card</span>
                        <Card className="hover:border-slate-400 dark:hover:border-neutral-600 cursor-pointer group transition-colors">
                            <CardHeader className="pb-4">
                                <CardTitle className="group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Hover This Card</CardTitle>
                                <CardDescription>Border darkens, title shifts to emerald. Zero elevation changes.</CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                        <span className="text-xs font-mono text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Button States</span>
                        <div className="flex flex-wrap gap-3">
                            <Button>Primary (Opacity shift)</Button>
                            <Button variant="outline">Outline (Border darkens)</Button>
                            <Button variant="ghost">Ghost (Background fades in)</Button>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-neutral-500 italic">All hover states modify color only—no scale, lift, or shadow effects.</p>
                    </div>
                </div>
            </section>

            {/* Tabs & Navigation */}
            <section className="space-y-8">
                <SectionHeader title="Navigation Components" description="Tabs and segmented controls." />

                <div className="space-y-6">
                    <Typography variant="h4">Segmented Controls</Typography>
                    <div className="p-6 border-2 border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900">
                        <Tabs defaultValue="stats" className="w-full">
                            <TabsList className="w-full grid grid-cols-3">
                                <TabsTrigger value="stats">Stats</TabsTrigger>
                                <TabsTrigger value="lineup">Lineup</TabsTrigger>
                                <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
                            </TabsList>
                            <TabsContent value="stats" className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-lg mt-4 border-2 border-slate-300 dark:border-neutral-700 text-center text-sm text-slate-500 dark:text-neutral-400">
                                Game Statistics View
                            </TabsContent>
                            <TabsContent value="lineup" className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-lg mt-4 border-2 border-slate-300 dark:border-neutral-700 text-center text-sm text-slate-500 dark:text-neutral-400">
                                Player Positions View
                            </TabsContent>
                            <TabsContent value="heatmap" className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-lg mt-4 border-2 border-slate-300 dark:border-neutral-700 text-center text-sm text-slate-500 dark:text-neutral-400">
                                Movement Map View
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </section>

            {/* FC26 Rating Badges */}
            <section className="space-y-8">
                <SectionHeader title="FC26 Rating Badges" description="Specialized badges for displaying player ratings with color coding." />

                <div className="space-y-8">
                    {/* Current Style - Inline Badges */}
                    <div>
                        <Typography variant="h4" className="mb-4">Current Style - Inline Badges</Typography>
                        <div className="p-8 border-2 border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 space-y-6">
                            <div className="space-y-3">
                                <span className="text-xs font-mono text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Color-Coded Ratings</span>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Badge variant="secondary" className="text-[9px] h-5 px-1.5 py-0 font-bold gap-0.5 flex items-center">
                                        <span className="text-[7px] opacity-60 font-normal">OVR</span>
                                        <span className="font-black text-emerald-600 dark:text-emerald-500">92</span>
                                    </Badge>
                                    <Badge variant="secondary" className="text-[9px] h-5 px-1.5 py-0 font-bold gap-0.5 flex items-center">
                                        <span className="text-[7px] opacity-60 font-normal">OVR</span>
                                        <span className="font-black text-emerald-500 dark:text-emerald-400">75</span>
                                    </Badge>
                                    <Badge variant="secondary" className="text-[9px] h-5 px-1.5 py-0 font-bold gap-0.5 flex items-center">
                                        <span className="text-[7px] opacity-60 font-normal">OVR</span>
                                        <span className="font-black text-yellow-600 dark:text-yellow-500">68</span>
                                    </Badge>
                                    <Badge variant="secondary" className="text-[9px] h-5 px-1.5 py-0 font-bold gap-0.5 flex items-center">
                                        <span className="text-[7px] opacity-60 font-normal">OVR</span>
                                        <span className="font-black text-orange-500 dark:text-orange-400">55</span>
                                    </Badge>
                                    <Badge variant="secondary" className="text-[9px] h-5 px-1.5 py-0 font-bold gap-0.5 flex items-center">
                                        <span className="text-[7px] opacity-60 font-normal">OVR</span>
                                        <span className="font-black text-red-600 dark:text-red-500">42</span>
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-neutral-500">
                                    80+: Strong Green | 70-79: Light Green | 60-69: Yellow | 50-59: Orange | &lt;50: Red
                                </p>
                            </div>
                            <Separator />
                            <div className="space-y-3">
                                <span className="text-xs font-mono text-slate-400 dark:text-neutral-500 uppercase tracking-wider">With Potential (POT)</span>
                                <div className="flex items-center gap-1.5">
                                    <Badge variant="secondary" className="text-[9px] h-5 px-1.5 py-0 font-bold gap-0.5 flex items-center">
                                        <span className="text-[7px] opacity-60 font-normal">OVR</span>
                                        <span className="font-black text-emerald-600 dark:text-emerald-500">85</span>
                                    </Badge>
                                    <Badge variant="secondary" className="text-[9px] h-5 px-1.5 py-0 font-bold gap-0.5 flex items-center opacity-75">
                                        <span className="text-[7px] opacity-60 font-normal">POT</span>
                                        <span className="font-black text-slate-600 dark:text-slate-400">91</span>
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Previous Style - Stacked Columns */}
                    <div>
                        <Typography variant="h4" className="mb-4">Alternative Style - Stacked Columns</Typography>
                        <div className="p-8 border-2 border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900">
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-center leading-none">
                                    <span className="text-[8px] text-emerald-600 dark:text-emerald-500 font-bold">OVR</span>
                                    <span className="text-xs font-black text-slate-900 dark:text-neutral-100">85</span>
                                </div>
                                <div className="flex flex-col items-center leading-none border-l border-slate-200 dark:border-neutral-700 pl-3">
                                    <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold">POT</span>
                                    <span className="text-xs font-black text-slate-500 dark:text-neutral-400">91</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-neutral-500 mt-4">Vertical stacked layout with divider - previous design</p>
                        </div>
                    </div>

                    {/* FC26 Inline Badge Style */}
                    <div>
                        <Typography variant="h4" className="mb-4">Inline Badge - "FC26 Rating"</Typography>
                        <div className="p-8 border-2 border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge variant="secondary" className="text-[9px] h-4 px-1.5 py-0 font-bold gap-0.5 flex items-center">
                                    <span className="text-[7px] font-bold italic opacity-70">FC26</span>
                                    <span className="font-black text-emerald-600 dark:text-emerald-500">88</span>
                                </Badge>
                                <Badge variant="secondary" className="text-[9px] h-4 px-1.5 py-0 font-bold gap-0.5 flex items-center">
                                    <span className="text-[7px] font-bold italic opacity-70">FC26</span>
                                    <span className="font-black text-yellow-600 dark:text-yellow-500">65</span>
                                </Badge>
                                <Badge variant="secondary" className="text-[9px] h-4 px-1.5 py-0 font-bold gap-0.5 flex items-center">
                                    <span className="text-[7px] font-bold italic opacity-70">FC26</span>
                                    <span className="font-black text-orange-500 dark:text-orange-400">52</span>
                                </Badge>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-neutral-500">Compact inline badge with "FC26" label and color-coded rating - used in mini player cards</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feedback */}
            <section className="space-y-8">
                <SectionHeader title="Feedback & Loading" description="Communicating state without noise." />
                <div className="grid md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <Skeleton className="h-5 w-[140px] mb-2" />
                            <Skeleton className="h-4 w-[100px]" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[100px] w-full rounded-lg" />
                        </CardContent>
                    </Card>

                    <div className="col-span-2 space-y-4 p-6 border-2 border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900">
                        <div className="flex items-center gap-4">
                            <Badge variant="default">Default</Badge>
                            <Badge variant="secondary">Secondary</Badge>
                            <Badge variant="outline">Outline</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge variant="success"><Check className="w-3 h-3 mr-1" /> Verified</Badge>
                            <Badge variant="warning"><AlertCircle className="w-3 h-3 mr-1" /> Issues Found</Badge>
                            <Badge variant="destructive">Suspended</Badge>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}

function SectionHeader({ title, description }: { title: string, description: string }) {
    return (
        <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-neutral-100 border-l-4 border-emerald-500 dark:border-emerald-400 pl-4">{title}</h2>
            <p className="text-lg text-slate-600 dark:text-neutral-400 pl-5">{description}</p>
        </div>
    )
}

function PrincipleCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="p-4 bg-white dark:bg-neutral-900 border-2 border-slate-300 dark:border-neutral-700 rounded-lg space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-neutral-100 text-base">{title}</h3>
            <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">{description}</p>
        </div>
    )
}

function ColorCard({ name, variable, text, border }: { name: string, variable: string, text: string, border?: boolean }) {
    /* ... retained ... */
    return <div className={`h-24 rounded-xl flex items-center justify-center font-bold shadow-sm ${variable} ${text} ${border ? 'border border-slate-200 dark:border-neutral-700' : ''}`}>{name}</div>
}
