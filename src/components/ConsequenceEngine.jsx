import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const FALLBACK_REWARDS = ['Take a 20-minute nap', 'Grab your favorite snack', 'Listen to your favorite song'];
const FALLBACK_PUNISHMENTS = ['No screen time for an hour', 'Do 20 pushups immediately', 'Clean your workspace'];
const DURATIONS = ['5 mins', '10 mins', '15 mins', '20 mins', '30 mins'];

const REWARD_TEMPLATES = [
  "Mission cleared! Treat yourself to {item}.",
  "You earned this: Uninterrupted time for {item}.",
  "Task crushed! Reward yourself with {item}.",
  "Flawless victory. Go enjoy {item} guilt-free!"
];

const PUNISHMENT_TEMPLATES = [
  "You dropped the ball. Penalty: {item}.",
  "Deadline missed. Time to face the music: {item}.",
  "Focus lost. Your immediate consequence is {item}.",
  "Mission failed. You must immediately do: {item}."
];

export default function ConsequenceEngine() {
  const { tasks = [], hobbies = [], dislikes = [], updateTask, addReward, addPunishment } = useStore();
  
  const [activeEvent, setActiveEvent] = useState(null);
  const [isPopping, setIsPopping] = useState(false);
  
  const processedEvents = useRef(new Set());
  const rewardAudioRef = useRef(null);
  const punishmentAudioRef = useRef(null);

  // 1. Listen for Manual Status Changes
  useEffect(() => {
    if (activeEvent) return; 

    for (const task of tasks) {
      if (task.status === 'Done' && !task.rewardClaimed && !processedEvents.current.has(`reward-${task.id}`)) {
        processedEvents.current.add(`reward-${task.id}`);
        triggerEvent('reward', task.id);
        return; 
      }
      
      if (task.status === 'Missed' && !task.punishmentClaimed && !processedEvents.current.has(`punish-${task.id}`)) {
        processedEvents.current.add(`punish-${task.id}`);
        triggerEvent('punishment', task.id);
        return; 
      }
    }
  }, [tasks, activeEvent]);

  // 2. The Timekeeper (Auto-Fail Logic)
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeEvent) return; 
      const now = new Date();
      
      tasks.forEach(task => {
        // 🟢 THE FIX: Now checks 'In Review' as well!
        if (task.status === 'To Do' || task.status === 'In Progress' || task.status === 'In Review') {
          if (task.endDate) {
            const deadline = new Date(`${task.endDate}T${task.time || "23:59"}`);
            if (now > deadline) {
              updateTask(task.id, { status: 'Missed' });
            }
          }
        }
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [tasks, activeEvent, updateTask]);

  const triggerEvent = (type, taskId) => {
    const duration = DURATIONS[Math.floor(Math.random() * DURATIONS.length)];
    let finalMessage = 'A mystery consequence';

    try {
      const arr = type === 'reward' ? hobbies : dislikes;
      const fallback = type === 'reward' ? FALLBACK_REWARDS : FALLBACK_PUNISHMENTS;
      const templates = type === 'reward' ? REWARD_TEMPLATES : PUNISHMENT_TEMPLATES;
      
      let rawItem = (arr && arr.length > 0) ? arr[Math.floor(Math.random() * arr.length)] : fallback[Math.floor(Math.random() * fallback.length)];
      
      let itemString = '';
      if (typeof rawItem === 'string') itemString = rawItem;
      else if (rawItem && typeof rawItem === 'object') itemString = rawItem.label || rawItem.value || rawItem.name || rawItem.text || fallback[0];
      
      const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
      finalMessage = selectedTemplate.replace('{item}', itemString);
      
    } catch (e) {
      finalMessage = type === 'reward' ? 'Claim a reward!' : 'Face the consequence!';
    }

    if (type === 'reward' && rewardAudioRef.current) {
      rewardAudioRef.current.currentTime = 0;
      rewardAudioRef.current.play().catch((e) => console.warn("Browser blocked audio:", e));
    } else if (type === 'punishment' && punishmentAudioRef.current) {
      punishmentAudioRef.current.currentTime = 0;
      punishmentAudioRef.current.play().catch((e) => console.warn("Browser blocked audio:", e));
    }

    setActiveEvent({ type, text: finalMessage, duration, taskId });
  };

  const handleAction = (action) => {
    if (!activeEvent) return;

    const finalLogText = `${activeEvent.text} (${activeEvent.duration})`;

    if (activeEvent.type === 'reward') {
      addReward({ text: finalLogText, status: action === 'accept' ? 'completed' : 'pending' });
      updateTask(activeEvent.taskId, { rewardClaimed: true });
    } else {
      addPunishment({ text: finalLogText, status: action === 'accept' ? 'completed' : 'pending' });
      updateTask(activeEvent.taskId, { punishmentClaimed: true });
    }
    
    if (rewardAudioRef.current) {
      rewardAudioRef.current.pause();
      rewardAudioRef.current.currentTime = 0;
    }
    if (punishmentAudioRef.current) {
      punishmentAudioRef.current.pause();
      punishmentAudioRef.current.currentTime = 0;
    }
    
    setActiveEvent(null);
  };

  const handleRewardPop = () => {
    setIsPopping(true);
    
    try {
      const popAudio = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_756a9081e6.mp3');
      popAudio.volume = 0.6;
      popAudio.play().catch(()=>{});
    } catch (e) {}

    setTimeout(() => {
      handleAction('accept');
      setIsPopping(false);
    }, 500);
  };

  return (
    <>
      <audio ref={rewardAudioRef} src="https://cdn.pixabay.com/audio/2021/08/04/audio_bb630cc098.mp3" preload="auto" loop />
      <audio ref={punishmentAudioRef} src="https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3" preload="auto" loop />

      {activeEvent && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden transition-colors duration-300">
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes warp { 0% { transform: translateY(100vh) scale(0.5); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(-100vh) scale(1.5); opacity: 0; } }
            .rocket-fly { animation: warp 1.5s linear infinite; position: absolute; font-size: 4rem; filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.5)); }
            @keyframes strobe { 0% { background-color: rgba(220, 38, 38, 0.95); } 50% { background-color: rgba(153, 27, 27, 0.95); } 100% { background-color: rgba(220, 38, 38, 0.95); } }
            @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px) rotate(-1deg); } 75% { transform: translateX(5px) rotate(1deg); } }
            .danger-bg { animation: strobe 0.8s infinite; }
            .danger-shake { animation: shake 0.4s infinite; }
            
            @keyframes graffiti-pop {
              0% { transform: scale(0.5) rotate(-15deg); opacity: 1; }
              50% { transform: scale(1.4) rotate(5deg); opacity: 1; filter: drop-shadow(0px 4px 10px currentColor); }
              100% { transform: scale(1.8) rotate(15deg); opacity: 0; }
            }
            @keyframes particle-1 { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(-50px, -45px) scale(0); opacity: 0; } }
            @keyframes particle-2 { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(50px, -55px) scale(0); opacity: 0; } }
            @keyframes particle-3 { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(65px, 25px) scale(0); opacity: 0; } }
            @keyframes particle-4 { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(-60px, 35px) scale(0); opacity: 0; } }
            @keyframes particle-5 { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(0px, -70px) scale(0); opacity: 0; } }
          `}} />

          {activeEvent.type === 'reward' ? (
            <div className="absolute inset-0 bg-slate-900 backdrop-blur-md">
              <div className="rocket-fly" style={{ left: '10%', animationDelay: '0s' }}>🚀</div>
              <div className="rocket-fly" style={{ left: '30%', animationDelay: '0.4s', fontSize: '2rem' }}>✨</div>
              <div className="rocket-fly" style={{ left: '50%', animationDelay: '0.2s', fontSize: '5rem' }}>🚀</div>
              <div className="rocket-fly" style={{ left: '70%', animationDelay: '0.7s', fontSize: '3rem' }}>✨</div>
              <div className="rocket-fly" style={{ left: '85%', animationDelay: '0.1s' }}>🚀</div>
            </div>
          ) : (
            <div className="absolute inset-0 danger-bg backdrop-blur-md flex items-center justify-center opacity-90">
              <div className="absolute inset-0 flex flex-wrap justify-around items-center opacity-20 pointer-events-none">
                <AlertTriangle size={120} className="text-black m-4" />
                <AlertTriangle size={180} className="text-black m-4" />
                <AlertTriangle size={100} className="text-black m-4" />
              </div>
            </div>
          )}

          {/* 🟢 Dark Mode added primarily to the Reward Popup container */}
          <div className={`relative z-10 w-full max-w-[400px] p-8 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] text-center transition-colors duration-300 ${activeEvent.type === 'reward' ? 'bg-white dark:bg-slate-900 border-4 border-green-100 dark:border-green-900/50 scale-100' : 'bg-black border-4 border-red-600 danger-shake'}`}>
            
            <div className="flex justify-center mb-6">
              {activeEvent.type === 'reward' ? (
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle size={40} className="text-green-600 dark:text-green-400" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-red-900/50 rounded-full flex items-center justify-center">
                  <AlertTriangle size={40} className="text-red-500 animate-pulse" />
                </div>
              )}
            </div>

            <h2 className={`text-3xl font-black tracking-tight mb-2 uppercase ${activeEvent.type === 'reward' ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
              {activeEvent.type === 'reward' ? 'Reward Unlocked!' : 'Deadline Missed!'}
            </h2>
            
            <div className={`mb-8 p-5 rounded-xl text-left shadow-inner transition-colors duration-300 ${activeEvent.type === 'reward' ? 'bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700' : 'bg-red-950 border border-red-900'}`}>
              <p className={`text-lg font-medium leading-snug ${activeEvent.type === 'reward' ? 'text-gray-700 dark:text-slate-300' : 'text-red-200'}`}>
                {activeEvent.type === 'reward' ? 'Treat yourself:' : 'Consequence:'} <br/>
                <strong className={`text-xl block mt-1 ${activeEvent.type === 'reward' ? 'text-green-600 dark:text-green-400' : 'text-white'}`}>{activeEvent.text}</strong>
              </p>
              <div className={`flex items-center gap-2 mt-4 pt-4 border-t font-bold text-sm uppercase tracking-wide transition-colors duration-300 ${activeEvent.type === 'reward' ? 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400' : 'border-red-900 text-red-400'}`}>
                <Clock size={16} /> Duration: <span className={activeEvent.type === 'reward' ? 'text-gray-900 dark:text-white' : 'text-white'}>{activeEvent.duration}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {activeEvent.type === 'reward' ? (
                <>
                  <div className="relative w-full flex items-center justify-center">
                    <button 
                      onClick={handleRewardPop} 
                      className={`w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-[0_4px_15px_rgba(34,197,94,0.4)] transition-all active:scale-95 text-lg flex items-center justify-center gap-2 ${isPopping ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`} 
                      style={{ backgroundColor: '#22c55e' }}
                    >
                      <CheckCircle size={20} /> Claim Reward Now
                    </button>

                    {isPopping && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                        <div className="absolute font-black text-3xl tracking-wider whitespace-nowrap text-green-500 drop-shadow-md" style={{ animation: 'graffiti-pop 0.5s ease-out forwards', fontFamily: '"Comic Sans MS", "Marker Felt", "Caveat", cursive, sans-serif' }}>
                          CLAIMED! ✨
                        </div>
                        <div className="absolute w-4 h-4 rounded-full bg-green-400" style={{ animation: 'particle-1 0.5s ease-out forwards' }} />
                        <div className="absolute w-3 h-3 rounded-full bg-blue-400" style={{ animation: 'particle-2 0.5s ease-out forwards' }} />
                        <div className="absolute w-4 h-4 rounded-full bg-yellow-400" style={{ animation: 'particle-3 0.5s ease-out forwards' }} />
                        <div className="absolute w-3.5 h-3.5 rounded-full bg-purple-400" style={{ animation: 'particle-4 0.5s ease-out forwards' }} />
                        <div className="absolute w-3 h-3 rounded-full bg-pink-400" style={{ animation: 'particle-5 0.5s ease-out forwards' }} />
                      </div>
                    )}
                  </div>

                  <button onClick={() => handleAction('later')} className="w-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-300 font-bold py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2">
                    <Clock size={18} /> Save for Later
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => handleAction('accept')} className="w-full bg-white hover:bg-gray-100 text-red-600 font-black py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all active:scale-95 text-lg flex items-center justify-center gap-2 uppercase tracking-wide">
                    <AlertTriangle size={20} /> Accept Punishment
                  </button>
                  <button onClick={() => handleAction('later')} className="w-full bg-red-800 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-600">
                    <Clock size={18} /> I'll do it later
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}