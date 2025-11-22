import { create } from 'zustand';

interface User {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    plan: 'free' | 'pro' | 'enterprise';
}

interface Task {
    id: string;
    description: string;
    status: 'queued' | 'in_progress' | 'completed' | 'failed';
    createdAt: Date;
    completedAt?: Date;
}

interface AppState {
    // User state
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;

    // Task state
    currentTask: Task | null;
    recentTasks: Task[];
    setCurrentTask: (task: Task | null) => void;
    addTask: (task: Task) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;

    // Stream state
    streamActive: boolean;
    streamStatus: 'idle' | 'connecting' | 'active' | 'error';
    currentFrame: string | null;
    setStreamActive: (active: boolean) => void;
    setStreamStatus: (status: 'idle' | 'connecting' | 'active' | 'error') => void;
    setCurrentFrame: (frame: string | null) => void;

    // UI state
    sidebarOpen: boolean;
    toggleSidebar: () => void;
}

export const useStore = create<AppState>((set) => ({
    // User state
    user: null,
    setUser: (user) => set({ user }),
    logout: () => {
        localStorage.removeItem('browuser_uid');
        localStorage.removeItem('browuser_email');
        set({ user: null, currentTask: null, recentTasks: [] });
    },

    // Task state
    currentTask: null,
    recentTasks: [],
    setCurrentTask: (task) => set({ currentTask: task }),
    addTask: (task) => set((state) => ({
        recentTasks: [task, ...state.recentTasks].slice(0, 10)
    })),
    updateTask: (id, updates) => set((state) => ({
        recentTasks: state.recentTasks.map(task =>
            task.id === id ? { ...task, ...updates } : task
        ),
        currentTask: state.currentTask?.id === id
            ? { ...state.currentTask, ...updates }
            : state.currentTask
    })),

    // Stream state
    streamActive: false,
    streamStatus: 'idle',
    currentFrame: null,
    setStreamActive: (active) => set({ streamActive: active }),
    setStreamStatus: (status) => set({ streamStatus: status }),
    setCurrentFrame: (frame) => set({ currentFrame: frame }),

    // UI state
    sidebarOpen: true,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
