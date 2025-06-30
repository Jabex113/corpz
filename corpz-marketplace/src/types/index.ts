export interface User {
  id: string;
  email: string;
  name: string;
  profilePic?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
  seller?: User;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface Order {
  id: string;
  itemId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  quantity: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  item?: Item;
  buyer?: User;
  seller?: User;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  MyListings: undefined;
  PurchaseHistory: undefined;
  Favorites: undefined;
  PaymentMethods: undefined;
  ShippingAddress: undefined;
  Notifications: undefined;
  PrivacySecurity: undefined;
  HelpSupport: undefined;
  About: undefined;
  EditProfile: undefined;
  ItemDetails: { item: Item };
  ChangePassword: undefined;
  ChangeEmail: undefined;
  ChangeName: undefined;
  Followers: { userId: string };
  Following: { userId: string };
  Chat: { userId: string; userName: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Post: undefined;
  Earnings: undefined;
  Messages: undefined;
  Account: undefined;
};
