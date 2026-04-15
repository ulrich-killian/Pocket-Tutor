import { useState, useCallback, useEffect } from 'react';
import { EducationLevel, Stream, Subject } from '../types/syllabus';
import syllabusService from '../services/syllabus.service';

interface UseSyllabusReturn {
  levels: EducationLevel[];
  selectedLevel: EducationLevel | null;
  selectedStream: Stream | null;
  isLoading: boolean;
  error: string | null;
  fetchLevels: () => Promise<void>;
  selectLevel: (level: EducationLevel | null) => void;
  selectStream: (stream: Stream | null) => void;
  fetchStreams: (levelId: string) => Promise<Stream[]>;
  fetchSubjects: (streamId: string) => Promise<Subject[]>;
}

export function useSyllabus(): UseSyllabusReturn {
  const [levels, setLevels] = useState<EducationLevel[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel | null>(
    null,
  );
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLevels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await syllabusService.getAllLevels();
      setLevels(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch education levels',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectLevel = useCallback((level: EducationLevel | null) => {
    setSelectedLevel(level);
    setSelectedStream(null);
  }, []);

  const selectStream = useCallback((stream: Stream | null) => {
    setSelectedStream(stream);
  }, []);

  const fetchStreams = useCallback(
    async (levelId: string): Promise<Stream[]> => {
      return syllabusService.getStreamsByLevelId(levelId);
    },
    [],
  );

  const fetchSubjects = useCallback(
    async (streamId: string): Promise<Subject[]> => {
      return syllabusService.getSubjectsByStreamId(streamId);
    },
    [],
  );

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  return {
    levels,
    selectedLevel,
    selectedStream,
    isLoading,
    error,
    fetchLevels,
    selectLevel,
    selectStream,
    fetchStreams,
    fetchSubjects,
  };
}
