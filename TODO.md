# Fix Upload Buttons on Web

## Steps:

1. ✅ Create TODO.md
2. Create src/hooks/useFilePicker.ts - Web file input + Native DocumentPicker hook
3. Update app/(protected)/upload.tsx - Use useFilePicker in handleSelectFile
4. Update app/(protected)/documents-with-status.tsx - Replace DocumentPicker in handleUpload
5. Update app/(protected)/documents.tsx if needed
6. Test: expo start --web, test upload button/file select
7. attempt_completion
