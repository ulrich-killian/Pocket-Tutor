export interface Subject {
  id: string;
  name: string;
  slug: string;
  streamId: string;
}

export interface Stream {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  educationLevelId: string;
  subjects?: Subject[];
}

export interface EducationLevel {
  id: string;
  name: string;
  slug: string;
  order: number;
  description: string | null;
  streams?: Stream[];
  created_at: string;
}

export interface SyllabusState {
  levels: EducationLevel[];
  selectedLevel: EducationLevel | null;
  selectedStream: Stream | null;
  selectedSubject: Subject | null;
  isLoading: boolean;
  error: string | null;
}
