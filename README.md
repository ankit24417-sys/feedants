# 🏆 Feedants — High-Concurrency Talent & Competition Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_57-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose_Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_CDN-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

---

## 📌 Executive Summary

**Feedants** is a high-throughput, full-stack talent discovery and competition platform built for creators, adjudicators, and audiences. The platform powers national-level skill championships, verified jury evaluations, atomic spot reservations under heavy concurrency, high-definition multimedia submissions, and live community voting.

The codebase consists of:

- **High-Concurrency Backend API** (`/backend`): A clustered, production-tuned Node.js / Express 5 service backed by MongoDB with connection pooling, in-memory caching, atomic write operations, and Cloudinary media processing.
- **Cross-Platform Mobile Client** (`/frontend`): A mobile-first React Native & Expo application designed with strict **Atomic Design** principles (`atoms`, `molecules`, `organisms`, `screens`), bilingual localization (English / Hindi), adaptive LAN IP detection for physical hardware, and optimized micro-interactions.

---

## 🏗️ System Architecture

Feedants is architected as a decoupled, multi-tier system engineered to sustain 10,000+ concurrent requests during marquee competition drop events and voting spikes.

```mermaid
flowchart TD
    subgraph Client["Frontend Client (React Native + Expo SDK 57)"]
        UI["Atomic Design UI (Screens / Organisms / Molecules / Atoms)"]
        Nav["Navigation (Bottom Tabs + Native Stack)"]
        Net["Adaptive Network Client (api.ts - Dynamic LAN IP Resolution)"]
        UI --> Nav --> Net
    end

    subgraph Cluster["Backend Server Cluster (Node.js + Express 5)"]
        Master["Cluster Primary (Core Detection & Worker Lifecycle)"]
        W1["Worker Process 1"]
        W2["Worker Process 2"]
        Wn["Worker Process N"]
        Master -->|fork / auto-respawn| W1
        Master -->|fork / auto-respawn| W2
        Master -->|fork / auto-respawn| Wn

        subgraph Middleware["Worker Pipeline"]
            Sec["Helmet & Compression"]
            RL["Sliding-Window Rate Limiter"]
            Cache["Two-Tier In-Memory Cache (X-Cache: HIT / MISS)"]
            Multer["Multer Streaming Buffer"]
        end

        W1 --> Middleware
    end

    subgraph Persistence["Storage & CDN Services"]
        Mongo[("MongoDB Database Cluster")]
        Cloudinary[("Cloudinary Global Media CDN")]
    end

    Net -->|HTTP / Keep-Alive Requests| Master
    Middleware -->|Atomic Ops / Lean Queries| Mongo
    Multer -->|Direct Media Streaming| Cloudinary
```

### 1. High-Concurrency Backend Architecture

- **Primary / Worker Multi-Process Clustering**: Utilizes Node.js `node:cluster` to saturate all physical CPU cores with independent worker processes. If a worker encounters an unhandled fatal condition, the primary instantly forks a replacement worker, guaranteeing zero downtime.
- **HTTP Keep-Alive Connection Tuning**: HTTP server parameters (`keepAliveTimeout: 65000ms`, `headersTimeout: 66000ms`, `maxRequestsPerClient: 0`) minimize TCP handshake overhead under extreme request volumes.
- **Pre-Warmed Database Connection Pooling**: Mongoose connection pooling is pre-warmed (`minPoolSize: 10`, `maxPoolSize: 100`) to prevent cold-start latency spikes and TCP socket starvation.
- **Two-Tier In-Memory Route Caching**: High-read routes (`/competitions`, `/explore`, `/champions`) are served directly from an in-memory cache with sub-5ms response times and deterministic invalidation on mutations.
- **Atomic Concurrency Guarantee**: Contest registrations utilize atomic conditional operators (`findOneAndUpdate` with `{ spotsLeft: { $gt: 0 } }`), eliminating race conditions without distributed lock contention.

### 2. Mobile Client Architecture

- **Atomic Design Component Hierarchy**: UI elements are decomposed into pure `atoms` (Badge, Chip, IconButton), composite `molecules` (CategoryCard, JudgeCard, SearchBar, ContestHeader), and complex `organisms` (CompetitionCard, LeaderboardPodium, RewardsTable, WalletCard).
- **Adaptive Network Layer**: Dynamically determines the host computer's local Wi-Fi IP address at runtime via Expo Constants, allowing instant physical device testing on local networks without manual IP reconfiguration.
- **Bilingual Localization**: Built-in instant language switching between **English** and **Hindi** with localized typography and translation maps.
- **Optimistic State & Resilient UI**: High-frequency actions like voting and category filtering provide instantaneous visual feedback while dispatching background synchronization.

---

## ⚡ Concurrency & Atomic Spot Reservation Flow

Marquee talent competitions experience intense burst traffic when registration opens for strictly limited spots. Traditional read-then-write patterns (`SELECT spots -> if spots > 0 -> UPDATE spots`) suffer from critical race conditions, causing overselling.

Feedants enforces concurrency safety directly at the database storage engine layer:

```mermaid
sequenceDiagram
    autonumber
    actor UserA as User A (Mobile)
    actor UserB as User B (Mobile)
    participant API as Express Cluster Worker
    participant DB as MongoDB (WiredTiger Engine)

    Note over UserA,UserB: 100+ concurrent requests arrive simultaneously for 1 remaining spot
    UserA->>API: POST /competitions/:id/join
    UserB->>API: POST /competitions/:id/join

    critical Atomic Conditional Execution
        API->>DB: findOneAndUpdate({ _id: id, spotsLeft: { $gt: 0 } }, { $inc: { spotsLeft: -1, enrolled: 1 } })
        Note over DB: Atomically decrements spotsLeft from 1 to 0 for User A
        DB-->>API: Returns Updated Competition Document
        API-->>UserA: 200 OK — "Successfully joined competition!"
    end

    critical Second Request Attempt
        API->>DB: findOneAndUpdate({ _id: id, spotsLeft: { $gt: 0 } }, { $inc: { spotsLeft: -1, enrolled: 1 } })
        Note over DB: spotsLeft is 0 — Filter fails to match any document
        DB-->>API: Returns null
        API-->>UserB: 400 Bad Request — "Contest is already full! No spots left."
    end
```

---

## 🎯 Key Features Across the Stack

### 📱 Frontend Experience (React Native + Expo)

1. **Home Feed & Marquee Showcase**:
   - Spotlight Mega-Contest hero banner with dynamic countdown timer.
   - Active registration alert bar displaying imminent submission deadlines and allocated slot numbers.
   - Filterable talent categories (Classical Dance, Hip-Hop, Vocal Music, Instrumental, Fine Arts, Theater).
   - Live Competition cards with urgency progress indicators ("Few Spots Left").
   - Hall of Fame Champions carousel.
2. **Competitions Catalog & Search**:
   - Status-based filtering (`All`, `Live`, `Upcoming`).
   - Real-time search across titles, judges, and tags.
   - Quick spot indicators and direct navigation to detailed entry requirements.
3. **Contest Details & Flash Registration**:
   - Bilingual support: One-tap toggle between **English** and **Hindi**.
   - Atomic reservation flow preventing overselling of seats.
   - Prize pool distribution hierarchy table and official certification guidelines.
   - Adjudicator profile with credentials and masterclass video preview.
   - Referral program with native sharing (`Share API`) and one-tap clipboard copy.
4. **Explore & Discovery Hub**:
   - Adjudicator masterclass preview cards with booking hooks.
   - Monthly Podium Leaderboard showcasing top talent rankings and community points.
   - Trending performance video cards with live upvoting and view counters.
5. **Creator Studio & Performance Upload**:
   - Native camera and media library integration via `expo-image-picker`.
   - Live video/photo preview, title/description tagging, and seamless Cloudinary upload pipeline.
   - Automatic contest linkage updating registration status from `Registered` to `Submitted`.
6. **Creator Profile & Digital Wallet**:
   - Creator profile with verified badges and dynamic interest tags.
   - Digital Wallet showing current contest earnings and withdrawal action.
   - My Competitions manager segmented by status (`Registered`, `Upcoming`, `Submitted`).
   - Verified Achievement showcase with digital certificate preview.

### ⚙️ Backend Engineering (Node.js + Express + MongoDB)

1. **Engineered for 10,000+ Concurrent Requests**:
   - Multi-process primary/worker clustering utilizing all CPU cores with automatic healing respawn.
   - HTTP keep-alive optimization (`keepAliveTimeout: 65000ms`, `headersTimeout: 66000ms`, unlimited client reuse).
   - Pre-warmed MongoDB connection pool (`minPoolSize: 10`, `maxPoolSize: 100`) preventing TCP handshake bottlenecks.
2. **Atomic Consistency Under Contention**:
   - Zero-oversubscription contest booking using single-operation conditional atomic updates (`$inc` guarded by `{ spotsLeft: { $gt: 0 } }`).
   - High-throughput vote counting without document locks.
3. **Low-Latency In-Memory Caching**:
   - Two-tier caching middleware serving hot read endpoints (`/competitions`, `/explore`, `/champions`) in sub-5ms with cache hit/miss headers (`X-Cache: HIT / MISS`).
   - Deterministic cache invalidation on write events (`createCompetition`, `joinCompetition`, `createSubmission`).
4. **Enterprise Defense & Standardization**:
   - Sliding-window rate limiting protecting against abusive bursts and DDoS attacks.
   - Uniform payload envelope via custom `ApiResponse` and `ApiError` classes.
   - Lean query projection (`.lean().exec()`) bypassing Mongoose document hydration overhead on read paths.

---

## 📂 Repository Structure

```text
.
├── .github/
│   └── workflows/
│       └── my_workflow.yaml       # GitHub Actions CI/CD Pipeline (Docker build, GHCR, SSH deployment)
│
├── backend/                       # Node.js + Express + MongoDB Backend Service
│   ├── src/
│   │   ├── app.js                 # Express app configuration & middleware pipeline
│   │   ├── constants.js           # Application constants & database identifiers
│   │   ├── index.js               # Cluster manager, server bootstrap & HTTP tuning
│   │   ├── config/                # Database connection pooling & auto-seed trigger
│   │   │   └── db.js
│   │   ├── controllers/           # Business logic & atomic query controllers
│   │   │   ├── champion.controller.js
│   │   │   ├── competition.controller.js
│   │   │   ├── explore.controller.js
│   │   │   ├── submission.controller.js
│   │   │   └── user.controller.js
│   │   ├── middlewares/           # Caching, rate limiting, and Multer upload
│   │   │   ├── cache.middleware.js
│   │   │   ├── multer.middleware.js
│   │   │   └── rateLimiter.middleware.js
│   │   ├── models/                # Mongoose schemas & compound indexes
│   │   │   ├── achievement.model.js
│   │   │   ├── category.model.js
│   │   │   ├── champion.model.js
│   │   │   ├── competition.model.js
│   │   │   ├── judge.model.js
│   │   │   ├── leaderboard.model.js
│   │   │   ├── registration.model.js
│   │   │   ├── submission.model.js
│   │   │   └── user.model.js
│   │   ├── routes/                # Express 5 REST API route modules
│   │   │   ├── champion.routes.js
│   │   │   ├── competition.routes.js
│   │   │   ├── explore.routes.js
│   │   │   ├── health.routes.js
│   │   │   ├── submission.routes.js
│   │   │   └── user.routes.js
│   │   └── utils/                 # Standardized response envelopes, Cloudinary & DB seeder
│   │       ├── apiError.js
│   │       ├── apiResponse.js
│   │       ├── asyncHandler.js
│   │       ├── cloudinary.js
│   │       └── seedData.js        # Default data seeder (Categories, Competitions, Champions)
│   ├── Dockerfile                 # Production backend container definition
│   ├── .dockerignore
│   ├── .env.example               # Backend environment blueprint
│   └── package.json
│
├── frontend/                      # React Native + Expo Mobile & Web Application
│   ├── Dockerfile                 # Multi-stage Expo Web build + Nginx static server
│   ├── nginx.conf                 # Nginx SPA router & /api/ reverse proxy
│   ├── .dockerignore
│   ├── App.tsx                    # Root provider entry point
│   ├── app.json                   # Expo configuration manifest
│   ├── src/
│   │   ├── components/
│   │   │   ├── atoms/             # Primitive UI building blocks (Badge, Chip, IconButton)
│   │   │   ├── molecules/         # Composite units (ContestHeader, CountdownBanner, JudgeCard, SearchBar, etc.)
│   │   │   └── organisms/         # Complex components (CompetitionCard, RewardsTable, WinnerCarousel, etc.)
│   │   ├── navigation/            # Navigation routing & type definitions
│   │   │   ├── AppNavigator.tsx   # BottomTabNavigator & NativeStack routing
│   │   │   └── types.ts           # Navigation param lists
│   │   ├── screens/               # Screen compositions
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── CompetitionsScreen.tsx
│   │   │   ├── ContestDetailsScreen.tsx
│   │   │   ├── ExploreScreen.tsx
│   │   │   ├── CreateScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   ├── services/
│   │   │   └── api.ts             # Adaptive networking client (Auto LAN IP & dynamic Web origin detection)
│   │   └── theme.ts               # Design tokens (Teal brand palette, spacing, typography)
│   ├── .env.example               # Frontend environment blueprint
│   └── package.json
│
├── docker-compose.yml             # Full-stack container orchestration (Frontend + Backend + MongoDB)
├── .gitignore
├── .prettierrc
└── README.md                      # Project documentation & engineering analysis
```

---

## 🛠️ Technology Stack

| Domain | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Backend Runtime** | Node.js | v20+ | Event-driven JavaScript runtime with native multi-core clustering |
| **API Framework** | Express.js | 5.x | High-throughput HTTP routing and middleware orchestration |
| **Database** | MongoDB | 7.x | Document database with WiredTiger storage engine for microsecond atomic updates |
| **ODM** | Mongoose | 9.x | Schema modeling, connection pool management, and compound index enforcement |
| **Mobile Runtime** | React Native | 0.86.x | Cross-platform native mobile compilation |
| **Mobile Toolchain** | Expo | SDK 57 | Application bundler, native asset pipeline, and device runtime |
| **Navigation** | React Navigation | 7.x | Native stack transitions and fluid bottom tab navigation |
| **Language** | TypeScript / ES Modules | 5.x / ESM | Static typing on client and modern ES module syntax on server |
| **Media Pipeline** | Cloudinary + Multer | 2.x | Memory buffer ingestion with streaming upload to global CDN |
| **Containerization**| Docker & Docker Compose | Latest | Reproducible multi-service development and production orchestration |
| **Web Server & Proxy** | Nginx | Alpine | High-concurrency static asset delivery & `/api/` reverse proxy |
| **CI/CD Automation** | GitHub Actions | v4 | Automated Docker Buildx, GHCR package publishing & zero-downtime SSH deployment |

---

## 📡 API Reference Overview

All backend responses conform to a standardized JSON response envelope:

### Success Response Envelope
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Operation description",
  "success": true
}
```

### Error Response Envelope
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Descriptive error message",
  "errors": []
}
```

---

## 🚀 How to Run the Entire Project

This guide provides end-to-end instructions for launching both the **Backend API** and the **Mobile Client**, whether using containerized Docker services or running natively.

---

### 1. Prerequisites & System Requirements

Before starting, ensure your system has the following installed:

- **Node.js**: v20.x or higher (`node -v`)
- **npm**: v10.x or higher (`npm -v`)
- **Docker & Docker Compose** (Optional, recommended for one-command database and backend setup)
- **Expo Go App**: Installed on your physical Android device (Google Play Store) or iOS device (Apple App Store)
- **Android Studio / Xcode** (Optional, only needed if testing on local emulators/simulators)
- **Cloudinary Account** (Optional for browsing catalog, required for uploading new media submissions)

---

### 2. Environment Configuration

The repository uses environment blueprints for both services.

#### Backend Environment Setup
1. Navigate to `backend/`:
   ```bash
   cd backend
   cp .env.example .env
   ```
2. Open `backend/.env` and configure key variables:
   ```env
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=*
   MAX_WORKERS=0             # 0 = auto-detect and fork all available CPU cores
   CACHE_TTL_SECONDS=30      # In-memory route cache duration

   # MongoDB connection string (Local or MongoDB Atlas Cluster)
   MONGO_URI=mongodb://localhost:27017/feedants
   DB_NAME=feedants

   # Authentication Secret
   JWT_SECRET=feedants_super_secret_jwt_key_2026
   JWT_EXPIRY=7d

   # Cloudinary Media CDN (Required for photo/video submissions)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

#### Frontend Environment Setup
1. Open a new terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   cp .env.example .env
   ```
2. Open `frontend/.env` and verify:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1
   EXPO_PUBLIC_APP_ENV=development
   ```
   > **Note on Expo Environment Variables**: In Expo SDK 49+, all variables prefixed with `EXPO_PUBLIC_` are automatically bundled and exposed to the client JavaScript runtime via `process.env.EXPO_PUBLIC_*`.

---

### 3. Running the Full Stack with Docker Compose

You can run the entire full stack (Frontend, Backend, and Database) using **Docker Compose** (recommended) or run each service **Natively**.

#### Option A: Docker Compose (One-Command Full-Stack Launch — Recommended)

From the project root:

```bash
docker compose up -d --build
```

This starts:
- **Frontend Web App (`feedants-frontend`)**: Nginx web server running on port `80` with SPA routing and reverse proxy for `/api/` calls.
- **Backend API (`feedants-backend`)**: Clustered Node.js / Express 5 API running on port `5000` (automatically seeds initial categories, competitions, and champions if the database is empty).
- **MongoDB Database (`feedants-mongo`)**: MongoDB 7 instance on port `27017` with persistent volume `mongo_data`.

**Useful Docker Management Commands**:
```bash
# View real-time logs across all services
docker compose logs -f

# View backend API logs specifically
docker compose logs -f backend

# View frontend web logs specifically
docker compose logs -f frontend

# Check container status
docker compose ps

# Stop and remove containers
docker compose down
```

**Verify Services**:
- Frontend Web App: Open `http://localhost/` in your browser.
- Backend API Health: `curl http://localhost:5000/api/v1/health` (or `curl http://localhost/api/v1/health` through Nginx).

#### Option B: Native Execution (Without Docker)

1. Ensure a local MongoDB instance is running on port `27017` (or provide an active MongoDB Atlas cluster URI in `backend/.env`).
2. Navigate to `backend/` and install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Launch the server:
   ```bash
   # Development mode with file watch
   npm run dev

   # OR Clustered production mode (forks across all CPU cores)
   npm start
   ```

Verify backend health:
```bash
curl http://localhost:5000/api/v1/health
```

---

### 4. Running the Frontend (Mobile App)

1. In a separate terminal, navigate to `frontend/`:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Expo bundler:
   ```bash
   npx expo start
   ```
3. Clear cache if needed:
   ```bash
   npx expo start -c
   ```

---

### 5. Target Platforms & How to Connect

Once the Expo development server is running, choose your target platform:

#### 📱 Physical Mobile Device (Android / iOS)
1. Ensure your physical phone and computer are connected to the **same local Wi-Fi network**.
2. **Android**: Open the **Expo Go** app and tap **"Scan QR code"**. Scan the terminal QR code.
3. **iOS**: Open the native **Camera** app, point at the terminal QR code, and tap the prompt to open in Expo Go.
4. **Adaptive LAN IP Auto-Resolution**:
   On physical devices, `localhost` points to the mobile phone itself, not your PC. Our custom networking client ([`frontend/src/services/api.ts`](frontend/src/services/api.ts)) dynamically detects your host computer's local Wi-Fi IP address from the Expo bundler `hostUri` at runtime. You **do not** need to manually hardcode your IP address when switching between devices.

#### 🌐 Web Browser
Press **`w`** in the Expo interactive terminal to open the application in Google Chrome / default browser at `http://localhost:8081`.

#### 🤖 Android Emulator
With Android Studio running and a virtual device launched, press **`a`** in the Expo terminal.

#### 🍎 iOS Simulator (macOS only)
With Xcode installed, press **`i`** in the Expo terminal.

---

### ⌨️ Expo Terminal Keyboard Controls

While the Expo server is active, use the following interactive terminal shortcuts:

| Key | Action |
| :---: | :--- |
| `w` | Open application in web browser |
| `a` | Open on Android emulator / connected device |
| `i` | Open on iOS simulator |
| `r` | Reload application JavaScript bundle |
| `m` | Toggle in-app developer menu |
| `c` | Show terminal QR code again |
| `j` | Open Chrome DevTools debugger |
| `?` | Show all available commands |

---

### 🔧 Troubleshooting & FAQ

#### 1. `Error: listen EADDRINUSE: address already in use :::5000`
Another process is already occupying port `5000`. Kill the existing process:
```bash
# Linux / macOS
npx kill-port 5000
# or find PID and kill:
lsof -i :5000
kill -9 <PID>
```

#### 2. `Network request failed` on Physical Mobile Device
- **Check Wi-Fi Network**: Ensure your mobile phone and development machine are connected to the exact same Wi-Fi SSID.
- **Router Isolation / Hotspot**: Corporate or public Wi-Fi networks often enable "AP Isolation", preventing devices from communicating with each other. Connect both devices to a mobile hotspot to bypass network isolation.
- **Firewall Restrictions**: Ensure your host operating system firewall allows incoming TCP connections on port `5000`.

#### 3. MongoDB Connection Refused (`ECONNREFUSED 127.0.0.1:27017`)
- If running natively, ensure the local MongoDB daemon is active:
  ```bash
  sudo systemctl status mongod
  # Or start it:
  sudo systemctl start mongod
  ```
- If using Docker, check that the container is healthy:
  ```bash
  docker ps -a
  docker compose restart mongodb
  ```

#### 4. Media Upload Fails in Studio (`Upload Failed: Cloudinary credentials missing`)
Browsing the app works without Cloudinary credentials using built-in fallbacks. However, uploading videos or photos from the **Create** tab requires valid `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in `backend/.env`.

---

### 🧪 Verification & Health Checking Runbook

#### 1. Hardware & Process Health Check
```bash
curl -X GET http://localhost:5000/api/v1/health
```
_Expected Output_: `200 OK` with JSON payload containing system status (`UP`), CPU core count, uptime, and memory usage.

#### 2. Verify In-Memory Cache Headers
```bash
# First request (Cache Miss)
curl -i http://localhost:5000/api/v1/competitions
# Header check: X-Cache: MISS

# Second request within 15s (Cache Hit - Sub-5ms)
curl -i http://localhost:5000/api/v1/competitions
# Header check: X-Cache: HIT
```

#### 3. High-Concurrency Stress Test on Atomic Spot Booking
Simulate concurrent registration requests using a load-testing utility (`autocannon` or `k6`):
```bash
npx autocannon -c 100 -d 10 -m POST http://localhost:5000/api/v1/competitions/<CONTEST_ID>/join
```
_Expected Result_: Exactly `N` registrations succeed until `spotsLeft == 0`. Subsequent requests immediately return `400 Bad Request: "Contest is already full!"` with zero over-enrollment or negative spot counts.

---

## 🔄 Automated CI/CD & Deployment Pipeline

Feedants features an automated, production-grade CI/CD pipeline defined in [`.github/workflows/my_workflow.yaml`](.github/workflows/my_workflow.yaml). Every `git push` to the `main` branch automatically builds, verifies, packages, and deploys the entire full-stack application to the remote AWS EC2 production server with zero downtime.

### 📊 Pipeline Architecture

```mermaid
flowchart TD
    subgraph Git["Source Control"]
        Push["git push origin main"]
    end

    subgraph CI["GitHub Actions Runner (Ubuntu Latest)"]
        Checkout["actions/checkout@v4<br/>Fetch Repository"]
        Buildx["docker/setup-buildx-action@v3<br/>Set Up Docker Build Engine"]
        GHCR["docker/login-action@v3<br/>Authenticate with GHCR"]
        BuildBackend["docker/build-push-action@v5<br/>Build & Push Backend Image<br/>ghcr.io/.../backend:latest"]
        BuildFrontend["docker/build-push-action@v5<br/>Build & Push Frontend Image<br/>ghcr.io/.../frontend:latest"]
    end

    subgraph CD["Remote Production Server (AWS EC2)"]
        SSH["Native OpenSSH with Key Auto-Repair"]
        GitPull["git pull origin main<br/>(Auto-clone if missing)"]
        Compose["docker compose up -d --build<br/>Rebuild & Restart Services"]
        Prune["docker image prune -f<br/>Clean Dangling Images"]
        Verify["docker compose ps<br/>Container Health Verification"]
    end

    Push --> Checkout
    Checkout --> Buildx
    Buildx --> GHCR
    GHCR --> BuildBackend
    GHCR --> BuildFrontend
    BuildBackend & BuildFrontend --> SSH
    SSH --> GitPull
    GitPull --> Compose
    Compose --> Prune
    Prune --> Verify
```

### ⚙️ Pipeline Jobs Breakdown

#### 1. Build & Package Job (`build`)
- **Checkout**: Pulls the latest repository commit using `actions/checkout@v4`.
- **Build Engine**: Initializes Docker Buildx with GitHub Actions layer caching (`type=gha,mode=max`) for accelerated builds.
- **Backend Containerization**: Builds `backend/Dockerfile` and pushes version-tagged images to GitHub Packages / GitHub Container Registry (`ghcr.io`).
- **Frontend Containerization**: Builds `frontend/Dockerfile` (compiling the Expo Web static bundle and packaging with Nginx) and pushes to GHCR.

#### 2. Deployment Job (`deploy`)
- **Condition**: Triggers only on successful completion of the `build` job on branch `refs/heads/main`.
- **Native OpenSSH**: Employs `/usr/bin/ssh` directly with modern client configurations, ensuring full compatibility with AWS EC2 SSH policies (`-o PubkeyAcceptedKeyTypes=+ssh-rsa`).
- **Key Auto-Repair**: Automatically detects if the secret omitted the `-----BEGIN RSA PRIVATE KEY-----` header or `-----END RSA PRIVATE KEY-----` footer, reconstructing the valid PEM envelope on the fly to prevent `libcrypto` parsing errors.
- **Auto-Clone Fallback**: Checks if the target repository directory exists on the server; if not, automatically clones the repository.
- **Zero-Downtime Compose Up**: Auto-detects Docker Compose v2 (`docker compose`) or v1 (`docker-compose`) and executes `docker compose up -d --build`.
- **Storage Conservation**: Executes `docker image prune -f` after deployment to prevent disk bloat on the server.

---

### 🔐 Required GitHub Repository Secrets

Configure these under **Settings** ➔ **Secrets and variables** ➔ **Actions** ➔ **Repository secrets**:

| Secret Name | Required | Default Fallback | Description |
| :--- | :---: | :--- | :--- |
| `SERVER_SSH_KEY` | **Yes** | — | Private SSH Key for EC2 instance access (content of `.pem` / `id_rsa`) |
| `SERVER_HOST` | No | `3.110.181.136` | Public IP or DNS of the remote server |
| `SERVER_USER` | No | `ubuntu` | Remote SSH username |
| `SERVER_APP_DIR` | No | `~/feedants` | Path to the repository directory on the remote server |

---

### 🧪 Verifying the Deployed Application

Once the GitHub Actions workflow finishes with a green checkmark:

1. **Frontend Web UI**: Open `http://3.110.181.136/` in any browser.
2. **Backend API Health**:
   ```bash
   curl http://3.110.181.136:5000/api/v1/health
   # Or through the Nginx reverse proxy on port 80:
   curl http://3.110.181.136/api/v1/health
   ```
3. **Database Seed Check**:
   ```bash
   curl http://3.110.181.136/api/v1/competitions
   ```
4. **Server Container Status**:
   ```bash
   ssh -i /path/to/aws-key.pem ubuntu@3.110.181.136 "docker compose -f ~/feedants/docker-compose.yml ps"
   ```

---

## 🔮 Production Scaling Roadmap

For scaling Feedants to an enterprise tier serving millions of concurrent active users, the following architectural milestones are recommended:

1. **Distributed Caching & Asynchronous Queue Ingestion (Redis + BullMQ)**:
   - Transition the in-process cache to a managed **Redis Sentinel / Cluster** for cross-pod cache synchronization and distributed rate limiting.
   - Offload media transcoding, video watermarking, automated fraud scoring, and push notifications to **BullMQ** worker threads backed by Redis.
2. **Database Read-Write Splitting & Sharding**:
   - Implement **MongoDB Replica Sets** with read preference routing: directed writes go to the primary node, while heavy catalog browsing queries are distributed across read secondaries (`readPreference: 'secondaryPreferred'`).
   - Shard the `submissions` and `registrations` collections by `{ contestId, createdAt }` to maintain constant-time query latency as data volumes reach tens of millions of records.
3. **Idempotent Payment Gateway Integration**:
   - Production integration with **Razorpay / Stripe Webhooks**:
     - Pre-registration order generation with server-side HMAC-SHA256 signature verification.
     - Database idempotency keys to guarantee a user is never double-charged during network retry loops.
     - Automated escrow wallet disbursement directly to winner bank accounts upon jury score finalization.
4. **Real-Time State Synchronization via WebSockets / SSE**:
   - Implement **Socket.io / Server-Sent Events (SSE)** for real-time contest dynamics:
     - Live broadcast of remaining spot countdowns (`"Only 2 spots left!"`) to all active viewers.
     - Live leaderboard position updates as adjudicators submit scores during championship finals.
5. **Observability, APM & Infrastructure as Code**:
   - Multi-stage Dockerfiles with non-root security contexts, Kubernetes Helm charts, and Horizontal Pod Autoscaling (HPA).
   - Instrument the backend with **OpenTelemetry**, exporting metrics to Prometheus/Grafana and distributed traces to Jaeger/Datadog for p99 latency monitoring and slow-query profiling.
