import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Typography } from "@/components/ui/Typography";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { Separator } from "@/components/ui/Separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/Dialog";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/Command";
import { AlertCircle, Check, Terminal, User, ArrowRight, Zap, Search, Shield, Layout, MousePointer2 } from "lucide-react";

export default function DesignSystemPage() {
    return (
        <div className="max-w-[1200px] mx-auto p-12 space-y-24 pb-32">

            <header className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                        <Zap className="w-6 h-6 fill-current" />
                    </div>
                </div>
                <h1 className="text-5xl font-black tracking-tight text-slate-900">Midfield Design System</h1>
                <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
                    Squarish, intentional, and congruent. Every element respects the constitution.
                </p>
            </header>

            <Separator />

            {/* Design Constitution */}
            <section className="space-y-8">
                <SectionHeader title="The Constitution" description="Four immutable laws that govern the Midfield aesthetic." />
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ConstitutionCard
                        icon={MousePointer2}
                        title="Mandatory Hover"
                        description="Every clickable element MUST have hover feedback. No exceptions. Clickable without hover is forbidden."
                    />
                    <ConstitutionCard
                        icon={Layout}
                        title="Darken on Hover"
                        description="In light mode, hovering always darkens—never lightens. Borders get darker, backgrounds get darker."
                    />
                    <ConstitutionCard
                        icon={Shield}
                        title="Intentional Spacing"
                        description="All radius, padding, and spacing values follow a consistent 4px scale. Every measurement is deliberate."
                    />
                    <ConstitutionCard
                        icon={Zap}
                        title="Visual Congruence"
                        description="Similar elements share similar styling. Buttons feel like buttons, cards feel like cards, everywhere."
                    />
                </div>
            </section>

            {/* Variants Showcase */}
            <section className="space-y-8">
                <SectionHeader title="Component Variants" description="Expanded set for high-density interfaces." />

                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <Typography variant="h4">Button Physics</Typography>
                        <div className="p-8 border border-slate-200 rounded-lg space-y-6 bg-white">
                            <div className="space-y-3">
                                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Solid Variants</span>
                                <div className="flex flex-wrap gap-3">
                                    <Button variant="default">Primary</Button>
                                    <Button variant="feature">Feature</Button>
                                    <Button variant="secondary">Secondary</Button>
                                    <Button variant="destructive">Destructive</Button>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-3">
                                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Ghost Variants</span>
                                <div className="flex flex-wrap gap-3">
                                    <Button variant="ghost">Ghost</Button>
                                    <Button variant="ghost-dark">Ghost Dark</Button>
                                    <Button variant="subtle">Subtle</Button>
                                    <Button variant="link">Link Style</Button>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-3">
                                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Outlined</span>
                                <div className="flex flex-wrap gap-3">
                                    <Button variant="outline">Outline</Button>
                                    <Button variant="stroke">Heavy Stroke</Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card Variants */}
                    <div className="space-y-6">
                        <Typography variant="h4">Card Physics</Typography>
                        <div className="space-y-4">
                            <Card variant="interactive" className="p-6">
                                <div className="font-bold text-slate-900">Interactive Card</div>
                                <div className="text-sm text-slate-600">Hover: Border darkens + subtle bg shift</div>
                            </Card>
                            <Card variant="highlight" className="p-6">
                                <div className="font-bold text-green-900">Highlight Card</div>
                                <div className="text-sm text-green-700">For promoted items. Green tint darkens on hover.</div>
                            </Card>
                            <Card variant="flat" className="p-6">
                                <div className="font-bold text-slate-900">Flat Card</div>
                                <div className="text-sm text-slate-600">Subtle border appears on hover.</div>
                            </Card>
                            <Card variant="ghost" className="p-6">
                                <div className="font-bold text-slate-900">Ghost Card</div>
                                <div className="text-sm text-slate-600">Invisible until hover. Perfect for lists.</div>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Overlays & Command */}
            <section className="space-y-8">
                <SectionHeader title="Overlays & Search" description="Complex interactions and data finding." />
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Dialog */}
                    <div className="p-8 border border-slate-200 rounded-[24px] flex flex-col items-center justify-center space-y-4 text-center">
                        <Typography variant="h3">Modal Dialog</Typography>
                        <p className="text-slate-500">Click to see the backdrop blur and animation.</p>

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

                    {/* Command */}
                    <div className="border border-slate-200 rounded-[24px] overflow-hidden bg-white h-[350px]">
                        <Command className="rounded-none border-none shadow-none">
                            <CommandInput placeholder="Type a command or search..." />
                            <CommandList>
                                <CommandEmpty>No results found.</CommandEmpty>
                                <CommandGroup heading="Suggestions">
                                    <CommandItem><Search className="mr-2 h-4 w-4" /> Calendar</CommandItem>
                                    <CommandItem><Search className="mr-2 h-4 w-4" /> Search Emoji</CommandItem>
                                    <CommandItem><Search className="mr-2 h-4 w-4" /> Calculator</CommandItem>
                                </CommandGroup>
                                <CommandGroup heading="Settings">
                                    <CommandItem><User className="mr-2 h-4 w-4" /> Profile</CommandItem>
                                    <CommandItem><Shield className="mr-2 h-4 w-4" /> Privacy</CommandItem>
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </div>
                </div>
            </section>

            {/* Typography */}
            <section className="space-y-8">
                <SectionHeader title="Typography" description="The Onest type scale. Clean, geometric, and highly readable." />
                <div className="space-y-6 p-8 border border-slate-100 rounded-[24px] bg-slate-50/50">
                    <div className="grid gap-8 items-center md:grid-cols-[200px_1fr]">
                        <span className="text-sm text-slate-400 font-mono">Display (H1)</span>
                        <Typography variant="h1">The Quick Brown Fox</Typography>
                    </div>
                    <Separator />
                    <div className="grid gap-8 items-center md:grid-cols-[200px_1fr]">
                        <span className="text-sm text-slate-400 font-mono">Page Title (H2)</span>
                        <Typography variant="h2">Jumps Over The Lazy Dog</Typography>
                    </div>
                    <Separator />
                    <div className="grid gap-8 items-center md:grid-cols-[200px_1fr]">
                        <span className="text-sm text-slate-400 font-mono">Section (H3)</span>
                        <Typography variant="h3">Midfield Intelligence</Typography>
                    </div>
                    <Separator />
                    <div className="grid gap-8 items-center md:grid-cols-[200px_1fr]">
                        <span className="text-sm text-slate-400 font-mono">Body</span>
                        <Typography variant="body">
                            Football is a game of spaces. The design system reflects this with generous padding, clear hierarchy, and distinct boundaries defined by strokes, not shadows.
                        </Typography>
                    </div>
                    <Separator />
                    <div className="grid gap-8 items-center md:grid-cols-[200px_1fr]">
                        <span className="text-sm text-slate-400 font-mono">Tiny & Muted</span>
                        <div className="flex gap-4">
                            <Typography variant="tiny">LEGAL TEXT</Typography>
                            <Typography variant="muted">Metadata text</Typography>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interaction Lab */}
            <section className="space-y-8">
                <SectionHeader title="Interaction Lab" description="Strict Rule: No shadows. Hover = Border Color Shift." />

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Card Interaction */}
                    <div className="space-y-4">
                        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Card Primitive</span>
                        <Card className="hover:border-slate-400 cursor-pointer group">
                            <CardHeader>
                                <CardTitle className="group-hover:text-green-600 transition-colors">Hover This Card</CardTitle>
                                <CardDescription>Notice the border darkens. No shadow.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-24 rounded-lg bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm">
                                    Content Area
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Button Interactions */}
                    <div className="space-y-4">
                        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Button Primitive</span>
                        <div className="p-8 border border-slate-200 rounded-[24px] space-y-4 flex flex-col items-start bg-white">
                            <Button>Standard Button</Button>
                            <p className="text-xs text-slate-400">Hover: Opacity 90%. No Lift.</p>

                            <div className="flex gap-4">
                                <Button variant="outline">Outline</Button>
                                <Button variant="ghost">Ghost Hover</Button>
                            </div>
                            <p className="text-xs text-slate-400">Hover: Background Fade. No Shadow.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Components Grid */}
            <section className="space-y-8">
                <SectionHeader title="Interface Components" description="Building blocks for data and controls." />

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Forms */}
                    <div className="space-y-6">
                        <Typography variant="h4">Forms & Inputs</Typography>
                        <div className="space-y-4 p-6 border border-slate-200 rounded-2xl">
                            <div className="space-y-2">
                                <Typography variant="small">Email Address</Typography>
                                <Input placeholder="name@example.com" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Typography variant="small">Password</Typography>
                                    <Typography variant="tiny" className="text-green-600 cursor-pointer">Forgot?</Typography>
                                </div>
                                <Input type="password" value="secret123" />
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="space-y-6">
                        <Typography variant="h4">Segmented Controls</Typography>
                        <div className="p-6 border border-slate-200 rounded-2xl h-full">
                            <Tabs defaultValue="stats" className="w-full">
                                <TabsList className="w-full grid grid-cols-3">
                                    <TabsTrigger value="stats">Stats</TabsTrigger>
                                    <TabsTrigger value="lineup">Lineup</TabsTrigger>
                                    <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
                                </TabsList>
                                <TabsContent value="stats" className="p-4 bg-slate-50 rounded-lg mt-4 border border-slate-100 text-center text-sm text-slate-500">
                                    Game Statistics View
                                </TabsContent>
                                <TabsContent value="lineup" className="p-4 bg-slate-50 rounded-lg mt-4 border border-slate-100 text-center text-sm text-slate-500">
                                    Player Positions View
                                </TabsContent>
                                <TabsContent value="heatmap" className="p-4 bg-slate-50 rounded-lg mt-4 border border-slate-100 text-center text-sm text-slate-500">
                                    Movement Map View
                                </TabsContent>
                            </Tabs>
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
                            <Skeleton className="h-[100px] w-full rounded-xl" />
                        </CardContent>
                    </Card>

                    <div className="col-span-2 space-y-4 p-6 border border-slate-200 rounded-[24px]">
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
        <div className="space-y-2 mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-green-500 pl-4">{title}</h2>
            <p className="text-lg text-slate-500 pl-5">{description}</p>
        </div>
    )
}

function ConstitutionCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="p-6 bg-slate-50 border border-slate-100 rounded-lg space-y-3 hover:border-slate-200 hover:bg-slate-100 transition-all cursor-pointer">
            <div className="w-10 h-10 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-900">
                <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
        </div>
    )
}

function ColorCard({ name, variable, text, border }: { name: string, variable: string, text: string, border?: boolean }) {
    /* ... retained ... */
    return <div className={`h-24 rounded-xl flex items-center justify-center font-bold shadow-sm ${variable} ${text} ${border ? 'border border-slate-200' : ''}`}>{name}</div>
}
