# Komiota Branding & Design Guidelines

This document outlines the core branding, aesthetic principles, and design system for the Komiota mobile application. Our goal is to create an experience that is **modern, easy to navigate, highly aesthetic, and friendly**.

## 1. Brand Identity & Vibe
* **Atmosphere:** Clean, welcoming, intuitive, and playful yet professional.
* **The Mascot:** We utilize a friendly, minimalist, cute white character (akin to a little polar bear). The mascot should be used thoughtfully to guide users, add personality to empty states (e.g., "No events today!"), celebrate successes, and make onboarding engaging.
* **Core Philosophy:** Functionality meets delight. The interface should never feel cluttered; generous whitespace is our friend.

## 2. Color Palette

### Light Mode Palette & Use Cases:
- **Background (Vanilla Milk - #F8F4F1):** Use for the main app background, bottom sheet backgrounds, and offline map base layers.
- **Primary Brand & Text (Deep Amethyst - #402859):** Use for primary high-emphasis text, primary action buttons (like "Start Route" or "Report Stop"), the main logo, and active bottom-navigation icons.
- **Secondary Brand (Plum Builder - #895C9A):** Use for secondary buttons, progress bars (e.g., Commuter Score tracker), active UI highlights, route line colors on the map, and muted text.
- **Tertiary/Accent (Orchid Petal - #CAB6CE):** Use for subtle borders, divider lines, disabled button states, and backgrounds for small tags/badges (like "Moderator" or "Offline").

### Dark Mode Palette & Use Cases:
- **Dark Background (Midnight Plum - #1A1622):** A deep, purple-tinted gray. Use this for the absolute base background of the app. It reduces eye strain during night commutes while staying on-brand.
- **Dark Surface (Twilight Surface - #2A2435):** A slightly lighter elevated gray. Use this for floating cards, bottom sheets, modals, and the search bar. It creates depth against the Dark Background.
- **Dark Mode Primary Text (#F8F4F1):** Re-use the Vanilla Milk color for all primary headings and highly legible body text against the dark surfaces.
- **Dark Mode Secondary Text (#CAB6CE):** Re-use Orchid Petal for timestamps, ETAs, secondary route information, and placeholder text in input fields.
- **Dark Mode Accents:** Continue using #895C9A for buttons and interactive elements, ensuring they stand out against the dark surfaces.

## 3. Typography
* **Font Family:** 
  * **Headings/Logos:** Quicksand - A modern, geometric, and friendly sans-serif for headers and branding elements.
  * **Body Text:** Inter - Highly legible, medium-to-light weight for easy extended reading.
* **Hierarchy:**
  * **Headers:** Bold, clean, providing clear page context and separation.
  * **Body:** Highly legible, medium-to-light weight for easy extended reading.
  * **Buttons/Badges:** Semi-bold for clear distinction and tap-ability.

## 4. UI Components & Layout
* **Border Radii (Corners):** 
  * Playful and soft. Use generous rounding (`24px` to `32px` for main container cards, structural backgrounds, and bottom sheets).
  * Buttons should predominantly be pill-shaped (fully rounded).
* **Shadows:** 
  * Soft, diffuse drop shadows for floating elements (FABs, elevated cards, popups) to create depth and layering without harsh delineations.
* **Icons & Logos:** 
  * **Logo Usage:** Always use our official logo (`mobile/assets/images/android-icon-monochrome.png`) when representing the brand within the app.
  * **General Icons:** Utilize a modern, consistent icon library (e.g., Lucide or Expo Vector Icons). 
  * *Style Preferences:* Rounded, consistent stroke weights, friendly. Unfilled/outline icons for inactive states, filled for active states.
* **Layout Structure:**
  * **Card-based interfaces:** Group related content in overlapping surface cards placed over the softer colored app background.
  * Ample use of spacing to group elements together logically.

## 5. Motion, Animations & Interactions
Motion is key to making the app feel "alive", premium, and modern.

* **Micro-interactions:**
  * **Spring physics:** Use gentle spring animations for button presses, toggles, and card expansions to give a tactile, satisfying feel.
  * **State changes:** Smooth crossfades or slide transitions when switching tabs or changing component states.
* **Mascot Animations:**
  * The mascot should have subtle idle animations (blinking, swaying) and contextual reactive animations (waving hello on the login screen, peeking over a calendar, or dropping a pin on the map).
* **Transitions:**
  * Fluid navigation transitions; elements should organically slide or scale into place rather than abruptly appearing.

## 6. Golden Rules
1. **Always use our primary color (#402859)** as the anchoring visual and brand element.
2. **Always highlight the Komiota Logo** (`android-icon-monochrome.png`) for branding, and maintain visual consistency across all general library icons used.
3. Keep it uncluttered: if a screen feels busy, abstract it into a card, a bottom sheet, or a collapsible section. 
4. Bring delight through our trusted mascot and smooth, liquid motion.
