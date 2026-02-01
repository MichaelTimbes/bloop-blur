# Boop-Blur Feature Inventory

> **Last Updated:** January 31, 2026  
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
  - Grid display of current week's artifacts (ISO week)
  - Visual decay effects based on artifact age:
    - Day 0: crisp
    - Days 1-2: blur(1px)
    - Days 3-4: blur(2px) + saturate(0.8)
    - Days 5-6: blur(3px) + saturate(0.6) + contrast(0.9)
    - Days 7+: pixelated (24x24 canvas downscale)
  - Artifact info overlay (date, age in days)
  - Empty state messaging
  - Back button to home

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
