export type CityId = 'ranchi' | 'patna' | 'delhi';

export interface CityHub {
  id: CityId;
  name: string;
  state: string;
  municipalRadiusKm: number; // City limit calculation (e.g. 18km for Patna City, no district)
  defaultHub: string;
  hubs: string[];
  coordinates: { lat: number; lng: number }; // Central municipal GPS coordinate
}

export type GenderType = 'All' | 'Boys' | 'Girls' | 'Others';

export type LocationSource = 'gps' | 'ip' | 'manual' | 'signup';

export interface RadarPerson {
  id: string;
  name: string;
  gender: 'Boys' | 'Girls' | 'Others';
  avatar: string;
  bio: string;
  coordinates?: { lat: number; lng: number }; // Exact GPS location inside city
  distanceMeter: number; // Dynamically calculated via Haversine from user's live coordinate
  status: 'Online' | 'Study Mode' | 'Looking for PG' | 'Walking on Road';
  hub: string;
  cityId: CityId;
  isFriend?: boolean;
  // Production location tracking fields
  lastLocationAt?: string; // ISO timestamp of when location was last updated
  locationSource?: LocationSource; // How location was captured
  isOnline?: boolean; // Currently has app open
  lastSeenAt?: string; // ISO timestamp of last activity
}

export type PgType = 'Only Boys' | 'Only Girls' | 'Co-ed';
export type SharingType = 'Single' | 'Double' | 'Triple';

export interface PgListing {
  id: string;
  title: string;
  cityId: CityId;
  hub: string;
  coordinates: { lat: number; lng: number };
  type: PgType;
  sharing: SharingType;
  rentPerMonth: number;
  securityDeposit: number;
  rating: number;
  isPrime: boolean; // ₹500/mo featured badge
  foodIncluded: boolean;
  curfewTime: string;
  amenities: string[];
  image: string;
  distanceMeter: number;
  contactPhone: string;
  whatsappNumber: string;
}

export type FlatCategory = 'Independent' | 'Family Only' | 'Bachelor Allowed';
export type BhkType = '1 BHK' | '2 BHK' | '3 BHK';

export interface FlatListing {
  id: string;
  title: string;
  cityId: CityId;
  hub: string;
  coordinates: { lat: number; lng: number };
  category: FlatCategory;
  bhk: BhkType;
  rentPerMonth: number;
  securityDeposit: number;
  brokerage: boolean;
  furnishing: 'Fully Furnished' | 'Semi Furnished' | 'Unfurnished';
  rating: number;
  isPrime: boolean;
  image: string;
  distanceMeter: number;
  contactPhone: string;
  whatsappNumber: string;
}

export type FoodCategory = 'Pure Veg' | 'Veg + Non-Veg';

export interface TiffinListing {
  id: string;
  title: string;
  cityId: CityId;
  hub: string;
  coordinates: { lat: number; lng: number };
  category: FoodCategory;
  isHomeCooked: boolean; // Ghar ka khana
  singleThaliPrice: number;
  monthlySubscriptionPrice: number;
  deliveryRadiusKm: number;
  rating: number;
  isPrime: boolean;
  todaysMenu: string;
  mealTimings: string;
  image: string;
  distanceMeter: number;
  contactPhone: string;
  whatsappNumber: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  senderName?: string;
  senderAvatar?: string;
}
