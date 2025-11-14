# WhatsApp Dashboard Frontend

Frontend application for WhatsApp Business Cloud API Dashboard.

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Tech Stack

- React 18
- Vite 5
- TailwindCSS 3
- React Router DOM
- Axios
- React Query
- Socket.io Client 4

## Realtime Updates

- The frontend connects to Socket.io (same origin as the API) to receive `message:new`, `message:status` and `conversations:update` events in real time.
- Configure `VITE_SOCKET_URL` if the socket server is hosted on a different origin than `VITE_API_URL`. Otherwise the value from `VITE_API_URL` (minus `/api`) is used automatically.
- The socket client reuses the stored JWT access token; whenever the token refreshes we call `socketService.refreshAuth()` so the realtime feed stays authenticated.

