# Chatter Socket.IO Mobile Integration Spec

## 1. Document Goal

This document defines a production-oriented Socket.IO integration guide for mobile clients.
It is intended to be the implementation source of truth for:

1. Realtime message flow.
2. Event contracts and parameter rules.
3. Error handling and reconnection strategy.
4. Client state management for consistent UX.

This document is based on current backend behavior in:

1. src/constants/realtime.constants.ts
2. src/realtime/socket.types.ts
3. src/realtime/socket.server.ts
4. src/realtime/socket.service.ts

---

## 2. Runtime Configuration

## 2.1 Endpoint

1. Socket URL: http://localhost:3001
2. Socket Path: /socket.io
3. Recommended transport: websocket

## 2.2 Authentication Sources Accepted by Server

During handshake, server accepts token from:

1. auth.token
2. auth.authorization (Bearer token format)
3. headers.authorization (Bearer token format)

Fallback auth event after connect is supported:

1. auth:login

---

## 3. Realtime Event Catalog

## 3.1 Client -> Server Events

1. auth:login
2. conversation:join
3. message:send
4. message:typing

## 3.2 Server -> Client Events

1. conversation:history
2. message:new
3. message:typing

## 3.3 Built-in Connection Lifecycle Events

1. connect
2. connect_error
3. disconnect

---

## 4. Realtime Message Flow (End-to-End)

## 4.1 Connect and Authenticate

1. Client connects with access token in handshake auth.
2. If handshake token is missing, client may emit auth:login with token.
3. Protected events require authenticated socket context.

Expected integration behavior:

1. Prefer handshake auth as default path.
2. Keep auth:login only as fallback/legacy path.

## 4.2 Open Conversation

1. Client emits conversation:join with conversationId and optional pagination params.
2. Server validates payload and membership.
3. Server joins socket into room conversation:<conversationId>.
4. Server emits conversation:history to that socket.
5. Server acknowledges join request.

## 4.3 Send Message

1. Client emits message:send with clientMessageId and message payload.
2. Server validates payload and membership.
3. Server persists message and updates conversation last-message pointers in DB transaction.
4. Server returns ack to sender.
5. Server broadcasts message:new to other room members.

## 4.4 Typing Indicator

1. Client emits message:typing with conversationId and isTyping.
2. Server validates payload and membership.
3. Server acks sender.
4. Server broadcasts message:typing to other room members.

---

## 5. Acknowledgement Envelope Contract

All ack callbacks follow a strict envelope.

## 5.1 Success Envelope

```json
{
	"ok": true,
	"event": "message:send",
	"timestamp": "2026-03-19T10:00:00.000Z",
	"data": {}
}
```

## 5.2 Error Envelope

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

## 5.3 Error Codes in Current Implementation

1. unauthorized
2. forbidden
3. validation_failed
4. internal_error

Error code mapping recommendation for mobile:

1. unauthorized -> refresh token + reconnect + retry once.
2. forbidden -> show permission/membership warning.
3. validation_failed -> show field-level feedback, do not auto-retry.
4. internal_error -> show retry option with backoff.

---

## 6. Event Specifications

## 6.1 auth:login

Direction: client -> server

Purpose:

1. Authenticate a connected socket when handshake auth is not used.

Payload:

```json
{
	"token": "<access-token>"
}
```

Validation:

1. token is required and non-empty string.

Ack success data:

```json
{
	"userId": "1"
}
```

Common errors:

1. unauthorized (invalid token)
2. validation_failed (missing token)

---

## 6.2 conversation:join

Direction: client -> server

Purpose:

1. Join conversation room.
2. Load message history.

Payload:

```json
{
	"conversationId": "10",
	"limit": 30,
	"cursor": null
}
```

Field rules:

1. conversationId: required numeric string.
2. limit: optional integer 1..100.
3. cursor: optional object or null.
4. cursor.createdAt: ISO datetime.
5. cursor.id: numeric string.

Ack success data:

```json
{
	"conversationId": "10",
	"joined": true
}
```

Server event emitted to same socket: conversation:history

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
		"createdAt": "2026-03-19T10:09:00.000Z",
		"id": "100"
	}
}
```

Membership rule:

1. User must be active member (deleted_at is null and left_at is null).

---

## 6.3 message:send

Direction: client -> server

Purpose:

1. Create new message and distribute it to participants.

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

Field rules:

1. clientMessageId: required, non-empty, max length 120.
2. conversationId: required numeric string.
3. type: one of text, image, file, system.
4. content: optional nullable string, max 4000.
5. For type=text, content is required and cannot be empty after trim.
6. metadata: optional JSON object/array/value or null.
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

Broadcast to other members in room: message:new

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

Persistence behavior:

1. Insert record into messages.
2. Update conversations.last_message_id.
3. Update conversations.last_message_at.

These operations are performed in a DB transaction.

---

## 6.4 message:typing

Direction: client -> server and server -> clients

Purpose:

1. Notify participants when user starts/stops typing.

Client payload:

```json
{
	"conversationId": "10",
	"isTyping": true
}
```

Field rules:

1. conversationId: required numeric string.
2. isTyping: required boolean.

Ack success data:

```json
{
	"conversationId": "10",
	"accepted": true
}
```

Broadcast payload to other members:

```json
{
	"conversationId": "10",
	"userId": "1",
	"isTyping": true,
	"at": "2026-03-19T10:11:30.000Z"
}
```

Mobile UX recommendation:

1. Debounce typing ON emissions.
2. Auto-send typing OFF after inactivity timeout.
3. Clear typing indicators on disconnect or room change.

---

## 7. Mobile Client State Machine

## 7.1 Connection States

1. idle
2. connecting
3. connected
4. authenticating
5. ready
6. reconnecting
7. disconnected

## 7.2 Room States per Conversation

1. not_joined
2. joining
3. joined
4. history_loaded

## 7.3 Outgoing Message States

1. local_pending
2. sending
3. sent
4. failed

Recommended mapping:

1. local_pending -> render optimistic bubble.
2. sent -> replace optimistic id by server id from ack.
3. failed -> keep bubble with retry action.

---

## 8. Retry and Reconnect Strategy

## 8.1 Connect Retry

1. Use exponential backoff with jitter.
2. Limit aggressive retry loops while app is backgrounded.

## 8.2 Event Retry

1. Retry only idempotent-safe operations by policy.
2. For message:send, avoid blind resend; check local pending map by clientMessageId.
3. For conversation:join, safe to retry after reconnect.

## 8.3 Token Expiration Handling

1. On unauthorized ack or connect_error auth failure:
   1.1 call refresh token HTTP API
   1.2 reconnect with new access token
   1.3 rejoin active conversations

---

## 9. Parameter Validation Matrix

## 9.1 conversation:join

1. conversationId invalid format -> validation_failed
2. limit out of range -> validation_failed
3. cursor malformed -> validation_failed

## 9.2 message:send

1. missing clientMessageId -> validation_failed
2. missing conversationId -> validation_failed
3. type not in enum -> validation_failed
4. type=text with empty content -> validation_failed
5. invalid replyToMessageId format -> validation_failed

## 9.3 message:typing

1. missing conversationId -> validation_failed
2. non-boolean isTyping -> validation_failed

---

## 10. Security Rules Relevant to Mobile

1. Never emit protected events without authenticated socket.
2. Never expose accessToken in logs.
3. Do not trust room join from UI state alone; rely on server ack.
4. Handle forbidden as expected business condition (not as network error).

---

## 11. Integration Checklist (Mobile)

1. Connect socket with handshake token.
2. Handle connect, disconnect, connect_error.
3. Implement fallback auth:login only if needed.
4. Join conversation and consume conversation:history.
5. Send message with clientMessageId and ack reconciliation.
6. Listen message:new and merge into timeline.
7. Emit/listen message:typing with debounce and timeout.
8. Implement token refresh + reconnect + rejoin flow.
9. Map all ack error codes to UI actions.
10. Verify dual-client behavior in QA.

---

## 12. QA Scenarios (Must Pass)

1. Valid join and history load.
2. Non-member join/send/typing returns forbidden.
3. Invalid payload returns validation_failed with details.
4. Sender receives message:send ack and peer receives message:new.
5. Typing ON/OFF appears on peer and clears correctly.
6. Reconnect after temporary network loss restores realtime flow.
7. Token expiration path refreshes and recovers session.

---

## 13. Versioning and Change Policy

When any realtime contract changes:

1. Update this document in the same pull request.
2. Update SOCKET_IO_FLOW_SPEC.md if flow semantics changed.
3. Update API_SPEC_MOBILE_INTEGRATION.md if cross-reference fields changed.
4. Re-run integration tests and two-client manual test.
