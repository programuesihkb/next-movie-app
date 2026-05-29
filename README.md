# MovieApp — Full-Stack Movie Suggestion App

Ionic 8 + Angular 19 frontend · NestJS 10 backend · PostgreSQL · TMDB API · JWT auth

---

## Monorepo Structure

```
NexeMovieApp/
├── backend/          NestJS REST API
├── next-movie-app/   Ionic + Angular frontend
└── README.md
```

---

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 18 + |
| npm | 9 + |
| PostgreSQL | 14 + |
| TMDB API key | [Get one free](https://www.themoviedb.org/settings/api) |
| **iOS builds** | macOS + Xcode 15+ |
| **Android builds** | Android Studio + SDK 34+ |

---

## Setup

### 1. Clone & install

```bash
git clone <repo-url>
cd NexeMovieApp

# Backend
cd backend
npm install

# Frontend
cd ../next-movie-app
npm install
```

### 2. Configure the backend environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=yourpassword
DB_NAME=movieapp_db
JWT_ACCESS_SECRET=change_me_access
JWT_REFRESH_SECRET=change_me_refresh
TMDB_API_KEY=your_tmdb_api_key
FRONTEND_URL=http://localhost:8100
```

### 3. Create the PostgreSQL database

```bash
psql -U postgres -c "CREATE DATABASE movieapp_db;"
```

(TypeORM `synchronize: true` will create tables automatically on first run.)

### 4. Run both servers

```bash
# Terminal 1 — backend (port 3000)
cd backend
npm run start:dev

# Terminal 2 — frontend (port 8100)
cd next-movie-app
npm start
```

Open **http://localhost:8100** in your browser.

---

## API Endpoints

All routes are prefixed with `/api`.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /auth/register | — | Create account |
| POST | /auth/login | — | Login, sets httpOnly refresh cookie |
| POST | /auth/refresh | cookie | Exchange refresh token for new access token |
| POST | /auth/logout | Bearer | Clear refresh token |
| GET | /auth/me | Bearer | Current user info |
| GET | /movies | — | Popular movies (paginated) |
| GET | /movies?genreId=X&minRating=7 | — | Discover with filters |
| GET | /movies/genres | — | All TMDB genres |
| GET | /movies/search?q=… | — | Search by title |
| GET | /movies/:id | — | Movie detail |
| GET | /favorites | Bearer | User's saved movies |
| POST | /favorites | Bearer | Save a movie |
| DELETE | /favorites/:id | Bearer | Remove a movie |
| GET | /recommendations | Bearer | Personalized picks |

---

## Running on iOS Simulator

```bash
cd next-movie-app
npm run build
npx cap sync ios
npx cap open ios
```

In Xcode: select a simulator → press **Run** (▶).

---

## Running on Android Emulator

```bash
cd next-movie-app
npm run build
npx cap sync android
npx cap open android
```

In Android Studio: select an emulator → press **Run** (▶).

---

## Running on a Physical Device

1. Edit `next-movie-app/capacitor.config.ts`:
   ```ts
   server: {
     url: 'http://192.168.x.x:8100',   // your machine's LAN IP
     cleartext: true,
   }
   ```
2. Connect device via USB with developer mode enabled.
3. Run from Xcode (iOS) or Android Studio (Android).

---

## Feature Checklist

- [x] Register / Login with JWT (access token in memory, refresh in httpOnly cookie)
- [x] Token auto-refresh via HTTP interceptor — stays logged in across refreshes
- [x] Browse popular movies with infinite scroll
- [x] Filter by genre (chip selector) and minimum rating (Top Rated segment)
- [x] Search movies with 400 ms debounce
- [x] Full movie detail page with backdrop hero image
- [x] Add / remove favorites (requires login)
- [x] Personalized recommendations on Home (genre-based via TMDB)
- [x] Bottom tab navigation (Home · Search · Favorites · Profile)
- [x] Logout clears session and redirects to login
- [x] Capacitor configured for iOS & Android deployment

---

## Architecture Notes

### Recommendation Engine (backend/src/recommendations/)

Current approach is **genre-based via TMDB /discover** — free and requires no ML:

1. Fetch genre IDs from the user's saved favorites
2. Call `/discover/movie` for each of the top 3 genres
3. Deduplicate, remove already-favorited movies, return top 10

Upgrade paths documented in `recommendations.service.ts`:
- **Future A** — TMDB `/movie/{id}/recommendations` (1-day effort, better accuracy)
- **Future B** — Collaborative filtering with a `user_views` table
- **Future C** — OpenAI embeddings + pgvector (production-grade semantic matching)

### Auth Flow

```
Login → access_token (15 min, in memory) + refresh_token (7 d, httpOnly cookie)
         ↓ 401 on any request
         authInterceptor → POST /auth/refresh → new pair → retry original request
         ↓ refresh also fails
         logout() → redirect /login
```
