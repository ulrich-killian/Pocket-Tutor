import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, type AppColors } from '../../src/context/ThemeContext';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const handleSend = (): void => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
    Keyboard.dismiss();
  };

  const canSend = input.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      <View style={[styles.inputWrapper, isFocused && styles.inputFocused]}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask your tutor anything..."
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={2000}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.sendButton,
          canSend ? styles.sendButtonActive : styles.sendButtonDisabled,
        ]}
        onPress={handleSend}
        disabled={!canSend}
        activeOpacity={0.7}
      >
        <Ionicons
          name="send"
          size={20}
          color={canSend ? '#FFFFFF' : '#9CA3AF'}
        />
      </TouchableOpacity>
    </View>
  );
};

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: c.surface,
      borderTopWidth: 1,
      borderTopColor: c.border,
      gap: 10,
    },
    inputWrapper: {
      flex: 1,
      backgroundColor: c.surfaceSecondary,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 16,
      paddingVertical: 10,
      maxHeight: 120,
    },
    inputFocused: {
      borderColor: '#6366F1',
      backgroundColor: c.inputBg,
    },
    input: {
      fontSize: 15,
      lineHeight: 20,
      color: c.inputText,
      maxHeight: 100,
      padding: 0,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonActive: {
      backgroundColor: '#4F46E5',
      shadowColor: '#4F46E5',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    sendButtonDisabled: {
      backgroundColor: c.skeleton,
    },
  });

export default ChatInput;
