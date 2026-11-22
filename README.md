# IDX Exchange – Property Browser

A real estate listings site: browse, filter, sort and save California properties.

- **Frontend:** React (Create React App), React Router 6 — `http://localhost:3000`
- **Backend:** Node.js + Express — `http://localhost:5000`
- **Database:** MySQL 8 in Docker (`rets` database, `rets_property` / `rets_openhouse` tables)

## Running locally

```bash
docker start <mysql-container>          # database
cd backend  && npm install && npm run dev   # API on :5000
cd frontend && npm install && npm start     # app on :3000
```

The backend reads its database settings from `backend/.env` (not committed):
`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
The frontend reads `REACT_APP_GOOGLE_MAPS_API_KEY` from `frontend/.env.development.local`.

## Scripts

| Where | Command | What it does |
|---|---|---|
| frontend | `npm start` | Dev server with hot reload |
| frontend | `npm test` | Jest + React Testing Library |
| frontend | `npm run lint` | ESLint; fails on any error or warning |
| backend | `npm run dev` | API with nodemon |
| backend | `npm test` | Jest + Supertest (database is mocked) |

## Project structure

```
backend/
  server.js              Express app: middleware, request logger, routes, health check
  db.js                  MySQL connection pool (settings from .env)
  routes/properties.js   /api/properties list (filters, sorting, pagination), detail, open houses
  tests/                 API tests for sorting/validation and the request logger

frontend/src/
  index.js               Entry point: mounts <App /> in StrictMode
  App.js                 Router, site header, error boundary, page routes
  App.css / index.css    Design tokens and all component styles
  setupTests.js          Adds jest-dom matchers to every test

  api/
    client.js            fetch wrappers for every backend endpoint

  components/            Reusable UI pieces (no page-level data fetching)
    SiteHeader.js        Top bar with Listings / Favorites links and favorites count
    PropertyFilters.js   City, ZIP, price, beds and baths filter form
    SortControl.js       "Sort by" dropdown mapped to whitelisted API columns
    PropertyCard.js      One listing card (photo, price, address, stats, heart)
    FavoriteButton.js    Heart toggle that saves/removes a favorite
    Pagination.js        Page buttons with ellipsis for long ranges
    PropertyImageCarousel.js  Photo carousel inside a card
    PropertyImageGallery.js   Detail-page gallery with thumbnails and full-screen lightbox
    PropertyMap.js       Google Maps embed and directions link
    ErrorBoundary.js     Catches render errors and shows a recovery screen

  hooks/
    useFavorites.js      Favorites stored in localStorage, shared across components

  pages/                 One component per route; they load data and compose components
    ListingsPage.js      "/" – filters, sorting, results grid, pagination
    PropertyDetailPage.js  "/property/:id" – details, gallery, map, open houses
    FavoritesPage.js     "/favorites" – saved homes and count

  utils/                 Pure helper functions, no React state
    format.js            Price and number formatting
    photos.js            Parses the L_Photos JSON column
    openHouse.js         Open house date, time and remarks formatting
    propTypes.js         Shared PropTypes shapes (e.g. propertyShape)

docs/
  week9-performance.md   Index changes and before/after query timings

.github/
  pull_request_template.md  Checklist for every pull request
```

Tests sit next to the file they test (`PropertyCard.test.js` beside `PropertyCard.js`).

## Git workflow

- `main` – stable, released code. Only updated by merging `develop` through a pull request.
- `develop` – integration branch. All feature branches start here and merge back here.
- Feature branches – `feat/...`, `fix/...`, `refactor/...`, `docs/...`, `chore/...`

Commit messages follow Conventional Commits:

```
type(scope): short description
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.
Example: `fix(pagination): reset to page 1 when filters change`
