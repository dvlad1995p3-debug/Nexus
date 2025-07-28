import { supabase } from './supabase';

export interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  lastname?: string;
  avatar?: string;
  bio?: string;
  city?: string;
  birthdate?: string;
  created_at?: string;
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
  email_verified?: boolean;
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

export interface UserProfile {
  id: string;
  auth_user_id: string;
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

export interface Post {
  id: string;
  user_id: string;
  content: string;
  media_url?: string;
  media_type?: 'photo' | 'video' | 'document';
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
}

export interface Media {
  id: string;
  user_id: string;
  type: 'photo' | 'video';
  url: string;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  is_private: boolean;
  created_by: string;
  created_at: string;
  member_count: number;
}

export interface Friendship {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
}

export interface GroupPost {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  media_url?: string;
  media_type?: 'photo' | 'video' | 'document';
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
}

export class DatabaseService {
  // Helper method to ensure user is authenticated
  private static async ensureAuthenticated() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      throw new Error('User not authenticated');
    }
    return user;
  }

  // Get current user profile
  static async getCurrentUserProfile(): Promise<DatabaseUser | null> {
    try {
      const authUser = await this.ensureAuthenticated();
      console.log('🔍 Fetching profile for auth user:', authUser.email);

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('❌ No profile found for user, needs to be created');
          return null;
        }
        console.error('Database error:', error);
        throw new Error(`Failed to fetch profile: ${error.message}`);
      }

      console.log('✅ Profile found:', data);
      
      // Map database fields to interface
      const profile: DatabaseUser = {
        id: data.id,
        email: data.email,
        name: data.name,
        lastname: data.last_name, // Map last_name to lastname
        avatar: data.avatar,
        bio: data.bio,
        city: data.city,
        birthdate: data.birth_date, // Map birth_date to birthdate
        created_at: data.created_at,
        education: data.education,
        work: data.work,
        relationshipStatus: data.relationshipStatus,
        phone: data.phone,
        website: data.website,
        isVerified: data.isVerified,
        familyStatus: data.familyStatus,
        location: data.location,
        hobbies: data.hobbies,
        languages: data.languages,
        email_verified: data.email_verified,
        notifications: data.notifications,
        privacy: data.privacy
      };

      return profile;
    } catch (error) {
      console.error('Error fetching current user profile:', error);
      throw error;
    }
  }

  // Create user profile
  static async createUserProfile(profileData: {
    name: string;
    last_name: string;
    email: string;
    avatar?: string;
    bio?: string;
  }): Promise<DatabaseUser> {
    try {
      const authUser = await this.ensureAuthenticated();
      
      console.log('📝 Creating user profile:', profileData);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([{
          auth_user_id: authUser.id,
          name: profileData.name,
          last_name: profileData.last_name,
          email: profileData.email,
          avatar: profileData.avatar,
          bio: profileData.bio,
          notifications: { email: true, messages: true, friendRequests: true },
          privacy: { showEmail: false, showBirthDate: true, profileVisibility: 'public' }
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        throw new Error(`Failed to create profile: ${error.message}`);
      }

      console.log('✅ User profile created:', data);
      
      // Map to DatabaseUser interface
      const newUser: DatabaseUser = {
        id: data.id,
        email: data.email,
        name: data.name,
        lastname: data.last_name,
        avatar: data.avatar,
        bio: data.bio,
        city: data.city,
        birthdate: data.birth_date,
        created_at: data.created_at,
        education: data.education,
        work: data.work,
        relationshipStatus: data.relationshipStatus,
        phone: data.phone,
        website: data.website,
        isVerified: data.isVerified,
        familyStatus: data.familyStatus,
        location: data.location,
        hobbies: data.hobbies,
        languages: data.languages,
        email_verified: data.email_verified,
        notifications: data.notifications,
        privacy: data.privacy
      };
      
      return newUser;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Search users by name
  static async searchUsers(query: string): Promise<DatabaseUser[]> {
    try {
      if (query.length < 2) {
        return [];
      }

      // Перевіряємо аутентифікацію перед пошуком
      await this.ensureAuthenticated();

      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, name, last_name, avatar, email')
        .or(`name.ilike.%${query}%, last_name.ilike.%${query}%`)
        .limit(10);

      if (error) {
        console.error('Error searching users:', error);
        throw new Error(`Search failed: ${error.message}`);
      }

      return (data || []).map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        lastname: user.last_name,
        avatar: user.avatar
      }));
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  // Get all users with proper error handling
  static async getAllUsers(): Promise<DatabaseUser[]> {
    try {
      // Перевіряємо аутентифікацію
      const authUser = await this.ensureAuthenticated();
      console.log('Fetching all users for authenticated user:', authUser.email);

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all users:', error);
        throw new Error(`Failed to fetch users: ${error.message}`);
      }

      // Filter out invalid users and ensure required fields
      const validUsers = (data || []).filter(user => 
        user && 
        user.id && 
        user.name && 
        user.email &&
        user.name.trim() !== '' &&
        user.email.trim() !== ''
      ).map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        lastname: user.last_name,
        avatar: user.avatar,
        bio: user.bio,
        city: user.city,
        birthdate: user.birth_date,
        created_at: user.created_at,
        education: user.education,
        work: user.work,
        relationshipStatus: user.relationshipStatus,
        phone: user.phone,
        website: user.website,
        isVerified: user.isVerified,
        familyStatus: user.familyStatus,
        location: user.location,
        hobbies: user.hobbies,
        languages: user.languages,
        email_verified: user.email_verified,
        notifications: user.notifications,
        privacy: user.privacy
      }));

      console.log(`Fetched ${validUsers.length} valid users out of ${data?.length || 0} total`);
      return validUsers;
    } catch (error) {
      console.error('Error fetching all users:', error);
      // Повертаємо порожній масив замість викидання помилки для UI
      return [];
    }
  }

  // Get user posts
  static async getUserPosts(userId: string): Promise<Post[]> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }
  }

  // Get user media
  static async getUserMedia(userId: string): Promise<Media[]> {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user media:', error);
      return [];
    }
  }

  // Update user profile
  static async updateUserProfile(updates: Partial<DatabaseUser>): Promise<DatabaseUser | null> {
    try {
      const authUser = await this.ensureAuthenticated();

      // Remove non-database fields and map interface fields to database fields
      const { id, lastname, birthdate, ...otherUpdates } = updates;
      
      const dbUpdates = {
        ...otherUpdates,
        last_name: lastname, // Map lastname to last_name
        birth_date: birthdate, // Map birthdate to birth_date
      };

      console.log('Updating user profile with:', dbUpdates);
      const { data, error } = await supabase
        .from('user_profiles')
        .update(dbUpdates)
        .eq('auth_user_id', authUser.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        throw new Error(`Failed to update profile: ${error.message}`);
      }

      console.log('Successfully updated user profile:', data);
      
      // Map back to DatabaseUser interface
      const updatedUser: DatabaseUser = {
        id: data.id,
        email: data.email,
        name: data.name,
        lastname: data.last_name,
        avatar: data.avatar,
        bio: data.bio,
        city: data.city,
        birthdate: data.birth_date,
        created_at: data.created_at,
        education: data.education,
        work: data.work,
        relationshipStatus: data.relationshipStatus,
        phone: data.phone,
        website: data.website,
        isVerified: data.isVerified,
        familyStatus: data.familyStatus,
        location: data.location,
        hobbies: data.hobbies,
        languages: data.languages,
        email_verified: data.email_verified,
        notifications: data.notifications,
        privacy: data.privacy
      };
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Create new post
  static async createPost(content: string, mediaUrl?: string, mediaType?: 'photo' | 'video' | 'document'): Promise<Post | null> {
    try {
      const currentUser = await this.getCurrentUserProfile();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const postData = {
        user_id: currentUser.id,
        content,
        media_url: mediaUrl,
        media_type: mediaType,
        likes_count: 0,
        comments_count: 0
      };

      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  }

  // Get all posts with user information
  static async getAllPosts(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user_profiles:user_id (
            id,
            name,
            last_name,
            avatar
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching all posts:', error);
      return [];
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<DatabaseUser | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      // Map to DatabaseUser interface
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        lastname: data.last_name,
        avatar: data.avatar,
        bio: data.bio,
        city: data.city,
        birthdate: data.birth_date,
        created_at: data.created_at,
        education: data.education,
        work: data.work,
        relationshipStatus: data.relationshipStatus,
        phone: data.phone,
        website: data.website,
        isVerified: data.isVerified,
        familyStatus: data.familyStatus,
        location: data.location,
        hobbies: data.hobbies,
        languages: data.languages,
        email_verified: data.email_verified,
        notifications: data.notifications,
        privacy: data.privacy
      };
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  }

  // Friend request methods
  static async sendFriendRequest(receiverId: string): Promise<boolean> {
    try {
      const currentUser = await this.getCurrentUserProfile();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('friend_requests')
        .insert([{
          sender_id: currentUser.id,
          receiver_id: receiverId,
          status: 'pending'
        }]);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      return false;
    }
  }

  static async getFriendRequests(): Promise<FriendRequest[]> {
    try {
      const currentUser = await this.getCurrentUserProfile();
      if (!currentUser) {
        return [];
      }

      const { data, error } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('receiver_id', currentUser.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      return [];
    }
  }

  static async acceptFriendRequest(requestId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      return false;
    }
  }

  static async rejectFriendRequest(requestId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      return false;
    }
  }

  static async getFriends(userId?: string): Promise<DatabaseUser[]> {
    try {
      const currentUser = await this.getCurrentUserProfile();
      if (!currentUser && !userId) {
        return [];
      }

      const targetUserId = userId || currentUser!.id;

      const { data, error } = await supabase
        .from('friendships')
        .select(`
          user1_id,
          user2_id,
          user1:user1_id (
            id,
            name,
            last_name,
            avatar,
            email
          ),
          user2:user2_id (
            id,
            name,
            last_name,
            avatar,
            email
          )
        `)
        .or(`user1_id.eq.${targetUserId},user2_id.eq.${targetUserId}`);

      if (error) {
        throw error;
      }

      // Extract friends (the other user in each friendship)
      const friends = (data || []).map(friendship => {
        const friend = friendship.user1_id === targetUserId ? friendship.user2 : friendship.user1;
        return {
          id: friend.id,
          name: friend.name,
          lastname: friend.last_name,
          avatar: friend.avatar,
          email: friend.email
        };
      });

      return friends;
    } catch (error) {
      console.error('Error fetching friends:', error);
      return [];
    }
  }
}