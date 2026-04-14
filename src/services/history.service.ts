import api from './api';

export type StudyActivityType = 'flashcard' | 'quiz' | 'chat' | 'document';

export interface StudyActivity {
  id: string;
  userId: string;
  type: StudyActivityType;
  title: string;
  description?: string;
  duration?: number;
  score?: number;
  totalQuestions?: number;
  correctAnswers?: number;
  documentId?: string;
  createdAt: string;
}

export interface CreateActivityPayload {
  userId: string;
  type: StudyActivityType;
  title: string;
  description?: string;
  duration?: number;
  score?: number;
  totalQuestions?: number;
  correctAnswers?: number;
  documentId?: string;
}

export interface StudyStats {
  type: StudyActivityType;
  total_sessions: number;
  total_duration: number | null;
  avg_score: number | null;
  last_activity: string;
}

class HistoryError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'HistoryError';
  }
}

export async function createActivity(
  payload: CreateActivityPayload,
): Promise<StudyActivity> {
  try {
    const response = await api.post<{
      success: boolean;
      activity: StudyActivity;
    }>('/history', payload);
    return response.data.activity;
  } catch (error: any) {
    const message =
      error.response?.data?.message || 'Failed to create activity';
    throw new HistoryError(message, 'CREATE_FAILED');
  }
}

export async function getUserHistory(
  userId: string,
  limit = 20,
): Promise<StudyActivity[]> {
  try {
    const response = await api.get<{ history: StudyActivity[] }>(
      `/history/user/${userId}`,
      { params: { limit } },
    );
    return response.data.history;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to fetch history';
    throw new HistoryError(message, 'FETCH_FAILED');
  }
}

export async function getHistoryByType(
  userId: string,
  type: StudyActivityType,
): Promise<StudyActivity[]> {
  try {
    const response = await api.get<{ history: StudyActivity[] }>(
      `/history/user/${userId}/${type}`,
    );
    return response.data.history;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to fetch history';
    throw new HistoryError(message, 'FETCH_FAILED');
  }
}

export async function getStudyStats(userId: string): Promise<StudyStats[]> {
  try {
    const response = await api.get<{ stats: StudyStats[] }>(
      `/history/stats/${userId}`,
    );
    return response.data.stats;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to fetch stats';
    throw new HistoryError(message, 'FETCH_FAILED');
  }
}

export async function deleteActivity(
  id: string,
  userId: string,
): Promise<boolean> {
  try {
    const response = await api.delete<{ success: boolean }>(`/history/${id}`, {
      data: { userId },
    });
    return response.data.success;
  } catch (error: any) {
    const message =
      error.response?.data?.message || 'Failed to delete activity';
    throw new HistoryError(message, 'DELETE_FAILED');
  }
}

export async function clearUserHistory(userId: string): Promise<number> {
  try {
    const response = await api.delete<{ success: boolean; deleted: number }>(
      `/history/clear/${userId}`,
    );
    return response.data.deleted;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to clear history';
    throw new HistoryError(message, 'CLEAR_FAILED');
  }
}

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return '0m';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return 'Today';
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

export function getActivityIcon(type: StudyActivityType): string {
  switch (type) {
    case 'flashcard':
      return 'albums';
    case 'quiz':
      return 'document-text';
    case 'chat':
      return 'chatbubbles';
    case 'document':
      return 'folder';
    default:
      return 'time';
  }
}

export function getActivityColor(type: StudyActivityType): string {
  switch (type) {
    case 'flashcard':
      return '#10B981';
    case 'quiz':
      return '#F59E0B';
    case 'chat':
      return '#3B82F6';
    case 'document':
      return '#EC4899';
    default:
      return '#8B5CF6';
  }
}
