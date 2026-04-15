import api from './api';
import { EducationLevel, Stream, Subject } from '../types/syllabus';

export const syllabusService = {
  getAllLevels: async (): Promise<EducationLevel[]> => {
    const response = await api.get('/syllabus/levels');
    return response.data;
  },

  getLevelById: async (id: string): Promise<EducationLevel> => {
    const response = await api.get(`/syllabus/levels/${id}`);
    return response.data;
  },

  getStreamsByLevelId: async (levelId: string): Promise<Stream[]> => {
    const response = await api.get(`/syllabus/levels/${levelId}/streams`);
    return response.data;
  },

  getSubjectsByStreamId: async (streamId: string): Promise<Subject[]> => {
    const response = await api.get(`/syllabus/streams/${streamId}/subjects`);
    return response.data;
  },

  seedEducationLevels: async (): Promise<{ message: string }> => {
    const response = await api.get('/syllabus/seed');
    return response.data;
  },
};

export default syllabusService;
