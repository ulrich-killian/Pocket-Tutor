import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, type AppColors } from '../../src/context/ThemeContext';

interface ChatInputProps {
  onSend: (text: string, image?: string) => void;
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const pickImage = async (): Promise<void> => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        'Permission Required',
        'Please allow camera access to take pictures.',
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setSelectedImage(base64Image);
    }
  };

  const clearImage = (): void => {
    setSelectedImage(null);
  };

  const handleSend = (): void => {
    if (!input.trim() && !selectedImage) return;
    onSend(input.trim(), selectedImage ?? undefined);
    setInput('');
    setSelectedImage(null);
    Keyboard.dismiss();
  };

  const canSend = (input.trim().length > 0 || selectedImage) && !disabled;

  return (
    <View style={styles.container}>
      <View style={styles.attachmentContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onCameraPress}
          disabled={disabled}
        >
          <Ionicons name="camera-outline" size={24} color="#6366F1" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onFilePress}
          disabled={disabled}
        >
          <Ionicons name="document-attach-outline" size={24} color="#6366F1" />
        </TouchableOpacity>
      </View>

      {selectedImage && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={clearImage}
          >
            <Ionicons name="close-circle" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}
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
        style={styles.cameraButton}
        onPress={pickImage}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Ionicons
          name="camera"
          size={22}
          color={disabled ? '#9CA3AF' : '#6366F1'}
        />
      </TouchableOpacity>

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
    imagePreviewContainer: {
      position: 'relative',
      marginBottom: 8,
    },
    imagePreview: {
      width: 60,
      height: 60,
      borderRadius: 8,
      marginRight: 8,
    },
    removeImageButton: {
      position: 'absolute',
      top: -8,
      right: 4,
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
    cameraButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
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
