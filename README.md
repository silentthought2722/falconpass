# FalconPass - Secure Zero-Knowledge Password Manager

FalconPass is a modern, secure password manager that uses zero-knowledge architecture to ensure your passwords are encrypted with your master password before they ever leave your device. This means that even if our servers were compromised, your passwords would remain secure.

## Features

- **Zero-Knowledge Architecture**: All encryption/decryption happens client-side
- **Strong Encryption**: XChaCha20-Poly1305 for data encryption and Argon2id for key derivation
- **Two-Factor Authentication**: WebAuthn (FIDO2) support for passwordless second factor
- **Secure Password Generator**: Create strong, unique passwords
- **Auto-Lock**: Automatically locks your vault after a period of inactivity
- **Clipboard Clearing**: Automatically clears sensitive data from clipboard
- **Import/Export**: Securely import and export your encrypted vault
- **Search & Tags**: Easily find and organize your passwords
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS

## Tech Stack

### Frontend
- React with TypeScript
- Vite for fast development and building
- Tailwind CSS with shadcn/ui components
- Zustand for state management
- XChaCha20-Poly1305 for encryption (via TweetNaCl.js)
- Argon2id for key derivation

### Backend
- Node.js with TypeScript
- Fastify for high-performance API
- MySQL database with Knex.js
- JWT for secure authentication
- WebAuthn for two-factor authentication

### DevOps
- Docker and docker-compose for easy development and deployment
- GitHub Actions for CI/CD

## Security Architecture

FalconPass uses a zero-knowledge architecture where:

1. **Master Password**: Never sent to the server, used to derive encryption keys
2. **Challenge-Response Authentication**: Secure authentication without sending passwords
3. **Client-Side Encryption**: All sensitive data is encrypted before leaving your device
4. **WebAuthn 2FA**: Optional hardware security key or biometric authentication

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and docker-compose (optional, for containerized setup)
- MySQL 8.0+ (if not using Docker)

### Development Setup

#### Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/falcon-pass.git
   cd falcon-pass
   ```

2. Start the containers:
   ```bash
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/documentation

#### Manual Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/falcon-pass.git
   cd falcon-pass
   ```

2. Set up the backend:
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Edit the .env file with your configuration
   npm run migrate
   npm run dev
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## API Documentation

The API documentation is available at http://localhost:3000/documentation when the backend is running.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details."# falconpass" 
