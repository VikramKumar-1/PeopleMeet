import { createClient } from '@supabase/supabase-js';
import { RadarPerson, PgListing } from '@/types';

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
 * Fetch live active peers from Supabase profiles table for a specific city.
 * Falls back to null if Supabase is not configured or table is empty.
 */
export const fetchLiveProfiles = async (cityId: string): Promise<RadarPerson[] | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('city_id', cityId);

    if (error || !data || data.length === 0) return null;

    return data.map((item: any) => ({
      id: item.id,
      name: item.full_name || 'Anonymous Student',
      gender: item.gender || 'Others',
      avatar: item.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      bio: item.bio || 'Active peer nearby',
      coordinates: item.lat && item.lng ? { lat: item.lat, lng: item.lng } : { lat: 23.364, lng: 85.319 },
      distanceMeter: 100,
      status: item.status || 'Active',
      hub: item.locality_hub || 'Central Hub',
      cityId: item.city_id,
    }));
  } catch (e) {
    console.error('Error fetching live profiles from Supabase:', e);
    return null;
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


