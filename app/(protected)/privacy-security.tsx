import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { authService } from '../../src/services/authService';
import { supabase } from '../../src/lib/supabase';
import { useAppTheme, type AppColors } from '../../src/context/ThemeContext';

export default function PrivacySecurityScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.updatePassword(newPassword);
      Alert.alert('Success', 'Your password has been updated.', [
        {
          text: 'OK',
          onPress: () => {
            setShowPasswordModal(false);
            setNewPassword('');
            setConfirmPassword('');
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to update password. Please try again.',
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleResetPasswordEmail = async () => {
    if (!user?.email) return;
    Alert.alert(
      'Reset Password',
      `A password reset link will be sent to ${user.email}. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            try {
              await authService.resetPassword(user.email!);
              Alert.alert(
                'Email Sent',
                'Check your inbox for the password reset link.',
              );
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.message || 'Failed to send reset email.',
              );
            }
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'Type "DELETE" to confirm account deletion.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm',
                  style: 'destructive',
                  onPress: async () => {
                    setIsDeletingAccount(true);
                    try {
                      const { error } = await supabase.rpc(
                        'delete_user_account',
                      );
                      if (error) throw error;
                      await signOut();
                      router.replace('/(auth)/login');
                    } catch {
                      Alert.alert(
                        'Error',
                        'Account deletion is not available yet. Please contact support.',
                      );
                    } finally {
                      setIsDeletingAccount(false);
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  const handleSignOutAllDevices = () => {
    Alert.alert(
      'Sign Out All Devices',
      'This will sign you out from all devices. You will need to log in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out All',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut({
                scope: 'global',
              });
              if (error) throw error;
              router.replace('/(auth)/login');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to sign out.');
            }
          },
        },
      ],
    );
  };

  const securityItems = [
    {
      id: '1',
      icon: 'lock-closed' as const,
      title: 'Change Password',
      subtitle: 'Update your account password',
      color: '#4F46E5',
      bgColor: '#EEF2FF',
      onPress: () => setShowPasswordModal(true),
    },
    {
      id: '2',
      icon: 'mail' as const,
      title: 'Reset Password via Email',
      subtitle: `Send reset link to ${user?.email ?? ''}`,
      color: '#10B981',
      bgColor: '#ECFDF5',
      onPress: handleResetPasswordEmail,
    },
    {
      id: '3',
      icon: 'log-out' as const,
      title: 'Sign Out All Devices',
      subtitle: 'End all active sessions',
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      onPress: handleSignOutAllDevices,
    },
  ];

  const privacyItems = [
    {
      id: '4',
      icon: 'eye-off' as const,
      title: 'Account Email',
      subtitle: user?.email ?? 'Not available',
      color: '#6B7280',
      bgColor: '#F3F4F6',
    },
    {
      id: '5',
      icon: 'calendar' as const,
      title: 'Account Created',
      subtitle: user?.created_at
        ? new Date(user.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'Unknown',
      color: '#8B5CF6',
      bgColor: '#F5F3FF',
    },
    {
      id: '6',
      icon: 'time' as const,
      title: 'Last Sign In',
      subtitle: user?.last_sign_in_at
        ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Unknown',
      color: '#06B6D4',
      bgColor: '#ECFEFF',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.menuCard}>
            {securityItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index < securityItems.length - 1 && styles.menuItemBorder,
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
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Privacy / Account Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.menuCard}>
            {privacyItems.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.menuItem,
                  index < privacyItems.length - 1 && styles.menuItemBorder,
                ]}
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
              </View>
            ))}
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>
            Danger Zone
          </Text>
          <View style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeleteAccount}
              disabled={isDeletingAccount}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIconContainer,
                  { backgroundColor: '#FEF2F2' },
                ]}
              >
                {isDeletingAccount ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <Ionicons name="trash" size={22} color="#EF4444" />
                )}
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuTitle, { color: '#EF4444' }]}>
                  Delete Account
                </Text>
                <Text style={styles.menuSubtitle}>
                  Permanently delete your account and data
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TouchableOpacity
              onPress={handleChangePassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.modalSave}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor={colors.placeholder}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Ionicons
                  name={showNewPassword ? 'eye-off' : 'eye'}
                  size={22}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={colors.placeholder}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.passwordHint}>
              Password must be at least 6 characters long.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    header: {
      backgroundColor: c.headerBg,
      paddingTop: 50,
      paddingBottom: 16,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: c.headerText,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingTop: 20,
      paddingHorizontal: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: c.text,
      marginBottom: 12,
      paddingLeft: 4,
    },
    menuCard: {
      backgroundColor: c.surface,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
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
      borderBottomColor: c.border,
    },
    menuIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    menuTextContainer: {
      flex: 1,
    },
    menuTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: c.text,
      marginBottom: 2,
    },
    menuSubtitle: {
      fontSize: 13,
      color: c.textSecondary,
    },
    // Modal
    modalContainer: {
      flex: 1,
      backgroundColor: c.background,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 16,
      paddingBottom: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      backgroundColor: c.surface,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: c.text,
    },
    modalCancel: {
      fontSize: 16,
      color: c.textSecondary,
    },
    modalSave: {
      fontSize: 16,
      fontWeight: '600',
      color: c.primary,
    },
    modalContent: {
      padding: 20,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
      marginBottom: 8,
      marginTop: 16,
    },
    passwordInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.inputBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.inputBorder,
    },
    passwordInput: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 16,
      fontSize: 16,
      color: c.inputText,
    },
    eyeButton: {
      padding: 12,
    },
    passwordHint: {
      fontSize: 13,
      color: c.textTertiary,
      marginTop: 12,
    },
  });
