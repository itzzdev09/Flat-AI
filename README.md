# Flat AI

Flat AI is a property search, analytics, and recommendation platform built as a hybrid stack:

- React frontend for the user interface
- Node.js/Express backend for app APIs, authentication, property data, and the working prediction endpoint
- Django service for standalone prediction and recommendation logic
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
- The Node backend handles request routing, auth, data access, and the prediction page flow
- The Django app remains available as a standalone ML service
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
- serves the prediction route used by the React prediction page
- hydrates data for recommendation flows
- connects to MongoDB when possible
- falls back to local JSON / pickle data when Mongo is unavailable

### 3. Django ML Service

The Django app is still part of the repo, but the website no longer depends on the browser reaching Django directly for the prediction page.

It:

- estimates property prices
- returns similar properties using heuristic scoring
- can be run independently for ML experiments or future integration

### 4. Data Storage

This repo uses more than one data source:

- MongoDB stores properties and users when available
- `Website/Backend/data/users.json` is the fallback user store when Mongo is not available
- `Website/Backend/db/localDataStore.js` is the main property fallback used by Node prediction and browsing flows
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

This slice is the older recommendation hydrator used by the legacy prediction path.

The current working prediction page gets recommendation cards from the Node backend directly, but this slice is still useful if you want to restore the two-step workflow later.

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
- sends them to the Node prediction route
- displays the predicted value
- fetches prediction history for signed-in users
- requests recommended homes from the same response

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

It is the bridge between the user and the Node prediction route.
The page now receives the prediction and recommendation cards from one backend call.

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
- exposes the working prediction route at `/api/prediction/submit`
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

#### `Website/Backend/Controllers/SinglePropertyRecommendationController.js`

Accepts a list of property IDs and returns the matching records.

This is the second step in the recommendation flow when the UI already has ranked property IDs.

#### `Website/Backend/Controllers/PredictionRecommendationController.js`

Accepts predicted-property candidate data and returns property details from IDs and similarity scores.

#### `Website/Backend/Controllers/PredictionController.js`

This is the working prediction endpoint used by the website.

It:

- loads property data from the Node fallback layer
- estimates the price band from the query
- returns the recommendation cards in the same response

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
2. React sends the query to `POST /api/prediction/submit`.
3. Node estimates the price from the shared property dataset.
4. Node builds the recommendation list from the same dataset.
5. React displays the predicted band and recommendation cards below the form.
6. Django can still run separately, but it is no longer required for this page.

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

These should include the trailing `/api/` path if you want the existing code to work as-is.

`REACT_APP_DJANGO_API_URL` is still useful if you want to run the Django service manually, but the current prediction page does not rely on it.

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

It prefers the repo virtualenv for Django, passes backend Mongo env values into the Django process, and starts the ML server on `0.0.0.0:8000`.
The prediction page itself uses the Node prediction route, so the website still works even if Django is unavailable.

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

## Core Concepts In Plain English

This section is the "teach me the stack from zero" version. If a senior developer asks you what each piece does, these are the mental models to use.

### React

React is the UI library that builds the browser interface out of components.

Think of a component as a reusable piece of UI that:

- receives input through `props`
- keeps local state with hooks like `useState`
- reacts to lifecycle-like changes with hooks like `useEffect`
- returns JSX, which looks like HTML but is really JavaScript syntax

In this repo, React is used to build pages like the home screen, profile screen, admin dashboard, prediction form, and analysis charts.

### JSX

JSX is the syntax React uses to describe UI.

It lets you write markup-like code inside JavaScript so that the render logic stays close to the data logic. For example:

- a page can show a loading screen while data is being fetched
- once data arrives, the same page can render cards, charts, or forms

### Props

Props are inputs passed from one component to another.

They are how the parent component tells a child component what to display or how to behave.

Example in this app:

- `AnalysisPage` passes filtered property data into chart components
- `SuggestedProperty` passes `id` into the recommendation widget
- `HistoryTable` receives a history list and delete handler

### State

State is data that belongs to a component or a global store and can change over time.

There are two levels of state in this app:

- local component state, such as form fields and loading flags
- global Redux state, such as search results and paginated property data

### Hooks

Hooks are React functions that let function components use state and side effects.

The common ones in this app are:

- `useState` for form values, loading flags, and errors
- `useEffect` for API calls and startup logic
- `useMemo` for derived values like filtered analytics data
- `useSelector` and `useDispatch` for Redux integration

### Redux

Redux is a centralized state management pattern.

Without Redux, each component would have to own and share data manually. That becomes messy when many pages need the same data.

Redux solves that by giving you a single store for app-wide state.

In this repo, Redux is a good fit for:

- search results shown on the home page
- infinite-scroll listing data
- property details
- prediction recommendation output

The flow is usually:

1. A UI component dispatches an action.
2. A thunk performs an async request.
3. The Redux slice updates loading/data/error state.
4. Another component reads that state and renders the result.

### Redux Toolkit

Redux Toolkit is the modern, recommended way to use Redux.

It reduces boilerplate and gives you helpers like:

- `createSlice` for state + reducers
- `createAsyncThunk` for async API calls
- `configureStore` for store setup

That is why the Redux code in this repo is compact and easier to read than classic Redux.

### Thunks

A thunk is an async function used by Redux to handle API calls.

The async thunks in this repo fetch:

- all listings
- filtered search results
- one property by ID
- prediction recommendation data

### Axios

Axios is the HTTP client used for talking to APIs.

Why it matters here:

- it sends JSON cleanly
- it automatically parses JSON responses
- it lets us attach auth headers
- it gives friendly error objects for UI messages

### JWT

JWT means JSON Web Token.

It is a signed string that proves the user is logged in.

This app uses JWT so the backend can stay stateless:

- login returns a token
- frontend stores it in localStorage
- protected routes send it in the `Authorization` header
- backend middleware verifies it on every request

### localStorage

localStorage is the browser's simple key-value storage.

In this app it stores:

- auth token
- user info
- session metadata
- wishlist data
- prediction history

This makes the experience persistent across refreshes.

### Node.js and Express

Node.js lets JavaScript run on the server.

Express is the web framework sitting on top of Node.

Together they provide:

- routing
- middleware
- request/response handling
- auth and admin APIs
- data hydration for frontend needs

### Middleware

Middleware is logic that runs before a route handler finishes.

In this project, middleware is used for:

- protecting authenticated routes
- checking admin permissions
- parsing JSON bodies
- enabling CORS

### MongoDB and Mongoose

MongoDB stores data as documents rather than rows and columns.

Mongoose is the library that gives structure to MongoDB records.

Why Mongoose matters:

- it defines schemas for users and properties
- it validates fields
- it makes querying easier
- it gives the app a consistent model layer

### Django

Django is the Python web framework used here for the ML service.

It is responsible for:

- turning form input into a prediction
- scoring property similarity
- exposing those results through API endpoints

### URL Routing in Django

Django routes requests by matching paths in `urls.py`.

That means:

- `submit/` goes to the prediction function
- `fetchdata/` returns the stored prediction
- recommendation endpoints go to the recommendation logic

### CORS

CORS stands for Cross-Origin Resource Sharing.

It is the browser security rule that decides whether one origin is allowed to call another.

This matters because:

- the React app runs on one port/origin in development
- the Node backend runs on another
- the Django service runs on another

The backend and Django service both need CORS configured so the frontend can call them.

### Fallback Data

This app is designed to keep working even when the ideal database is not present.

There are fallback layers for:

- users
- property listings
- analytics data
- ML recommendation input

That means the repo is more forgiving during development and demonstration.

## File-by-File Walkthrough

This is the "what does every important file actually do?" section.

### Root Files

#### `README.md`

This documentation file explains the system architecture, concepts, request flow, and file responsibilities.

#### `Website/dev.ps1`

This PowerShell script starts the backend, frontend, and Django service together on Windows.

It prefers the repo `.venv` Python, passes relevant Mongo env values into the Django process, and starts Django on `0.0.0.0:8000`.

#### `.gitignore`

This file prevents secrets, dependencies, generated builds, and local databases from being committed.

### Frontend Entry and Layout

#### `Website/frontend/src/index.js`

Bootstraps the app into the DOM and wraps it in Redux and React Router providers.

#### `Website/frontend/src/App.jsx`

Defines application routes and renders the persistent layout shell.

#### `Website/frontend/src/CSS/index.css`

Global styling for the app.

#### `Website/frontend/src/CSS/App.css`

Application-specific styling for the overall visual theme and layout.

### Frontend Pages

#### `Website/frontend/src/Pages/Home.jsx`

Composes the home page sections: poster, search form, search results, and property feed.

#### `Website/frontend/src/Pages/Prediction.jsx`

Wraps the prediction component in a dedicated page route.

#### `Website/frontend/src/Pages/AnalysisPage.jsx`

Loads filtered data and feeds it into analytics charts.

#### `Website/frontend/src/Pages/Auth.jsx`

Handles sign up and login.

It validates form input, calls the Node auth API, stores the returned JWT session, and redirects based on role.

#### `Website/frontend/src/Pages/Profile.jsx`

Loads and updates the logged-in user's profile and password.

#### `Website/frontend/src/Pages/Admin.jsx`

Provides admin summary cards, user role control, property CRUD, and data refresh actions.

#### `Website/frontend/src/Pages/PropertyDetailsPage.jsx`

Shows the single-property detail screen and likely combines the property data, image, and suggested properties.

#### `Website/frontend/src/Pages/WishList.jsx`

Renders saved properties from localStorage for the current signed-in user.

### Frontend Components

#### `Website/frontend/src/Components/Sections/Navbar.jsx`

The global navigation bar.

It likely links between the main pages and adapts based on auth state.

#### `Website/frontend/src/Components/Sections/Footer.jsx`

The global footer.

#### `Website/frontend/src/Components/Sections/Loading.jsx`

A reusable loading indicator shown while data is being fetched.

#### `Website/frontend/src/Components/Home/Poster.jsx`

The homepage hero section.

It sets the first visual impression and frames the app's search workflow.

#### `Website/frontend/src/Components/Home/FindFlat.jsx`

The search form for home-page property lookup.

It handles location suggestions, bedroom count, property type, and form submission.

#### `Website/frontend/src/Components/Home/SearchResult.jsx`

Displays filtered search results returned from the Node API.

It also adds wishlist support.

#### `Website/frontend/src/Components/Home/AllFlats.jsx`

Displays the main paginated property feed.

It implements infinite scroll by asking Redux for the next page when the user nears the bottom.

#### `Website/frontend/src/Components/Prediction/Prediction.jsx`

The main ML prediction form.

It:

- collects property features
- sends them to the Node prediction route
- shows the predicted price
- renders the recommendation cards returned in the same response
- stores per-user history in localStorage

#### `Website/frontend/src/Components/Prediction/HistoryTable.jsx`

Shows previous prediction queries for the current user.

#### `Website/frontend/src/Components/Prediction/Recommendation.jsx`

Shows recommendation results after prediction.

This component now only renders the recommendation array it receives from the prediction page.
It no longer dispatches a second request on its own.

#### `Website/frontend/src/Components/PropertyDetailsPage/Details.jsx`

Shows the main body of the property details page.

#### `Website/frontend/src/Components/PropertyDetailsPage/SuggestedProperty.jsx`

Shows similar properties.

It combines Django similarity ranking with Node data hydration.

For the prediction page, the working flow now stays inside Node so the browser does not need to reach Django directly.

#### `Website/frontend/src/Components/Analysis/*`

These are the visualization components that turn data into charts and insights.

Examples:

- bar plot
- box plot
- histogram
- heatmap
- pie chart
- scatter plot
- insight cards

### Frontend State and Utilities

#### `Website/frontend/src/RTK/store.js`

Creates the Redux store and registers each slice reducer.

#### `Website/frontend/src/RTK/Slices/SearchSlice.js`

Manages search API calls and state.

#### `Website/frontend/src/RTK/Slices/allDataSlice.js`

Manages paginated listing state.

#### `Website/frontend/src/RTK/Slices/PropertyDetailsSlice.js`

Manages one-property detail fetches.

#### `Website/frontend/src/RTK/Slices/PredictionRecommendationSlice.js`

Legacy recommendation hydrator kept for the older two-step flow.
The current prediction page gets its recommendations from the Node prediction endpoint directly.

#### `Website/frontend/src/utils/auth.js`

Manages persistent auth state in localStorage.

#### `Website/frontend/src/utils/propertyUtils.js`

Contains helpers for property images, location aliasing, and display-friendly normalization.

#### `Website/frontend/src/others/Keywords.js`

Provides location keyword lists used for suggestion UIs.

### Backend Entry and Routing

#### `Website/Backend/server.js`

The main Express app.

It loads env vars, configures middleware, mounts routes, starts MongoDB when available, and starts the server.

#### `Website/Backend/Routes/authRoute.js`

Auth endpoints for signup, login, profile lookup, profile update, and password change.

#### `Website/Backend/Routes/adminRoute.js`

Admin-only endpoints for summary, users, role updates, and property CRUD.

#### `Website/Backend/Routes/ClientDataRoute.js`

Search endpoint used by the homepage search form.

#### `Website/Backend/Routes/allDataRoute.js`

Paginated property feed endpoint.

#### `Website/Backend/Routes/singlePropertyRoute.js`

Fetches one property by ID.

#### `Website/Backend/Routes/SinglePropertyRecommendationRoute.js`

Hydrates a list of property IDs into full property documents.

#### `Website/Backend/Routes/PredictionRoute.js`

Receives the prediction form submission from the React app and returns the price estimate plus recommendation cards.

#### `Website/Backend/Routes/PredictionRecommendationRouter.js`

Receives prediction-based recommendation requests.

### Backend Controllers

#### `Website/Backend/Controllers/authController.js`

Implements the authentication and profile logic.

It validates input, creates users, checks passwords, signs JWTs, updates profile fields, and changes passwords.

#### `Website/Backend/Controllers/adminController.js`

Implements the admin dashboard behavior.

It returns summaries, lists users, changes roles, and manages properties.

#### `Website/Backend/Controllers/searchController.js`

Turns search form input into a database query and returns matching flats.

#### `Website/Backend/Controllers/allDataController.js`

Fetches one paginated chunk of properties.

#### `Website/Backend/Controllers/singlePropertyController.js`

Fetches a single property by ID.

#### `Website/Backend/Controllers/SinglePropertyRecommendationController.js`

Accepts property IDs and returns the matching full property objects.

#### `Website/Backend/Controllers/PredictionRecommendationController.js`

Accepts a list of candidate IDs and returns details plus similarity metadata.

### Backend Database and Fallback Layers

#### `Website/Backend/db/db.js`

Reads the MongoDB URI from env and opens the Mongoose connection.

#### `Website/Backend/db/FlatModel.js`

Defines the schema for property documents.

#### `Website/Backend/db/UserModel.js`

Defines the schema for user documents.

#### `Website/Backend/db/userStore.js`

Abstracts user storage so the app can use Mongo or a local JSON file.

#### `Website/Backend/db/localDataStore.js`

Abstracts property data access and fallback behavior.

It is responsible for:

- pagination
- filtering
- lookup by ID
- lookup by `PROP_ID`
- filtered analytics output

#### `Website/Backend/data/users.json`

The fallback local user store written when MongoDB is unavailable.

### Backend Middleware

#### `Website/Backend/Middleware/authMiddleware.js`

Verifies JWTs and loads the authenticated user into the request.

#### `Website/Backend/Middleware/adminMiddleware.js`

Blocks access unless the authenticated user has the admin role.

### Backend Utilities

#### `Website/Backend/utils/password.js`

Hashes and verifies passwords.

#### `Website/Backend/utils/jwt.js`

Signs tokens and validates them.

#### `Website/Backend/utils/validation.js`

Validates auth and profile payloads before they reach the database layer.

#### `Website/Backend/utils/location.js`

Normalizes location names and helps the search logic treat aliases as the same place.

### Django Files

#### `Website/ml/manage.py`

Standard Django command runner.

#### `Website/ml/ml/settings.py`

Configures installed apps, middleware, database location, and CORS.

#### `Website/ml/ml/urls.py`

Connects Django URL paths to the two feature apps.

#### `Website/ml/prediction/views.py`

Implements price prediction logic.

#### `Website/ml/Recommendation/views.py`

Implements similarity ranking logic.

#### `Website/ml/ml/property_data.py`

Provides the data source used by the Django services.

#### `Website/ml/pkl/prediction_df.pkl`

The fallback data file used when the app needs local prediction/analysis rows.

#### `Website/ml/db.sqlite3`

Django's local SQLite database used for the Python side of the project.

## Request Lifecycle At A Glance

### Example: Search a flat

1. User types location and filters into the home page search form.
2. `FindFlat.jsx` dispatches a Redux thunk.
3. The thunk sends a request to `POST /api/clientData`.
4. Node validates the payload and builds a query.
5. `localDataStore.js` checks Mongo first, then fallback data.
6. The response comes back as a list of flats.
7. React shows the matching cards.

### Example: Save a property

1. User clicks the heart icon.
2. Frontend checks whether the user is signed in.
3. The property is stored in localStorage under a user-specific wishlist key.
4. The UI updates instantly without a server round-trip.

### Example: Predict a price

1. User enters property features on the prediction page.
2. React sends the feature payload to `POST /api/prediction/submit`.
3. Node normalizes the values and scores comparable properties.
4. Node calculates a weighted predicted price.
5. Node returns the price band and recommendation cards together.
6. React displays the value and the recommendations under the form.

### Example: Admin changes a user role

1. Admin opens the dashboard.
2. React sends a request with the JWT auth header.
3. Node verifies the token and admin role.
4. Backend updates the user role in the database or fallback store.
5. The dashboard refreshes the user list.

## What To Say If Someone Asks "Why This Design?"

- React gives a responsive, component-based UI.
- Redux keeps async app state predictable across many pages.
- Axios keeps API calls clean and consistent.
- Node/Express is ideal for auth, CRUD, and app orchestration.
- Django is isolated for the ML-style logic so prediction code does not clutter the main app API.
- MongoDB is the primary persistent store, but the fallback layer keeps the project runnable in more environments.

## If You Want To Go Even Further

The next things worth documenting would be:

1. a sequence diagram for each request flow
2. a database schema map for Mongo, JSON, and SQLite
3. a "how to run locally" setup section with exact env values
4. a "common interview questions" appendix
