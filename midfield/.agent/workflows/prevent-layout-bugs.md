---
description: How to prevent layout bugs and broken page rendering in Next.js
---

# Layout Bug Prevention Guidelines

This workflow documents the **root causes of layout breaking bugs** and how to prevent them.

---

## ⚠️ CRITICAL: Tailwind v4 Width Collapse Bug

### The Problem
In **Tailwind CSS v4** with Next.js 16+, flex containers using Tailwind utility classes like `w-full`, `max-w-md`, `mx-auto` can **collapse to minimum width**, causing text to wrap on every word.

This is especially prevalent when:
- Using `flex items-center justify-center` for centering
- Using `max-w-*` classes inside flex containers
- Client components with Suspense boundaries

### The Symptoms
- Text breaks at every single word
- Input fields appear as tiny squares
- Buttons wrap text vertically
- Content appears extremely narrow despite no visible constraint

### ✅ THE FIX: Use Inline Styles for Critical Layout

**For width, max-width, and margin, USE INLINE STYLES instead of Tailwind classes:**

```tsx
// ❌ BROKEN - Tailwind v4 width classes collapse
<div className="w-full max-w-md mx-auto">
    <input className="w-full" />
</div>

// ✅ WORKING - Inline styles for layout-critical properties
<div style={{ width: '100%', maxWidth: '448px', margin: '0 auto' }}>
    <input style={{ width: '100%' }} />
</div>
```

### Safe to Use with Tailwind:
- Colors: `text-slate-900`, `bg-white`, `border-emerald-500`
- Spacing: `p-4`, `mb-6`, `gap-3` (mostly safe)
- Typography: `text-sm`, `font-bold`
- Borders: `rounded-md`, `border-2`
- Flex alignment: `items-center`, `justify-center`

### MUST Use Inline Styles:
- `width` → `style={{ width: '100%' }}`
- `max-width` → `style={{ maxWidth: '448px' }}`
- `margin: auto` → `style={{ margin: '0 auto' }}`
- Critical flex containers → `style={{ display: 'flex', gap: '32px' }}`

---

## ⚠️ Suspense Boundaries for useSearchParams

### The Problem
`useSearchParams()` opts components into dynamic rendering. Without Suspense, layouts break during hydration.

### The Fix
```tsx
// Wrap the component that uses useSearchParams
function MyForm() {
    const searchParams = useSearchParams();
    return <div>...</div>;
}

export default function MyPage() {
    return (
        <Suspense fallback={<MySkeleton />}>
            <MyForm />
        </Suspense>
    );
}
```

---

## ⚠️ Never Apply max-w to Layout Files

### The Problem
Nested layout files with `max-w-*` conflict with content width constraints.

### The Fix
```tsx
// ❌ WRONG - auth/layout.tsx
export default function AuthLayout({ children }) {
    return <div className="max-w-md mx-auto">{children}</div>; // BREAKS!
}

// ✅ CORRECT - Let content control its own width
export default function AuthLayout({ children }) {
    return children;
}
```

---

## Quick Reference Checklist

Before committing any page/component:

- [ ] Are width/max-width using inline styles (not Tailwind classes)?
- [ ] Does `useSearchParams()` have a Suspense boundary?
- [ ] Do route layout files return `children` without wrappers?
- [ ] Do icons have `shrink-0` or inline `flexShrink: 0`?
- [ ] Do text containers have `minWidth: 0` or `min-w-0` in flex?

---

## Proven Safe Patterns

### Centered Page Container
```tsx
<div style={{ width: '100%', maxWidth: '448px', margin: '0 auto', padding: '64px 0' }}>
    {/* Content */}
</div>
```

### Form with Full-Width Input
```tsx
<input 
    className="h-10 rounded-md border-2 text-sm"
    style={{ width: '100%' }}
/>
```

### Flex Row with Gap
```tsx
<div style={{ display: 'flex', flexDirection: 'row', gap: '32px', flexWrap: 'wrap' }}>
    {/* Items */}
</div>
```
