# Rule: 20 Anti-AI-Slop Design Principles

Every agent proposing, generating, modifying, or reviewing frontend interfaces, UI components, styling, typography, or UX copy in this repository must strictly adhere to these 20 design principles:

1. **Delete Filler Badges**: Eliminate arbitrary, unearned badges (e.g., "AI-Powered", "Next-Gen", "100% Reliable", decorative pill tags). Every badge must convey concrete, verifiable metadata (such as dates, metrics, status, or official designations).
2. **Drop Redundant Labels**: Remove self-evident key labels (e.g., "Email:", "Role:", "Category:", "Title:") when the content's nature is already obvious from its format or context.
3. **Unitalicize Random Words**: Never italicize words arbitrarily in headings or body text to simulate "sophistication" or AI emphasis. Italics are reserved solely for standard code keywords, book/letter titles, or documented typographical citations.
4. **Mono Only Where Needed**: Reserve monospace fonts strictly for code snippets, raw metrics, telemetry values, system IDs, hashes, and tabular keys. Never use monospace for conversational body copy or broad descriptive labels.
5. **Use a Design System**: Adhere rigorously to established design tokens (colors, type scale, spacing, border styles, CSS variables like `--wall`, `--card`, `--ink`, `--mute`, `--r`, `--r-lg`). Never introduce hardcoded, one-off color hexes or arbitrary spatial units.
6. **Show the Actual Product**: Display concrete diagrams, verifiable previews, actual interactive letters/scenes, or real UI components instead of abstract 3D geometric shapes, neon blobs, or generic stock illustrations.
7. **Enlarge the Main Feature**: Establish clear visual hierarchy by giving primary visual weight and spatial dominance to the flagship feature or interactive element (e.g., the 3D letter / canvas stage) rather than rendering an undifferentiated grid of uniform cards.
8. **Group with Spacing**: Rely on Gestalt proximity and generous whitespace to organize related items. Avoid enclosing every element in gratuitous hairline boxes or nested border dividers.
9. **Make Headlines Specific**: Write direct, factual, and informative headlines that state tangible outcomes or clear purposes. Ban vague buzzwords, hyperbolic marketing claims, and generic AI catchphrases.
10. **Emphasize the CTA**: Ensure primary calls-to-action possess distinct visual priority (contrast, weight, directional indicator) over secondary links and passive text.
11. **Add an Accent Colour**: Employ a focused, intentional accent color palette (e.g., `--dot: #d7261e` wax seal red) to draw attention to critical interactive elements or verified states, rejecting both monotonous greyscale and chaotic multi-colored palettes.
12. **Keep Icons Consistent**: Standardize icon styling across all surfaces: uniform stroke widths (e.g., 1.5px–2px), viewbox geometry, optical weights, and corner radii.
13. **Remove Embellishments**: Strip away unnecessary decorative flourishes such as neon glow halos, extraneous sci-fi crosshairs, floating dots, and ornamental background grids that add visual noise without utility.
14. **Inner Radius = Outer − Padding**: When nesting rounded containers, calculate the inner corner radius precisely ($R_{\text{inner}} = R_{\text{outer}} - \text{padding}$). If padding equals or exceeds outer radius, set inner radius to 0 (or match flat borders).
15. **Improve Text Contrast**: Guarantee that every text element surpasses WCAG AA contrast standards (minimum 4.5:1 for normal text, 3:1 for large text). Avoid low-contrast tinted text or heavy opacity reduction on secondary labels (ensure `--mute` maintains readable contrast against `--wall` / `--card`).
16. **Wrap Headlines Properly**: Prevent typographic widows and awkward line wraps by applying `text-wrap: balance` to headings and `text-wrap: pretty` to body blocks.
17. **Align by Eye, Not Pixels**: Optically balance icons, badges, capitalized acronyms, and directional glyphs to counteract bounding box visual weight discrepancies.
18. **Use Tabular Nums**: Enforce `font-variant-numeric: tabular-nums` (or `tnum`) for all numerical metrics, timestamps, countdowns, letter counts, and data tables to prevent character jitter and misaligned columns.
19. **Add Loading States**: Ensure asynchronous actions and interactive components provide visible, responsive feedback (skeletons, progress bars, disabled states, loading spinners) rather than freezing without explanation.
20. **Animate Useful Feedback**: Restrict animations to functional transitions and immediate user feedback (e.g., envelope flap opening, seal breaking, toast notification, state change indicators). Ban perpetual gratuitous loops that distract from content.

