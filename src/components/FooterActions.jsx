import { useState } from 'react';
import { 
  Share2, Trash2, Copy, CheckCircle2, AlertTriangle, 
  X as CloseIcon, Moon, Sun 
} from 'lucide-react';
import { useStore } from '../store';

// 🟢 CUSTOM BRAND ICONS
const XIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedInIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const FacebookIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 1.719-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 1.718 6.781 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-1.718 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-1.719-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

export default function FooterActions() {
  const { tasks, resetApp, theme, toggleTheme } = useStore();
  
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  
  const [copied, setCopied] = useState(false);
  const [resetText, setResetText] = useState('');

  const calculateScore = (task) => {
    if (!task.createdAt || !task.endDate || !task.completedAt) return 85; 
    const created = new Date(task.createdAt).getTime();
    const completed = new Date(task.completedAt).getTime();
    const deadline = new Date(`${task.endDate}T${task.time || '23:59'}`).getTime();
    if (deadline <= created) return 100; 
    const totalAllocated = deadline - created;
    const timeSaved = deadline - completed;
    if (timeSaved < 0) return 20; 
    return Math.min(100, Math.max(0, Math.round(50 + ((timeSaved / totalAllocated) * 50))));
  };

  const doneTasks = tasks.filter(t => t.status === 'Done');
  const globalScore = doneTasks.length 
    ? Math.round(doneTasks.reduce((acc, t) => acc + calculateScore(t), 0) / doneTasks.length) 
    : 0;

  const shareText = `I'm crushing my goals with a ${globalScore}/100 Productivity Score on Taskly Done! 🚀\n\nLock in your tasks and build momentum.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = {
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
    linkedin: `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(shareText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`,
    instagram: `https://instagram.com/` 
  };

  const handleReset = () => {
    if (resetText.trim().toLowerCase() === 'reset') {
      resetApp();
    }
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 items-center">
        <button 
          onClick={toggleTheme}
          className="w-14 h-14 bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 text-slate-600 dark:text-amber-400 flex items-center justify-center rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.4)] transition-all hover:scale-105 active:scale-95 group"
        >
          {theme === 'dark' ? (
            <Sun size={24} className="group-hover:rotate-45 transition-transform duration-500" />
          ) : (
            <Moon size={24} className="group-hover:-rotate-12 transition-transform duration-500" />
          )}
        </button>

        <button 
          onClick={() => setIsShareOpen(true)}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center rounded-full shadow-[0_10px_25px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95 group"
        >
          <Share2 size={24} className="group-hover:scale-110 transition-transform duration-300" />
        </button>
      </div>

      <div className="w-full mt-16 pt-8 pb-8 flex flex-col gap-6">
        <div className="flex justify-end px-4 md:px-0">
          <button 
            onClick={() => { setIsResetOpen(true); setResetText(''); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-bold text-sm rounded-xl transition-colors active:scale-95"
          >
            <Trash2 size={16} /> Reset App
          </button>
        </div>

        <footer className="w-full border-t border-gray-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-0">
          <p className="text-[14px] font-bold text-gray-400 dark:text-slate-500">
            Built by <span className="text-gray-800 dark:text-slate-200">Oladoyin</span> ✌️
          </p>
          <div className="flex items-center gap-6">
            <a href="https://www.linkedin.com/in/oluwatosinoladoyin/" target="_blank" rel="noreferrer" className="text-[14px] font-bold text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              LinkedIn
            </a>
            <a href="https://crevianstudios.com/" target="_blank" rel="noreferrer" className="text-[14px] font-bold text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Crevian Studios
            </a>
          </div>
        </footer>
      </div>

      {isShareOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setIsShareOpen(false)}>
          <div className="w-full max-w-[420px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 pb-0 flex justify-between items-start">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4">
                <Share2 size={24} />
              </div>
              <button onClick={() => setIsShareOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2 -mr-2 -mt-2">
                <CloseIcon size={20} />
              </button>
            </div>
            
            <div className="px-6 pb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Share your vibe</h3>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-6">Flex your productivity score with the world.</p>
              
              <div className="relative bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 p-4 rounded-2xl mb-6">
                <p className="text-[15px] text-gray-700 dark:text-slate-200 font-medium leading-relaxed font-sans pr-10">
                  {shareText}
                </p>
                <button 
                  onClick={handleCopy}
                  className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {copied ? <CheckCircle2 size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>
              </div>

              {/* 🟢 CUSTOM BRAND BUTTONS - NOW THEY ALL POP! */}
              <div className="grid grid-cols-4 gap-3">
                
                {/* X / Twitter */}
                <a href={shareLinks.x} target="_blank" rel="noreferrer" className="group relative flex items-center justify-center py-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-600 dark:text-gray-300 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:text-white dark:hover:text-black shadow-sm overflow-hidden">
                  <div className="absolute inset-0 bg-black dark:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10"><XIcon size={20} /></div>
                </a>
                
                {/* LinkedIn */}
                <a href={shareLinks.linkedin} target="_blank" rel="noreferrer" className="group relative flex items-center justify-center py-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-600 dark:text-gray-300 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:text-white shadow-sm overflow-hidden">
                  <div className="absolute inset-0 bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10"><LinkedInIcon size={20} /></div>
                </a>
                
                {/* Facebook */}
                <a href={shareLinks.facebook} target="_blank" rel="noreferrer" className="group relative flex items-center justify-center py-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-600 dark:text-gray-300 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:text-white shadow-sm overflow-hidden">
                  <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10"><FacebookIcon size={20} /></div>
                </a>
                
                {/* Instagram */}
                <a href={shareLinks.instagram} target="_blank" rel="noreferrer" className="group relative flex items-center justify-center py-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-600 dark:text-gray-300 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:text-white shadow-sm overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10"><InstagramIcon size={20} /></div>
                </a>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* (Reset Modal stays exactly the same) */}
      {isResetOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={() => setIsResetOpen(false)}>
          <div className="w-full max-w-[400px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border-4 border-red-50 dark:border-red-900/20 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-8 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Danger Zone</h3>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-8 leading-relaxed">
                This will completely wipe your history, tasks, rewards, and profile. This action <strong className="text-red-500">cannot be undone</strong>.
              </p>
              <div className="w-full text-left mb-6">
                <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">
                  Type "reset" to confirm
                </label>
                <input 
                  type="text" 
                  value={resetText}
                  onChange={(e) => setResetText(e.target.value)}
                  placeholder="reset"
                  className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 focus:border-red-500 dark:focus:border-red-600 rounded-xl px-4 py-3 text-lg font-bold text-center text-red-600 dark:text-red-500 outline-none transition-colors placeholder:text-gray-300 dark:placeholder:text-slate-600"
                />
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={() => setIsResetOpen(false)} className="flex-1 py-3.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 font-bold rounded-xl transition-colors">
                  Cancel
                </button>
                <button onClick={handleReset} disabled={resetText.trim().toLowerCase() !== 'reset'} className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 dark:disabled:bg-slate-800 disabled:text-gray-400 dark:disabled:text-slate-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-600/20 disabled:shadow-none">
                  Wipe Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}