'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  address: string | null;
  birth_date: string | null;
  bio: string | null;
  role: string;
  updated_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, refreshAuth } = useAuth();
  const [saveLoading, setSaveLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [bio, setBio] = useState('');
  const supabase = createClientComponentClient();

  // Check if user is authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("Profile: User not authenticated, redirecting to login");
      router.push('/auth/signin?redirect=/profile');
    }
  }, [isLoading, isAuthenticated, router]);

  // Load profile data when user is available
  useEffect(() => {
    if (user && user.id) {
      console.log("Profile: User authenticated, fetching profile data");
      getProfile();
    }
  }, [user]);

  async function getProfile() {
    try {
      setProfileLoading(true);
      console.log("Profile: Fetching profile for user", user?.id);

      if (!user?.id) {
        console.log("Profile: No user ID available");
        return;
      }

      // First check if profile data is already in the user object
      if (user.profile) {
        console.log("Profile: Using profile data from user object");
        setProfile(user.profile as UserProfile);
        setFirstName(user.profile.first_name || '');
        setLastName(user.profile.last_name || '');
        setAddress(user.profile.address || '');
        setBirthDate(user.profile.birth_date || '');
        setBio(user.profile.bio || '');
        return;
      }

      // Otherwise fetch from the database
      console.log("Profile: Fetching profile from database");
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Profile: Error fetching profile:", error);
        return;
      }

      if (data) {
        console.log("Profile: Profile data retrieved successfully");
        setProfile(data);
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setAddress(data.address || '');
        setBirthDate(data.birth_date || '');
        setBio(data.bio || '');
      } else {
        console.log("Profile: No profile data found");
      }
    } catch (error) {
      console.error("Profile: Unexpected error:", error);
    } finally {
      setProfileLoading(false);
    }
  }

  async function updateProfile() {
    if (!user) {
      console.error("Profile: Cannot update profile, no user");
      return;
    }
    
    try {
      console.log("Profile: Updating profile for user", user.id);
      setSaveLoading(true);

      const updates = {
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        address: address,
        birth_date: birthDate,
        bio: bio,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) {
        console.error("Profile: Error updating profile:", error);
        throw error;
      }
      
      // Refresh auth context to get updated profile
      console.log("Profile: Profile updated, refreshing auth context");
      await refreshAuth();
      
      alert('Profile updated!');
    } catch (error) {
      alert('Error updating the data!');
      console.error("Profile: Error in updateProfile:", error);
    } finally {
      setSaveLoading(false);
    }
  }

  // Show loading while checking auth or fetching profile
  if (isLoading || profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-rugby-teal mb-4" />
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect handled in useEffect)
  if (!user) {
    return null;
  }

  return (
    <div className="container-width py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-secondary-navy mb-8">Profile Settings</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="text"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue bg-gray-100 dark:bg-gray-700"
            />
          </div>

          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Address
            </label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue"
            />
          </div>

          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Birth Date
            </label>
            <input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue"
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={updateProfile}
              disabled={saveLoading}
              className="flex items-center"
            >
              {saveLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 
