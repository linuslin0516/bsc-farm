<p align="center">
  <img src="public/logo.png" alt="Space Farm Logo" width="120" />
</p>

<h1 align="center">Space Farm</h1>

<p align="center">
  <b>Deep Space Sci-Fi Farming Simulation Game</b><br/>
  Plant crops on asteroid farms, visit friends, steal harvests, and trade on a dynamic market.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-12.8-FFCA28?logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Zustand-5.0-433E38?logo=npm&logoColor=white" />
  <img src="https://img.shields.io/badge/BSC-Testnet-F0B90B?logo=binance&logoColor=black" />
</p>

---

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Firebase Setup](#firebase-setup)
- [Cloud Functions](#cloud-functions)
- [Available Scripts](#available-scripts)
- [Game Mechanics](#game-mechanics)
- [Internationalization](#internationalization)
- [License](#license)

---

## Features

- **Isometric 2.5D Farm** — Plant, grow, and harvest 24+ crops on an expandable asteroid farm (3x3 to 6x6)
- **Deep Space Theme** — Animated starfield background, nebula drift, shooting stars, bioluminescent effects
- **Social System** — Add friends, visit their farms, and steal their mature crops (with cooldowns)
- **Dynamic Market** — Sine-wave-based price fluctuation with guaranteed profit margins
- **Achievement System** — 20+ achievements across farming, social, collection, and milestone categories
- **Daily Tasks** — 3-5 randomly generated tasks that reset at UTC midnight
- **Leaderboard** — Score-based ranking with multi-dimensional sorting
- **Upgrade System** — 8 upgradable farm modules across production, protection, expansion, and special categories
- **Admin Dashboard** — Player management, airdrop CSV export, dashboard statistics
- **Blockchain Integration** — BSC token withdrawals via Cloud Functions
- **Trilingual Support** — Traditional Chinese, Simplified Chinese, and English

---

## Screenshots

> Add screenshots to the `docs/screenshots/` directory and they will display below.

| Login | Farm | Friend Visit |
|:-----:|:----:|:------------:|
| ![Login](docs/screenshots/login.png) | ![Farm](docs/screenshots/farm.png) | ![Visit](docs/screenshots/visit.png) |

| Shop & Upgrades | Leaderboard | Daily Tasks & Achievements |
|:---------------:|:-----------:|:--------------------------:|
| ![Shop](docs/screenshots/shop.png) | ![Leaderboard](docs/screenshots/leaderboard.png) | ![Tasks](docs/screenshots/tasks.png) |

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Client (Browser)                          │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────────────┐  │
│  │  React   │  │ Zustand  │  │  React    │  │   Tailwind CSS    │  │
│  │  18.3    │  │  5.0     │  │  Router 7 │  │   3.4 + Custom    │  │
│  │          │  │          │  │           │  │   Animations      │  │
│  │ 36 Comps │  │ 3 Stores │  │ 7 Routes  │  │   Space Theme     │  │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └───────────────────┘  │
│       │              │              │                                │
│  ┌────┴──────────────┴──────────────┴─────────────────────────────┐  │
│  │                    9 Service Modules                           │  │
│  │  auth · user · friend · steal · market · leaderboard          │  │
│  │  achievement · dailyTask · admin                              │  │
│  └───────────────────────┬───────────────────────────────────────┘  │
│                          │                                          │
│  ┌───────────────────────┴───────────────────────────────────────┐  │
│  │              Firebase SDK (Firestore + Auth)                  │  │
│  └───────────────────────┬───────────────────────────────────────┘  │
└──────────────────────────┼──────────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────┼──────────────────────────────────────────┐
│                    Firebase Cloud                                   │
│                          │                                          │
│  ┌───────────────────────┴───────────────────────────────────────┐  │
│  │                  Cloud Firestore                              │  │
│  │                                                               │  │
│  │  users · players · friends · steal_records · market           │  │
│  │  dailyTasks · achievements · playerStats · leaderboardCache   │  │
│  │  exchange · user_exchange · withdrawal_requests               │  │
│  │  exchange_transactions · airdropHistory                       │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              Cloud Functions (asia-east1)                     │  │
│  │              processWithdrawal — onDocumentCreated            │  │
│  └───────────────────────┬───────────────────────────────────────┘  │
│                          │                                          │
└──────────────────────────┼──────────────────────────────────────────┘
                           │ JSON-RPC
┌──────────────────────────┼──────────────────────────────────────────┐
│              BSC Blockchain (Testnet / Mainnet)                     │
│                          │                                          │
│  ┌───────────────────────┴───────────────────────────────────────┐  │
│  │           ERC-20 Token Transfer (ethers.js 6.x)               │  │
│  │           Treasury Wallet → User Wallet                       │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
┌──────────┐    Twitter OAuth     ┌──────────────┐
│  User    │ ──────────────────── │ Firebase Auth │
└────┬─────┘                      └──────┬───────┘
     │                                    │
     │  Game Actions                      │  UID
     ▼                                    ▼
┌──────────┐   setDoc / getDoc   ┌──────────────┐
│  Zustand │ ◄────────────────── │  Firestore   │
│  Store   │ ──────────────────► │  Database    │
└────┬─────┘    sync on change   └──────┬───────┘
     │                                   │
     │  Render                           │  onDocumentCreated
     ▼                                   ▼
┌──────────┐                     ┌──────────────┐
│  React   │                     │    Cloud     │
│  UI      │                     │  Functions   │
└──────────┘                     └──────┬───────┘
                                        │
                                        │  ethers.js
                                        ▼
                                 ┌──────────────┐
                                 │     BSC      │
                                 │  Blockchain  │
                                 └──────────────┘
```

### Component Architecture

```
App.tsx (Router)
├── LoginPage ─────── Twitter OAuth
├── SetupPage ─────── New player setup
├── GamePage ──────── Main game (normal + friend visit mode)
│   ├── AnimatedBackground ── Stars, nebula, shooting stars
│   ├── HUD ─────────────── Left: player info / Right: sidebar buttons
│   │                        Visit mode: red banner + steal stats
│   ├── IsometricFarm ────── Farm grid renderer
│   │   └── IsometricCell ── Individual cell (rock texture + crop)
│   │       └── IsometricCrop ── Crop stage animation
│   ├── CropToolbar ──────── Crop selection
│   ├── ToolToolbar ──────── Tool selection
│   ├── Shop ─────────────── Buy seeds, land, tools
│   ├── UpgradeShopPanel ─── Farm upgrades
│   ├── LeaderboardPanel ─── Rankings
│   ├── DailyTasksPanel ──── Daily tasks
│   ├── AchievementPanel ─── Achievements
│   ├── CropCodex ────────── Crop encyclopedia
│   ├── FriendPanel ──────── Social features
│   │   ├── FriendList
│   │   ├── FriendRequests
│   │   └── AddFriend
│   └── ActiveBonusesPanel ─ Active upgrade bonuses
├── AdminPage ─────── Admin dashboard
├── WhitepaperPage ── Whitepaper
└── ComingSoonPage ── Coming soon notice
```

### State Management

```
┌─────────────────────────────────────────────────────────┐
│                    Zustand Stores                        │
│                                                         │
│  ┌─────────────────┐  Persisted to LocalStorage         │
│  │  useGameStore   │  Key: 'space_farm_state'           │
│  │                 │                                    │
│  │  player         │  Player data + level + balance     │
│  │  farmCells[]    │  Farm grid state                   │
│  │  goldBalance    │  In-game currency                  │
│  │  inventory[]    │  Items and tools                   │
│  │  selectedCrop   │  Currently selected crop           │
│  │  playerUpgrades │  Upgrade levels                    │
│  └─────────────────┘                                    │
│                                                         │
│  ┌─────────────────┐  In-memory only                    │
│  │  useAuthStore   │                                    │
│  │                 │                                    │
│  │  firebaseUser   │  Firebase Auth user object         │
│  │  twitterProfile │  Extracted Twitter data            │
│  │  isInitialized  │  Auth state flag                   │
│  └─────────────────┘                                    │
│                                                         │
│  ┌─────────────────┐  Persisted to LocalStorage         │
│  │ useLanguageStore│  Key: 'bsc-farm-language'          │
│  │                 │                                    │
│  │  language       │  'zh-CN' | 'zh-TW' | 'en'         │
│  └─────────────────┘                                    │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| React | 18.3.1 | UI framework |
| TypeScript | ~5.6.2 | Type-safe JavaScript |
| Vite | 6.0.5 | Build tool & dev server |
| Tailwind CSS | 3.4.17 | Utility-first CSS framework |
| Zustand | 5.0.0 | Lightweight state management |
| React Router DOM | 7.13.0 | Client-side routing |
| opencc-js | 1.0.5 | Traditional/Simplified Chinese conversion |

### Backend

| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| Firebase Firestore | 12.8.0 | NoSQL cloud database |
| Firebase Auth | 12.8.0 | Twitter OAuth authentication |
| Firebase Cloud Functions | 4.5.0 | Serverless backend |
| Firebase Admin SDK | 13.6.0 | Server-side Firebase access |

### Blockchain

| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| ethers.js | 6.13.4 | BSC blockchain interaction |
| BSC Testnet | — | ERC-20 token transfers |

### Development Tools

| Tool | Version | Purpose |
|:-----|:--------|:--------|
| ESLint | 9.17.0 | Code linting |
| typescript-eslint | 8.18.2 | TypeScript ESLint integration |
| PostCSS | 8.4.49 | CSS transformations |
| Autoprefixer | 10.4.20 | Browser vendor prefixes |
| dotenv | 17.2.3 | Environment variable loading |

---

## Project Structure

```
bsc_farm/
├── public/
│   ├── logo.png                        # App logo
│   ├── favicon-32x32.png               # Favicon
│   └── apple-touch-icon.png            # iOS icon
│
├── functions/                           # Firebase Cloud Functions
│   ├── index.js                         #   processWithdrawal function
│   └── package.json                     #   Node 18, ethers.js
│
├── src/
│   ├── components/
│   │   ├── pages/         (7 files)     # Page-level components
│   │   ├── game/          (21 files)    # Game UI components
│   │   ├── social/        (4 files)     # Friend system components
│   │   └── ui/            (4 files)     # Reusable UI components
│   │
│   ├── config/
│   │   ├── firebase.ts                  # Firebase initialization
│   │   └── constants.ts                 # Game constants & config
│   │
│   ├── data/
│   │   ├── crops.ts                     # 24+ crop definitions
│   │   ├── achievements.ts              # Achievement definitions
│   │   ├── dailyTasks.ts               # Daily task pool
│   │   ├── shop.ts                      # Shop items
│   │   └── upgrades.ts                 # 8 upgrade definitions
│   │
│   ├── hooks/
│   │   └── useFriendFarm.ts            # Friend farm visit logic
│   │
│   ├── services/           (9 files)    # Firebase service layer
│   │   ├── authService.ts              #   Twitter OAuth
│   │   ├── userService.ts              #   User CRUD
│   │   ├── friendService.ts            #   Friend system
│   │   ├── stealService.ts             #   Steal mechanics
│   │   ├── marketService.ts            #   Dynamic pricing
│   │   ├── leaderboardService.ts       #   Rankings
│   │   ├── achievementService.ts       #   Achievement tracking
│   │   ├── dailyTaskService.ts         #   Daily tasks
│   │   └── adminService.ts            #   Admin operations
│   │
│   ├── store/              (3 files)    # Zustand state stores
│   │   ├── useGameStore.ts             #   Game state (persisted)
│   │   ├── useAuthStore.ts             #   Auth state
│   │   └── useLanguageStore.ts         #   Language (persisted)
│   │
│   ├── translations/       (4 files)    # i18n translations
│   │   ├── index.ts                    #   Translation hook
│   │   ├── zh-TW.ts                    #   Traditional Chinese
│   │   ├── zh-CN.ts                    #   Simplified Chinese
│   │   └── en.ts                       #   English
│   │
│   ├── types/
│   │   └── index.ts                    # All TypeScript interfaces
│   │
│   ├── utils/
│   │   ├── i18n.ts                     # opencc-js integration
│   │   ├── isometric.ts               # Isometric math utilities
│   │   └── timeOfDay.ts               # Time-of-day helpers
│   │
│   ├── App.tsx                          # Root component & routing
│   ├── main.tsx                         # Entry point
│   └── index.css                        # Global styles & animations
│
├── firestore.rules                      # Firestore security rules
├── firestore.indexes.json               # Firestore composite indexes
├── firebase.json                        # Firebase project config
├── tailwind.config.js                   # Tailwind custom theme
├── tsconfig.json                        # TypeScript config
├── vite.config.ts                       # Vite config
├── postcss.config.js                    # PostCSS config
├── eslint.config.js                     # ESLint config
├── .env.example                         # Environment template
└── package.json                         # Dependencies & scripts
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **Firebase CLI** (`npm install -g firebase-tools`)
- A **Firebase project** with Firestore and Authentication enabled
- A **Twitter Developer App** (for OAuth — configured in Firebase Auth)

### 1. Clone the Repository

```bash
git clone https://github.com/linuslin0516/bsc-farm.git
cd bsc-farm
```

### 2. Install Dependencies

```bash
# Frontend dependencies
npm install

# Cloud Functions dependencies
cd functions
npm install
cd ..
```

### 3. Configure Environment Variables

Copy the example env file and fill in your Firebase credentials:

```bash
cp .env.example .env
```

Edit `.env` with your Firebase project values:

```env
# Firebase Configuration
# Get these from: Firebase Console > Project Settings > Your App > SDK Config
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Admin Configuration (optional)
VITE_ADMIN_TWITTER_UIDS=twitter-uid-1,twitter-uid-2

# App Mode
VITE_COMING_SOON=false
```

### 4. Firebase Setup

```bash
# Login to Firebase
firebase login

# Set your project
firebase use your-project-id

# Deploy Firestore rules and indexes
firebase deploy --only firestore
```

### 5. Enable Twitter Authentication

1. Go to **Firebase Console** > **Authentication** > **Sign-in method**
2. Enable **Twitter** provider
3. Enter your Twitter API Key and API Secret
4. Copy the callback URL to your Twitter Developer Portal

### 6. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 7. Build for Production

```bash
npm run build
npm run preview    # Preview the production build locally
```

---

## Environment Variables

| Variable | Required | Description |
|:---------|:--------:|:------------|
| `VITE_FIREBASE_API_KEY` | Yes | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase app ID |
| `VITE_ADMIN_TWITTER_UIDS` | No | Comma-separated admin Twitter UIDs |
| `VITE_COMING_SOON` | No | Enable coming soon mode (`true`/`false`) |

---

## Firebase Setup

### Firestore Collections

The app uses 14 Firestore collections:

| Collection | Document Key | Description |
|:-----------|:------------|:------------|
| `users` | `{oderId}` | Player account data |
| `players` | `{oderId}` | Legacy player data |
| `friends` | `{oderId}` | Friend lists & requests |
| `dailyTasks` | `{oderId}` | Daily task progress |
| `achievements` | `{oderId}` | Achievement tracking |
| `playerStats` | `{oderId}` | Leaderboard stats |
| `leaderboardCache` | auto | Cached leaderboard data |
| `steal_records` | auto | Steal history records |
| `market` | auto | Dynamic crop pricing |
| `exchange` | auto | Exchange rate data (read-only) |
| `user_exchange` | `{userId}` | User exchange history |
| `withdrawal_requests` | auto | Token withdrawal requests |
| `exchange_transactions` | auto | Exchange transaction logs |
| `airdropHistory` | auto | Admin airdrop records |

### Firestore Indexes

Two composite indexes are required (defined in `firestore.indexes.json`):

1. **withdrawal_requests** — `userId` (ASC) + `createdAt` (DESC)
2. **exchange_transactions** — `userId` (ASC) + `timestamp` (DESC)

### Deploy Rules & Indexes

```bash
firebase deploy --only firestore --project your-project-id
```

---

## Cloud Functions

### `processWithdrawal`

Automatically processes token withdrawal requests on BSC.

- **Trigger**: `onDocumentCreated` on `withdrawal_requests/{requestId}`
- **Region**: `asia-east1`
- **Runtime**: Node.js 18

**Setup**:

```bash
# Set the treasury wallet private key as a secret
firebase functions:secrets:set TREASURY_PRIVATE_KEY

# Deploy the function
cd functions
npm install
firebase deploy --only functions
```

**Flow**: Request created → Validate → Connect BSC → Transfer ERC-20 tokens → Update status

---

## Available Scripts

| Command | Description |
|:--------|:------------|
| `npm run dev` | Start Vite dev server at `localhost:5173` |
| `npm run build` | TypeScript compile + Vite production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |
| `firebase deploy --only firestore` | Deploy Firestore rules & indexes |
| `firebase deploy --only functions` | Deploy Cloud Functions |

---

## Game Mechanics

| Mechanic | Details |
|:---------|:--------|
| **Farm Size** | 3x3 → 4x4 → 5x5 → 6x6 (purchasable expansion) |
| **Max Level** | 50 |
| **Level-up Formula** | `floor(100 * 1.5^(level-1))` XP per level |
| **Starting Balance** | 500 GOLD |
| **Crop Rarities** | Common / Uncommon / Rare / Epic / Legendary |
| **Growth Time** | 180s (common) to 3600s (legendary) |
| **Steal Rate** | 10-20% of crop sell value |
| **Steal Cooldown** | 30 minutes per friend |
| **Market Fluctuation** | Sine-wave, 0%–10% (common) to +35% (legendary) |
| **Min Profit Margin** | 10% above seed cost guaranteed |
| **Score Formula** | `(level * 100) + (harvests * 10) + (steals * 5)` |
| **Daily Tasks** | 3-5 random tasks, reset at UTC midnight |
| **Online Detection** | Active within last 5 minutes |

---

## Internationalization

The app supports three languages with a custom translation system:

| Language | Code | Implementation |
|:---------|:-----|:---------------|
| Traditional Chinese | `zh-TW` | Primary language, hand-written translations |
| Simplified Chinese | `zh-CN` | Auto-converted from zh-TW via `opencc-js` |
| English | `en` | Hand-written translations |

Translation files are located in `src/translations/`. Language preference is persisted to LocalStorage.

---

## License

This project is private and proprietary.

---

<p align="center">
  Built with React + Firebase + Tailwind CSS<br/>
  <sub>Space Farm &copy; 2025</sub>
</p>
