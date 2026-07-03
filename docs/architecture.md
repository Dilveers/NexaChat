# Architecture

NexaChat uses a Firebase serverless realtime design:

1. Users sign in with Firebase Authentication.
2. Protected pages are wrapped by the application auth guard.
3. Chat, group, profile, friend, settings, and block data are stored in Cloud Firestore.
4. Firestore realtime listeners synchronize chat lists, message rooms, typing state, presence, and requests.
5. Firebase Storage stores message attachments and future profile/group media.
6. Firestore and Storage security rules enforce signed-in access, user ownership, and chat/group membership.
7. Firebase Hosting serves the Next.js frontend.

## DynamoDB Tables

Primary Firestore collections:

- `users/{userId}`
- `presence/{userId}`
- `friends/{friendshipId}`
- `friendRequests/{requestId}`
- `chats/{chatId}/messages/{messageId}`
- `groups/{groupId}/messages/{messageId}`
- `archivedChats/{docId}`
- `deletedChats/{docId}`
- `mutedChats/{docId}`
- `blockedUsers/{docId}`
- `notificationState/{docId}`
- `forwardQueue/{userId}`

## Scalability Notes

- Firestore realtime listeners remove the need to manage a dedicated socket server.
- Firebase Authentication handles managed identity and session state.
- Firebase Hosting and managed backend services scale automatically.
- Firestore security rules reduce the need for trusted client-side checks.
- High-volume group chats should use paginated message queries and carefully scoped listeners.
