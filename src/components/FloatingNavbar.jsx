import { useEffect } from 'react';
import { Plus, User, Check } from 'lucide-react';
import { useStore } from '../store';

export default function FloatingNavbar({ onProfileClick }) {
  // 🟢 Brought in 'theme' to power the invisible HTML switch
  const { user, setAddModalOpen, theme } = useStore();

  // Helper to extract just the first name safely
  const getFirstName = (fullName) => {
    if (!fullName) return null;
    return fullName.trim().split(' ')[0];
  };

  const firstName = getFirstName(user?.name);

  // 🟢 THE MAGIC SWITCH: Watches the store and changes the whole app background
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0f172a');
    } else {
      document.documentElement.classList.remove('dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#ffffff');
    }
  }, [theme]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* 🟢 Dark mode background and blur */}
      <div className="absolute inset-0 h-[88px] bg-gray-50/40 dark:bg-slate-900/40 backdrop-blur-md transition-colors duration-300" 
           style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent)' }} />

      <div className="relative flex justify-center px-4 py-4 w-full">
        {/* 🟢 Dark mode nav container */}
        <nav className="w-full max-w-6xl bg-white/70 dark:bg-slate-800/80 shadow-sm border border-gray-100 dark:border-slate-700 rounded-2xl px-4 md:px-6 py-2.5 md:py-3 flex items-center justify-between transition-colors duration-300">
          
          {/* 🟢 FLAT 3D CALENDAR LOGO */}
          <div className="flex items-center gap-3.5 select-none">
            
            <div className="relative w-10 h-10 flex-shrink-0 mt-1">
              {/* The Hard 3D Shadow (Extrusion) - Kept dark for contrast */}
              <div className="absolute inset-0 bg-slate-900 rounded-xl translate-x-[3px] translate-y-[3px]"></div>
              
              {/* Main Calendar Body */}
              <div className="absolute inset-0 bg-white border-2 border-slate-900 rounded-xl flex flex-col overflow-hidden z-10">
                {/* Calendar Blue Header */}
                <div className="h-3 bg-blue-600 border-b-2 border-slate-900 w-full"></div>
                {/* Calendar White Face + Checkmark */}
                <div className="flex-1 bg-white flex items-center justify-center">
                  <Check size={18} strokeWidth={4} className="text-blue-600 mt-0.5" />
                </div>
              </div>
              
              {/* Tiny Calendar Binder Rings */}
              <div className="absolute -top-1.5 left-2 w-1.5 h-3 bg-white border-2 border-slate-900 rounded-full z-20"></div>
              <div className="absolute -top-1.5 right-2 w-1.5 h-3 bg-white border-2 border-slate-900 rounded-full z-20"></div>
            </div>
            
            {/* 🟢 BRANDING: Adapts to white text in dark mode */}
            <span className="hidden sm:block text-[22px] font-black text-slate-900 dark:text-white tracking-tight transition-colors duration-300">
              Taskly<span className="ml-1 text-slate-900 dark:text-white">Done</span>
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1.5 pr-3 md:pr-4 shadow-sm transition-colors active:scale-95"
            >
              <div className="bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center shadow-sm">
                <Plus size={20} strokeWidth={3} />
              </div>
              <span className="text-sm font-bold tracking-wide mr-1">Add Task</span>
            </button>
            
            {/* 🟢 PROFILE BUTTON: Dark mode hover states and borders */}
            <button 
              onClick={onProfileClick}
              className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-700 p-1.5 sm:pr-4 rounded-full transition-colors border border-gray-200 dark:border-slate-600 shadow-sm active:scale-95 group"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-gray-200 dark:border-slate-600 group-hover:border-blue-200 dark:group-hover:border-blue-500 transition-colors">
                {user?.dp ? (
                  <img src={user.dp} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={18} className="text-gray-400 dark:text-slate-500" />
                )}
              </div>
              {/* 🟢 PROFILE TEXT: Adapts to white text in dark mode */}
              <span className="hidden sm:block text-[14px] font-bold text-gray-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                {firstName ? `Hi, ${firstName}` : 'Hi, Task Master'}
              </span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}