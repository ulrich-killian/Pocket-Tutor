import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@pocket_tutor_theme';

export interface AppColors {
  // Surfaces
  background: string;
  surface: string;
  surfaceSecondary: string;
  // Header
  headerBg: string;
  headerText: string;
  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  // Borders
  border: string;
  borderLight: string;
  // Input
  inputBg: string;
  inputBorder: string;
  inputText: string;
  placeholder: string;
  // Tab bar
  tabBar: string;
  tabBarBorder: string;
  tabActive: string;
  tabInactive: string;
  // Primary
  primary: string;
  primaryLight: string;
  // Misc
  skeleton: string;
  divider: string;
}

export const lightColors: AppColors = {
  background: '#F3F4F6',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8FAFC',
  headerBg: '#1E3A8A',
  headerText: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F1F5F9',
  inputBg: '#FFFFFF',
  inputBorder: '#E2E8F0',
  inputText: '#1F2937',
  placeholder: '#9CA3AF',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E5E7EB',
  tabActive: '#1E3A8A',
  tabInactive: '#9CA3AF',
  primary: '#1E3A8A',
  primaryLight: '#EEF2FF',
  skeleton: '#E5E7EB',
  divider: '#F3F4F6',
};

export const darkColors: AppColors = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceSecondary: '#162032',
  headerBg: '#0F172A',
  headerText: '#F1F5F9',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  border: '#334155',
  borderLight: '#1E293B',
  inputBg: '#1E293B',
  inputBorder: '#334155',
  inputText: '#F1F5F9',
  placeholder: '#64748B',
  tabBar: '#1E293B',
  tabBarBorder: '#334155',
  tabActive: '#60A5FA',
  tabInactive: '#64748B',
  primary: '#3B82F6',
  primaryLight: '#1E3A5A',
  skeleton: '#334155',
  divider: '#1E293B',
};

interface ThemeContextValue {
  isDark: boolean;
  colors: AppColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
});

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((value) => {
      if (value === 'dark') setIsDark(true);
      setLoaded(true);
    });
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
      return next;
    });
  };

  const colors = isDark ? darkColors : lightColors;

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
