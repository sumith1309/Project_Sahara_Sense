# Sahara Sense Color Palette

## Primary Soft Desert Colors

These are the main brand colors used throughout the application:

```css
--color-sky: #93B5C6;      /* Soft blue-grey (sky) */
--color-mist: #C9CCD5;     /* Light grey-blue (mist) */
--color-sand: #E4D8DC;     /* Soft pink-grey (sand) */
--color-blush: #FFE3E3;    /* Light pink (blush) */
```

## Accent Color (Amber)

Used for CTAs, buttons, and highlights:

```css
--color-amber: #D4A574;    /* Main amber for buttons and accents */
--color-amber-dark: #B8935F;  /* Darker shade for hover states */
```

## Usage Guidelines

### Backgrounds
- Main background: `linear-gradient(135deg, #F5F5F4 0%, #FFE3E3 30%, #E4D8DC 70%, #C9CCD5 100%)`
- Cards: `bg-white/90` with `backdrop-blur-sm`
- Borders: `border-stone-200`

### Text
- Primary text: `text-stone-800`
- Secondary text: `text-stone-600`
- Muted text: `text-stone-500`

### Buttons
- Primary CTA: `background: linear-gradient(135deg, #D4A574 0%, #B8935F 100%)`
- Secondary: `bg-white/90` with `border-stone-300`

### Icons & Accents
- Use `#D4A574` (amber) for icons and accent elements
- Use palette colors (#93B5C6, #C9CCD5, #E4D8DC, #FFE3E3) for stat cards and decorative elements

## Implementation

All colors are centralized in `/lib/design/colors.ts` for easy maintenance and consistency across the application.
