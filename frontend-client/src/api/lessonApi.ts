const BASE_URL = "http://localhost:8080/api";

export interface Lesson {
  id: number;
  title: string;
  youtubeUrl: string;
}

export interface Sentence {
  id: number;
  content: string;
  startTime: number;
  endTime: number;
  orderIndex: number;
}

export const lessonApi = {
  getAll: (): Promise<Lesson[]> =>
    fetch(`${BASE_URL}/lessons`).then(res => res.json()),

  getById: (id: string | number): Promise<Lesson> =>
    fetch(`${BASE_URL}/lessons/${id}`).then(res => res.json()),

  getSentences: (lessonId: string | number): Promise<Sentence[]> =>
    fetch(`${BASE_URL}/sentences/lesson/${lessonId}`).then(res => res.json()),
};