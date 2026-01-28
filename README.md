# FUBOOKS Mobile App

A complete React Native mobile application for the FUBOOKS book ordering platform, built with Expo.

## Features

- 🔐 **Authentication**: Login and registration with JWT token management
- 📚 **Book Browsing**: Browse, search, and filter books by category
- 🛒 **Shopping Cart**: Add books to cart, manage quantities, and checkout
- 📦 **Order Management**: View order history and track order status
- 💳 **Payment Integration**: Multiple payment methods (Account Payment, Bank Card, Bank Account, Cashier)
- 👤 **User Profile**: View profile information and manage account
- 🎨 **Modern UI**: Clean, responsive design with dark mode support

## Tech Stack

- **Framework**: Expo Router (file-based routing)
- **Language**: TypeScript
- **State Management**: React Context API
- **Storage**: AsyncStorage for local data persistence
- **HTTP Client**: Axios
- **Image Handling**: Expo Image
- **Navigation**: React Navigation (Tabs & Stack)

## Project Structure

```
mobile/
├── app/                    # App screens (Expo Router)
│   ├── (auth)/            # Authentication screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/            # Main tab screens
│   │   ├── index.tsx      # Home
│   │   ├── books.tsx      # Book listing
│   │   ├── books/[id].tsx # Book details
│   │   ├── cart.tsx       # Shopping cart
│   │   ├── orders.tsx     # Order list
│   │   ├── orders/[id].tsx # Order details
│   │   ├── orders/[id]/payment.tsx # Payment
│   │   └── profile.tsx     # User profile
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── BookCard.tsx
│   └── LoadingSpinner.tsx
├── config/                # Configuration
│   └── api.ts            # API configuration
├── contexts/              # React Context providers
│   └── AuthContext.tsx   # Authentication context
├── services/              # API services
│   └── api.ts            # API service layer
├── types/                 # TypeScript types
│   └── index.ts
└── utils/                 # Utility functions
    └── storage.ts         # Cart storage utilities
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for iOS) or Android Emulator (for Android)
- Or Expo Go app on your physical device

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure API URL (optional):
   - Create a `.env` file in the `mobile/` directory
   - Add: `EXPO_PUBLIC_API_URL=https://bookmate-n9wh.onrender.com`
   - Or update `config/api.ts` directly

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your device

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run on web browser
- `npm run lint` - Run ESLint

## Features Overview

### Authentication
- User registration with name, email, registration number, password, and accommodation
- Login with email or registration number
- JWT token-based authentication
- Secure token storage using AsyncStorage

### Book Browsing
- View all available books
- Search by title or author
- Filter by category (Textbook, Manual, Guide, Past Paper)
- View book details with images, price, stock, and description
- Add books to cart with quantity selection

### Shopping Cart
- Add/remove items
- Update quantities
- View total price
- Enter delivery address
- Proceed to checkout (requires authentication)

### Orders
- View order history
- Track order status (processing, purchased, delivering, delivered)
- Track payment status (paid, pending, failed)
- View order details with items and totals
- Complete payment for pending orders

### Payment
- Multiple payment methods:
  - Account Payment
  - Bank Card
  - Bank Account
  - Cashier Payment
- Opens payment URL in browser
- Redirects back to app after payment

### Profile
- View account information
- Quick access to orders and cart
- Sign out functionality

## API Integration

The app connects to the FUBOOKS backend API. Make sure the backend is running and accessible.

Default API URL: `https://bookmate-n9wh.onrender.com`

To change the API URL:
1. Update `config/api.ts` or
2. Set `EXPO_PUBLIC_API_URL` environment variable

## Environment Variables

Create a `.env` file in the `mobile/` directory:

```
EXPO_PUBLIC_API_URL=https://your-api-url.com
```

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

Or use EAS Build:
```bash
eas build --platform ios
eas build --platform android
```

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Check if backend is running
   - Verify API URL in `config/api.ts`
   - Check network connectivity

2. **Image Loading Issues**
   - Ensure backend returns base64 encoded images
   - Check image format (should be data URL)

3. **Authentication Issues**
   - Clear app data and re-login
   - Check token expiration

4. **Build Errors**
   - Clear cache: `expo start -c`
   - Delete `node_modules` and reinstall

## Contributing

1. Follow TypeScript best practices
2. Use functional components with hooks
3. Maintain consistent code style
4. Add proper error handling
5. Test on both iOS and Android

## License

Private - FUBOOKS Project
