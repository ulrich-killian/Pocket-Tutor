import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { AuthError } from '../services/authService';
import { useAppTheme, type AppColors } from '../context/ThemeContext';
interface LoginScreenProps {
  navigation?: {
    navigate: (screen: string) => void;
  };
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { signIn, loading } = useAuth();
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [showLoader, setShowLoader] = useState(false);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleLogin = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (cooldown > 0) {
      setError(`Please wait ${cooldown} second(s) before trying again`);
      return;
    }

    setError(null);

    // Show the loader immediately when login is triggered
    setShowLoader(true);

    try {
      await signIn(email.trim(), password);
      // Keep loader visible for a moment to show the transition
      setTimeout(() => {
        setShowLoader(false);
        router.replace('/dashboard');
      }, 1500);
    } catch (err) {
      if (
        err instanceof AuthError &&
        (err.statusCode === 429 || err.code === 'over_email_send_rate_limit')
      ) {
        setCooldown(60);
        const errorMessage =
          err.code === 'over_email_send_rate_limit'
            ? 'Email rate limit exceeded. Please wait 60 seconds.'
            : 'Too many requests. Please wait 60 seconds.';
        setError(errorMessage);
        return;
      }

      if (err instanceof AuthError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      // Hide loader on error
      setShowLoader(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      Alert.alert('Reset Password', 'Please enter your email address first.', [
        { text: 'OK' },
      ]);
      return;
    }

    Alert.alert(
      'Reset Password',
      `We will send a password reset link to ${email}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            Alert.alert('Success', 'Check your email for the reset link.');
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>PT</Text>
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue learning</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={colors.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotLink}>Forgot?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={colors.placeholder}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.togglePassword}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.togglePasswordText}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.button,
              (loading || cooldown > 0) && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading || cooldown > 0}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : cooldown > 0 ? (
              <Text style={styles.buttonText}>Wait {cooldown}s</Text>
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {showLoader && (
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loaderText}>Logging you in...</Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 80,
      paddingBottom: 40,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 32,
    },
    logoCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    logoText: {
      fontSize: 32,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: c.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      color: c.textSecondary,
    },
    form: {},
    inputContainer: {
      marginBottom: 20,
    },
    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
    },
    forgotLink: {
      fontSize: 14,
      color: c.primary,
      fontWeight: '500',
    },
    input: {
      borderWidth: 1,
      borderColor: c.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: c.inputText,
      backgroundColor: c.inputBg,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.inputBorder,
      borderRadius: 12,
      backgroundColor: c.inputBg,
    },
    passwordInput: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: c.inputText,
    },
    togglePassword: {
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    togglePasswordText: {
      fontSize: 14,
      color: c.primary,
      fontWeight: '600',
    },
    errorContainer: {
      backgroundColor: '#FEF2F2',
      borderWidth: 1,
      borderColor: '#FECACA',
      borderRadius: 12,
      padding: 14,
      marginBottom: 16,
    },
    errorText: {
      color: '#DC2626',
      fontSize: 14,
      textAlign: 'center',
    },
    button: {
      backgroundColor: c.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: 24,
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: c.border,
    },
    dividerText: {
      fontSize: 14,
      color: c.textTertiary,
      marginHorizontal: 16,
    },
    signUpContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    signUpText: {
      fontSize: 14,
      color: c.textSecondary,
    },
    signUpLink: {
      fontSize: 14,
      color: c.primary,
      fontWeight: '600',
    },
    loaderOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loaderContainer: {
      backgroundColor: c.surface,
      padding: 32,
      borderRadius: 16,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    loaderText: {
      marginTop: 16,
      fontSize: 16,
      color: c.text,
      fontWeight: '500',
    },
  });
