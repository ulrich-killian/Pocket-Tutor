import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  AntDesign,
} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../src/hooks/useAuth';

const CLOUDINARY_CLOUD_NAME =
  process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET =
  process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

export default function Profile() {
  const router = useRouter();
  const { user, signOut, updateUserMetadata } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);

  // Settings states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] =
    useState(true);

  // Get user initials for avatar placeholder
  const getUserInitials = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Get display name from user metadata
  const getDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  // Handle avatar pick and upload
  const handlePickAvatar = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to change your profile picture.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled || !result.assets || result.assets.length === 0)
        return;

      const image = result.assets[0];
      if (!user?.id) return;

      setIsUploadingAvatar(true);

      const formData = new FormData();
      formData.append('file', {
        uri: image.uri,
        name: `avatar_${user.id}.jpg`,
        type: image.mimeType || 'image/jpeg',
      } as any);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'pocket-tutor/avatars');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      const avatarUrl = `${data.secure_url}?t=${Date.now()}`;
      setLocalAvatarUri(avatarUrl);
      await updateUserMetadata({ avatar_url: avatarUrl });

      Alert.alert('Success', 'Profile picture updated!');
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile picture');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          setIsLoading(true);
          try {
            await signOut();
            router.replace('/(auth)/login');
          } catch (error) {
            Alert.alert('Error', 'Failed to logout. Please try again.');
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  // Bottom Tab Navigation
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    {
      id: 'home',
      name: 'Home',
      icon: 'home' as keyof typeof Ionicons.glyphMap,
      activeIcon: 'home' as keyof typeof Ionicons.glyphMap,
      route: '/dashboard',
    },
    {
      id: 'study',
      name: 'Study',
      icon: 'book-outline' as keyof typeof Ionicons.glyphMap,
      activeIcon: 'book' as keyof typeof Ionicons.glyphMap,
      route: '/chat',
    },
    {
      id: 'flashcards',
      name: 'Flashcards',
      icon: 'albums-outline' as keyof typeof Ionicons.glyphMap,
      activeIcon: 'albums' as keyof typeof Ionicons.glyphMap,
      route: '/flashcards',
    },
    {
      id: 'profile',
      name: 'Profile',
      icon: 'person-outline' as keyof typeof Ionicons.glyphMap,
      activeIcon: 'person' as keyof typeof Ionicons.glyphMap,
      route: '/profile',
    },
  ];

  const handleTabPress = (tab: (typeof tabs)[0]) => {
    setActiveTab(tab.id);
    if (tab.id !== 'profile') {
      router.push(tab.route as any);
    }
  };

  // Bottom Tab Bar
  const BottomTabBar = () => (
    <View style={styles.bottomTabBar}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={styles.tabItem}
          onPress={() => handleTabPress(tab)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === tab.id ? tab.activeIcon : tab.icon}
            size={24}
            color={activeTab === tab.id ? '#1E3A8A' : '#9CA3AF'}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === tab.id ? '#1E3A8A' : '#9CA3AF' },
            ]}
          >
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Profile stats
  const stats = [
    {
      id: '1',
      value: '12',
      label: 'Flashcards',
      icon: 'albums' as keyof typeof Ionicons.glyphMap,
      color: '#10B981',
    },
    {
      id: '2',
      value: '5',
      label: 'Quizzes',
      icon: 'document-text' as keyof typeof Ionicons.glyphMap,
      color: '#F59E0B',
    },
    {
      id: '3',
      value: '24',
      label: 'Hours',
      icon: 'time' as keyof typeof Ionicons.glyphMap,
      color: '#4F46E5',
    },
    {
      id: '4',
      value: '8',
      label: 'Streak',
      icon: 'flame' as keyof typeof Ionicons.glyphMap,
      color: '#EC4899',
    },
  ];

  // Menu items
  const menuItems = [
    {
      id: '1',
      icon: 'person' as keyof typeof Ionicons.glyphMap,
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      color: '#4F46E5',
      bgColor: '#EEF2FF',
      onPress: () =>
        Alert.alert('Edit Profile', 'Profile editing coming soon!'),
    },
    {
      id: '2',
      icon: 'notifications' as keyof typeof Ionicons.glyphMap,
      title: 'Notifications',
      subtitle: 'Manage notification settings',
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      hasSwitch: true,
      switchValue: notificationsEnabled,
      onSwitchChange: setNotificationsEnabled,
    },
    {
      id: '3',
      icon: 'mail' as keyof typeof Ionicons.glyphMap,
      title: 'Email Notifications',
      subtitle: 'Receive updates via email',
      color: '#10B981',
      bgColor: '#ECFDF5',
      hasSwitch: true,
      switchValue: emailNotificationsEnabled,
      onSwitchChange: setEmailNotificationsEnabled,
    },
    {
      id: '4',
      icon: 'moon' as keyof typeof Ionicons.glyphMap,
      title: 'Dark Mode',
      subtitle: 'Switch to dark theme',
      color: '#8B5CF6',
      bgColor: '#F5F3FF',
      hasSwitch: true,
      switchValue: darkModeEnabled,
      onSwitchChange: setDarkModeEnabled,
    },
    {
      id: '5',
      icon: 'help-circle' as keyof typeof Ionicons.glyphMap,
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      color: '#06B6D4',
      bgColor: '#ECFEFF',
      onPress: () => Alert.alert('Help & Support', 'Help center coming soon!'),
    },
    {
      id: '6',
      icon: 'shield-checkmark' as keyof typeof Ionicons.glyphMap,
      title: 'Privacy & Security',
      subtitle: 'Manage your privacy settings',
      color: '#EF4444',
      bgColor: '#FEF2F2',
      onPress: () =>
        Alert.alert('Privacy & Security', 'Privacy settings coming soon!'),
    },
    {
      id: '7',
      icon: 'information-circle' as keyof typeof Ionicons.glyphMap,
      title: 'About',
      subtitle: 'App version and information',
      color: '#6B7280',
      bgColor: '#F3F4F6',
      onPress: () =>
        Alert.alert('About', 'Pocket Tutor v1.0.0\nBuilt with love ❤️'),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.notificationButton}>
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingsButton}>
                <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {localAvatarUri || user?.user_metadata?.avatar_url ? (
              <Image
                source={{
                  uri: localAvatarUri || user?.user_metadata?.avatar_url,
                }}
                style={styles.avatar}
                key={localAvatarUri || user?.user_metadata?.avatar_url}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{getUserInitials()}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={handlePickAvatar}
              disabled={isUploadingAvatar}
            >
              {isUploadingAvatar ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{getDisplayName()}</Text>
          <Text style={styles.userEmail}>
            {user?.email || 'No email provided'}
          </Text>

          {/* Member since */}
          <View style={styles.memberBadge}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.memberText}>
              Member since{' '}
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })
                : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <TouchableOpacity key={stat.id} style={styles.statItem}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: stat.color + '20' },
                ]}
              >
                <Ionicons name={stat.icon} size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index < menuItems.length - 1 && styles.menuItemBorder,
                ]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.menuIconContainer,
                    { backgroundColor: item.bgColor },
                  ]}
                >
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                {item.hasSwitch ? (
                  <Switch
                    value={item.switchValue}
                    onValueChange={item.onSwitchChange}
                    trackColor={{ false: '#E5E7EB', true: item.color + '80' }}
                    thumbColor={item.switchValue ? item.color : '#FFFFFF'}
                    ios_backgroundColor="#E5E7EB"
                  />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text style={styles.logoutText}>
              {isLoading ? 'Logging out...' : 'Logout'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <Text style={styles.versionText}>Pocket Tutor v1.0.0</Text>

        {/* Bottom padding for tab bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Tab Bar */}
      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#1E3A8A',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  memberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 20,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  menuSection: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  logoutSection: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 20,
  },
  bottomPadding: {
    height: 20,
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingBottom: 30,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});
