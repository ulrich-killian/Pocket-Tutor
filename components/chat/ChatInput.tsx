import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, type AppColors } from '../../src/context/ThemeContext';

interface ChatInputProps {
  onSend: (text: string) => void;
  onFilePress: () => void;
  onCameraPress: () => void;
  disabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onFilePress,
  onCameraPress,
  disabled,
}) => {
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
      <View style={styles.attachmentContainer}>
        {/* STEP 3: Ensure onPress points to the prop onCameraPress */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onCameraPress}
          disabled={disabled}
        >
          <Ionicons name="camera-outline" size={24} color="#6366F1" />
        </TouchableOpacity>

        {/* STEP 4: Ensure onPress points to the prop onFilePress */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onFilePress}
          disabled={disabled}
        >
          <Ionicons name="document-attach-outline" size={24} color="#6366F1" />
        </TouchableOpacity>
      </View>

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
      paddingHorizontal: 12, // Reduced padding to fit more icons
      paddingVertical: 12,
      backgroundColor: c.surface,
      borderTopWidth: 1,
      borderTopColor: c.border,
      gap: 8,
    },
    attachmentContainer: {
      flexDirection: 'row',
      gap: 4,
      paddingBottom: 4, // Align icons slightly better with the input
    },
    iconButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    inputWrapper: {
      flex: 1,
      backgroundColor: c.surfaceSecondary,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
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
    },
    sendButtonDisabled: {
      backgroundColor: c.skeleton,
    },
  });
export default ChatInput;
