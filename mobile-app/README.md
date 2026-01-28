# Gated Community Mobile App

This is the React Native / Expo mobile application for the Gated Community System.

## Setup

1. Navigate to the mobile app directory:
   ```bash
   cd gated-community-system/mobile-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

## Features

- **Multi-tenant Architecture**: Dynamic branding and context based on selected community.
- **Persistence**: Remembers selected community across app restarts (using AsyncStorage).
- **Styling**: Glassmorphism, Dark Theme, and Gradients inspired by the design docs.

## Structure

- `src/screens/LandingScreen.tsx`: Community selection page (fetches from API).
- `src/screens/LoginScreen.tsx`: Tenant-specific login page.
- `src/utils/storage.ts`: Persistence logic.
- `src/constants/theme.ts`: Shared styling constants.
