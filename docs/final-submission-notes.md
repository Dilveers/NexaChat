# Final Submission Notes

## Architecture Suggestions

- Keep Firebase Authentication as the single identity layer for all protected routes.
- Keep chat messages under `chats/{chatId}/messages` and `groups/{groupId}/messages` to scope reads by conversation.
- Use Firebase Cloud Functions or Next.js API routes for privileged operations such as server-side notifications, audit logs, and large group fan-out.
- Store only metadata in Firestore and keep binary attachments in Firebase Storage.
- Add composite Firestore indexes for chat list ordering, pending friend requests, archived chats, muted chats, and message queries.

## Performance Optimization Suggestions

- Paginate message history with `limit()` and `startAfter()` instead of loading full rooms.
- Keep realtime listeners scoped to the current user and active chat only.
- Add image compression before upload and enforce file-size limits in Storage rules.
- Use memoized chat cards and message rows for long lists.
- Run Artillery or k6 tests against message creation, room opening, and group chat listener load.
- Track Core Web Vitals after Firebase Hosting deployment.

## Remaining Issues

- Run real Firebase Emulator tests for `firestore.rules` and `storage.rules`.
- Confirm Firebase project indexes after the first production query errors.
- Replace any legacy AWS backend/infrastructure files if the final submission must be Firebase-only.
- npm audit still reports a moderate PostCSS advisory from Next.js 15.5.20's nested dependency; `npm audit fix --force` would downgrade Next to 9, so it should be tracked until the framework releases a safe patch.
- Add real screenshots after the final hosted deployment.
- Run mobile visual QA on physical devices or browser device emulation.

## Final Readiness Checklist

- [x] Next.js + TypeScript frontend is present.
- [x] Tailwind UI uses responsive sizing and global horizontal overflow protection.
- [x] Protected app sections use `AuthGuard` layouts.
- [x] Browser `alert`, `confirm`, and `prompt` calls are removed.
- [x] Sonner toast notifications are integrated.
- [x] Message and group inputs are validated before writes.
- [x] Firebase Firestore and Storage rules are included.
- [x] TypeScript checks pass.
- [ ] Firebase Emulator rule tests completed.
- [ ] Performance test report completed.
- [ ] Final screenshots captured.
- [ ] Final PDF report generated.
- [ ] Final PPT generated.

## PDF/PPT Section Outline

1. Introduction
2. Objectives
3. Problem Statement
4. Existing System
5. Proposed System
6. System Architecture Diagram
7. Technology Stack
8. Features Implemented
9. Firebase Architecture
10. Authentication Flow
11. Real-Time Messaging Flow
12. Database Schema
13. Screenshots
14. Serverless Benefits
15. Performance Testing
16. Comparison: Serverless vs Traditional Hosting
17. Future Scope
18. Conclusion
19. References
