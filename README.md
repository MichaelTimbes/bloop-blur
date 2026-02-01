# Boop-Blur

A tiny, local-first web app that helps you "feel real again" with a daily check-in.

## Overview

Boop-Blur is a minimalist Vue 3 application designed around the concept of ephemeral presence. Each day, users can tap "I'm here" to capture a photo moment, which is stored locally and decays visually over time like a fading memory. The app includes:

- **Daily Check-ins**: A single button interaction with silly interstitials
- **Local Storage**: All artifacts stored in IndexedDB (client-side only)
- **Visual Decay**: Photos blur and pixelate as they age
- **Vibe Packs**: Curated spark lines with different philosophical vibes
- **Weekly Mosaic**: View your week's artifacts with decay effects
- **Ephemeral Design**: Optional auto-deletion policies

## Features

✨ **Ultra-minimal UX** - One big button, no clutter  
📸 **Photo Capture** - Tap to capture daily moments  
🎨 **Visual Decay** - Artifacts blur and pixelate over time (0-7+ days)  
💾 **Local-First** - All data stored in IndexedDB, works offline  
🎭 **Vibe Packs** - 5 different philosophical spark line collections  
🔒 **Privacy** - No analytics, no ads, no cloud sync  
🔥 **Optional Auth** - Firebase Auth behind a feature flag (for login only)

## Tech Stack

- **Vue 3** (Composition API)
- **TypeScript** 
- **Vite** (Build tool)
- **Pinia** (State management)
- **Vue Router** (Routing)
- **IndexedDB** (via `idb` library)
- **date-fns** (Date utilities)
- **Firebase** (Optional authentication)

## Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will open at `http://localhost:3000`

## Project Structure

```
boop-blur/
├── src/
│   ├── components/          # Vue components
│   │   ├── CaptureFlow.vue  # Photo capture flow
│   │   ├── Interstitial.vue # Silly loading screen
│   │   └── SparkLine.vue    # Display spark line message
│   ├── content/
│   │   └── packs/           # Vibe pack JSON files
│   │       ├── zen-but-dumb.json
│   │       ├── existential-but-cozy.json
│   │       ├── relational-nudges.json
│   │       ├── existential-but-mundane.json
│   │       └── nature-but-unhinged.json
│   ├── repositories/        # Data access layer
│   │   └── artifacts.ts     # IndexedDB operations
│   ├── router/              # Vue Router config
│   │   └── index.ts
│   ├── stores/              # Pinia stores
│   │   ├── artifacts.ts     # Artifact management
│   │   ├── auth.ts          # Firebase auth (optional)
│   │   ├── settings.ts      # User settings
│   │   └── trace.ts         # Usage tracking
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   ├── date.ts          # Date/ISO week helpers
│   │   ├── helpers.ts       # General helpers
│   │   └── storage.ts       # localStorage helpers
│   ├── views/               # Page components
│   │   ├── Home.vue         # Main screen
│   │   ├── Login.vue        # Auth page (optional)
│   │   ├── Mosaic.vue       # Weekly mosaic view
│   │   └── Settings.vue     # Settings page
│   ├── App.vue              # Root component
│   ├── config.ts            # App configuration
│   ├── main.ts              # App entry point
│   └── style.css            # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Core Concepts

### Visual Decay System

Artifacts decay over time based on their age:

| Age (days) | Effect |
|------------|--------|
| 0 | Crisp, no effects |
| 1-2 | Slight blur (1px) |
| 3-4 | More blur (2px) + slight desaturation |
| 5-6 | Heavy blur (3px) + desaturation + reduced contrast |
| 7+ | Pixelated compression (24x24 downscale) |

The decay is applied at **render time** using CSS filters and canvas manipulation, so original files are never modified.

### Vibe Packs

Five curated collections of "spark lines" shown after each boop:

1. **zen-but-dumb** (default) - Minimalist, no-pressure vibes
2. **existential-but-cozy** - Contemplating mortality with warmth
3. **relational-nudges** - Connection and vulnerability prompts
4. **existential-but-mundane** - Philosophy meets daily chores
5. **nature-but-unhinged** - Feral, carefree nature wisdom

Spark lines are chosen deterministically by date (same line each day).

### Deletion Policies

Optional auto-deletion to maintain ephemerality:

- **Off** (default) - Keep all artifacts
- **Keep 4 weeks** - Delete artifacts older than 28 days
- **Delete 14 days** - Delete artifacts older than 14 days

Cleanup runs automatically on app start.

## Firebase Authentication (Optional)

### Enabling Auth

1. Set `ENABLE_AUTH = true` in [src/config.ts](src/config.ts)

2. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)

3. Enable Email/Password authentication in Firebase Console

4. Copy `.env.example` to `.env` and add your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id
```

5. Restart the dev server

**Important**: Authentication is for login only. All artifacts remain stored locally in IndexedDB. Nothing syncs to the cloud.

## Routes

- `/` - Home page with "I'm here" button
- `/mosaic` - Weekly mosaic view with decay effects
- `/settings` - Settings and stats
- `/login` - Login/signup (only if `ENABLE_AUTH` is true)

## Data Storage

### IndexedDB (Artifacts)

```typescript
interface Artifact {
  id: string;           // UUID
  ts: number;           // Timestamp (ms)
  isoDate: string;      // YYYY-MM-DD
  weekKey: string;      // ISO week (e.g., "2026-W05")
  type: 'photo';
  blob: Blob;           // Photo file
  sparkPackId: string;  // Vibe pack used
  sparkIndex: number;   // Index of spark line
}
```

### localStorage (Settings & Trace)

```typescript
interface Trace {
  totalBoops: number;
  lastBoopTs: number;
}

interface Settings {
  activeVibePack: string;
  deletionPolicy: 'off' | 'keep-4-weeks' | 'delete-14-days';
}
```

## Acceptance Tests (Manual Checklist)

Run these tests to verify the app works correctly:

### ✅ Basic Flow
- [ ] Tap "I'm here" button
- [ ] See silly interstitial message (auto-dismiss)
- [ ] File picker opens for photo selection
- [ ] Select/capture a photo
- [ ] See a spark line message
- [ ] Tap "Done" to return to home

### ✅ Persistence
- [ ] Refresh the page
- [ ] Photo still exists in mosaic
- [ ] Total boops counter incremented

### ✅ Mosaic View
- [ ] Navigate to /mosaic
- [ ] See current week's artifacts in grid
- [ ] Recent photos appear crisp
- [ ] (Simulate aging by temporarily modifying date)
- [ ] Verify older artifacts show blur/desaturation
- [ ] Verify 7+ day artifacts are pixelated

### ✅ Settings
- [ ] Navigate to /settings
- [ ] See total boops stat
- [ ] Change vibe pack
- [ ] Next boop shows spark line from new pack
- [ ] Change deletion policy
- [ ] (Simulate aging artifacts and restart app)
- [ ] Verify old artifacts are deleted based on policy

### ✅ Offline & Privacy
- [ ] Disconnect from network (after initial load)
- [ ] App still works (can boop, view mosaic, change settings)
- [ ] No network requests made
- [ ] No analytics/tracking present

### ✅ Mobile Responsive
- [ ] Open on mobile device or resize browser
- [ ] UI adapts to small screens
- [ ] Big button is tappable
- [ ] Mosaic grid adjusts

### ✅ Optional: Firebase Auth
- [ ] Set `ENABLE_AUTH = true` in config
- [ ] Redirects to /login
- [ ] Can create account
- [ ] Can sign in
- [ ] Can sign out
- [ ] Artifacts still stored locally only

## Implementation Details

### ISO Week Key Generation

Uses `date-fns` to generate ISO week keys (e.g., `2026-W05`). Week starts on Monday following ISO 8601 standard.

```typescript
import { getISOWeek, getISOWeekYear } from 'date-fns';

export function getWeekKey(date: Date = new Date()): string {
  const year = getISOWeekYear(date);
  const week = getISOWeek(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
}
```

### Pixelation Effect

For artifacts 7+ days old, uses canvas to create pixelated "compression":

1. Draw image to tiny canvas (24x24)
2. Disable image smoothing
3. Scale up to display size
4. Result: chunky, unrecognizable pixels

```typescript
function renderPixelated(canvas: HTMLCanvasElement, imageUrl: string) {
  const pixelSize = 24;
  const displaySize = 300;
  
  // Downscale to tiny canvas
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = pixelSize;
  tempCanvas.height = pixelSize;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(img, 0, 0, pixelSize, pixelSize);
  
  // Scale up with pixelation
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tempCanvas, 0, 0, displaySize, displaySize);
}
```

### Deterministic Spark Line Selection

Same spark line appears for a given date using simple hash:

```typescript
export function hashDateString(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit
  }
  return Math.abs(hash);
}

// Usage
const index = hashDateString('2026-01-31') % sparkLines.length;
```

## Design Philosophy

- **Minimal**: One button, no distractions
- **Local-first**: Your data stays on your device
- **Ephemeral**: Visually represents memory decay
- **No sharing**: This is for you, not social media
- **No analytics**: Zero tracking or telemetry
- **No ads**: Just vibes

## Browser Support

- Modern browsers with IndexedDB support
- Chrome/Edge 90+
- Firefox 90+
- Safari 14+

## Contributing

This is a personal MVP. Feel free to fork and adapt to your needs.

## License

MIT (or whatever you prefer)

---

**Remember**: You're here. That's enough. 💜
