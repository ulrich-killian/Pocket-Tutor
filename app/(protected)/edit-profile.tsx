import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../src/hooks/useAuth';
import { supabase } from '../../src/lib/supabase';

const CLOUDINARY_CLOUD_NAME =
  process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET =
  process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUserMetadata } = useAuth();

  const [fullName, setFullName] = useState(
    (user?.user_metadata?.full_name as string) || '',
  );
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUri, setAvatarUri] = useState<string | null>(
    (user?.user_metadata?.avatar_url as string) || null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null);

  const originalEmail = user?.email || '';
  const originalName = (user?.user_metadata?.full_name as string) || '';

  const hasChanges =
    fullName !== originalName ||
    email !== originalEmail ||
    pendingAvatarUrl !== null;

  // Pick and upload a new avatar
  const handleChangePhoto = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const image = result.assets[0];
      if (!user?.id) return;

      setIsUploadingPhoto(true);

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

      const newUrl = `${data.secure_url}?t=${Date.now()}`;
      setAvatarUri(newUrl);
      setPendingAvatarUrl(newUrl);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Save all changes
  const handleSave = async () => {
    if (!hasChanges) {
      router.back();
      return;
    }

    setIsSaving(true);
    try {
      // 1. Update name and avatar via user metadata
      const metadata: Record<string, unknown> = {};
      if (fullName !== originalName) {
        metadata.full_name = fullName.trim();
      }
      if (pendingAvatarUrl) {
        metadata.avatar_url = pendingAvatarUrl;
      }
      if (Object.keys(metadata).length > 0) {
        await updateUserMetadata(metadata);
      }

      // 2. Update email if changed (Supabase sends confirmation)
      if (email.trim() !== originalEmail) {
        const { error } = await supabase.auth.updateUser({
          email: email.trim(),
        });
        if (error) throw new Error(error.message);
        Alert.alert(
          'Confirm Email',
          'A confirmation link has been sent to your new email address. Please verify it to complete the change.',
          [{ text: 'OK', onPress: () => router.back() }],
        );
        return;
      }

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getUserInitials = () => {
    if (fullName) return fullName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!hasChanges || isSaving) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.avatar}
                  key={avatarUri}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{getUserInitials()}</Text>
                </View>
              )}
              {isUploadingPhoto && (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={handleChangePhoto}
              disabled={isUploadingPhoto}
            >
              <Ionicons name="camera-outline" size={18} color="#1E3A8A" />
              <Text style={styles.changePhotoText}>
                {isUploadingPhoto ? 'Uploading...' : 'Change Photo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Full Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#9CA3AF"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  returnKeyType="next"
                />
                {fullName !== originalName && fullName.length > 0 && (
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                )}
              </View>
            </View>

            {/* Email */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#9CA3AF"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                />
                {email !== originalEmail && email.length > 0 && (
                  <Ionicons
                    name="alert-circle-outline"
                    size={20}
                    color="#F59E0B"
                  />
                )}
              </View>
              {email !== originalEmail && (
                <Text style={styles.fieldHint}>
                  A confirmation email will be sent to verify the new address.
                </Text>
              )}
            </View>

            {/* Member Since (read-only) */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Member Since</Text>
              <View style={[styles.inputWrapper, styles.inputDisabled]}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#9CA3AF"
                  style={styles.inputIcon}
                />
                <Text style={styles.inputDisabledText}>
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* Info Note */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text style={styles.infoText}>
              Changing your email requires verification. You&apos;ll receive a
              confirmation link at your new address.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  saveButton: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
  },

  // Form
  formSection: {
    gap: 20,
    marginBottom: 24,
  },
  fieldContainer: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  inputDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
  },
  inputDisabledText: {
    flex: 1,
    fontSize: 16,
    color: '#9CA3AF',
  },
  fieldHint: {
    fontSize: 12,
    color: '#F59E0B',
    marginLeft: 4,
  },

  // Info
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 16,
    gap: 10,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 20,
  },
});
