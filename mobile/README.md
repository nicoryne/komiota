# Komiota - Mobile

This directory contains the mobile application for **Komiota**, built to help Cebu City commuters navigate the newly implemented CBRT network seamlessly, even without mobile data.

## Overview

The Komiota mobile app prioritizes an offline-first experience. Because internet connectivity can be spotty while commuting, the app bundles essential transit data and utilizes lightweight vector map tiles to ensure users can always find their way.

### Core Mobile Features

- **Offline Vector Maps:** Utilizes MapLibre GL to render OpenStreetMap (OSM) data locally, keeping the app size manageable while providing crisp, street-level detail.
- **Local Caching & Background Sync:** Transit routes and verified stops are stored in a local on-device database. The app silently fetches new verified stops from the backend whenever a stable connection is detected.
- **Crowdsourced Submissions:** Commuters can drop pins on the map, attach photos of unlisted bus stops, and submit them for review. Submissions made offline are queued and uploaded automatically upon reconnection.

## Tech Stack

- **Framework:** React Native
- **Maps:** MapLibre React Native
- **Map Data:** OpenStreetMap (OSM)

---

_Maintained by Nicolo | [ryne.dev](https://ryne.dev)_
