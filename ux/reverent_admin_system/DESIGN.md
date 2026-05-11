---
name: the-sanctuary design system
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#44474d'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#75777e'
  outline-variant: '#c5c6ce'
  surface-tint: '#4f5e7e'
  primary: '#041632'
  on-primary: '#ffffff'
  primary-container: '#1b2b48'
  on-primary-container: '#8393b5'
  inverse-primary: '#b7c7eb'
  secondary: '#775a19'
  on-secondary: '#ffffff'
  secondary-container: '#fed488'
  on-secondary-container: '#785a1a'
  tertiary: '#1d1602'
  on-tertiary: '#ffffff'
  tertiary-container: '#322a12'
  on-tertiary-container: '#9e9171'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#b7c7eb'
  on-primary-fixed: '#091b37'
  on-primary-fixed-variant: '#374765'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#f1e1bd'
  tertiary-fixed-dim: '#d4c5a2'
  on-tertiary-fixed: '#221b05'
  on-tertiary-fixed-variant: '#50462b'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  title-sm:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  edge-margin: 1rem
  stack-gap: 0.75rem
  list-item-padding: 1rem
  section-padding: 1.5rem
  bottom-nav-height: 4.5rem
---

## Brand & Style

The design system is anchored in a **Corporate/Modern** style that emphasizes institutional trust and sacred reverence. The aesthetic is clean and high-fidelity, designed to facilitate administrative efficiency while acknowledging the spiritual context of the organization. 

The personality is professional, orderly, and understated. By utilizing significant whitespace and a refined color palette, the interface remains uncluttered even when managing dense lists of 50+ members. The visual language avoids trendy gimmicks in favor of a timeless, reliable interface that feels both contemporary and respectful.

## Colors

The palette is directly extracted from the provided iconography to ensure brand continuity.
- **Deep Navy Blue (#1B2B48):** Used as the primary color for headers, primary actions, and navigation backgrounds to evoke stability and authority.
- **Metallic Gold (#C5A059):** Applied as an accent for meaningful highlights, selected states, and iconography to symbolize the sacred nature of the service.
- **Surface Neutrals:** A range of very light greys and off-whites provides a clean canvas that keeps the focus on member data and attendance metrics.
- **Semantic Colors:** Soft reds and greens are used sparingly for attendance tracking (absent/present) but are muted to maintain the professional tone.

## Typography

The typography system utilizes **Hanken Grotesk** for its exceptional clarity and modern, sharp terminals which feel professional and efficient. For utility-heavy data and labels, **Inter** is used to ensure maximum legibility at small sizes.

Hierarchy is strictly enforced to manage large volumes of data. Member names use `title-sm`, while administrative metadata (ID numbers, phone numbers) uses `caption`. Section headers for different youth groups utilize `label-caps` in the primary navy color to provide clear visual anchoring during scrolling.

## Layout & Spacing

This design system follows a **Fluid Grid** model optimized for a mobile-first PWA experience. 

- **The List Framework:** Given the requirement for 50+ members, the layout prioritizes vertical scanning. Member rows are 64px–72px high to ensure comfortable tap targets for attendance marking.
- **Mobile Navigation:** A fixed bottom bar with 4 tabs (Dashboard, Members, Attendance, Settings) is used.
- **Safe Areas:** A 16px (1rem) margin is maintained on all screen edges to ensure content doesn't feel cramped. 
- **Sticky Headers:** When scrolling through long member lists, alphabetical or group headers stick to the top to maintain context.

## Elevation & Depth

The design system uses **Tonal Layers** and **Low-contrast outlines** rather than heavy shadows to maintain a clean, reverent look.

- **Primary Surface:** White (#FFFFFF).
- **Secondary Surface:** Light Navy Wash (#F1F4F9) used for search bars and input fields to distinguish them from the page background.
- **Floating Elements:** Bottom navigation and primary "Add Member" buttons use a very soft, diffused shadow (0px 4px 20px rgba(27, 43, 72, 0.08)) to indicate they sit above the list.
- **Dividers:** 1px borders in a soft neutral are used between list items to create structure without visual noise.

## Shapes

The design system employs **Soft** (0.25rem) roundedness for most UI components. This choice provides a subtle modern touch without feeling too informal or "bubbly."

- **Input Fields & Search:** 0.25rem (4px) corner radius.
- **Attendance Chips:** 1rem (16px) radius to create a pill shape, making them easily distinguishable from other data points.
- **Member Avatars:** Perfect circles to reference the circular geometry of the organization's logo.

## Components

### Attendance Toggle
A custom three-state component (Present, Absent, Excused). When selected, the background fills with a soft tint of the state color (Green, Red, or Gold) with a high-contrast border.

### Member List Item
A structured row containing:
- Left: Circular avatar with member initials.
- Center: Member name (Primary) and Phone/ID (Secondary).
- Right: Attendance status indicator or quick-action chevron.

### Navigation Bar (Bottom)
4-tab layout using the primary navy color for active icons and labels. The active state includes a small gold underline or dot to denote focus.

### Search & Filter Bar
A persistent top-screen element. It uses a light-grey background and an "All Members" count label in `label-caps` typography.

### Profile Cards
Used in the member detail view, these cards use the secondary metallic gold for icons related to sacraments or milestones, set against a clean white background.

### Buttons
- **Primary:** Deep navy background with white text.
- **Secondary:** White background with navy border and gold icon.
- **Destructive:** Plain text with a thin red underline for "Delete" or "Remove" actions to keep the interface calm.