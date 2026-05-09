# WebSocket Debugger

A browser-based tool for testing and debugging WebSocket connections, with first-class support for **Rails Action Cable**.

![WebSocket Debugger UI](src/assets/hero.png)

## Features

- Connect to any WebSocket URL
- Subscribe to Action Cable channels with custom parameters (e.g. auth tokens, room IDs)
- View real-time incoming messages in a live data stream
- Send JSON data to the connected channel
- Connection status indicators (Connecting, Connected, Disconnected, Rejected)

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Usage

1. Enter your WebSocket URL (default: `ws://localhost:3000/cable`)
2. Enter the channel name (e.g. `CustomerSupportChannel`)
3. Add any extra JSON parameters (e.g. `{ "auth_token": "..." }`)
4. Click **Connect**
5. Incoming messages appear in the Data Stream panel
6. Use the send bar to push JSON data to the channel

## Tech Stack

- [React 19](https://react.dev)
- [Vite](https://vite.dev)
- [@rails/actioncable](https://www.npmjs.com/package/@rails/actioncable)
