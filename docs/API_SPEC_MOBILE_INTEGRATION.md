# Chatter Backend API Spec for Mobile Integration

## 1. Purpose and Scope

This document is the single integration spec for mobile clients.
It covers all currently implemented backend interfaces:

1. HTTP APIs (Express): auth, conversation, health.
2. Realtime APIs (Socket.IO): auth fallback, join, history, send, typing.

Goal: help mobile teams integrate correctly with minimal guesswork.

---

## 2. Runtime Endpoints

## 2.1 HTTP

1. Base URL: http://localhost:3000
2. API Prefix: /api/v1
3. Swagger Docs: http://localhost:3000/docs

## 2.2 Realtime (Socket.IO)

1. Socket URL: http://localhost:3001
2. Socket Path: /socket.io

---

## 3. Common Conventions

## 3.1 Data Types

1. IDs are returned as numeric strings (example: "1", "42").
2. Timestamps are ISO 8601 strings (example: "2026-03-19T10:20:30.000Z").
3. Use UTF-8 JSON for HTTP payloads.

## 3.2 HTTP Headers

1. Content-Type: application/json
2. Authorization: Bearer <accessToken> for protected endpoints

## 3.3 Standard HTTP Response Envelope

Every HTTP response uses this structure:

```json
{
	"success": true,
	"message": "...",
	"data": {},
	"metadata": {},
	"errors": []
}
```

Rules:

1. success=true responses typically include data.
2. success=false responses may include errors array with field-level issues.
3. metadata is only used for paginated responses (currently not used in conversation list).

## 3.4 Standard Validation Error Shape (HTTP)

```json
{
	"success": false,
	"message": "Validation failed",
	"errors": [
		{
			"field": "password",
			"code": "too_small",
			"message": "Password must be at least 8 characters"
		}
	]
}
```

---

## 4. Authentication Model

## 4.1 Access Token

1. Issued on register/login and valid for 30 minutes.
2. Signed with JWT_SECRET.
3. Must be sent as Bearer token for protected HTTP APIs.
4. Can also be used for Socket.IO handshake auth.

## 4.2 Refresh Token

1. Issued on register/login and valid based on JWT_REFRESH_EXPIRES_IN (default 10 days).
2. Stored server-side as hash in user_sessions.
3. Refresh flow revokes old session and issues a new token pair.

Important:

1. Refresh endpoint returns new accessToken and refreshToken.
2. Refresh response does not include user object.

---

## 5. HTTP API Specification

## 5.1 Health Check

1. Method: GET
2. Path: /health
3. Auth: none

Success response (200):

```json
{
	"success": true,
	"message": "Health check success",
	"data": {
		"status": "ok"
	}
}
```

---

## 5.2 Register

1. Method: POST
2. Path: /api/v1/auth/register
3. Auth: none

Request body:

```json
{
	"username": "johndoe",
	"email": "john@example.com",
	"password": "Secret123",
	"displayName": "John Doe"
}
```

Validation rules:

1. username: string, trimmed, min 3, max 50.
2. email: valid email, max 255.
3. password: min 8, max 72.
4. displayName: optional, trimmed, min 1 if provided, max 100.

Success response (201):

```json
{
	"success": true,
	"message": "Register success",
	"data": {
		"user": {
			"id": "1",
			"username": "johndoe",
			"email": "john@example.com",
			"displayName": "John Doe",
			"avatarUrl": null,
			"createdAt": "2026-03-19T08:00:00.000Z"
		},
		"accessToken": "<jwt-access-token>",
		"refreshToken": "<jwt-refresh-token>"
	}
}
```

Error responses:

1. 400 Validation failed
2. 409 Email already exists or Username already exists
3. 500 Internal server error

---

## 5.3 Login

1. Method: POST
2. Path: /api/v1/auth/login
3. Auth: none

Request body:

```json
{
	"emailOrUsername": "john@example.com",
	"password": "Secret123"
}
```

Validation rules:

1. emailOrUsername: required, trimmed, non-empty.
2. password: required, non-empty.

Behavior:

1. If input contains @, backend treats it as email lookup.
2. Otherwise backend treats it as username lookup.

Success response (200):

```json
{
	"success": true,
	"message": "Login success",
	"data": {
		"user": {
			"id": "1",
			"username": "johndoe",
			"email": "john@example.com",
			"displayName": "John Doe",
			"avatarUrl": null,
			"createdAt": "2026-03-19T08:00:00.000Z"
		},
		"accessToken": "<jwt-access-token>",
		"refreshToken": "<jwt-refresh-token>"
	}
}
```

Error responses:

1. 400 Validation failed
2. 401 Invalid credentials
3. 500 Internal server error

---

## 5.4 Refresh Token

1. Method: POST
2. Path: /api/v1/auth/refresh-token
3. Auth: none

Request body:

```json
{
	"refreshToken": "<jwt-refresh-token>"
}
```

Validation rules:

1. refreshToken: required, trimmed, non-empty.

Success response (200):

```json
{
	"success": true,
	"message": "Refresh token success",
	"data": {
		"accessToken": "<jwt-access-token-new>",
		"refreshToken": "<jwt-refresh-token-new>"
	}
}
```

Error responses:

1. 400 Validation failed
2. 401 Invalid refresh token
3. 500 Internal server error

---

## 5.5 Create Conversation

1. Method: POST
2. Path: /api/v1/conversation
3. Auth: required (Bearer access token)

Request body:

```json
{
	"type": "group",
	"title": "Team Backend",
	"memberIds": ["2", "3"]
}
```

Validation rules:

1. type: one of direct, group, channel. Default direct.
2. memberIds: array of numeric strings, minimum 1 item.
3. direct requires exactly 1 memberId.
4. group/channel requires title.
5. title if provided: trimmed, min 1, max 255.

Business rules:

1. memberIds must not include current user id.
2. All member IDs must exist and not be soft-deleted.
3. Creator is auto-added as owner.
4. Other members are added as member role.

Success response (201):

```json
{
	"success": true,
	"message": "Create conversation success",
	"data": {
		"id": "10",
		"type": "group",
		"title": "Team Backend",
		"avatarUrl": null,
		"createdBy": "1",
		"createdAt": "2026-03-19T09:00:00.000Z",
		"updatedAt": "2026-03-19T09:00:00.000Z",
		"members": [
			{
				"userId": "1",
				"role": "owner",
				"joinedAt": "2026-03-19T09:00:00.000Z"
			},
			{
				"userId": "2",
				"role": "member",
				"joinedAt": "2026-03-19T09:00:00.000Z"
			}
		]
	}
}
```

Error responses:

1. 400 Validation failed
2. 400 Invalid user id in access token
3. 400 memberIds must not include current user id
4. 401 Unauthorized
5. 404 One or more members do not exist
6. 500 Internal server error

---

## 5.6 Get Conversation List

1. Method: GET
2. Path: /api/v1/conversation
3. Auth: required (Bearer access token)

Request body: none

Success response (200):

```json
{
	"success": true,
	"message": "Get conversation list success",
	"data": [
		{
			"id": "10",
			"type": "group",
			"title": "Team Backend",
			"avatarUrl": null,
			"createdBy": "1",
			"createdAt": "2026-03-19T09:00:00.000Z",
			"updatedAt": "2026-03-19T09:10:00.000Z",
			"members": [
				{
					"userId": "1",
					"role": "owner",
					"joinedAt": "2026-03-19T09:00:00.000Z"
				},
				{
					"userId": "2",
					"role": "member",
					"joinedAt": "2026-03-19T09:00:00.000Z"
				}
			]
		}
	]
}
```

Ordering behavior:

1. Sort by last_message_at desc.
2. Then updated_at desc.
3. Then id desc.

Error responses:

1. 400 Invalid user id in access token
2. 401 Unauthorized
3. 500 Internal server error

---

## 6. Realtime API Specification (Socket.IO)

## 6.1 Connection and Auth

Socket config:

1. URL: http://localhost:3001
2. Path: /socket.io
3. Recommended transport: websocket

Handshake auth (recommended):

```json
{
	"auth": {
		"token": "<access-token>"
	}
}
```

Alternative auth fields accepted at handshake:

1. auth.authorization = Bearer <access-token>
2. headers.authorization = Bearer <access-token>

Fallback event after connected:

1. Emit auth:login with token if handshake did not include token.

---

## 6.2 Realtime Ack Envelope

All ack callbacks return:

Success:

```json
{
	"ok": true,
	"event": "message:send",
	"timestamp": "2026-03-19T10:00:00.000Z",
	"data": {}
}
```

Error:

```json
{
	"ok": false,
	"event": "message:send",
	"timestamp": "2026-03-19T10:00:00.000Z",
	"error": {
		"code": "validation_failed",
		"message": "Validation failed",
		"details": [
			{
				"field": "content",
				"code": "custom",
				"message": "content is required for text message"
			}
		]
	}
}
```

Error codes currently used:

1. unauthorized
2. forbidden
3. validation_failed
4. internal_error

---

## 6.3 Event: auth:login (client -> server)

Purpose:

1. Authenticate connected socket via token when handshake auth is missing.

Payload:

```json
{
	"token": "<access-token>"
}
```

Ack success data:

```json
{
	"userId": "1"
}
```

Common errors:

1. unauthorized when token invalid
2. validation_failed when token is missing

---

## 6.4 Event: conversation:join (client -> server)

Purpose:

1. Authorize membership.
2. Join conversation room.
3. Trigger conversation history delivery.

Payload:

```json
{
	"conversationId": "10",
	"limit": 30,
	"cursor": null
}
```

Payload rules:

1. conversationId: required numeric string.
2. limit: optional int 1..100, default 30.
3. cursor: optional object { createdAt: ISO datetime, id: numeric string }.

Ack success data:

```json
{
	"conversationId": "10",
	"joined": true
}
```

Server emit after successful join:

Event: conversation:history

```json
{
	"conversationId": "10",
	"messages": [
		{
			"id": "101",
			"conversationId": "10",
			"senderId": "1",
			"type": "text",
			"content": "hello",
			"metadata": null,
			"replyToMessageId": null,
			"createdAt": "2026-03-19T10:10:00.000Z"
		}
	],
	"nextCursor": {
		"createdAt": "2026-03-19T10:10:00.000Z",
		"id": "101"
	}
}
```

Common errors:

1. unauthorized when socket is not authenticated
2. forbidden when user is not a conversation member
3. validation_failed for invalid payload

---

## 6.5 Event: message:send (client -> server)

Purpose:

1. Persist message in DB.
2. Update conversation last_message fields.
3. Return ack to sender.
4. Broadcast message:new to other users in room.

Payload:

```json
{
	"clientMessageId": "a-1710000000000",
	"conversationId": "10",
	"type": "text",
	"content": "Hello team",
	"metadata": null,
	"replyToMessageId": null
}
```

Payload rules:

1. clientMessageId: required, non-empty, max 120.
2. conversationId: required numeric string.
3. type: text, image, file, or system.
4. content: optional nullable string, max 4000.
5. If type=text then content is required and cannot be empty after trim.
6. metadata: optional JSON or null.
7. replyToMessageId: optional numeric string or null.

Ack success data:

```json
{
	"clientMessageId": "a-1710000000000",
	"message": {
		"id": "102",
		"conversationId": "10",
		"senderId": "1",
		"type": "text",
		"content": "Hello team",
		"metadata": null,
		"replyToMessageId": null,
		"createdAt": "2026-03-19T10:11:00.000Z"
	}
}
```

Broadcast event to room peers (excluding sender):

Event: message:new

```json
{
	"message": {
		"id": "102",
		"conversationId": "10",
		"senderId": "1",
		"type": "text",
		"content": "Hello team",
		"metadata": null,
		"replyToMessageId": null,
		"createdAt": "2026-03-19T10:11:00.000Z"
	}
}
```

Common errors:

1. unauthorized when socket is not authenticated
2. forbidden when user is not a conversation member
3. validation_failed for payload issues

---

## 6.6 Event: message:typing (client -> server)

Purpose:

1. Notify other members that current user started or stopped typing.

Payload:

```json
{
	"conversationId": "10",
	"isTyping": true
}
```

Payload rules:

1. conversationId: required numeric string.
2. isTyping: required boolean.

Ack success data:

```json
{
	"conversationId": "10",
	"accepted": true
}
```

Broadcast event to room peers (excluding sender):

Event: message:typing

```json
{
	"conversationId": "10",
	"userId": "1",
	"isTyping": true,
	"at": "2026-03-19T10:11:30.000Z"
}
```

Common errors:

1. unauthorized when socket is not authenticated
2. forbidden when user is not a conversation member
3. validation_failed for payload issues

---

## 7. Error Catalog for Mobile Mapping

## 7.1 HTTP Error Messages (current)

1. Unauthorized
2. Invalid access token
3. Invalid or expired access token
4. Validation failed
5. Invalid credentials
6. Invalid refresh token
7. Email already exists
8. Username already exists
9. One or more members do not exist
10. memberIds must not include current user id
11. Invalid user id in access token
12. Internal server error

## 7.2 Realtime Error Codes and Messages (current)

1. code=unauthorized, message=Unauthorized
2. code=forbidden, message=You are not a member of this conversation
3. code=validation_failed, message=Validation failed
4. code=internal_error, message=<server error message>

---

## 8. Mobile Integration Flows

## 8.1 App Startup and Session Restore

1. Load persisted accessToken and refreshToken.
2. If access token exists, call GET /api/v1/conversation.
3. If unauthorized, call POST /api/v1/auth/refresh-token.
4. If refresh success, retry protected requests.
5. If refresh fails, go to login screen.

## 8.2 Realtime Connection Flow

1. Connect Socket.IO with handshake token.
2. On connect_error due to auth, refresh token via HTTP and reconnect.
3. After connect, emit conversation:join when user opens a chat room.
4. Render conversation:history.
5. Send message with message:send and optimistic UI.
6. Update typing state with message:typing.

## 8.3 Message Reliability Recommendations

1. Keep clientMessageId unique per message.
2. Mark outgoing message as pending until ack ok=true.
3. If ack fails, show retry UI.
4. Deduplicate by server message.id when reconciling local state.

---

## 9. Testing Checklist for Mobile Team

1. Register with valid and invalid payloads.
2. Login by email and by username.
3. Refresh token with valid and revoked tokens.
4. Create direct/group/channel conversation rule checks.
5. Verify bearer token errors for protected HTTP endpoints.
6. Join conversation and validate history cursor behavior.
7. Send text message valid and invalid (empty content for type=text).
8. Verify message:new received on second client.
9. Verify message:typing ON and OFF on second client.
10. Verify reconnect and token-expired behavior.

---

## 10. Implementation Notes

1. Current CORS is configured for specific localhost and ngrok origins.
2. Native mobile apps are not browser-origin based, but webview clients still need allowed origin.
3. Keep all IDs as strings in mobile domain layer to avoid bigint overflow risks.
4. Preserve server-provided timestamps for canonical ordering.

---

## 11. Change Management

When backend contracts change, update this document in the same pull request.
Recommended process:

1. Update route or socket handler.
2. Update Swagger and/or realtime docs.
3. Update this API spec document.
4. Re-run integration scripts and client-test scenarios.
