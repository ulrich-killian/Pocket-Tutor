import * as DocumentPicker from 'expo-document-picker';
import { useCallback, useRef } from 'react';
import { Platform } from 'react-native';

export type SelectedFile = {
  uri: string;
  name: string;
  type: string;
  size: number;
} | null;

type MimeTypes = DocumentPicker.DocumentPickerOptions['type'];

export const useFilePicker = (
  mimeTypes?: MimeTypes,
): {
  selectFile: (overrideMimeTypes?: MimeTypes) => Promise<SelectedFile>;
  inputRef: React.RefObject<HTMLInputElement | null>;
} => {
  const inputRef = useRef<HTMLInputElement>(null);

  const selectFile = useCallback(
    async (overrideMimeTypes?: MimeTypes): Promise<SelectedFile> => {
      const types = overrideMimeTypes || mimeTypes;
      if (Platform.OS === 'web') {
        return new Promise((resolve) => {
          const input = inputRef.current;
          if (!input) {
            resolve(null);
            return;
          }

          // Clear previous value and set accept
          input.value = '';
          if (types) {
            input.accept = Array.isArray(types) ? types.join(',') : '*/*';
          }

          const handleChange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            const file = target.files?.[0];
            if (file) {
              resolve({
                uri: URL.createObjectURL(file),
                name: file.name,
                type: file.type || 'application/octet-stream',
                size: file.size,
              });
            } else {
              resolve(null);
            }
            input.removeEventListener('change', handleChange);
          };

          input.addEventListener('change', handleChange);
          input.click();
        });
      } else {
        const result = (await DocumentPicker.getDocumentAsync({
          type: types || [
            'application/pdf',
            'text/plain',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ],
          copyToCacheDirectory: true,
        })) as any;

        if (result.canceled || !result.assets?.[0]) {
          return null;
        }

        const file = result.assets[0];
        return {
          uri: file.uri,
          name: file.name!,
          type: file.mimeType || 'application/octet-stream',
          size: file.size || 0,
        };
      }
    },
    [mimeTypes],
  );

  return { selectFile, inputRef };
};
