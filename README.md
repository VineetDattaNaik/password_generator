# Password Generator

A simple React application to generate secure passwords with customizable options.

## Features

- Adjustable password length (1-50 characters)
- Options to include:
  - Alphabets (A-Z, a-z)
  - Numbers (0-9)
  - Special characters (!@#$%^&*()_+-=[]{}|;:,.<>?)
- Generate passwords using Enter key or button
- Clean, modern interface
- Secure password generation via backend API

## Architecture

This application uses a client-server architecture:
- Frontend: React-based client application
- Backend: Separate server handling password generation logic
  - Ensures better security by keeping generation logic server-side
  - API endpoint for password generation requests

## Setup

### Frontend
1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Start the app:
```bash
npm start
```

### Backend
1. Navigate to the backend directory
2. Install dependencies:
```bash
npm install
```
3. Start the server:
```bash
npm start
```

## Usage

1. Set password length
2. Select character types to include
3. Press Enter or click "Generate Password"
4. Copy your generated password

## Built With

Frontend:
- React
- Create React App
- Modern CSS

Backend:
- Node.js
- Express
- Crypto library for secure password generation

## API Documentation

The backend exposes the following endpoint:

`POST /api/generate-password`
- Request body: 
  ```json
  {
    "length": number,
    "includeUppercase": boolean,
    "includeLowercase": boolean,
    "includeNumbers": boolean,
    "includeSpecial": boolean
  }
  ```
- Response: Generated password string
