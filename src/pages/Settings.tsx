import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { supabase } from '../lib/supabase';
import { User, Shield, Bell, Globe, Lock, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../lib/userProfileService';

interface UserSettings {
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
  isVerified?: boolean;
  familyStatus?: string;
  location?: string;
  hobbies?: string[];
  languages?: string[];
  email_verified?: boolean;
  notifications: {
    email: boolean;
    messages: boolean;
    friendRequests: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showBirthDate: boolean;
    showEmail: boolean;
  };
}

export function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [newHobby, setNewHobby] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    last_name: '',
    email: '',
    avatar: '',
    bio: '',
    city: '',
    birth_date: '',
    education: '',
    work: '',
    relationshipStatus: '',
    phone: '',
    website: '',
    isVerified: false,
    familyStatus: '',
    location: '',
    hobbies: [],
    languages: [],
    email_verified: false,
    notifications: {
      email: true,
      messages: true,
      friendRequests: true,
    },
    privacy: {
      profileVisibility: 'public',
      showBirthDate: true,
      showEmail: false,
    },
  });

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        navigate('/login');
        return;
      }
      const data = await getUserProfile(authUser.id);
      if (!data) return;
      setSettings({
        name: data.name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        avatar: data.avatar || '',
        bio: data.bio || '',
        city: data.city || '',
        birth_date: data.birth_date || '',
        education: data.education || '',
        work: data.work || '',
        relationshipStatus: data.relationshipStatus || '',
        phone: data.phone || '',
        website: data.website || '',
        isVerified: data.isVerified || false,
        familyStatus: data.familyStatus || '',
        location: data.location || '',
        hobbies: data.hobbies || [],
        languages: data.languages || [],
        email_verified: data.email_verified || false,
        notifications: data.notifications || { email: true, messages: true, friendRequests: true },
        privacy: data.privacy || { profileVisibility: 'public', showBirthDate: true, showEmail: false },
      });
    } catch (error) {
      console.error('Error loading user settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        navigate('/login');
        return;
      }
      await updateUserProfile(authUser.id, settings);
      alert('Налаштування збережено успішно');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Помилка при збереженні налаштувань');
    }
  };

  const addHobby = () => {
    if (newHobby.trim() && !settings.hobbies?.includes(newHobby.trim())) {
      setSettings({
        ...settings,
        hobbies: [...(settings.hobbies || []), newHobby.trim()]
      });
      setNewHobby('');
    }
  };

  const removeHobby = (hobby: string) => {
    setSettings({
      ...settings,
      hobbies: settings.hobbies?.filter(h => h !== hobby) || []
    });
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !settings.languages?.includes(newLanguage.trim())) {
      setSettings({
        ...settings,
        languages: [...(settings.languages || []), newLanguage.trim()]
      });
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setSettings({
      ...settings,
      languages: settings.languages?.filter(l => l !== language) || []
    });
  };

  const tabs = [
    { id: 'profile', label: 'Профіль', icon: User },
    { id: 'additional', label: 'Додаткова інформація', icon: Globe },
    { id: 'privacy', label: 'Приватність', icon: Lock },
    { id: 'notifications', label: 'Сповіщення', icon: Bell },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="text-center">Завантаження...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Налаштування</h1>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-200">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center px-6 py-3 text-sm font-medium ${
                    activeTab === id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={18} className="mr-2" />
                  {label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'profile' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ім'я</label>
                      <input
                        type="text"
                        value={settings.name}
                        onChange={e => setSettings({ ...settings, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Прізвище</label>
                      <input
                        type="text"
                        value={settings.last_name}
                        onChange={e => setSettings({ ...settings, last_name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={settings.email}
                        onChange={e => setSettings({ ...settings, email: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      {settings.email_verified && (
                        <p className="text-sm text-green-600 mt-1">✓ Email верифіковано</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Телефон</label>
                      <input
                        type="tel"
                        value={settings.phone || ''}
                        onChange={e => setSettings({ ...settings, phone: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="+380..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Аватар (URL)</label>
                    <input
                      type="url"
                      value={settings.avatar || ''}
                      onChange={e => setSettings({ ...settings, avatar: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Про себе</label>
                    <textarea
                      value={settings.bio || ''}
                      onChange={e => setSettings({ ...settings, bio: e.target.value })}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Місто</label>
                      <input
                        type="text"
                        value={settings.city || ''}
                        onChange={e => setSettings({ ...settings, city: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Місцезнаходження</label>
                      <input
                        type="text"
                        value={settings.location || ''}
                        onChange={e => setSettings({ ...settings, location: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Країна, регіон"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">День народження</label>
                    <input
                      type="date"
                      value={settings.birth_date || ''}
                      onChange={e => setSettings({ ...settings, birth_date: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Веб-сайт</label>
                    <input
                      type="url"
                      value={settings.website || ''}
                      onChange={e => setSettings({ ...settings, website: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Зберегти
                  </button>
                </form>
              )}

              {activeTab === 'additional' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Освіта</label>
                      <input
                        type="text"
                        value={settings.education || ''}
                        onChange={e => setSettings({ ...settings, education: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Університет, спеціальність"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Робота</label>
                      <input
                        type="text"
                        value={settings.work || ''}
                        onChange={e => setSettings({ ...settings, work: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Компанія, посада"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Статус стосунків</label>
                      <select
                        value={settings.relationshipStatus || ''}
                        onChange={e => setSettings({ ...settings, relationshipStatus: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                      <label className="block text-sm font-medium text-gray-700">Сімейний статус</label>
                      <select
                        value={settings.familyStatus || ''}
                        onChange={e => setSettings({ ...settings, familyStatus: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Не вказано</option>
                        <option value="no_children">Без дітей</option>
                        <option value="have_children">Є діти</option>
                        <option value="want_children">Хочу дітей</option>
                        <option value="no_want_children">Не хочу дітей</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Хобі</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {settings.hobbies?.map((hobby, index) => (
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
                        onChange={e => setNewHobby(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addHobby())}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Додати хобі"
                      />
                      <button
                        type="button"
                        onClick={addHobby}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Мови</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {settings.languages?.map((language, index) => (
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
                        onChange={e => setNewLanguage(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Додати мову"
                      />
                      <button
                        type="button"
                        onClick={addLanguage}
                        className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Зберегти
                  </button>
                </form>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Видимість профілю</label>
                    <div className="flex space-x-4 mt-2">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="profileVisibility"
                          value="public"
                          checked={settings.privacy.profileVisibility === 'public'}
                          onChange={() => setSettings({ ...settings, privacy: { ...settings.privacy, profileVisibility: 'public' } })}
                          className="form-radio h-5 w-5 text-blue-600"
                        />
                        <span className="ml-2">Публічно</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="profileVisibility"
                          value="friends"
                          checked={settings.privacy.profileVisibility === 'friends'}
                          onChange={() => setSettings({ ...settings, privacy: { ...settings.privacy, profileVisibility: 'friends' } })}
                          className="form-radio h-5 w-5 text-blue-600"
                        />
                        <span className="ml-2">Тільки друзі</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="profileVisibility"
                          value="private"
                          checked={settings.privacy.profileVisibility === 'private'}
                          onChange={() => setSettings({ ...settings, privacy: { ...settings.privacy, profileVisibility: 'private' } })}
                          className="form-radio h-5 w-5 text-blue-600"
                        />
                        <span className="ml-2">Приватно</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.privacy.showEmail}
                        onChange={e => setSettings({ ...settings, privacy: { ...settings.privacy, showEmail: e.target.checked } })}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                      <span className="ml-2">Показувати email</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.privacy.showBirthDate}
                        onChange={e => setSettings({ ...settings, privacy: { ...settings.privacy, showBirthDate: e.target.checked } })}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                      <span className="ml-2">Показувати дату народження</span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.email}
                        onChange={e => setSettings({ ...settings, notifications: { ...settings.notifications, email: e.target.checked } })}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                      <span className="ml-2">Email</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.messages}
                        onChange={e => setSettings({ ...settings, notifications: { ...settings.notifications, messages: e.target.checked } })}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                      <span className="ml-2">Повідомлення</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.friendRequests}
                        onChange={e => setSettings({ ...settings, notifications: { ...settings.notifications, friendRequests: e.target.checked } })}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                      <span className="ml-2">Запити в друзі</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}