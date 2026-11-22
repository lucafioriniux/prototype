# DysPrint 3D — Design & Accessibility Guidelines
*Additive Manufacturing Accessories & Replacement Parts for Dyson Systems*

---

## 1. Project Overview & Scope
**DysPrint 3D** is a specialized direct-to-consumer and maker e-commerce platform designed for ordering precision 3D printed accessories, dock organizers, nozzle adapters, and ergonomic attachments for Dyson appliances—starting with cordless and upright vacuums, with future expansion to hair care (Supersonic/Airwrap) and air treatment (Purifier/Humidify).

All user interfaces, design tokens, interaction models, and future builds under this project **must strictly adhere** to the guidelines outlined in this document.

---

## 2. Brand & Aesthetic Identity
The brand blends **Dyson's industrial precision engineering** with **additive manufacturing material authenticity**.

- **Tone**: Technical, trustworthy, high-utility, refined, modern.
- **Aesthetic Principles**:
  - *Utilitarian Elegance*: Clean surfaces, precise mechanical metadata, clear technical specs (print hours, filament weight, tolerance ratings).
  - *Filament Truth*: Highlighting actual additive manufacturing qualities (layer heights, infill patterns, PETG/TPU/PLA+ properties) rather than disguising them.
  - *Seamless Ergonomics*: Interfaces that mirror the satisfying snap and tactile click of Dyson quick-release mechanisms.

---

## 3. Visual Design System & Tokens

### 3.1 Color Palette & Contrast Standards
Every color pairing must satisfy **WCAG 2.1 AA** contrast ratios:
- **Normal Body Text (<18pt / <24px)**: $\ge 4.5:1$ contrast ratio.
- **Large Text ($\ge 18\text{pt}$ or $\ge 14\text{pt}$ bold)**: $\ge 3:1$ contrast ratio.
- **UI Components & Graphical Objects**: $\ge 3:1$ contrast ratio against adjacent backgrounds.

| Token Name | Hex Code | Purpose / Usage | WCAG Pairings & Notes |
| :--- | :--- | :--- | :--- |
| `zinc-950` | `#09090b` | Dark mode primary background | Background for dark surfaces |
| `zinc-900` | `#18181b` | Dark mode elevated card background | Contrasts 12.8:1 against white text |
| `zinc-800` | `#27272a` | Dark mode borders & dividers | $\ge 3:1$ boundary definition |
| `zinc-100` | `#f4f4f5` | Dark mode primary text / Light surface | High legibility text on dark |
| `zinc-600` | `#52525b` | Secondary text & metadata | 5.1:1 on white, 4.6:1 on light gray |
| `white` | `#ffffff` | Light mode primary background | Standard light canvas |
| `dyson-iron` | `#2b2d32` | Signature Dyson gunmetal gray | Primary brand neutral |
| `dyson-nickel` | `#50535a` | Metallic secondary tone | Accent & hardware elements |
| `dyson-cyan` | `#0891b2` (Dark) / `#0e7490` (Light) | Electric Cyan accent (V15/laser) | $\ge 4.5:1$ against backgrounds |
| `dyson-fuchsia` | `#be185d` | Signature Dyson Magenta/Fuchsia | High-visibility action badge |
| `dyson-copper` | `#c2410c` | Warm Amber / Copper (Gen5detect) | Warm accent badge |
| `safety-emerald`| `#059669` | Compatibility verified / In-stock | Accessible status confirmation |

### 3.2 Typography Hierarchy
System font stack with fallback to modern geometric grotesque:
`font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;`

- **Display Titles (`text-3xl` / `text-4xl`)**: Bold 700/800, tight tracking (`-0.02em`).
- **Section Headers (`text-xl` / `text-2xl`)**: Semibold 600, balanced line height (`1.3`).
- **Card Headings (`text-base` / `text-lg`)**: Semibold 600.
- **Body Text (`text-sm` / `text-base`)**: Regular 400, leading relaxed (`1.5`).
- **Technical Specifications (`font-mono` / `text-xs`)**: Clean tabular figures for millimeters, grams, hours, and model numbers.

### 3.3 Touch Targets & Spacing
- **Minimum Interactive Target Size**: $44 \times 44\text{px}$ (WCAG 2.5.5 / 2.5.8 Target Size minimum $24\times24\text{px}$, targeting enhanced $44\text{px}$).
- **Spacing Units**: 4px baseline grid (`p-1` = 4px, `p-2` = 8px, `p-4` = 16px, `p-6` = 24px).
- **Corner Radius**:
  - Buttons / Badges: `rounded-lg` (8px) or `rounded-full` for chips.
  - Cards & Containers: `rounded-2xl` (16px).
  - Modals & Drawers: `rounded-3xl` (24px).

---

## 4. WCAG 2.1 Level AA Accessibility Standards

### 4.1 Keyboard Operability & Focus Navigation
1. **Focus Rings**:
   - Every interactive element (buttons, links, inputs, selects, radio cards) must feature an unobstructed, high-contrast focus indicator:
     `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950`
   - Never suppress outline/ring without a visible replacement.
2. **Logical Tab Order**:
   - DOM order must match visual layout.
   - Modals and drawers must implement **focus trapping**: pressing `Tab` cycles within the active dialog; pressing `Escape` closes the dialog and returns focus to the trigger.
3. **Skip Links**:
   - Provide an accessible "Skip to Main Content" link at the very top of the page for keyboard users.

### 4.2 Semantic Structure & ARIA Patterns
- Use native HTML5 landmarks: `<header>`, `<nav>`, `<main>`, `<section>`, `<aside>`, `<footer>`.
- Every icon-only button (e.g. cart button, close modal button, theme toggle) must include an explicit `aria-label` or visually hidden screen reader text (`sr-only`).
- Accordions and filter dropdowns must use `aria-expanded="true|false"` and `aria-controls`.
- Dynamic cart counts, toast messages, and compatibility validation alerts must use `aria-live="polite"` so screen reader users receive auditory updates without focus disruption.
- Color alone must **never** be the sole indicator of compatibility, status, or selection. Always combine color with an icon and textual label (e.g. `✓ Guaranteed Fit` vs `✗ Incompatible`).

### 4.3 Reduced Motion Support
Respect users' system motion preferences:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 5. Domain UX Architecture: Dyson 3D Printing E-Commerce

### 5.1 The "Compatibility-First" Filter Engine
The #1 failure mode in 3D printed vacuum accessories is model mismatch (e.g., V8 red-clip accessories do NOT fit V12 Slim quick-release collars, and screw-in batteries differ from click-in batteries).
- **Rule**: Users must be able to lock their exact Dyson model globally (e.g. "Dyson V15 Detect") with 1 click.
- When a model is selected:
  - Products compatible receive a prominent **"Guaranteed Fit for [Model]"** badge.
  - Incompatible products display a clear **"Does not fit [Model]"** alert and disabled order action with explanation.
- **Diagnostic Helper**: An interactive 2-step identification wizard for users who do not know their model number (identifying click-in vs screw battery, LCD screen vs LED lights, wand color).

### 5.2 3D Print Technical Customizer
Every item ordered for manufacturing must allow full configuration:
1. **Engineering Grade Material**:
   - **PETG (Polyethylene Terephthalate Glycol)**: Tough, impact resistant, chemically inert. Recommended for wall docks and tool holders.
   - **Tough PLA+**: High rigidity, smooth surface finish, tightest dimensional tolerances ($\pm0.15\text{mm}$). Ideal for crevice nozzles and trigger clamps.
   - **TPU 95A (Thermoplastic Polyurethane)**: Semi-flexible elastomer. Prevents scratching delicate furniture, hardwood baseboards, and car interiors.
2. **Color Palette Matching**:
   - Formulated to complement authentic Dyson body finishes: *Iron Grey*, *Dyson Fuchsia*, *Electric Royal Blue*, *Sunset Copper*, *Matte Stealth Black*, and *Safety Orange*.
3. **Infill / Durability Profiles**:
   - *Standard (25% Infill)*: Everyday residential use.
   - *Heavy-Duty (55% Infill)*: Commercial/garage use, high mechanical stress.
   - *Ultra-Solid (100% Solid)*: Maximum structural rigidity for mounting anchors.
4. **Live Print Telemetry**:
   - Real-time updates displaying estimated print time (e.g. `3h 45m`), filament weight (`72g`), and dimensional tolerances.

### 5.3 Cart & Order Transparency
- Free shipping threshold visualizer ($35+).
- Clear manufacturing timeline: "Printed on demand within 24–48 hours in Boston, MA".
- 100% Fit Guarantee statement on checkout summary.

---

## 6. Implementation Checklist for All Builds
Before any commit or deployment, verify:
- [ ] No automated console errors or React key warnings.
- [ ] Color contrast passes WCAG AA on both Light and Dark themes.
- [ ] Keyboard navigation: full workflow achievable using `Tab`, `Shift+Tab`, `Space`, `Enter`, and `Esc`.
- [ ] Mobile responsive: tested across 375px (iPhone SE/Mini), 768px (iPad/Tablet), and 1280px+ (Desktop).
- [ ] Screen reader tested with semantic headings (`h1` -> `h2` -> `h3`) without skipping levels.
- [ ] Touch targets are at least 44px on mobile devices.
- [ ] Base path in Vite is set properly for GitHub Pages deployment.
