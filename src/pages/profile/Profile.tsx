import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { supabase } from '../../lib/supabase';
import { DatabaseService } from '../../lib/database';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Edit3, 
  Camera, 
  Save, 
  X, 
  Settings,
  Heart,
  MessageCircle,
  Users,
  Image as ImageIcon,
  Plus,
  Upload,
  Check,
  AlertCircle,
  Globe,
  Phone,
  Briefcase,
  GraduationCap,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  name: string;
  lastname?: string;
  email: string;
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

export function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newHobby, setNewHobby] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  
  // Form states
  const [editForm, setEditForm] = useState({
    name: '',
    lastname: '',
    bio: '',
    city: '',
    birthdate: '',
    avatar: '',
    education: '',
    work: '',
    relationshipStatus: '',
    phone: '',
    website: '',
    familyStatus: '',
    location: '',
    hobbies: [] as string[],
    languages: [] as string[]
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Loading profile...');
      
      // Отримуємо поточного користувача
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error(`Помилка аутентифікації: ${authError.message}`);
      }
      
      if (!authUser) {
        console.log('No authenticated user, redirecting to login');
        navigate('/login');
        return;
      }
      
      console.log('✅ Authenticated user:', authUser.email);
      setCurrentUser(authUser);
      
      // Отримуємо профіль користувача
      const userProfile = await DatabaseService.getCurrentUserProfile();
      
      if (!userProfile) {
        console.log('❌ No profile found');
        setError('Профіль не знайдено. Спробуйте увійти знову.');
        return;
      }
      
      console.log('✅ Profile loaded:', userProfile);
      setProfile(userProfile);
      
      // Заповнюємо форму редагування
      setEditForm({
        name: userProfile.name || '',
        lastname: userProfile.lastname || '',
        bio: userProfile.bio || '',
        city: userProfile.city || '',
        birthdate: userProfile.birthdate || '',
        avatar: userProfile.avatar || '',
        education: userProfile.education || '',
        work: userProfile.work || '',
        relationshipStatus: userProfile.relationshipStatus || '',
        phone: userProfile.phone || '',
        website: userProfile.website || '',
        familyStatus: userProfile.familyStatus || '',
        location: userProfile.location || '',
        hobbies: userProfile.hobbies || [],
        languages: userProfile.languages || []
      });
      
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err instanceof Error ? err.message : 'Помилка завантаження профілю');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      console.log('💾 Saving profile...', editForm);
      
      if (!editForm.name.trim()) {
        setError('Ім\'я є обов\'язковим полем');
        return;
      }
      
      // Оновлюємо профіль
      const updatedProfile = await DatabaseService.updateUserProfile({
        name: editForm.name.trim(),
        lastname: editForm.lastname.trim(),
        bio: editForm.bio.trim(),
        city: editForm.city.trim(),
        birthdate: editForm.birthdate || undefined,
        avatar: editForm.avatar.trim() || undefined,
        education: editForm.education.trim() || undefined,
        work: editForm.work.trim() || undefined,
        relationshipStatus: editForm.relationshipStatus || undefined,
        phone: editForm.phone.trim() || undefined,
        website: editForm.website.trim() || undefined,
        familyStatus: editForm.familyStatus || undefined,
        location: editForm.location.trim() || undefined,
        hobbies: editForm.hobbies,
        languages: editForm.languages
      });
      
      if (updatedProfile) {
        console.log('✅ Profile updated:', updatedProfile);
        setProfile(updatedProfile);
        setIsEditing(false);
        setSuccess('Профіль успішно оновлено!');
        
        // Очищаємо повідомлення через 3 секунди
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Не вдалося оновити профіль');
      }
      
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Помилка збереження профілю');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditForm({
        name: profile.name || '',
        lastname: profile.lastname || '',
        bio: profile.bio || '',
        city: profile.city || '',
        birthdate: profile.birthdate || '',
        avatar: profile.avatar || '',
        education: profile.education || '',
        work: profile.work || '',
        relationshipStatus: profile.relationshipStatus || '',
        phone: profile.phone || '',
        website: profile.website || '',
        familyStatus: profile.familyStatus || '',
        location: profile.location || '',
        hobbies: profile.hobbies || [],
        languages: profile.languages || []
      });
    }
    setIsEditing(false);
    setError(null);
    setNewHobby('');
    setNewLanguage('');
  };

  const addHobby = () => {
    if (newHobby.trim() && !editForm.hobbies.includes(newHobby.trim())) {
      setEditForm({
        ...editForm,
        hobbies: [...editForm.hobbies, newHobby.trim()]
      });
      setNewHobby('');
    }
  };

  const removeHobby = (hobby: string) => {
    setEditForm({
      ...editForm,
      hobbies: editForm.hobbies.filter(h => h !== hobby)
    });
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !editForm.languages.includes(newLanguage.trim())) {
      setEditForm({
        ...editForm,
        languages: [...editForm.languages, newLanguage.trim()]
      });
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setEditForm({
      ...editForm,
      languages: editForm.languages.filter(l => l !== language)
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не вказано';
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name?: string, lastname?: string) => {
    const firstInitial = name?.[0]?.toUpperCase() || '';
    const lastInitial = lastname?.[0]?.toUpperCase() || '';
    return firstInitial + lastInitial || '?';
  };

  const getRelationshipStatusText = (status?: string) => {
    const statusMap: { [key: string]: string } = {
      'single': 'Самотній/я',
      'in_relationship': 'У стосунках',
      'married': 'Одружений/а',
      'divorced': 'Розлучений/а',
      'complicated': 'Все складно'
    };
    return statusMap[status || ''] || status || 'Не вказано';
  };

  const getFamilyStatusText = (status?: string) => {
    const statusMap: { [key: string]: string } = {
      'no_children': 'Без дітей',
      'have_children': 'Є діти',
      'want_children': 'Хочу дітей',
      'no_want_children': 'Не хочу дітей'
    };
    return statusMap[status || ''] || status || 'Не вказано';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Завантаження профілю...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Помилка завантаження</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadProfile}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Спробувати знову
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Профіль не знайдено</h2>
              <p className="text-gray-600">Не вдалося завантажити дані профілю</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
              <Check className="h-5 w-5 mr-2" />
              {success}
            </div>
          )}
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            {/* Cover Photo */}
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            </div>

            {/* Profile Info */}
            <div className="relative px-6 pb-6">
              {/* Avatar */}
              <div className="flex items-end justify-between -mt-16 mb-4">
                <div className="relative">
                  <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {getInitials(profile.name, profile.lastname)}
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-2 right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                      <Camera size={16} />
                    </button>
                  )}
                </div>

                {/* Edit Button */}
                <div className="flex space-x-2">
                  {!isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit3 size={16} className="mr-2" />
                        Редагувати профіль
                      </button>
                      <button
                        onClick={() => navigate('/settings')}
                        className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Settings size={16} className="mr-2" />
                        Налаштування
                      </button>
                    </>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {saving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Save size={16} className="mr-2" />
                        )}
                        {saving ? 'Збереження...' : 'Зберегти'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={saving}
                        className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        <X size={16} className="mr-2" />
                        Скасувати
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-4">
                {!isEditing ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                          {profile.name} {profile.lastname}
                          {profile.isVerified && (
                            <Shield className="h-6 w-6 text-blue-500" title="Верифікований профіль" />
                          )}
                        </h1>
                        <p className="text-gray-600 flex items-center mt-1">
                          <Mail size={16} className="mr-2" />
                          {profile.email}
                          {profile.email_verified && (
                            <Check className="h-4 w-4 text-green-500 ml-1" title="Email верифіковано" />
                          )}
                        </p>
                      </div>
                    </div>

                    {profile.bio && (
                      <p className="text-gray-700 text-lg leading-relaxed">
                        {profile.bio}
                      </p>
                    )}

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      {profile.city && (
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-2" />
                          {profile.city}
                        </div>
                      )}
                      {profile.location && (
                        <div className="flex items-center">
                          <Globe size={16} className="mr-2" />
                          {profile.location}
                        </div>
                      )}
                      {profile.phone && (
                        <div className="flex items-center">
                          <Phone size={16} className="mr-2" />
                          {profile.phone}
                        </div>
                      )}
                      {profile.website && (
                        <div className="flex items-center">
                          <Globe size={16} className="mr-2" />
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {profile.website}
                          </a>
                        </div>
                      )}
                      {profile.work && (
                        <div className="flex items-center">
                          <Briefcase size={16} className="mr-2" />
                          {profile.work}
                        </div>
                      )}
                      {profile.education && (
                        <div className="flex items-center">
                          <GraduationCap size={16} className="mr-2" />
                          {profile.education}
                        </div>
                      )}
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      {profile.relationshipStatus && (
                        <div className="flex items-center">
                          <Heart size={16} className="mr-2" />
                          {getRelationshipStatusText(profile.relationshipStatus)}
                        </div>
                      )}
                      {profile.familyStatus && (
                        <div className="flex items-center">
                          <Users size={16} className="mr-2" />
                          {getFamilyStatusText(profile.familyStatus)}
                        </div>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-1" />
                        Приєднався {formatDate(profile.created_at)}
                      </div>
                      {profile.birthdate && (
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-1" />
                          Народився {formatDate(profile.birthdate)}
                        </div>
                      )}
                    </div>

                    {/* Hobbies */}
                    {profile.hobbies && profile.hobbies.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Хобі</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.hobbies.map((hobby, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              {hobby}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Languages */}
                    {profile.languages && profile.languages.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Мови</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.languages.map((language, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                            >
                              {language}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ім'я *
                        </label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Введіть ім'я"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Прізвище
                        </label>
                        <input
                          type="text"
                          value={editForm.lastname}
                          onChange={(e) => setEditForm(prev => ({ ...prev, lastname: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Введіть прізвище"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Про себе
                      </label>
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Розкажіть про себе"
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-500 mt-1">{editForm.bio.length}/500</p>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Місто
                        </label>
                        <input
                          type="text"
                          value={editForm.city}
                          onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Введіть місто"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Місцезнаходження
                        </label>
                        <input
                          type="text"
                          value={editForm.location}
                          onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Країна, регіон"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Телефон
                        </label>
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+380..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Веб-сайт
                        </label>
                        <input
                          type="url"
                          value={editForm.website}
                          onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    {/* Professional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Робота
                        </label>
                        <input
                          type="text"
                          value={editForm.work}
                          onChange={(e) => setEditForm(prev => ({ ...prev, work: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Компанія, посада"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Освіта
                        </label>
                        <input
                          type="text"
                          value={editForm.education}
                          onChange={(e) => setEditForm(prev => ({ ...prev, education: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Університет, спеціальність"
                        />
                      </div>
                    </div>

                    {/* Personal Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Статус стосунків
                        </label>
                        <select
                          value={editForm.relationshipStatus}
                          onChange={(e) => setEditForm(prev => ({ ...prev, relationshipStatus: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Не вказано</option>
                          <option value="single">Самотній/я</option>
                          <option value="in_relationship">У стосунках</option>
                          <option value="married">Одружений/а</option>
                          <option value="divorced">Розлучений/а</option>
                          <option value="complicated">Все складно</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Сімейний статус
                        </label>
                        <select
                          value={editForm.familyStatus}
                          onChange={(e) => setEditForm(prev => ({ ...prev, familyStatus: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Не вказано</option>
                          <option value="no_children">Без дітей</option>
                          <option value="have_children">Є діти</option>
                          <option value="want_children">Хочу дітей</option>
                          <option value="no_want_children">Не хочу дітей</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Дата народження
                        </label>
                        <input
                          type="date"
                          value={editForm.birthdate}
                          onChange={(e) => setEditForm(prev => ({ ...prev, birthdate: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Аватар (URL)
                        </label>
                        <input
                          type="url"
                          value={editForm.avatar}
                          onChange={(e) => setEditForm(prev => ({ ...prev, avatar: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://example.com/avatar.jpg"
                        />
                      </div>
                    </div>

                    {/* Hobbies */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Хобі</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {editForm.hobbies.map((hobby, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                          >
                            {hobby}
                            <button
                              type="button"
                              onClick={() => removeHobby(hobby)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newHobby}
                          onChange={(e) => setNewHobby(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHobby())}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Додати хобі"
                        />
                        <button
                          type="button"
                          onClick={addHobby}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Languages */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Мови</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {editForm.languages.map((language, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                          >
                            {language}
                            <button
                              type="button"
                              onClick={() => removeLanguage(language)}
                              className="ml-2 text-green-600 hover:text-green-800"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newLanguage}
                          onChange={(e) => setNewLanguage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Додати мову"
                        />
                        <button
                          type="button"
                          onClick={addLanguage}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Вподобань</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Постів</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Друзів</div>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button className="py-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">
                  Пости
                </button>
                <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
                  Фото
                </button>
                <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
                  Друзі
                </button>
              </nav>
            </div>

            <div className="p-6">
              <div className="text-center py-12">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Поки що немає контенту</h3>
                <p className="text-gray-600 mb-4">Почніть ділитися своїми думками та фото</p>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="h-4 w-4 mr-2" />
                  Створити пост
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}