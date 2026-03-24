# Komiota Branding & Design Guidelines

This document outlines the core branding, aesthetic principles, and design system for the Komiota mobile application. Our goal is to create an experience that is **modern, easy to navigate, highly aesthetic, and friendly**.

## 1. Brand Identity & Vibe
* **Atmosphere:** Clean, welcoming, intuitive, and playful yet professional.
* **The Mascot:** We utilize a friendly, minimalist, cute white character (akin to a little polar bear). The mascot should be used thoughtfully to guide users, add personality to empty states (e.g., "No events today!"), celebrate successes, and make onboarding engaging. 
* **Core Philosophy:** Functionality meets delight. The interface should never feel cluttered; generous whitespace is our friend.

## 2. Color Palette
Our color system is anchored by a rich, vibrant purple, supported by soft pastels and clean neutrals to create a cohesive, gradient-rich environment.

* **Primary Color:** `#4627b6`
  * *Usage:* Main calls-to-action (CTAs), primary headers, active states, tab bar highlights, logo elements, and prominent UI accents.
* **Light Mode Backgrounds & Gradients:**
  * Use fluid, soft gradients transitioning from the primary `#4627b6` to slightly lighter purples for header backgrounds.
  * *App Background:* A very soft, cool lavender or light purple (e.g., `#f4f0fc`) to create gentle contrast with foreground cards.
* **Dark Mode Principles:**
  * *App Background:* Deep, rich dark purples or muted grays (e.g., `#171520` or `#16161a`).
  * *Surface/Cards:* Slightly elevated/lighter than the background to create depth (e.g., `#232036` or `#202025`).
  * *Primary Color Adjustments:* The primary color (`#4627b6`) may use a slightly more vibrant tint to ensure accessible contrast.
* **Neutrals & Strict Rules:**
  * **NO Pure White (`#FFFFFF`)**: Use Off-White or very light cool purple/gray (e.g., `#FAFAFA`, `#FCFAFF`, or `#F5F5F5`) for surfaces and light text.
  * **NO Pure Black (`#000000`)**: Use Deep gray or purple-black (e.g., `#1C1A22` or `#1A1A1A`) for dark text and deep backgrounds.
  * *Text (Primary):* Deep purple-black for Light Mode, Off-White for Dark Mode.
  * *Text (Muted):* Soft cool grays for secondary text, metadata, and placeholders across both modes.
* **Status Colors:**
  * Use soft, pastel variations of red (error), green (success), and yellow (warning), adjusting luminosity appropriately for light vs. dark mode.

## 3. Typography
* **Font Family:** A modern, geometric, and friendly sans-serif. 
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
1. **Always use our primary color (`#4627b6`)** as the anchoring visual and brand element.
2. **Always highlight the Komiota Logo** (`android-icon-monochrome.png`) for branding, and maintain visual consistency across all general library icons used.
3. Keep it uncluttered: if a screen feels busy, abstract it into a card, a bottom sheet, or a collapsible section. 
4. Bring delight through our trusted mascot and smooth, liquid motion.
