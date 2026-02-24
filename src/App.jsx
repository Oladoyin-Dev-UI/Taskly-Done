import { useState, useEffect, useRef } from 'react';
import FloatingNavbar from './components/FloatingNavbar';
import TaskBoard from './components/TaskBoard';
import EfficiencyStats from './components/EfficiencyStats';
import Ledger from './components/HistoryRecords';
import OnboardingModal from './components/OnboardingModal';
import AddTaskModal from './components/AddTaskModal';
import ConsequenceEngine from './components/ConsequenceEngine'; 
import FooterActions from './components/FooterActions';

import { useStore } from './store';

function App() {
  const { user, isAddModalOpen, setAddModalOpen } = useStore();
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // 🟢 1. Create a reference to our hidden audio player
  const clickAudioRef = useRef(null);

  // Trigger onboarding if it's a first-time user
  useEffect(() => {
    if (!user?.name) {
      setShowOnboarding(true);
    }
  }, [user?.name]);

  // 🟢 2. The Global Click Listener
  useEffect(() => {
    const playClick = (e) => {
      // If they clicked a button, or an icon inside a button...
      if (e.target.closest('button')) {
        if (clickAudioRef.current) {
          clickAudioRef.current.currentTime = 0;
          clickAudioRef.current.volume = 0.2; // Keep it subtle!
          // Force the physical DOM element to play
          clickAudioRef.current.play().catch((err) => console.log("Click audio blocked:", err));
        }
      }
    };

    document.addEventListener('click', playClick);
    return () => document.removeEventListener('click', playClick);
  }, []);

  return (
    // 🟢 THE FIX: Added dark:bg-slate-900, dark:text-white, and a smooth transition
    <div className="font-sans min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white pt-[112px] pb-12 px-4 flex justify-center transition-colors duration-300">
      <FloatingNavbar onProfileClick={() => setShowOnboarding(true)} />

      <main className="w-full max-w-6xl space-y-6">
        <TaskBoard />
        <EfficiencyStats />
        <Ledger />
        <FooterActions />
      </main>

      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />

      <AddTaskModal 
        isOpen={isAddModalOpen} 
        onClose={() => setAddModalOpen(false)} 
      />

      {/* 🟢 3. The Physical Audio Element (Browsers trust this!) */}
      <audio ref={clickAudioRef} src="https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3" preload="auto" />

      <ConsequenceEngine />
    </div>
  );
}

export default App;