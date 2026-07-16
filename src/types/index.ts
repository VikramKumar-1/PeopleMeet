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

export interface RadarPerson {
  id: string;
  name: string;
  gender: 'Boys' | 'Girls' | 'Others';
  avatar: string;
  bio: string;
  coordinates: { lat: number; lng: number }; // Exact GPS location inside city
  distanceMeter: number; // Dynamically calculated from user's active coordinate
  status: 'Online' | 'Study Mode' | 'Looking for PG' | 'Walking on Road';
  hub: string;
  cityId: CityId;
  isFriend?: boolean;
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
}
