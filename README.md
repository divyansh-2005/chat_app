Certainly! Here’s an updated README that includes a reference to the Socket.IO documentation:

---

# Chat App

A real-time chat application built with Node.js, Express, Socket.IO, and SQLite. This app demonstrates how to handle chat messages, user nicknames, and typing notifications, with support for clustering to improve performance.

## Features

- Real-time chat messaging
- User nickname management
- Typing indicators
- Persistent message storage with SQLite
- Clustering support for improved performance with multiple CPU cores

## Technologies Used

- **Node.js**: JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Express**: Fast, unopinionated, minimalist web framework for Node.js.
- **Socket.IO**: Real-time communication library enabling real-time, bidirectional and event-based communication. [Socket.IO Documentation](https://socket.io/docs/)
- **SQLite**: Lightweight, disk-based database.
- **@socket.io/cluster-adapter**: Socket.IO adapter for handling clustering and distributing messages across multiple processes.

## Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd chat_app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

## Usage

1. **Start the server:**

   To start the server in development mode with automatic restarts, use:

   ```bash
   npm run dev
   ```

   For production, use:

   ```bash
   npm start
   ```

2. **Access the application:**

   Open your web browser and navigate to:

   ```
   http://localhost:3000
   ```

## Code Structure

- **`index.js`**: The main server file, setting up Express, Socket.IO, SQLite, and clustering.
- **`index.html`**: The client-side HTML and JavaScript for the chat interface.
- **`package.json`**: Contains metadata and dependencies for the project.

## Application Flow

1. **Server Initialization:**
   - Sets up Express and Socket.IO server.
   - Uses SQLite for message storage.
   - Clusters the application to utilize multiple CPU cores for better performance.

2. **Client Interaction:**
   - Users can set their nickname.
   - Users can send and receive chat messages.
   - Typing indicators are shown when users are typing.
   - Previous messages are sent to new clients upon connection.

## Cluster Setup

The application uses Node.js clustering to distribute incoming connections across multiple worker processes. Each worker listens on a different port. To use clustering:

1. Ensure the `PORT` environment variable is set in each worker (handled automatically in the script).

## SQLite Setup

The application uses SQLite to store chat messages. The database file is named `chat.db`, and it is automatically created if it does not exist.

## Dependencies

- **Express**: Web framework for Node.js.
- **Socket.IO**: Real-time communication library. [Socket.IO Documentation](https://socket.io/docs/)
- **SQLite3**: Database driver for SQLite.
- **@socket.io/cluster-adapter**: Cluster adapter for Socket.IO.

## Acknowledgements

- [Socket.IO](https://socket.io/docs/)
- [Express](https://expressjs.com/)
- [SQLite](https://www.sqlite.org/)
- [Node.js](https://nodejs.org/)

