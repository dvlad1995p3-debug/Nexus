import { supabase } from './supabase';

export interface UserProfileData {
  id?: string;
  auth_user_id?: string;
  name: string;
  last_name: string;
  email: string;
  avatar?: string;
  bio?: string;
  city?: string;
  birth_date?: string;
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  education?: string;
  work?: string;
  relationshipStatus?: string;
  phone?: string;
  website?: string;
  isVerified?: boolean;
  familyStatus?: string;
  location?: string;
  hobbies?: string[];
  languages?: string[];
  birthday?: string;
  notifications?: {
    email: boolean;
    messages: boolean;
    friendRequests: boolean;
  };
  privacy?: {
    profileVisibility: 'public' | 'friends' | 'private';
    showBirthDate: boolean;
    showEmail: boolean;
  };
}

export async function getUserProfile(authUserId: string): Promise<UserProfileData | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found
        return null;
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(authUserId: string, updates: Partial<UserProfileData>): Promise<UserProfileData | null> {
  try {
    // Remove fields that shouldn't be updated directly
    const { id, auth_user_id, created_at, updated_at, ...safeUpdates } = updates;
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(safeUpdates)
      .eq('auth_user_id', authUserId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

export async function insertUserProfile(profile: {
  auth_user_id: string;
  name: string;
  last_name: string;
  email: string;
  avatar?: string;
  bio?: string;
  city?: string;
  birth_date?: string;
  education?: string;
  work?: string;
  relationshipStatus?: string;
  phone?: string;
  website?: string;
  familyStatus?: string;
  location?: string;
  hobbies?: string[];
  languages?: string[];
  notifications?: {
    email: boolean;
    messages: boolean;
    friendRequests: boolean;
  };
  privacy?: {
    profileVisibility: 'public' | 'friends' | 'private';
    showBirthDate: boolean;
    showEmail: boolean;
  };
}): Promise<{ data: UserProfileData | null; error: any }> {
  try {
    const profileWithDefaults = {
      ...profile,
      email_verified: false,
      isVerified: false,
      notifications: profile.notifications || {
        email: true,
        messages: true,
        friendRequests: true
      },
      privacy: profile.privacy || {
        showEmail: false,
        showBirthDate: true,
        profileVisibility: 'public' as const
      }
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profileWithDefaults])
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error inserting user profile:', error);
    return { data: null, error };
  }
}

export async function createUserProfileFromAuth(authUser: any): Promise<UserProfileData | null> {
  try {
    const profileData = {
      auth_user_id: authUser.id,
      name: authUser.user_metadata?.name || 
            authUser.user_metadata?.full_name?.split(' ')[0] || 
            authUser.email?.split('@')[0] || 
            'User',
      last_name: authUser.user_metadata?.last_name || 
                 authUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 
                 '',
      email: authUser.email,
      avatar: authUser.user_metadata?.avatar_url,
      bio: authUser.user_metadata?.bio,
    };

    const { data, error } = await insertUserProfile(profileData);
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating user profile from auth:', error);
    return null;
  }
} 