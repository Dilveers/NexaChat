# Development Notes

## First Milestone

- Frontend chat screen runs locally in demo mode.
- AWS SAM template defines Cognito, WebSocket API Gateway, Lambda, DynamoDB, and CloudWatch logs.
- Lambda handlers support connect, disconnect, send message, and message history.

## Environment Values

Create `frontend/.env.local` after backend deployment:

```bash
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-api-id.execute-api.ap-south-1.amazonaws.com/dev
NEXT_PUBLIC_COGNITO_DOMAIN=your-domain-prefix.auth.ap-south-1.amazoncognito.com
NEXT_PUBLIC_COGNITO_CLIENT_ID=your-user-pool-client-id
NEXT_PUBLIC_AUTH_REDIRECT_URI=http://localhost:3000
```

## Next Coding Tasks

- Add proper sign-up and sign-out flow around Cognito hosted UI.
- Add room list and direct message views.
- Add message delivery states.
- Add unit tests for Lambda handlers.
- Add an Artillery or k6 test run against the deployed WebSocket endpoint.

