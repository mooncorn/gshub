# Game Server Hub

Game Server Hub is a video game server management tool where users can easily setup and control servers. It currently supports Minecraft and Valheim servers.

## Features

- **Server management:** Create, modify, and monitor custom servers.

- **Lifecycle control:** Read real-time server status. Startup and gracefully shutdown servers.

- **Console:** Monitor real-time console logs and execute commands.

- **Files:** Browse server files and edit file content.

- **Whitelist:** Manage access to minecraft servers.

- **Worlds:** Upload new worlds to minecraft servers.

## Technologies Used

- **next-app:** React with Next.js, Typescript, NextAuth for authentication, Tailwindcss, Socket.io-client for real-time updates.

- **api:** Node.js with Express.js, Typescript, and Socket.io for real-time updates.

## Motivation

Game Server Hub was developed to avoid paying for other video game hosting services, and for learning purposes. This project is currently running in production at zero cost. The API and database is hosted on a spare PC, and the client is on vercel. The website is meant to be used by friends to quickly setup custom servers and manage existing ones.

## Contributing

Contributions are welcome! If you have any improvements or new features to add, feel free to submit a pull request.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for more details.
