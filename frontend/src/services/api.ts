import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Dynamically determine backend URL based on host environment or .env
export const getBaseUrl = (): string => {
  // 1. Web browser running on PC or deployed server
  if (Platform.OS === 'web') {
    if (process.env.EXPO_PUBLIC_API_URL) {
      return process.env.EXPO_PUBLIC_API_URL;
    }
    if (typeof window !== 'undefined' && window.location) {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5000/api/v1';
      }
      // Deployed web: use same origin so Nginx reverse-proxies /api/ to backend:5000
      return `${window.location.origin}/api/v1`;
    }
    return '/api/v1';
  }

  // 2. On physical mobile phones, localhost points to the phone itself, NOT the PC!
  // Resolve host computer IP from Expo's bundler hostUri or fallback to the local Wi-Fi IP
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

  const computerIp = hostUri ? hostUri.split(':')[0] : '192.168.1.85';

  // 3. If EXPO_PUBLIC_API_URL is configured in .env
  if (process.env.EXPO_PUBLIC_API_URL) {
    const configuredUrl = process.env.EXPO_PUBLIC_API_URL;
    // If user left localhost in .env, intelligently rewrite it to the actual computer IP for mobile
    if (configuredUrl.includes('localhost') || configuredUrl.includes('127.0.0.1')) {
      return configuredUrl.replace(/localhost|127\.0\.0\.1/, computerIp);
    }
    return configuredUrl;
  }

  // 4. Default for mobile device on local Wi-Fi
  return `http://${computerIp}:5000/api/v1`;
};

export const API_BASE_URL = getBaseUrl();

console.log(`[API Base URL] Connected to: ${API_BASE_URL}`);

// Helper for HTTP requests
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || `Request failed with status ${res.status}`);
    }
    return json.data;
  } catch (error: any) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
}

// -----------------------------------------------------------------------------
// COMPETITIONS API
// -----------------------------------------------------------------------------
export interface CompetitionTag {
  label: string;
  type: 'hot' | 'fast' | 'default';
}

export interface CompetitionJudge {
  name: string;
  role: string;
  title?: string;
  experience?: string;
  avatarUrl: string;
  introVideoUrl?: string;
}

export interface DateItemData {
  label: string;
  date: string;
  time: string;
}

export interface WinnerData {
  name: string;
  position: string;
  imageUrl: string;
}

export interface RewardData {
  position: string;
  emoji: string;
  amount: string;
}

export interface Competition {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  category: string;
  tags: CompetitionTag[];
  prizePool: string;
  entryFee: string;
  spotsLeft: number;
  totalSpots: number;
  enrolled: number;
  urgency: 'normal' | 'critical';
  isMegaContest?: boolean;
  status: 'upcoming' | 'live' | 'registered' | 'ended';
  judge: CompetitionJudge;
  countdown?: string;
  certificateNote?: string;
  dates?: DateItemData[];
  previousWinners?: WinnerData[];
  aboutText?: string;
  rules?: string[];
  rewards?: RewardData[];
}

export interface CategoryItem {
  id: string;
  _id?: string;
  name: string;
  label: string;
  emoji: string;
  icon: string;
  subtitle?: string;
  liveCount: number;
  isActive?: boolean;
}

export interface ChampionItem {
  id: string;
  _id?: string;
  rank: number;
  name: string;
  prize: string;
  place: string;
  imageUrl: string;
}

export const api = {
  // Competitions
  getCompetitions: async (params?: { category?: string; status?: string; search?: string }): Promise<Competition[]> => {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') query.append('category', params.category);
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await request<{ competitions: Competition[] }>(`/competitions${queryString}`);
    return res.competitions.map((c) => ({
      ...c,
      id: c._id || c.id,
    }));
  },

  getCompetitionById: async (id: string): Promise<Competition> => {
    const comp = await request<Competition>(`/competitions/${id}`);
    return { ...comp, id: comp._id || comp.id };
  },

  getMegaContest: async (): Promise<any> => {
    return request<any>('/competitions/mega');
  },

  getCategories: async (): Promise<CategoryItem[]> => {
    const categories = await request<CategoryItem[]>('/competitions/categories');
    return categories.map((c) => ({
      ...c,
      id: c._id || c.id,
    }));
  },

  joinCompetition: async (contestId: string, userId?: string): Promise<any> => {
    return request<any>(`/competitions/${contestId}/join`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  // User & Profile
  getUserProfile: async (): Promise<any> => {
    return request<any>('/users/profile');
  },

  getActiveRegistration: async (): Promise<any> => {
    return request<any>('/users/active-registration');
  },

  getUserCompetitions: async (status?: string): Promise<any[]> => {
    const endpoint = status && status !== 'all' ? `/users/my-competitions?status=${status}` : '/users/my-competitions';
    return request<any[]>(endpoint);
  },

  getUserAchievements: async (): Promise<any> => {
    return request<any>('/users/achievements');
  },

  getUserWallet: async (): Promise<any> => {
    return request<any>('/users/wallet');
  },

  // Champions
  getChampions: async (): Promise<ChampionItem[]> => {
    const champions = await request<ChampionItem[]>('/champions');
    return champions.map((c) => ({
      ...c,
      id: c._id || c.id,
    }));
  },

  // Explore
  getExploreData: async (): Promise<any> => {
    return request<any>('/explore');
  },

  // Submissions
  getTrendingSubmissions: async (): Promise<any[]> => {
    return request<any[]>('/submissions/trending');
  },

  voteSubmission: async (id: string): Promise<any> => {
    return request<any>(`/submissions/${id}/vote`, { method: 'POST' });
  },

  uploadSubmission: async (formData: FormData): Promise<any> => {
    const url = `${API_BASE_URL}/submissions`;
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Submission upload failed');
    }
    return json.data;
  },
};
