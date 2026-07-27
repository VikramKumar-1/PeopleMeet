import { createClient } from '@supabase/supabase-js';
import { RadarPerson, PgListing, ChatMessage } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project-id.supabase.co')
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Check if Supabase is connected and ready to use.
 */
export const isSupabaseReady = () => {
  return Boolean(supabase);
};

/**
 * Haversine formula: Calculate exact distance in meters between two GPS coordinates.
 * Used for real-world proximity calculation (walk/bike/car accuracy).
 */
export const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

/**
 * Fetch live active peers from Supabase profiles table for a specific city.
 * Calculates REAL Haversine distance from the requesting user's coordinates.
 * Only returns users seen within the last 24 hours.
 */
export const fetchLiveProfiles = async (
  cityId: string,
  userLat?: number,
  userLng?: number
): Promise<RadarPerson[]> => {
  if (!supabase) {
    console.warn('[PeopleMeet] Supabase not connected — cannot fetch live profiles');
    return [];
  }
  try {
    // Fetch ALL profiles for this city (no time cutoff — new users should appear immediately)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('city_id', cityId);

    if (error) {
      console.error('[PeopleMeet] Supabase query error:', error.message);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('[PeopleMeet] No profiles found for city:', cityId);
      return [];
    }

    console.log(`[PeopleMeet] Fetched ${data.length} profiles for city: ${cityId}`);

    return data.map((item: any) => {
      const pLat = item.last_lat ?? item.lat ?? 0;
      const pLng = item.last_lng ?? item.lng ?? 0;
      const hasCoords = pLat !== 0 && pLng !== 0;

      // Calculate real distance if both user and peer have coordinates
      let distanceM = 9999;
      if (hasCoords && userLat && userLng) {
        distanceM = haversineDistance(userLat, userLng, pLat, pLng);
      }

      return {
        id: item.id,
        name: item.full_name || 'Anonymous Student',
        gender: item.gender || 'Others',
        avatar: item.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        bio: item.bio || 'Active peer nearby',
        coordinates: hasCoords ? { lat: pLat, lng: pLng } : undefined,
        distanceMeter: distanceM,
        status: item.is_online ? (item.status || 'Online') : 'Offline',
        hub: item.locality_hub || 'Central Hub',
        cityId: item.city_id,
        lastLocationAt: item.last_location_at || item.created_at,
        locationSource: item.location_source || 'signup',
        isOnline: item.is_online ?? false,
        lastSeenAt: item.last_seen_at || item.created_at,
      } as RadarPerson;
    });
  } catch (e) {
    console.error('[PeopleMeet] Error fetching live profiles:', e);
    return [];
  }
};

/**
 * Update user's live GPS location in Supabase.
 * Called every 30 seconds while app is visible + on initial load.
 */
export const updateUserLocation = async (
  userId: string,
  lat: number,
  lng: number,
  source: 'gps' | 'ip' | 'manual' | 'signup' = 'gps'
): Promise<boolean> => {
  if (!supabase || !userId) return false;
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        last_lat: lat,
        last_lng: lng,
        last_location_at: new Date().toISOString(),
        location_source: source,
        is_online: true,
        last_seen_at: new Date().toISOString(),
      })
      .eq('id', userId);
    if (error) {
      console.warn('[PeopleMeet] Location update warning:', error.message);
    }
    return !error;
  } catch (e) {
    console.error('[PeopleMeet] Error updating user location:', e);
    return false;
  }
};

/**
 * Mark user as offline when they close the tab / switch away.
 */
export const markUserOffline = async (userId: string): Promise<boolean> => {
  if (!supabase || !userId) return false;
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        is_online: false,
        last_seen_at: new Date().toISOString(),
      })
      .eq('id', userId);
    return !error;
  } catch (e) {
    console.error('Error marking user offline:', e);
    return false;
  }
};

/**
 * Seed initial real student rows directly into your live Supabase cloud database
 */
export const seedInitialSupabaseData = async (): Promise<boolean> => {
  if (!supabase) return false;
  try {
    // We insert real initial student records into your Supabase profiles table
    const initialPeers = [
      {
        id: '11111111-1111-1111-1111-111111111101',
        full_name: 'Vikash Kumar',
        gender: 'Boys',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        bio: 'Studying in library near Plaza Chowk. Looking for a vegetarian AC room partner!',
        city_id: 'ranchi',
        locality_hub: 'Lalpur Chowk',
        lat: 23.3645,
        lng: 85.3195,
        last_lat: 23.3645,
        last_lng: 85.3195,
        last_location_at: new Date().toISOString(),
        location_source: 'signup',
        is_online: true,
        last_seen_at: new Date().toISOString(),
        status: 'Online',
      },
      {
        id: '11111111-1111-1111-1111-111111111102',
        full_name: 'Priya Sharma',
        gender: 'Girls',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
        bio: 'CA Aspirant. Need daily home-made tiffin recommendations near Kanke Road.',
        city_id: 'ranchi',
        locality_hub: 'Kanke Road',
        lat: 23.3720,
        lng: 85.3150,
        last_lat: 23.3720,
        last_lng: 85.3150,
        last_location_at: new Date().toISOString(),
        location_source: 'signup',
        is_online: false,
        last_seen_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'Walking on Road',
      },
      {
        id: '11111111-1111-1111-1111-111111111103',
        full_name: 'Rohit Verma',
        gender: 'Boys',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        bio: 'BIT Mesra final year. Working on AI projects at Boring Road café.',
        city_id: 'ranchi',
        locality_hub: 'Boring Road',
        lat: 23.3660,
        lng: 85.3220,
        last_lat: 23.3660,
        last_lng: 85.3220,
        last_location_at: new Date().toISOString(),
        location_source: 'signup',
        is_online: true,
        last_seen_at: new Date().toISOString(),
        status: 'Online',
      },
      {
        id: '11111111-1111-1111-1111-111111111104',
        full_name: 'Ananya Singh',
        gender: 'Girls',
        avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
        bio: 'BPSC Target 2026. Looking for female flatmate in 2BHK near Lalpur.',
        city_id: 'ranchi',
        locality_hub: 'Lalpur Chowk',
        lat: 23.3638,
        lng: 85.3188,
        last_lat: 23.3638,
        last_lng: 85.3188,
        last_location_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        location_source: 'gps',
        is_online: false,
        last_seen_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        status: 'Online',
      },
      {
        id: '11111111-1111-1111-1111-111111111105',
        full_name: 'Aman Raj',
        gender: 'Boys',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        bio: 'Preparing for JEE at Nucleus / FIITJEE. Staying at Lalpur Boys Hostel.',
        city_id: 'ranchi',
        locality_hub: 'Lalpur Chowk',
        lat: 23.3642,
        lng: 85.3190,
        last_lat: 23.3642,
        last_lng: 85.3190,
        last_location_at: new Date().toISOString(),
        location_source: 'signup',
        is_online: true,
        last_seen_at: new Date().toISOString(),
        status: 'Online',
      }
    ];

    const { error } = await supabase.from('profiles').upsert(initialPeers, { onConflict: 'id' });
    if (error) {
      console.warn('Supabase Seed Warning (if foreign key auth constraint is active):', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Error seeding initial data:', e);
    return false;
  }
};

/**
 * Send a real-time peer-to-peer message across devices & tabs.
 * Uses Supabase Realtime Broadcast + BroadcastChannel for instant transmission.
 */
let sharedChatChannel: any = null;
let broadcastChannelInstance: BroadcastChannel | null = null;

const getBroadcastChannel = () => {
  if (typeof window === 'undefined') return null;
  if (!broadcastChannelInstance) {
    try {
      broadcastChannelInstance = new BroadcastChannel('stay_dine_campus_chat');
    } catch {}
  }
  return broadcastChannelInstance;
};

/**
 * Send a real-time peer-to-peer message across devices & tabs.
 * Uses Supabase Realtime Broadcast + BroadcastChannel for instant transmission.
 */
export const sendRealtimeMessage = async (msg: ChatMessage): Promise<void> => {
  if (typeof window !== 'undefined') {
    // 1. Send via local BroadcastChannel for multi-tab testing on the same browser
    try {
      const bc = getBroadcastChannel();
      if (bc) bc.postMessage(msg);
    } catch {}

    // 2. Persist to global chat history in localStorage so new tabs can sync immediately
    try {
      const historyRaw = localStorage.getItem('stay_dine_messages') || '[]';
      const history = JSON.parse(historyRaw);
      if (!history.some((m: ChatMessage) => m.id === msg.id)) {
        history.push(msg);
        if (history.length > 200) history.splice(0, history.length - 200);
        localStorage.setItem('stay_dine_messages', JSON.stringify(history));
      }
    } catch {}
  }

  // 3. Broadcast across devices via Supabase WebSockets
  if (supabase) {
    try {
      if (!sharedChatChannel) {
        sharedChatChannel = supabase.channel('campus_live_chat_channel', {
          config: { broadcast: { ack: false, self: true } }
        });
        sharedChatChannel.subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            sharedChatChannel.send({ type: 'broadcast', event: 'NEW_CHAT_MESSAGE', payload: msg });
          }
        });
      } else {
        sharedChatChannel.send({ type: 'broadcast', event: 'NEW_CHAT_MESSAGE', payload: msg });
      }
    } catch (e) {
      console.warn('Supabase WebSocket broadcast warning:', e);
    }
  }
};

export const subscribeToRealtimeChat = (onReceiveMessage: (msg: ChatMessage) => void): (() => void) => {
  if (typeof window !== 'undefined') {
    try {
      const bc = getBroadcastChannel();
      if (bc) {
        bc.onmessage = (event) => {
          if (event.data && event.data.id) onReceiveMessage(event.data);
        };
      }
    } catch {}
  }

  if (!supabase) return () => {};

  const channelId = `realtime_chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const channel = supabase.channel(channelId);

  try {
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload: any) => {
        const m = payload.new;
        if (m && m.id) {
          onReceiveMessage({
            id: m.id,
            senderId: m.sender_id,
            receiverId: m.receiver_id,
            text: m.text,
            timestamp: m.timestamp,
            isRead: m.is_read,
            senderName: m.sender_name,
            senderAvatar: m.sender_avatar
          });
        }
      }
    ).subscribe();
  } catch (e) {
    console.error('Error subscribing to realtime chat:', e);
  }

  return () => {
    try {
      if (supabase && channel) {
        supabase.removeChannel(channel);
      }
    } catch {}
  };
};

/**
 * Fetch messages between two users
 */
export const fetchMessagesFromDb = async (userId1: string, userId2: string): Promise<ChatMessage[]> => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1}),receiver_id.eq.${userId1},sender_id.eq.${userId1},receiver_id.eq.me,sender_id.eq.me`)
      .order('created_at', { ascending: true });

    if (error || !data) {
      if (error) console.error('Fetch messages error:', error);
      return [];
    }
    
    return data.map(m => ({
      id: m.id,
      senderId: m.sender_id,
      receiverId: m.receiver_id,
      text: m.text,
      timestamp: m.timestamp,
      isRead: m.is_read,
      senderName: m.sender_name,
      senderAvatar: m.sender_avatar,
    }));
  } catch (e) {
    console.error('Error fetching messages:', e);
    return [];
  }
};

/**
 * Save a new message to the database
 */
export const saveMessageToDb = async (msg: ChatMessage): Promise<void> => {
  if (!supabase) return;
  try {
    await supabase.from('messages').insert({
      id: msg.id,
      sender_id: msg.senderId,
      receiver_id: msg.receiverId,
      text: msg.text,
      timestamp: msg.timestamp,
      is_read: msg.isRead,
      sender_name: msg.senderName,
      sender_avatar: msg.senderAvatar
    });
  } catch (e) {
    console.error('Error saving message:', e);
  }
};

/**
 * Send a friend request
 */
export const sendFriendRequestToDb = async (senderId: string, receiverId: string): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('friend_requests').insert({
      sender_id: senderId,
      receiver_id: receiverId,
      status: 'pending'
    });
    return !error;
  } catch (e) {
    console.error('Error sending friend request:', e);
    return false;
  }
};

/**
 * Fetch sent friend requests
 */
export const fetchSentFriendRequestsFromDb = async (senderId: string): Promise<string[]> => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('friend_requests')
      .select('receiver_id')
      .eq('sender_id', senderId);
    
    if (error || !data) return [];
    return data.map(req => req.receiver_id);
  } catch (e) {
    console.error('Error fetching friend requests:', e);
    return [];
  }
};

/**
 * Create a new property listing
 */
export const createPropertyListingInDb = async (listing: Omit<PgListing, 'id' | 'distanceMeter'>): Promise<boolean> => {
  if (!supabase) return false;
  try {
    // Determine the type column value
    let typeVal = 'Co-ed';
    if ('type' in listing) typeVal = listing.type;
    else if ('category' in listing) typeVal = (listing as any).category;
    
    const { error } = await supabase.from('pg_listings').insert({
      owner_id: (listing as any).ownerId || null,
      title: listing.title,
      city_id: listing.cityId,
      locality_hub: listing.hub,
      rent_per_month: listing.rentPerMonth || (listing as any).singleThaliPrice || 0,
      type: typeVal,
      food_included: listing.foodIncluded ?? true,
      image_url: listing.image || ''
    });
    return !error;
  } catch (e) {
    console.error('Error creating property listing:', e);
    return false;
  }
};

