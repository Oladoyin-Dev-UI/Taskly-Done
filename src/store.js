import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 🟢 1. INDEXED-DB HELPERS (The Filing Cabinet for Heavy Images)
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TasklyImagesDB', 1);
    request.onupgradeneeded = (e) => {
      e.target.result.createObjectStore('images');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveImageToDB = async (base64Data) => {
  if (!base64Data) return;
  try {
    const db = await initDB();
    const tx = db.transaction('images', 'readwrite');
    tx.objectStore('images').put(base64Data, 'userDp');
  } catch (err) {
    console.error("Failed to save image to IndexedDB", err);
  }
};

const loadImageFromDB = async () => {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const tx = db.transaction('images', 'readonly');
      const request = tx.objectStore('images').get('userDp');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
  } catch (err) {
    console.error("Failed to load image from IndexedDB", err);
    return null;
  }
};

// 🟢 2. THE GLOBAL STORE
export const useStore = create(
  persist(
    (set) => ({
      // --- CORE STATE ---
      tasks: [],
      user: { name: '', dp: null },
      hobbies: [],
      dislikes: [],
      timezone: 'default',
      hasCompletedOnboarding: false,
      isAddModalOpen: false,

      // --- THEME STATE ---
      theme: 'light',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      // --- CONSEQUENCE LEDGER (Starts completely empty) ---
      rewards: [],
      punishments: [],

      // --- MODAL CONTROLS ---
      setAddModalOpen: (isOpen) => set({ isAddModalOpen: isOpen }),

      // --- IMMORTAL CONSEQUENCE STATE ---
      activeConsequence: null,
      setActiveConsequence: (event) => set({ activeConsequence: event }),
      clearActiveConsequence: () => set({ activeConsequence: null }),

      // --- ONBOARDING ACTIONS ---
      setTimezone: (tz) => set({ timezone: tz }),
      
      setUser: (userData) => {
        if (userData.dp) saveImageToDB(userData.dp); // Route heavy image to the filing cabinet
        set({ user: userData });
      },

      completeOnboarding: (userData, hobbies, dislikes) => {
        if (userData.dp) saveImageToDB(userData.dp); // Route heavy image to the filing cabinet
        set({ 
          user: userData, 
          hobbies: hobbies, 
          dislikes: dislikes, 
          hasCompletedOnboarding: true 
        });
      },

      // 🟢 Fetches the image from the filing cabinet and puts it back on screen
      loadProfilePicture: async () => {
        const dp = await loadImageFromDB();
        if (dp) {
          set((state) => ({ user: { ...state.user, dp } }));
        }
      },

      // --- TASK ACTIONS ---
      addTask: (taskData) => set((state) => ({ 
        tasks: [
          ...state.tasks, 
          { 
            id: Date.now().toString() + Math.random(), 
            createdAt: new Date().toISOString(), 
            rewardClaimed: false,
            punishmentClaimed: false,
            archived: false, // Soft delete flag
            ...taskData 
          }
        ] 
      })),

      addTasks: (tasksArray) => set((state) => {
        const formattedTasks = tasksArray.map(task => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9), 
          createdAt: new Date().toISOString(),
          rewardClaimed: false,
          punishmentClaimed: false,
          archived: false, // Soft delete flag
          ...task
        }));
        return { tasks: [...state.tasks, ...formattedTasks] };
      }),
      
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === id 
            ? { 
                ...t, 
                ...updates, 
                completedAt: (updates.status === 'Done' || updates.status === 'Missed') 
                  ? new Date().toISOString() 
                  : t.completedAt 
              } 
            : t
        )
      })),
      
      // 🟢 Archives finished tasks so they stay in Ledger, hard deletes active mistakes
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.map(task => {
          if (task.id === id) {
            if (task.status === 'Done' || task.status === 'Missed') {
              return { ...task, archived: true };
            }
            return null;
          }
          return task;
        }).filter(Boolean)
      })),

      // --- ENGINE ACTIONS ---
      addReward: (reward) => set((state) => ({
        rewards: [...state.rewards, { id: Date.now(), timestamp: new Date().toISOString(), ...reward }]
      })),

      addPunishment: (punishment) => set((state) => ({
        punishments: [...state.punishments, { id: Date.now(), timestamp: new Date().toISOString(), ...punishment }]
      })),

      markRewardClaimed: (id) => set((state) => ({
        rewards: state.rewards.map(r => r.id === id ? { ...r, status: 'completed' } : r)
      })),

      markPunishmentSettled: (id) => set((state) => ({
        punishments: state.punishments.map(p => p.id === id ? { ...p, status: 'completed' } : p)
      })),

      // --- RESET ACTION ---
      resetApp: () => {
        localStorage.removeItem('taskly-storage');
        indexedDB.deleteDatabase('TasklyImagesDB'); // Destroys the image filing cabinet too
        window.location.reload();
      }
    }),
    {
      name: 'taskly-storage',
      // 🟢 THE BOUNCER: Protects your limited text memory from the massive image string
      partialize: (state) => ({
        ...state,
        user: { ...state.user, dp: null } 
      }),
    }
  )
);

// 🟢 3. THE AUTO-BOOT SEQUENCE
// The exact millisecond your app opens, this reaches into the filing cabinet and grabs the photo!
useStore.getState().loadProfilePicture();