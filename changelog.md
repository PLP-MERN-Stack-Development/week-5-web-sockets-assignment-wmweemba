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

## [0.3.0] - 2025-07-13
### Added
- Implemented private messaging between users: users can select another user from the online list and send/receive private messages in a separate chat thread.

## [0.3.1] - 2025-07-13
### Added
- Implemented multiple chat rooms/channels: users can create, join, and switch between rooms, and messages are sent/received per room.

## [0.3.2] - 2025-07-13
### Added
- Enhanced typing indicator to work per room and per private chat, both on the client and server.

## [0.3.3] - 2025-07-13
### Added
- Enabled file and image sharing in chat: users can upload and send files/images in rooms and private chats, with images displayed inline and other files as download links.

## [0.3.4] - 2025-07-13
### Added
- Implemented read receipts: messages are marked as read when viewed, and a 'Read by' indicator is shown for each message.

## [0.3.5] - 2025-07-13
### Added
- Added message reactions: users can react to messages with like, love, laugh, wow, sad, and party, and see reaction counts.

## [0.3.6] - 2025-07-13
### Added
- Real-time unread message count for rooms and private chats, and system notifications when users join or leave a room.

## [0.3.7] - 2025-07-13
### Added
- Sound and browser notifications for new messages in inactive chats, using the Web Notifications API and a notification sound.

## [0.3.8] - 2025-07-13
### Fixed
- Room synchronization: rooms are now managed on the server and broadcast to all clients, so all users see and can join any created room in real time.

## [0.3.9] - 2025-07-13
### Added
- Message pagination for loading older messages in chat rooms.
- Robust reconnection logic and UI indicator for disconnections.
- Message delivery acknowledgment with checkmark for delivered messages.
- Message search bar to filter messages in the current chat.
- Responsive design for mobile and desktop devices.
- Logout button to log the user out and return to the login modal.
