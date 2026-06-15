# Flat AI

Flat AI is a property search, analytics, and recommendation platform built as a hybrid stack:

- React frontend for the user interface
- Node.js/Express backend for app APIs, authentication, and property data
- Django service for prediction and recommendation logic
- MongoDB as the primary database when available
- Local fallback storage for offline or partially configured development

This README explains both the project structure and the concepts behind it so you can describe the system at a high level in interviews or code reviews.

## What The App Does

The product lets a user:

1. Search and browse property listings
2. Open a single property detail page
3. Save properties to a wishlist
4. Create an account, log in, and manage a profile
5. Estimate property price through an ML-style prediction flow
6. See similar properties based on the current listing or predicted profile
7. Use an admin panel to manage users and properties
8. View analytics-style charts for the dataset

The overall design is split so each responsibility lives in the right layer:

- The frontend focuses on user experience and state management
- The Node backend handles request routing, auth, and data access
- The Django app handles prediction and ranking logic
- The data layer decides whether to use MongoDB or local fallback files

## Big Picture Architecture

### 1. React Frontend

The React app is the visible application the user interacts with in the browser.

It:

- renders pages and components
- collects user input
- calls APIs with `axios`
- stores app state in Redux
- stores auth session data in browser localStorage

### 2. Node/Express API

The Node server is the main application API.

It:

- serves auth endpoints
- serves search and listing endpoints
- serves admin endpoints
- forwards or hydrates data for recommendation flows
- connects to MongoDB when possible
- falls back to local JSON / pickle data when Mongo is unavailable

### 3. Django ML Service

The Django app is a second backend that focuses on property intelligence.

It:

- estimates property prices
- returns similar properties using heuristic scoring
- keeps prediction logic separate from the main Node API

### 4. Data Storage

This repo uses more than one data source:

- MongoDB stores properties and users when available
- `Website/Backend/data/users.json` is the fallback user store when Mongo is not available
- `Website/ml/pkl/prediction_df.pkl` is used as a dataset fallback for ML-related data
- `Website/ml/db.sqlite3` is Django's local SQLite database

That makes the app easier to run in development and more resilient when a service is missing.

## Why Redux Is Used

Redux is a predictable state container for JavaScript apps.

In plain English, Redux helps the app answer:

- "What data do we already have?"
- "What is loading right now?"
- "Did the request fail?"
- "What should happen when the user searches or scrolls?"

Instead of every component managing its own unrelated copy of app state, Redux gives you a central store.

In this project, Redux is mainly used for:

- search results
- paginated listing data
- property detail fetches
- prediction recommendations

That is why the store in `Website/frontend/src/RTK/store.js` combines multiple slices.

## Why Axios Is Used

Axios is a promise-based HTTP client.

It is used instead of the raw `fetch` API because it makes common tasks easier:

- sending JSON requests
- reading JSON responses
- attaching headers like `Authorization`
- handling errors consistently

So when the frontend calls:

- `POST /api/clientData`
- `GET /api/auth/me`
- `POST /api/prediction-recommendation`

it does that through Axios.

## Why JWT Is Used

JWT stands for JSON Web Token.

After login, the backend returns a signed token. The frontend stores it in localStorage, then sends it back in the `Authorization: Bearer ...` header for protected requests.

That gives the app:

- login sessions without server-side session storage
- stateless auth checks on the backend
- role-based access control for admin endpoints

## Project Layout

```text
Website/
  Backend/   -> Node/Express API
  frontend/  -> React app
  ml/        -> Django prediction/recommendation service
  dev.ps1    -> Windows helper to run all three services
```

## Frontend Deep Dive

### `Website/frontend/src/index.js`

This is the React entrypoint.

It:

- imports global CSS
- mounts the React app into the `root` DOM node
- wraps the app with:
  - `Provider` from `react-redux`
  - `Router` from `react-router-dom`

That means every page/component can:

- read from Redux
- navigate between routes

### `Website/frontend/src/App.jsx`

This is the top-level page router.

It defines the routes for:

- home
- prediction
- analysis
- wishlist
- profile
- admin
- login
- signup
- property details

It also renders the persistent layout pieces:

- `NavBar`
- `Footer`

So the app shell stays consistent while only the center content changes.

### `Website/frontend/src/RTK/store.js`

This file creates the Redux store.

It wires together multiple reducers:

- `searchResult`
- `allData`
- `propertyDetails`
- `predictionSuggestion`

The store is the central state container for the app.

### Redux Slices

Each slice handles one domain of data.

#### `Website/frontend/src/RTK/Slices/SearchSlice.js`

This slice handles search requests from the homepage.

It:

- sends the search payload to the Node backend
- stores returned results in Redux
- tracks loading and error states

This is the slice that powers the homepage search panel.

#### `Website/frontend/src/RTK/Slices/allDataSlice.js`

This slice handles the infinite-scroll property list.

It:

- asks the backend for one page of data at a time
- appends new data to the existing list
- marks when no more data exists

This is what makes the listing section keep loading more properties as you scroll.

#### `Website/frontend/src/RTK/Slices/PropertyDetailsSlice.js`

This slice fetches one property by ID.

It is used by the property details page so the page can show the selected flat's complete information.

#### `Website/frontend/src/RTK/Slices/PredictionRecommendationSlice.js`

This slice fetches recommendation data for the prediction page.

It is used after the ML service produces a price estimate, so the frontend can ask for similar properties based on the predicted profile.

### `Website/frontend/src/utils/auth.js`

This file is the auth session helper.

It handles:

- storing the JWT token in localStorage
- storing the user object
- storing session metadata
- reading auth data back later
- removing expired or invalid sessions
- producing auth headers for protected calls

This is important because the frontend does not keep auth in component state only. It needs to survive page refreshes.

### `Website/frontend/src/utils/propertyUtils.js`

This file contains property-specific helper logic.

It:

- normalizes location strings
- resolves location aliases
- chooses a fallback image when the provided image is invalid
- builds nicer property display logic

This keeps UI components simpler because they can ask for one normalized property image or location behavior instead of repeating the rules everywhere.

### `Website/frontend/src/Pages/*.jsx`

These are page-level components.

#### `Home.jsx`

Composes:

- `Poster`
- `FindFlat`
- `SearchResult`
- `AllFlats`

This is the landing page experience.

#### `Prediction.jsx`

This page gathers the features needed to predict a property's price.

It:

- collects location, bedroom count, balcony count, area, age, furnishing, amenities, and floor band
- sends them to Django
- displays the predicted value
- fetches prediction history for signed-in users
- requests recommended homes based on the predicted query

#### `AnalysisPage.jsx`

This page loads filtered analytics data and passes it into chart components.

It uses:

- `fetchData()` from `Components/Analysis/FetchData.js`
- chart components like bar, histogram, box plot, pie chart, scatter plot

#### `Auth.jsx`

This page handles login and signup.

It:

- validates user input
- sends login/signup requests to the Node API
- stores the returned JWT session
- redirects to profile or admin based on role

#### `Profile.jsx`

This page handles account management.

It:

- loads the current user profile
- lets the user update name and email
- lets the user change password
- refreshes the auth session after updates

#### `Admin.jsx`

This page is the admin dashboard.

It:

- loads user counts and property counts
- lists users
- allows role changes
- allows property creation
- allows property deletion

### `Website/frontend/src/Components`

This folder contains reusable UI building blocks.

#### `Components/Home/FindFlat.jsx`

This is the search form on the home page.

It:

- collects location, bedroom count, and property type
- provides suggestions for locations
- dispatches the Redux search thunk

#### `Components/Home/SearchResult.jsx`

This renders search matches returned from the Redux search state.

It also lets signed-in users add properties to the wishlist.

#### `Components/Home/AllFlats.jsx`

This renders the infinite-scroll list of properties.

It:

- dispatches paginated fetches
- listens to scroll events
- shows loading state while more data arrives

#### `Components/PropertyDetailsPage/SuggestedProperty.jsx`

This is the recommendation carousel for a property detail page.

It is interesting because it uses two services:

- Django scores the similarity
- Node hydrates the resulting property IDs into full property records

#### `Components/Prediction/Prediction.jsx`

This is the ML prediction UI.

It is the bridge between the user and the Django prediction service.

#### `Components/Analysis/*`

These files render charts and analytics views.

They rely on Plotly and chart helper functions.

`FetchData.js` calls the Node endpoint that returns filtered listing data for analysis.

## Backend Deep Dive

### `Website/Backend/server.js`

This is the Node app bootstrap file.

It does several things:

- loads environment variables from `Website/Backend/.env`
- creates the Express app
- installs middleware
- mounts all routes
- exposes `/api/allfilteredData`
- starts the server
- tries to connect to MongoDB
- creates a bootstrap admin user if missing

This file is effectively the traffic controller for the Node service.

### `Website/Backend/db/db.js`

This file manages the Mongo connection.

It:

- reads the Mongo URI from env
- rejects placeholder URIs
- connects to Mongo with timeout settings
- uses the `realestate` database name by default

If connection fails, the app can still start and use fallback data in many places.

### `Website/Backend/db/localDataStore.js`

This is one of the most important files in the repo.

It is the data abstraction layer for property records and user-like fallback behavior.

It:

- reads fallback property data from `prediction_df.pkl`
- normalizes the data shape
- deduplicates rows
- paginates listings
- searches properties by filters
- finds one property by ID
- finds one property by `PROP_ID`
- returns filtered analysis data

This file is why the app can still work even when MongoDB is not available.

### `Website/Backend/db/FlatModel.js`

This defines the MongoDB schema for a property listing.

It tells Mongo/Mongoose:

- what fields exist
- what types they should have
- which fields are required
- which indexes should exist

It is the formal shape of a property record in MongoDB.

### `Website/Backend/db/UserModel.js`

This defines the MongoDB schema for users.

It stores:

- name
- email
- password hash
- role

### `Website/Backend/db/userStore.js`

This is the user repository layer.

It can store and read users from either:

- MongoDB if available
- local JSON file fallback if Mongo is down

This file also hides password hashes when data is returned to the client.

### Middleware

#### `Website/Backend/Middleware/authMiddleware.js`

This middleware protects routes that need a logged-in user.

It:

- reads the JWT from the `Authorization` header
- verifies the token
- loads the current user
- attaches `req.user` and `req.auth`

#### `Website/Backend/Middleware/adminMiddleware.js`

This middleware blocks non-admin access to admin routes.

It checks the user role and returns `403` if the user is not an admin.

### Controllers

Controllers contain the request handling logic.

#### `Website/Backend/Controllers/searchController.js`

Accepts search filters from the frontend, converts the UI labels into database-friendly query values, and returns matched properties.

#### `Website/Backend/Controllers/allDataController.js`

Returns paginated property data for the infinite-scroll list.

#### `Website/Backend/Controllers/singlePropertyController.js`

Returns one property record by ID for the details page.

#### `Website/Backend/Controllers/SinglePropertyRecomendationController.js`

Accepts a list of property IDs and returns the matching records.

This is the second step in the recommendation flow after Django computes similarity.

#### `Website/Backend/Controllers/PredictionRecommendationController.js`

Accepts predicted-property candidate data and returns property details from IDs and similarity scores.

#### `Website/Backend/Controllers/authController.js`

Handles:

- signup
- login
- current-user lookup
- profile updates
- password changes

It also issues JWTs and keeps the stored user safe by removing password hashes before responses.

#### `Website/Backend/Controllers/adminController.js`

Handles admin dashboard data and CRUD.

It can:

- summarize counts
- list users
- change roles
- list properties
- create properties
- update properties
- delete properties

## Django Deep Dive

### `Website/ml/manage.py`

This is the standard Django entrypoint.

It is used to run:

- migrations
- development server
- admin commands

### `Website/ml/ml/settings.py`

This is the Django configuration file.

It defines:

- installed apps
- middleware
- database settings
- static file settings
- CORS allowed origins
- debug mode

Important detail:

- Django stores its local database in `db.sqlite3`
- the database path can be overridden with `DJANGO_SQLITE_PATH`

### `Website/ml/ml/urls.py`

This is Django's root URL router.

It includes:

- `prediction.urls`
- `Recommendation.urls`

So the Django service is split into two feature areas:

- price prediction
- recommendation scoring

### `Website/ml/prediction/views.py`

This file estimates a price from form input.

The flow is:

1. Normalize the incoming data
2. Compare it to the dataset
3. Score similar candidate properties
4. Derive a weighted price per square foot
5. Multiply by area
6. Return a price in crores

It also stores the prediction in a temporary in-memory session map so the frontend can fetch it again by session ID.

### `Website/ml/Recommendation/views.py`

This file computes similarity rankings.

There are two entry points:

- one for a property ID lookup
- one for a prediction-based query

It scores properties by comparing:

- location
- bedrooms
- balcony count
- furnishing
- age
- amenities
- floor band
- area
- price

Then it returns the highest-ranked matches.

## End-to-End Request Flows

### Search Flow

1. User fills the search form on the home page.
2. `FindFlat.jsx` dispatches `searchFlatSlice`.
3. The thunk sends a POST request to `/api/clientData`.
4. Node receives the request in `searchController.js`.
5. The controller builds a query object.
6. `localDataStore.js` searches Mongo or fallback data.
7. The results are stored in Redux.
8. `SearchResult.jsx` renders the matches.

### Listing Flow

1. `AllFlats.jsx` requests page 1 from Redux.
2. `allDataSlice.js` calls `/api/allData/1`.
3. Node paginates through `localDataStore.js`.
4. More rows are appended as the user scrolls.

### Property Detail Flow

1. The user opens `/flats/:id`.
2. The property details slice fetches the record.
3. Node returns a single property.
4. The page renders the full listing.

### Prediction Flow

1. User fills the prediction form.
2. React sends the query to Django `submit/`.
3. Django estimates price from the dataset.
4. Django returns a prediction and session ID.
5. React fetches the stored prediction by session ID.
6. React asks Django for prediction-based recommendations.
7. The recommendation list is displayed below the form.

### Auth Flow

1. User signs up or logs in.
2. Node validates input and issues a JWT.
3. Frontend stores token and user info in localStorage.
4. Protected requests include the token in the `Authorization` header.
5. Backend middleware verifies the token before allowing access.

### Admin Flow

1. Admin logs in.
2. Frontend checks the user role.
3. Admin dashboard calls protected admin endpoints.
4. Node verifies both JWT and admin role.
5. Admin can manage users and properties.

## Environment Variables

### Node backend

Typical variables used by `Website/Backend/server.js` and the DB layer:

- `PORT`
- `MONGODB_URI`
- `MONGODB_URI_ATLAS`
- `MONGO_URI`
- `MONGODB_DB_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

### Frontend

The React app expects:

- `REACT_APP_NODE_API_URL`
- `REACT_APP_DJANGO_API_URL`

These should include the trailing `/api/` path if you want the existing code to work as-is.

### Django

Useful Django variables include:

- `DJANGO_DEBUG`
- `DJANGO_SQLITE_PATH`

## Running The Project

The easiest way on Windows is the helper script:

```powershell
cd Website
.\dev.ps1
```

That script starts:

- the Node backend
- the React frontend
- the Django ML service

It also passes backend Mongo env values into the Django process when needed.

If you prefer to start them separately:

```powershell
cd Website/Backend
npm install
npm start
```

```powershell
cd Website/frontend
npm install
npm start
```

```powershell
cd Website/ml
python -m pip install -r requirements.txt
python manage.py runserver
```

## How To Explain This In An Interview

If someone asks you "what is this architecture?", a strong answer is:

> This is a split-service property platform. React is the presentation layer, Node/Express is the transactional API layer, and Django is the ML service. Redux is used to manage cross-component UI state like search results and listing pagination, while Axios is used for API calls. MongoDB is the primary datastore, but the backend has fallback file-based data paths so the app can still run without a full database setup.

If they ask "why did you split Node and Django?", answer:

> The Node service is optimized for auth, CRUD, and app orchestration. Django is better isolated for the price prediction and recommendation algorithms, so the ML code stays separate from the main business API.

If they ask "what happens when MongoDB is down?", answer:

> The backend falls back to local data sources for read-heavy paths, especially property browsing and analytics, so the app remains usable in development or degraded environments.

## Notes

- The frontend build is currently healthy.
- Plotly source-map warnings were fixed by upgrading the Plotly packages.
- The repo is Windows-friendly and includes a `dev.ps1` orchestration script.

