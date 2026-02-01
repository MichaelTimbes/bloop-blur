# Boop-Blur Feature Inventory

> **Last Updated:** January 31, 2026 (Mosaic Upgrade)  
> **Purpose:** Track all implemented functionality to prevent accidental overwrites during future development

---

## ✅ Implemented Features

### Core User Flow
- [x] **Daily Check-in Button** (`/` route)
  - Single "I'm here" button on home page
  - Click triggers interstitial → photo capture → spark line → return home
  - Disabled state while flow is active

- [x] **Silly Interstitial** (`Interstitial.vue`)
  - Random message from hardcoded array (15 messages)
  - Auto-dismisses after 0.5-1.5 seconds (random)
  - Full-screen overlay with muted blue background
  - Fade-in + pulse animations

- [x] **Photo Capture Flow** (`CaptureFlow.vue`)
  - Native `<input type="file" accept="image/*" capture="environment">`
  - File selection → save to IndexedDB → show spark line
  - Cancel option available
  - Loading state during save

- [x] **Spark Line Display** (`SparkLine.vue`)
  - Shows single spark line from active vibe pack
  - Deterministic selection based on ISO date hash
  - "Done" button returns to home
  - Displayed after photo capture

### Data Storage & Persistence

- [x] **IndexedDB Artifacts** (`repositories/artifacts.ts`)
  - Store: `artifacts` with indexes: by-date, by-week, by-timestamp
  - Schema: `{ id, ts, isoDate, weekKey, type, blob, sparkPackId, sparkIndex }`
  - Operations: save, get, getAll, getByWeek, getByDate, delete, deleteByIds, clear
  - Singleton pattern with auto-initialization

- [x] **localStorage Settings** (`utils/storage.ts`)
  - Active vibe pack (default: 'zen-but-dumb')
  - Deletion policy (default: 'off')
  - Persisted and retrieved via helper functions

- [x] **localStorage Trace** (`utils/storage.ts`)
  - Total boops counter
  - Last boop timestamp
  - Increment function updates both fields

### State Management (Pinia)

- [x] **Artifact Store** (`stores/artifacts.ts`)
  - Load/save artifacts
  - Computed: currentWeekArtifacts, todayArtifacts, hasBoopedToday
  - Cleanup job runs on app start based on deletion policy

- [x] **Trace Store** (`stores/trace.ts`)
  - Record boop events
  - Track total boops and last boop time
  - Reset function

- [x] **Settings Store** (`stores/settings.ts`)
  - Active vibe pack selection
  - Deletion policy selection
  - Reset function

- [x] **Auth Store** (`stores/auth.ts`)
  - Firebase Auth integration (behind ENABLE_AUTH flag)
  - Sign in/up/out methods
  - User state tracking
  - Auth state observer

### Views & Routes

- [x] **Home View** (`/`)
  - Big circular "I'm here" button
  - Navigation links to Mosaic and Settings
  - Total boops stat display
  - "Already booped today" indicator
  - Handles interstitial/capture flow state

- [x] **Mosaic View** (`/mosaic`)
  - **Sticky Living Header** with week context:
    - Left: Back button
    - Center: Title "Week of {Mon DD}", subtitle "Fading to Blur", decay meter
    - Decay meter: 5 tiny squares that fill left-to-right based on weekDecayProgress (Mon=0, Sun=6 / 6)
    - Sticky on scroll with backdrop blur and subtle shadow
  - **Contact Sheet Styling**:
    - Paper-like background (#faf8f3) with CSS grain texture (repeating gradients)
    - Tiles styled as printed photos with off-white borders (6px)
    - Soft shadows and hover elevation effect
    - Tighter grid spacing (minmax 240px vs 250px)
  - **Tap-to-View Modal**:
    - Large image preview with decay effects applied
    - Spark line displayed below image (read from artifact.sparkPackId/sparkIndex)
    - Back button and Esc key to close
    - Semi-transparent overlay with centered modal
  - **Long-Press Peek** (pointer-based):
    - Threshold: 350ms hold to trigger peek
    - Display artifact crisp (no decay) for ~1000ms
    - If pixelated, show normal img during peek
    - Prevents tap-to-open when peek is active
    - Auto-clears after 1s or on pointer release/cancel/leave
  - **Visual Decay Effects** (unchanged):
    - Day 0: crisp
    - Days 1-2: blur(1px)
    - Days 3-4: blur(2px) + saturate(0.8)
    - Days 5-6: blur(3px) + saturate(0.6) + contrast(0.9)
    - Days 7+: pixelated (24x24 downscale, cached)
  - Artifact info overlay (date, age in days)
  - Empty state messaging
  - Mobile-friendly responsive grid

- [x] **Settings View** (`/settings`)
  - Stats section (total boops card)
  - Vibe pack selector dropdown (5 packs)
  - Deletion policy selector (off, keep-4-weeks, delete-14-days)
  - Policy descriptions
  - About section with version info
  - Back button to home

- [x] **Login View** (`/login`)
  - Only visible if ENABLE_AUTH = true
  - Email/password inputs
  - Toggle between sign-in and sign-up modes
  - Error display
  - Privacy note about local storage

---

## 📝 File Inventory

### Components (`src/components/`)
- `App.vue` - Root component, cleanup job
- `CaptureFlow.vue` - Photo capture modal with dev skip button (DEV_ONLY)
- `Interstitial.vue` - Random silly message overlay
- `SparkLine.vue` - Spark line display component

### Views (`src/views/`)
- `Home.vue` - Daily check-in with expanding "I'm here" button (circle reveal animation)
- `Mosaic.vue` - **[UPGRADED JAN 31]** Weekly contact sheet with sticky header, decay meter, paper texture, tap-to-view modal, long-press peek, cached pixelation
- `Settings.vue` - Vibe pack selector, deletion policy, stats
- `Login.vue` - Firebase auth (if ENABLE_AUTH enabled)

### Stores (`src/stores/`)
- `artifacts.ts` - IndexedDB artifact CRUD + query
- `auth.ts` - Firebase authentication
- `settings.ts` - Vibe pack + deletion policy
- `trace.ts` - Boop counter + last timestamp

### Utilities (`src/utils/`)
- `date.ts` - ISO week/date, aging, hashing
- `helpers.ts` - ID gen, blob conversion, array utils
- `storage.ts` - localStorage helpers for settings + trace

### Repository (`src/repositories/`)
- `artifacts.ts` - IndexedDB singleton + operations

### Content (`src/content/packs/`)
- `zen-but-dumb.json` - 20 spark lines
- `existential-but-cozy.json` - 20 spark lines
- `relational-nudges.json` - 20 spark lines
- `existential-but-mundane.json` - 20 spark lines
- `nature-but-unhinged.json` - 20 spark lines

### Configuration & Root
- `src/config.ts` - Feature flags, defaults, decay thresholds
- `src/main.ts` - Vue app entry
- `src/types/index.ts` - TypeScript interfaces
- `src/router/index.ts` - Route definitions + auth guard
- `src/style.css` - Global styles + theme tokens
- `vite.config.ts` - Build config
- `tsconfig.json` - TypeScript config
- `package.json` - Dependencies

### Content (Vibe Packs)

All stored as JSON in `src/content/packs/`:

- [x] **zen-but-dumb.json** - 20 spark lines (default pack)
- [x] **existential-but-cozy.json** - 20 spark lines
- [x] **relational-nudges.json** - 20 spark lines
- [x] **existential-but-mundane.json** - 20 spark lines
- [x] **nature-but-unhinged.json** - 20 spark lines

### Visual Design System

**Theme Tokens** (defined in `:root`):
```css
--bg: #f6f1e7       /* Warm beige background */
--panel: #fff8ef    /* Light cream panels */
--text: #1c1b16     /* Dark charcoal text */
--muted: #6e6a5f    /* Brownish gray muted text */
--accent: #2b4c7e   /* Muted blue accent */
--radius: 18px      /* Border radius */
--shadow: 0 10px 30px rgba(0,0,0,0.08) /* Subtle shadow */
```

**Applied Consistently:**
- All buttons use var(--accent) background
- All panels use var(--panel) background
- All pages use var(--bg) background
- Border radius is 18px throughout
- Shadows use consistent token

### Utilities & Helpers

- [x] **Date Utils** (`utils/date.ts`)
  - `getISODate()` - YYYY-MM-DD format
  - `getWeekKey()` - ISO week format (2026-W05)
  - `getWeekStart()` - Monday of current week
  - `getAgeDays()` - Calculate artifact age
  - `hashDateString()` - Deterministic hash for spark line selection

- [x] **Helpers** (`utils/helpers.ts`)
  - `generateId()` - UUID v4 generation
  - `blobToDataURL()` - Convert Blob to data URL
  - `getRandomItem()` - Random array element

### Router & Navigation

- [x] **Route Guards** (`router/index.ts`)
  - Auth check if ENABLE_AUTH = true
  - Redirect to /login if not authenticated
  - Prevent login access if already authenticated

### Configuration

- [x] **Feature Flags** (`config.ts`)
  - `ENABLE_AUTH` = false (Firebase Auth toggle)
  - `DEFAULT_VIBE_PACK` = 'zen-but-dumb'
  - `DEFAULT_DELETION_POLICY` = 'off'
  - `DECAY_THRESHOLDS` object (day thresholds for visual effects)
  - Firebase config from env vars

### Deletion Policies (Ephemeral Design)

- [x] **Cleanup Job** (runs on app start in `App.vue`)
  - Respects deletion policy setting
  - `off` - no deletion
  - `delete-14-days` - removes artifacts older than 14 days
  - `keep-4-weeks` - removes artifacts older than 28 days
  - Batch deletion via IndexedDB

---

## 🏗️ Architecture Overview

### Data Flow
```
User Click "I'm here"
  ↓
Show Interstitial (random message)
  ↓
Open File Input (capture photo)
  ↓
Save to IndexedDB + increment trace
  ↓
Show Spark Line (deterministic by date)
  ↓
Return to Home
```

### Storage Architecture
```
IndexedDB: artifacts (photos as blobs)
localStorage: settings, trace (counters)
Firebase Auth: user authentication (optional)
```

### Component Hierarchy
```
App.vue
  ├── RouterView
      ├── Home.vue
      │   ├── Interstitial.vue (conditional)
      │   └── CaptureFlow.vue (conditional)
      │       └── SparkLine.vue
      ├── Mosaic.vue
      │   └── Viewer Modal (displays spark line from artifact.sparkPackId/sparkIndex)
      ├── Settings.vue
      └── Login.vue (if ENABLE_AUTH)
```

---

## 📦 Dependencies

**Runtime:**
- vue 3.4.19
- vue-router 4.2.5
- pinia 2.1.7
- idb 8.0.0
- date-fns 3.3.1
- firebase 10.8.0

**Dev:**
- vite 5.1.0
- typescript 5.3.3
- vue-tsc 2.0.6
- @vitejs/plugin-vue 5.0.4

---

## 🚫 Not Implemented / Out of Scope

- Social features (sharing, feeds, followers)
- Cloud sync of artifacts
- Push notifications
- Analytics or tracking
- User profiles or avatars
- Comments or reactions
- Search functionality
- Export/import features
- Multiple photo capture per day enforcement (can boop multiple times)
- Photo editing or filters
- Audio/video capture
- Tags or categories
- Reminders or notifications
- Desktop notifications
- PWA manifest/service worker
- Dark mode toggle

---

## 🔑 Key Technical Decisions

1. **Local-First:** All artifacts stored in IndexedDB, never uploaded to cloud
2. **ISO Weeks:** Using ISO 8601 standard (week starts Monday) for mosaic grouping
3. **Deterministic Spark Lines:** Same date always shows same spark line (via hash)
4. **Canvas Pixelation:** 7+ day old photos use canvas downscaling for decay effect
5. **No Edit/Delete UI:** Artifacts can only be removed via automatic deletion policies
6. **Single Daily Capture:** UI suggests one per day but doesn't enforce
7. **Firebase Auth Optional:** Behind feature flag to keep app functional without setup
8. **TypeScript:** Strict mode enabled for type safety
9. **No Backend:** Entirely client-side application
10. **Contact Sheet Mosaic:** Paper-like aesthetic with subtle grain texture and photo-print styling
11. **Pointer-Based Peek:** Long-press detection via pointer events for tactile interaction
12. **Cached Pixelation:** Pixelated canvases cached by artifactId to avoid re-rendering

---

## 🔄 Recent Updates

### Mosaic.vue Upgrade (January 31, 2026)

**What Changed:**
- Converted from basic grid to "contact sheet" aesthetic
- Added sticky header with decay meter
- Implemented tap-to-view modal with spark line
- Added long-press peek functionality
- Refactored pixelation rendering with caching
- Enhanced paper/zine visual theme

**New Imports:**
- All 5 vibe packs imported directly in Mosaic.vue for spark line lookup
- Added `getWeekStart` from date utils

**New State:**
- `viewerOpen`, `viewerArtifact` - Modal state
- `peekArtifactId`, `peekTimeout` - Long-press peek state
- `pixelatedCanvases` Map - Canvas rendering cache

**New Functions:**
- `renderPixelated(canvas, imageUrl, artifactId)` - Moved to setup, now cached
- `getSparkLineForArtifact(artifact)` - Reads from stored sparkPackId/sparkIndex
- `handlePointerDown(artifactId)` - Start 350ms peek timer
- `handlePointerUp()` - Cancel timer
- `openViewer(artifact)` - Open modal (blocked if peek active)
- `closeViewer()` - Close modal
- `getDecayStyleWithPeek()` - Override decay when peeking
- `shouldPixelateWithPeek()` - Skip pixelation during peek

**New Styles:**
- Paper grain texture (CSS repeating gradients)
- Sticky header with backdrop blur
- Decay meter (5 filled squares)
- Print-style tile borders (6px off-white)
- Hover elevation effect
- Viewer modal with semi-transparent overlay
- Spark line display in modal (italic, accent border)

**Behavior Changes:**
- Header stays visible on scroll
- Tapping tile opens full-screen viewer (modal)
- Long-pressing (350ms threshold) temporarily removes decay
- Esc key closes modal
- Clicking overlay closes modal
- Decay meter shows week progression (Mon=0%, Sun=100%)

**Browser Event Handling:**
- `pointerdown`, `pointerup`, `pointercancel`, `pointerleave` for peek
- `click` for viewer open
- `keydown` for Esc to close
- Click outside modal to close (overlay click)

**Performance Considerations:**
- Pixelated canvas results cached in Map (not re-encoded)
- Peek timers properly cleaned up on all pointer events
- Modal optimized with @click.stop to prevent bubble

---

## 📝 File Inventory

### Components (4)
- `CaptureFlow.vue` - Photo capture modal + orchestration
- `Interstitial.vue` - Silly loading screen
- `SparkLine.vue` - Display spark line message

### Views (4)
- `Home.vue` - Main "I'm here" button page
- `Mosaic.vue` - Weekly grid with decay effects
- `Settings.vue` - Configuration page
- `Login.vue` - Auth page (optional)

### Stores (4)
- `artifacts.ts` - Artifact CRUD + cleanup
- `auth.ts` - Firebase Auth wrapper
- `settings.ts` - User preferences
- `trace.ts` - Usage stats

### Utils (4)
- `date.ts` - Date/week calculations
- `helpers.ts` - General utilities
- `storage.ts` - localStorage wrappers

### Repositories (1)
- `artifacts.ts` - IndexedDB interface

### Content (5)
- `zen-but-dumb.json`
- `existential-but-cozy.json`
- `relational-nudges.json`
- `existential-but-mundane.json`
- `nature-but-unhinged.json`

### Config/Setup (7)
- `main.ts` - App entry
- `App.vue` - Root component
- `config.ts` - Feature flags & constants
- `router/index.ts` - Route definitions
- `types/index.ts` - TypeScript types
- `style.css` - Global styles + theme tokens
- `vite-env.d.ts` - Vite type declarations

---

## 🎨 Visual Decay Implementation Details

### CSS Filters (Days 0-6)
Applied via inline styles in `Mosaic.vue`:
```typescript
function getDecayStyle(ageDays: number) {
  if (ageDays === 0) return {}
  if (ageDays <= 2) return { filter: 'blur(1px)' }
  if (ageDays <= 4) return { filter: 'blur(2px) saturate(0.8)' }
  if (ageDays <= 6) return { filter: 'blur(3px) saturate(0.6) contrast(0.9)' }
}
```

### Canvas Pixelation (Days 7+)
Renders pixelated version using 24x24 downscale:
```typescript
function renderPixelated(canvas, imageUrl) {
  // 1. Draw to 24x24 temp canvas
  // 2. Disable image smoothing
  // 3. Scale up to display size
  // Result: Chunky, unrecognizable pixels
}
```

---

## 🔄 Update This Document

When adding new features:
1. ✅ Mark feature as implemented
2. Document which files were modified
3. Update architecture diagrams if needed
4. Add any new dependencies
5. Note any breaking changes or migrations

**This document should be the source of truth for what exists in the codebase.**
