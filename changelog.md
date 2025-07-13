## [0.1.0] - 2025-07-13
### Added
- Initial Express server setup in `server/server.js`.
- Integrated Socket.io for real-time bidirectional communication.
- Configured CORS for Socket.io and Express.
- Added basic connection, user join, message, typing indicator, and disconnect handlers.

## [0.1.1] - 2025-07-13
### Added
- Set up Socket.io client in `client/src/socket/socket.js`.
- Created a custom React hook `useSocket` for managing socket connection, messages, users, and typing indicators.

## [0.1.2] - 2025-07-13
### Added
- Created `.gitignore` file with standard ignores for Node.js, Vite/React, environment files, build output, and IDE/editor files.

## [0.2.0] - 2025-07-13
### Added
- Implemented simple username-based authentication in the React app by prompting for a username and connecting to the server with the chosen username.

## [0.2.1] - 2025-07-13
### Added
- Implemented a global chat room UI in the React app, allowing users to send and receive messages with sender name and timestamp.

## [0.2.2] - 2025-07-13
### Added
- Implemented typing indicators in the chat UI, showing when other users are composing a message.

## [0.2.3] - 2025-07-13
### Added
- Implemented online/offline status for users by displaying a user list with online users in the chat UI.
