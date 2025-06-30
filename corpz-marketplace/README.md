# Corpz 

A  React Native marketplace application built with Expo and Supabase, featuring messaging, user authentication, and comprehensive marketplace functionality.

## Features

### Core Functionality
- **User Authentication**: Secure registration and login system
- **Marketplace**: Browse, search, and filter products with category based organization
- **Posting**: Create and manage product listings with image upload support
- **Real-time Messaging**: Built-in chat system for buyer-seller communication
- **Favorites**: Save and manage favorite products
- **Cart Management**: Add items to cart and manage quantities
- **Order Management**: Complete purchase flow with order tracking
- **Earnings Dashboard**: Track sales and revenue for sellers

### Social Features
- **Following System**: Follow other users and build connections
- **Profile Management**: Comprehensive user profiles with edit capabilities
- **User Search**: Find and connect with other marketplace users

### Additional Features
- **Shipping Address Management**: Manage delivery addresses
- **Purchase History**: Track all your transactions
- **Notifications**: Stay updated with marketplace activities
- **Privacy & Security**: Comprehensive privacy settings

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase 
- **Authentication**: Supabase Auth with secure token storage
- **Navigation**: React Navigation 6
- **State Management**: React Context API
- **Styling**: StyleSheet with custom theme system
- **Icons**: Expo Vector Icons (Ionicons)


## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jabex113/corpz.git
   cd corpz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_COMPANY_NAME=Your Company Name
   EXPO_PUBLIC_COMPANY_EMAIL=hello@yourcompany.com
   # ... other variables
   ```

4. **Set up Supabase Database**
   
   Run the SQL schema provided in `database-schema.sql` in your Supabase SQL editor to create all necessary tables and policies.

5. **Start the development server**
   ```bash
   npm start
   ```

## Environment Variables

The application requires the following environment variables:

### Required Variables
- `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Optional Variables
- `EXPO_PUBLIC_COMPANY_NAME`: Company name displayed in the app
- `EXPO_PUBLIC_COMPANY_EMAIL`: Contact email
- `EXPO_PUBLIC_COMPANY_PHONE`: Contact phone number
- `EXPO_PUBLIC_COMPANY_ADDRESS`: Company address
- `EXPO_PUBLIC_FACEBOOK_URL`: Facebook page URL
- `EXPO_PUBLIC_TWITTER_URL`: Twitter profile URL
- `EXPO_PUBLIC_INSTAGRAM_URL`: Instagram profile URL
- `EXPO_PUBLIC_LINKEDIN_URL`: LinkedIn company page URL
- `EXPO_PUBLIC_CAREERS_URL`: Careers page URL
- `EXPO_PUBLIC_APP_NAME`: Application name
- `EXPO_PUBLIC_APP_VERSION`: Application version
- `EXPO_PUBLIC_APP_DESCRIPTION`: Application description

## Database Setup

### Supabase Configuration

1. Create a new Supabase project
2. Run the provided SQL schema in your Supabase SQL editor
3. Enable Row Level Security (RLS) on all tables
4. The schema includes:
   - Users management
   - Product listings
   - Messages and conversations
   - Orders and payments
   - Favorites and follows
   - Cart functionality

### Database Schema

The application uses the following main tables:
- `users`: User profiles and authentication data
- `items`: Product listings with seller information
- `messages`: Real-time messaging between users
- `orders`: Purchase transactions
- `payments`: Payment processing records
- `favorites`: User favorite items
- `follows`: User following relationships
- `cart`: Shopping cart items

## Key Components

### Authentication System
- Secure user registration and login
- Email validation and password requirements
- Profile management with image upload
- Session persistence with secure storage

### Marketplace Features
- Product listing creation and management
- Advanced search and filtering
- Category-based organization
- Real-time updates

### Messaging System
- Real-time chat between users
- Message history and read receipts
- User search and connection features

### Payment Integration
- Multiple payment method support
- Order tracking and management
- Earnings dashboard for sellers

## Customization

### Theming
The app uses a centralized theme system located in `src/constants/theme.ts`. You can customize:
- Colors and color schemes
- Typography and font sizes
- Spacing and layout constants
- Border radius and shadows

### Branding
Update environment variables to customize:
- Company information
- Social media links
- App name and description
- Contact details

## Development

### Available Scripts
- `npm start`: Start the Expo development server
- `npm run android`: Run on Android device/emulator
- `npm run ios`: Run on iOS device/simulator
- `npm run web`: Run in web browser

### Code Quality
The project includes:
- TypeScript for type safety
- Consistent code formatting
- Component-based architecture
- Proper error handling
