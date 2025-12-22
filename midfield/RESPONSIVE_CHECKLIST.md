# RESPONSIVE DEVELOPMENT CHECKLIST
## Prevents Future Refactor Hell

### PRE-SHIP CHECKLIST (mandatory for ALL new components):

□ **Test at 5 breakpoints**: 320px, 640px, 768px, 1024px, 1920px  
□ **Spacing scales progressively**: `p-3 sm:p-4 md:p-5`  
□ **Text scales progressively**: `text-xs sm:text-sm md:text-base`  
□ **Test ALL interactive states** at each size: hover, menus open, modals, dropdowns  
□ **Check overflow/wrapping/truncation** behavior  
□ **Touch targets ≥44px** on mobile  
□ **Test breakpoint edges**: 639px, 767px, 1023px, 1279px  

### DEVELOPMENT PATTERN:

**Desktop Sacred**: `sm:` breakpoint (640px+) must match original design  
**Mobile Adjustments Only**: Modify `<640px` with smaller values  
**Progressive Scaling**: `text-[10px] xs:text-xs sm:text-sm md:text-base`  

### GOLDEN RULE:

If desktop looks amazing, **NEVER** modify it. Fix responsiveness at smaller breakpoints only.

### Component-Level Checks:

- **Spacing**: No cramped density, intentional gutters
- **Typography**: Readable sizes, proper line-height, truncation
- **Layout**: No accidental stacking/wrapping
- **Interactive**: Menus don't break layout, modals fit screen
- **Images**: Scale appropriately, no distortion
