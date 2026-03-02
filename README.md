# News Aggregator API

Backend API for user authentication, preference-based news fetching, article search, and read/favorite tracking.

## Project Overview

This project provides:

- User registration and login with hashed passwords (`bcrypt`)
- JWT-based authentication middleware for protected routes
- User preference management (`categories`, `languages`)
- News fetching from NewsAPI based on user preferences
- Search endpoint for keyword-based news
- Article tracking (mark as read / favorite)

Tech stack:

- Node.js + Express
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- External API calls with `axios`

## Installation

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Create `.env` in project root:

```env
PORT=3000
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_connection_string
NEWS_API_KEY=your_newsapi_key
```

4. Start server:

```bash
npm start
```

Server runs on `http://localhost:3000` by default.

## Authentication

For protected routes, send:

```http
Authorization: Bearer <jwt_token>
```

## API Endpoints

Base URL: `http://localhost:3000`

### User Routes (`/users`)

#### `POST /users/signup`
Register a new user.

Request body:

```json
{
  "name": "Clark Kent",
  "email": "clark@superman.com",
  "password": "Krypt()n8"
}
```

Response:
- `200` user created
- `400` invalid input
- `409` email already exists

#### `POST /users/login`
Login and get JWT token.

Request body:

```json
{
  "email": "clark@superman.com",
  "password": "Krypt()n8"
}
```

Response:

```json
{
  "token": "<jwt_token>"
}
```

#### `GET /users/verify-token` (Protected)
Verifies token and returns decoded user payload.

#### `GET /users/preferences` (Protected)
Get logged-in user's saved preferences.

Response:

```json
{
  "preferences": {
    "categories": ["sports", "technology"],
    "languages": ["en"]
  }
}
```

#### `PUT /users/preferences` (Protected)
Update logged-in user's preferences.

Request body (any one or both fields):

```json
{
  "categories": ["sports", "technology"],
  "languages": ["en"]
}
```

### News Routes (`/news`) (Protected)

#### `GET /news`
Fetch news articles based on logged-in user's preferences.

Response:

```json
{
  "totalResults": 123,
  "news": [
    {
      "source": "BBC News",
      "author": "Author Name",
      "title": "Headline",
      "description": "Short description",
      "url": "https://example.com/article",
      "urlToImage": "https://example.com/image.jpg",
      "publishedAt": "2026-03-03T10:00:00Z"
    }
  ]
}
```

Note: only up to 5 articles are returned per request.

#### `GET /news/search/:keyword`
Search news by keyword.

Example:

`GET /news/search/bitcoin`

#### `POST /news/:id/read`
Mark an article as read for the logged-in user.

#### `POST /news/:id/favorite`
Mark an article as favorite for the logged-in user.

#### `GET /news/read`
Get all read article IDs for the logged-in user.

#### `GET /news/favorites`
Get all favorite article IDs for the logged-in user.

## Error Handling

Common status codes:

- `200` Success
- `400` Invalid input / bad request
- `401` Unauthorized (invalid or missing token)
- `404` Resource not found
- `409` Duplicate email
- `500` Server/configuration error
- `502` Upstream NewsAPI failure

All errors are returned as:

```json
{
  "message": "Error description"
}
```

## Test

Run tests with:

```bash
npm test
```
