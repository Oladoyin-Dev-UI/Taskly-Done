import { useState, useEffect, useRef } from 'react';
import { X, Plus, Globe, Search, Camera, Paperclip, MousePointerClick, ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';
import { useStore } from '../store';

const COUNTRIES = [
  { name: 'United States', code: 'US', zone: 'America/New_York' },
  { name: 'Nigeria', code: 'NG', zone: 'Africa/Lagos' },
  { name: 'United Kingdom', code: 'GB', zone: 'Europe/London' },
  { name: 'Canada', code: 'CA', zone: 'America/Toronto' },
  { name: 'Germany', code: 'DE', zone: 'Europe/Berlin' },
  { name: 'India', code: 'IN', zone: 'Asia/Kolkata' },
  { name: 'Australia', code: 'AU', zone: 'Australia/Sydney' },
  { name: 'Brazil', code: 'BR', zone: 'America/Sao_Paulo' },
  { name: 'Japan', code: 'JP', zone: 'Asia/Tokyo' },
  { name: 'France', code: 'FR', zone: 'Europe/Paris' },
];

const BANNED_WORDS = ['18+', 'crazything', 'badword', 'fuck', 'shit', 'bitch', 'ass', 'dick', 'pussy', 'cunt', 'whore', 'slut', 'bastard', 'crap'];
const isSafe = (text) => !BANNED_WORDS.some(word => text.toLowerCase().includes(word));
const getFlagUrl = (code) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

export default function OnboardingModal({ isOpen, onClose }) {
  const { user, hobbies: savedHobbies, dislikes: savedDislikes, completeOnboarding, hasCompletedOnboarding, setTimezone } = useStore();
  
  const [isFlipped, setIsFlipped] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [dp, setDp] = useState(null);
  const [hobbies, setHobbies] = useState([]);
  const [dislikes, setDislikes] = useState([]);
  const [hobbyInput, setHobbyInput] = useState('');
  const [dislikeInput, setDislikeInput] = useState('');
  
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);
  const clickAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'));
  const pageTurnAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2381/2381-preview.mp3'));

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsFlipped(false);
      setErrorMsg('');
      if (hasCompletedOnboarding) {
        setFirstName(user?.name || '');
        setDp(user?.dp || null);
        setHobbies(savedHobbies || []);
        setDislikes(savedDislikes || []);
      }
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]); 

  const playClick = () => {
    clickAudio.current.currentTime = 0;
    clickAudio.current.play().catch(() => {});
  };

  const handleFlip = (state) => {
    pageTurnAudio.current.currentTime = 0;
    pageTurnAudio.current.volume = 0.5;
    pageTurnAudio.current.play().catch(() => {});
    setIsFlipped(state);
  };

  const handleDpChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setDp(reader.result);
      reader.readAsDataURL(file);
      playClick();
    }
  };

  const addTag = (type) => {
    setErrorMsg('');
    const input = type === 'hobby' ? hobbyInput : dislikeInput;
    const val = input.trim();
    
    if (!val) return;

    if (!isSafe(val)) {
      setErrorMsg("Whoa there! Keep it clean, please.");
      return;
    }

    playClick();
    if (type === 'hobby' && hobbies.length < 5 && !hobbies.includes(val)) {
      setHobbies([...hobbies, val]);
      setHobbyInput('');
    } else if (type === 'dislike' && dislikes.length < 5 && !dislikes.includes(val)) {
      setDislikes([...dislikes, val]);
      setDislikeInput('');
    }
  };

  const handleKeyDown = (e, type) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(type);
    }
  };

  const handleSubmit = () => {
    playClick();
    if (!firstName.trim()) {
      setErrorMsg("We need your name to get started!");
      return;
    }
    if (hobbies.length === 0 || dislikes.length === 0) {
      setErrorMsg("Please add at least one hobby and one dislike!");
      return;
    }
    if (!selectedCountry && !hasCompletedOnboarding) {
      setErrorMsg("Please select your Home Base country.");
      return;
    }
    
    onClose();
    setTimeout(() => {
      completeOnboarding({ name: firstName, dp }, hobbies, dislikes);
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 overflow-hidden transition-colors duration-300"
      onClick={hasCompletedOnboarding ? onClose : undefined}
    >
      
      {hasCompletedOnboarding && (
        <button 
          onClick={onClose} 
          className="fixed top-6 right-6 z-[160] p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-300 rounded-full shadow-lg transition-all active:scale-95"
        >
          <X size={24} strokeWidth={2.5} />
        </button>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: transparent; border-radius: 10px; transition: background 0.3s ease; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.6); }
        
        @keyframes slideUpReveal {
          0% { transform: translateY(300px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-paper-reveal {
          animation: slideUpReveal 0.8s cubic-bezier(0.17, 0.84, 0.44, 1) forwards;
        }

        .cover-page {
          transform-origin: 0% 0%; 
          transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease;
        }
        .cover-page.flipped {
          transform: rotate(-100deg) translate(-20px, 10px); 
          pointer-events: none; 
        }

        .fun-font {
          font-family: 'Comic Sans MS', 'Marker Felt', 'Caveat', cursive, sans-serif;
        }
      `}</style>

      <div className="relative w-full max-w-[440px] h-[750px] flex items-end justify-center" onClick={(e) => e.stopPropagation()}>
        
        {/* The Manila Folder Back */}
        <div className="absolute bottom-0 w-[420px] h-[300px] bg-gradient-to-b from-[#E2B94A] to-[#C9A032] border border-[#B38D28] rounded-2xl rounded-tl-none shadow-inner z-0">
           <div className="absolute -top-10 left-[-1px] w-36 h-10 bg-[#E2B94A] rounded-t-2xl border-t border-l border-r border-[#B38D28] flex items-center px-4 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-white/40"></div>
             <span className="text-[10px] font-bold text-[#7A5C13] tracking-widest uppercase">Intake Form</span>
           </div>
        </div>

        <div className="absolute bottom-[90px] w-[380px] h-[600px] z-10 animate-paper-reveal perspective-1000">
          
          <div className="absolute -top-5 -left-4 z-[60]">
            <button 
              onClick={() => handleFlip(!isFlipped)}
              className="relative group p-2 outline-none transition-transform cursor-pointer hover:scale-110"
            >
              <Paperclip 
                size={36} 
                strokeWidth={1.5} 
                className="rotate-[-20deg] drop-shadow-md transition-colors duration-300 text-gray-400 group-hover:text-blue-500" 
              />
              <div className="absolute top-10 left-2 bg-gray-900 dark:bg-slate-700 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap flex items-center gap-1 shadow-lg">
                {isFlipped ? <><ArrowLeft size={10} /> Flip Back</> : <>Open <ArrowRight size={10} /></>}
              </div>
            </button>
          </div>

          {/* INNER PAPER (Dark Mode Enabled) */}
          <div className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col z-10 p-6 transition-colors duration-300">
            <div className="flex-1 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl flex flex-col overflow-hidden relative bg-white dark:bg-slate-900 transition-colors duration-300">
              
              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar flex flex-col">
                
                <div className="text-left mb-6 shrink-0">
                  <h2 className="text-[20px] font-bold text-gray-900 dark:text-white tracking-tight">Your Profile</h2>
                  <p className="text-[14px] text-gray-400 dark:text-slate-400 font-medium mt-1">Let's set up your workspace.</p>
                </div>

                <div className="space-y-6 shrink-0">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Profile Picture</label>
                    <div className="flex items-center gap-4">
                        <input type="file" ref={fileInputRef} onChange={handleDpChange} className="hidden" accept="image/*" />
                        <button 
                          type="button"
                          onClick={() => { playClick(); fileInputRef.current.click(); }}
                          className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          {dp ? <img src={dp} className="w-full h-full object-cover" alt="Avatar" /> : <Camera size={20} className="text-gray-400 dark:text-slate-500" />}
                        </button>
                        <span className="text-[14px] font-medium text-gray-500 dark:text-slate-400 italic">Select your profile picture</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest">First Name</label>
                    <input 
                      required
                      value={firstName}
                      onFocus={playClick}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all shadow-sm placeholder:text-gray-400 dark:placeholder:text-slate-500"
                      placeholder="Enter your name..."
                    />
                  </div>

                  <div className="space-y-1.5 relative">
                    <label className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Home Base (Country)</label>
                    <button 
                      type="button"
                      onClick={() => { setIsDropdownOpen(!isDropdownOpen); playClick(); }}
                      className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm text-gray-900 dark:text-white"
                    >
                      {selectedCountry ? (
                        <span className="flex items-center gap-2.5">
                          <img src={getFlagUrl(selectedCountry.code)} alt={selectedCountry.name} className="w-5 h-auto rounded-[2px] shadow-sm object-cover" />
                          <span className="font-medium">{selectedCountry.name}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-slate-500">Search for your country...</span>
                      )}
                      <Globe size={16} className="text-gray-400 dark:text-slate-500" />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-xl z-[110] overflow-hidden">
                        <div className="p-2 border-b border-gray-50 dark:border-slate-700 flex items-center gap-2">
                          <Search size={14} className="text-gray-400 dark:text-slate-500 ml-2" />
                          <input autoFocus className="w-full p-2 text-sm bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500" placeholder="Search..." value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} />
                        </div>
                        <div className="max-h-40 overflow-y-auto custom-scrollbar">
                          {COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())).map(c => (
                            <div 
                              key={c.code} 
                              onClick={(e) => { 
                                e.stopPropagation();
                                setSelectedCountry(c); 
                                setTimezone(c.zone); 
                                setIsDropdownOpen(false); 
                                setCountrySearch('');
                                playClick(); 
                              }} 
                              className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer text-sm transition-colors"
                            >
                              <img src={getFlagUrl(c.code)} alt={c.name} className="w-6 h-auto rounded-[2px] shadow-sm object-cover" />
                              <span className="font-medium text-gray-700 dark:text-slate-300">{c.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Hobbies (At least 1)</label>
                    <div className="flex gap-2">
                      <input 
                        value={hobbyInput} 
                        onChange={(e) => setHobbyInput(e.target.value)} 
                        onKeyDown={(e) => handleKeyDown(e, 'hobby')}
                        className="flex-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 shadow-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 transition-colors" 
                        placeholder="Add a hobby (Press Enter)" 
                      />
                      <button type="button" onClick={() => addTag('hobby')} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-400 p-3 rounded-xl hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-blue-400 transition-colors shadow-sm"><Plus size={20} strokeWidth={3} /></button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {hobbies.map((tag, i) => (
                        <span key={i} className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[12px] font-bold px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/30 flex items-center gap-2">
                          {tag} <X size={12} className="cursor-pointer hover:text-blue-900 dark:hover:text-blue-200" onClick={() => { playClick(); setHobbies(hobbies.filter((_, idx) => idx !== i)); }} />
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Dislikes (At least 1)</label>
                    <div className="flex gap-2">
                      <input 
                        value={dislikeInput} 
                        onChange={(e) => setDislikeInput(e.target.value)} 
                        onKeyDown={(e) => handleKeyDown(e, 'dislike')}
                        className="flex-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 dark:focus:border-red-500 shadow-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 transition-colors" 
                        placeholder="Add a dislike (Press Enter)" 
                      />
                      <button type="button" onClick={() => addTag('dislike')} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-400 p-3 rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-700 dark:hover:text-red-400 transition-colors shadow-sm"><Plus size={20} strokeWidth={3} /></button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {dislikes.map((tag, i) => (
                        <span key={i} className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[12px] font-bold px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-800/30 flex items-center gap-2">
                          {tag} <X size={12} className="cursor-pointer hover:text-red-900 dark:hover:text-red-200" onClick={() => { playClick(); setDislikes(dislikes.filter((_, idx) => idx !== i)); }} />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="mt-4 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/30 p-3 rounded-xl flex items-center gap-2 text-sm font-bold animate-in fade-in duration-200">
                    <AlertTriangle size={16} /> {errorMsg}
                  </div>
                )}

                <div className="mt-6 shrink-0 pb-2">
                  <button 
                    onClick={handleSubmit}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md transition-all active:scale-[0.98]"
                  >
                    {hasCompletedOnboarding ? 'Save Changes' : "Let's Goo"}
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* COVER PAGE (Dark Mode Enabled) */}
          <div 
            onClick={!isFlipped ? () => handleFlip(true) : undefined}
            className={`cover-page absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-6 z-20 ${isFlipped ? 'flipped' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800'} transition-colors duration-300`}
          >
            <div className="w-full h-full border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center pt-[40px] px-6 pb-6 relative bg-white dark:bg-slate-900 transition-colors duration-300">
              
              <div className="text-center space-y-4">
                <h1 className="fun-font text-[48px] font-bold text-gray-800 dark:text-white leading-[1.1] rotate-[-2deg]">
                  {hasCompletedOnboarding ? (
                    <>Update<br/><span className="text-blue-600 dark:text-blue-500">Profile!</span></>
                  ) : (
                    <>Welcome to<br/><span className="text-blue-600 dark:text-blue-500">Taskly!</span></>
                  )}
                </h1>
                <div className="w-16 h-1 bg-blue-100 dark:bg-blue-900/50 rounded-full mx-auto my-4 rotate-[1deg]" />
                <p className="text-gray-400 dark:text-slate-400 font-medium text-[16px] max-w-[200px] mx-auto">
                  {hasCompletedOnboarding ? 'Tweak your workspace parameters.' : 'Your new workspace is ready.'}
                </p>
              </div>

              {!isFlipped && (
                <div className="absolute bottom-10 flex flex-col items-center gap-2 text-blue-500 dark:text-blue-400 animate-pulse">
                  <MousePointerClick size={24} />
                  <span className="text-sm font-bold tracking-wide uppercase">Click to open</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* The Manila Folder Front */}
        <div className="absolute bottom-0 w-[420px] h-[150px] bg-gradient-to-b from-[#FAD66D] to-[#E2B94A] border border-[#C9A032] rounded-2xl shadow-[0_-8px_25px_rgba(0,0,0,0.15)] z-40 pointer-events-none overflow-hidden">
            <div className="absolute top-0 w-full h-[2px] bg-gradient-to-r from-white/20 via-white/60 to-white/20"></div>
            <div className="absolute inset-0 shadow-[inset_0_-4px_10px_rgba(0,0,0,0.05)] rounded-2xl"></div>
        </div>

      </div>
    </div>
  );
}