# API Documentation

Base URL: `http://localhost:3000/api` (or `http://localhost:8080/api` through nginx)

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Register

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Validation:**
- Username: 3-50 characters, alphanumeric with underscores and hyphens
- Email: Valid email format
- Password: Min 8 characters, must contain uppercase, lowercase, and number

**Response:** `201 Created`
```json
{
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "jwt_token_here"
}
```

**Rate Limit:** 5 requests per 15 minutes

---

### Login

Authenticate and receive JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "usernameOrEmail": "johndoe",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "avatar_url": null
  },
  "token": "jwt_token_here"
}
```

**Rate Limit:** 5 requests per 15 minutes

---

### Get Current User

Get authenticated user's profile.

**Endpoint:** `GET /auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "is_active": true,
    "avatar_url": null,
    "bio": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "last_login": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### Change Password

Change user's password.

**Endpoint:** `POST /auth/change-password`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "oldPassword": "OldPass123",
  "newPassword": "NewSecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password changed successfully"
}
```

---

## Forums

### List All Forums

Get all categories with their forums.

**Endpoint:** `GET /forums`

**Response:** `200 OK`
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "General Discussion",
      "slug": "general",
      "forums": [
        {
          "id": "uuid",
          "name": "Announcements",
          "slug": "announcements",
          "description": "Official announcements",
          "topicCount": 5,
          "postCount": 25
        }
      ]
    }
  ]
}
```

---

### Get Forum

Get a specific forum with its topics.

**Endpoint:** `GET /forums/:categorySlug/:forumSlug`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Example:** `GET /forums/general/announcements?page=1&limit=20`

**Response:** `200 OK`
```json
{
  "forum": {
    "id": "uuid",
    "name": "Announcements",
    "slug": "announcements",
    "description": "Official announcements",
    "category_name": "General Discussion",
    "category_slug": "general"
  },
  "topics": [
    {
      "id": "uuid",
      "title": "Welcome to the Forum",
      "slug": "welcome-to-the-forum",
      "author_username": "admin",
      "author_avatar": null,
      "post_count": 10,
      "view_count": 100,
      "is_pinned": true,
      "is_locked": false,
      "created_at": "2024-01-01T00:00:00.000Z",
      "last_post_at": "2024-01-02T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

---

## Topics

### Get Topic

Get a specific topic with its posts.

**Endpoint:** `GET /topics/:topicId`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:** `200 OK`
```json
{
  "topic": {
    "id": "uuid",
    "title": "Welcome to the Forum",
    "slug": "welcome-to-the-forum",
    "author_username": "admin",
    "author_avatar": null,
    "forum_name": "Announcements",
    "forum_slug": "announcements",
    "category_name": "General Discussion",
    "category_slug": "general",
    "post_count": 10,
    "view_count": 100,
    "is_pinned": true,
    "is_locked": false,
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "posts": [
    {
      "id": "uuid",
      "content": "Welcome to our community!",
      "author_username": "admin",
      "author_avatar": null,
      "author_role": "admin",
      "reaction_count": 5,
      "is_edited": false,
      "edited_at": null,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10,
    "pages": 1
  }
}
```

---

### Create Topic

Create a new topic with first post.

**Endpoint:** `POST /topics`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "forumId": "uuid",
  "title": "My New Topic",
  "content": "This is the first post content..."
}
```

**Validation:**
- Title: 5-255 characters
- Content: Min 10 characters
- ForumId: Valid UUID

**Response:** `201 Created`
```json
{
  "message": "Topic created successfully",
  "topic": {
    "id": "uuid",
    "forum_id": "uuid",
    "user_id": "uuid",
    "title": "My New Topic",
    "slug": "my-new-topic",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Rate Limit:** 10 requests per minute

---

### Update Topic

Update topic title (author or moderator only).

**Endpoint:** `PUT /topics/:topicId`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated Topic Title"
}
```

**Response:** `200 OK`
```json
{
  "message": "Topic updated successfully",
  "topic": {
    "id": "uuid",
    "title": "Updated Topic Title",
    "slug": "updated-topic-title",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### Delete Topic

Delete a topic (author or moderator only).

**Endpoint:** `DELETE /topics/:topicId`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Topic deleted successfully"
}
```

---

### Pin/Unpin Topic

Toggle pin status (moderator/admin only).

**Endpoint:** `POST /topics/:topicId/pin`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Topic pin status updated",
  "topic": {
    "id": "uuid",
    "is_pinned": true
  }
}
```

---

### Lock/Unlock Topic

Toggle lock status (moderator/admin only).

**Endpoint:** `POST /topics/:topicId/lock`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Topic lock status updated",
  "topic": {
    "id": "uuid",
    "is_locked": true
  }
}
```

---

## Posts

### Create Post

Create a reply to a topic.

**Endpoint:** `POST /posts`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "topicId": "uuid",
  "content": "This is my reply to the topic..."
}
```

**Validation:**
- Content: Min 10 characters
- TopicId: Valid UUID

**Response:** `201 Created`
```json
{
  "message": "Post created successfully",
  "post": {
    "id": "uuid",
    "topic_id": "uuid",
    "user_id": "uuid",
    "content": "This is my reply to the topic...",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Rate Limit:** 10 requests per minute

---

### Update Post

Update post content (author or moderator only).

**Endpoint:** `PUT /posts/:postId`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "Updated post content..."
}
```

**Response:** `200 OK`
```json
{
  "message": "Post updated successfully",
  "post": {
    "id": "uuid",
    "content": "Updated post content...",
    "is_edited": true,
    "edited_at": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### Delete Post

Delete a post (author or moderator only).

**Endpoint:** `DELETE /posts/:postId`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Post deleted successfully"
}
```

---

### Add Reaction

Add a reaction to a post.

**Endpoint:** `POST /posts/:postId/reactions`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reactionType": "like"
}
```

**Valid Reaction Types:** `like`, `love`, `helpful`

**Response:** `200 OK`
```json
{
  "message": "Reaction added successfully"
}
```

---

### Remove Reaction

Remove a reaction from a post.

**Endpoint:** `DELETE /posts/:postId/reactions`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reactionType": "like"
}
```

**Response:** `200 OK`
```json
{
  "message": "Reaction removed successfully"
}
```

---

## Users

### Get User Profile

Get public user profile.

**Endpoint:** `GET /users/:username`

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "is_active": true,
    "avatar_url": null,
    "bio": "Hello, I'm John!",
    "created_at": "2024-01-01T00:00:00.000Z",
    "last_login": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### Update Profile

Update own profile.

**Endpoint:** `PUT /users/profile`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "bio": "Updated bio text...",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Response:** `200 OK`
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "bio": "Updated bio text...",
    "avatar_url": "https://example.com/avatar.jpg"
  }
}
```

---

### List Users (Admin Only)

Get list of all users.

**Endpoint:** `GET /users`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:** `200 OK`
```json
{
  "users": [
    {
      "id": "uuid",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "is_active": true,
      "avatar_url": null,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

### Update User Role (Admin Only)

Change user's role.

**Endpoint:** `PUT /users/:userId/role`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "role": "moderator"
}
```

**Valid Roles:** `user`, `moderator`, `admin`

**Response:** `200 OK`
```json
{
  "message": "User role updated successfully",
  "user": {
    "id": "uuid",
    "role": "moderator"
  }
}
```

---

### Toggle User Active Status (Admin Only)

Enable or disable user account.

**Endpoint:** `POST /users/:userId/toggle-active`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "User active status updated successfully"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Must be a valid email address"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

or

```json
{
  "error": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limits

- **General API:** 100 requests per 15 minutes
- **Authentication endpoints:** 5 requests per 15 minutes
- **Content creation endpoints:** 10 requests per minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)
