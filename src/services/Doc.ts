const BACKEND_URL = 'http://localhost:3000';

async function uploadDocument(
  file: { uri: string; name: string; type: string },
  userId: string,
  title: string,
) {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);
    formData.append('userId', userId);
    formData.append('title', title);

    const response = await fetch(`${BACKEND_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return data;
  } catch (err) {
    console.error('Upload error:', err.message);
    throw err;
  }
}
