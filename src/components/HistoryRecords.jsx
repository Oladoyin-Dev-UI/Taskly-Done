import { useState, useEffect, useRef } from 'react';
import { FileText, Calendar, Gift, AlertTriangle, CheckCircle2, HelpCircle, Activity } from 'lucide-react';
import { useStore } from '../store';

const TABS = ['Task Records', 'Rewards', 'Punishments'];

export default function HistoryRecords() {
  const [activeTab, setActiveTab] = useState('Task Records');
  const [poppingId, setPoppingId] = useState(null);
  
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  
  const { tasks, rewards, punishments, markRewardClaimed, markPunishmentSettled } = useStore();
  
  const finishedTasks = tasks.filter(t => t.status === 'Done' || t.status === 'Missed');
  const sortedTasks = [...finishedTasks].sort((a, b) => {
    const dateA = new Date(a.completedAt || a.createdAt).getTime();
    const dateB = new Date(b.completedAt || b.createdAt).getTime();
    return dateB - dateA;
  });

  const pendingRewardsCount = rewards.filter(r => r.status !== 'completed').length;
  const pendingPunishmentsCount = punishments.filter(p => p.status !== 'completed').length;

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const formatShortDate = (dateStr) => {
    if (!dateStr || dateStr === 'Select') return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const calculateScore = (task) => {
    if (task.status === 'Missed') return 0;
    if (!task.createdAt || !task.endDate || !task.completedAt) return 85; 
    const created = new Date(task.createdAt).getTime();
    const completed = new Date(task.completedAt).getTime();
    const deadlineStr = `${task.endDate}T${task.time || '23:59'}`;
    const deadline = new Date(deadlineStr).getTime();
    if (deadline <= created) return 100; 
    const totalAllocated = deadline - created;
    const timeSaved = deadline - completed;
    if (timeSaved < 0) return 20; 
    const bonus = (timeSaved / totalAllocated) * 50;
    return Math.min(100, Math.max(0, Math.round(50 + bonus)));
  };

  const handleAction = (id, type) => {
    setPoppingId(id);
    try {
      const popAudio = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_756a9081e6.mp3');
      popAudio.volume = 0.5;
      popAudio.play().catch(()=>{});
    } catch (e) {}
    
    setTimeout(() => {
      if (type === 'Rewards') markRewardClaimed(id);
      else markPunishmentSettled(id);
      setPoppingId(null);
    }, 600); 
  };

  return (
    <section 
      ref={sectionRef} 
      className={`w-full bg-white dark:bg-slate-900 p-5 md:p-8 rounded-2xl border border-gray-100 dark:border-slate-800 flex flex-col gap-6 transition-all duration-1000 delay-100 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes graffiti-pop { 0% { transform: scale(0.5) rotate(-15deg); opacity: 1; } 50% { transform: scale(1.4) rotate(5deg); opacity: 1; filter: drop-shadow(0px 4px 10px currentColor); } 100% { transform: scale(1.8) rotate(15deg); opacity: 0; } }
        @keyframes particle-1 { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(-40px, -35px) scale(0); opacity: 0; } }
        @keyframes particle-2 { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(40px, -45px) scale(0); opacity: 0; } }
        @keyframes particle-3 { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(55px, 15px) scale(0); opacity: 0; } }
        @keyframes particle-4 { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(-50px, 25px) scale(0); opacity: 0; } }
      `}} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-[20px] md:text-[24px] font-semibold text-gray-900 dark:text-white tracking-tight mb-1">Ledger</h2>
          <p className="text-[13px] md:text-[14px] text-gray-400 dark:text-slate-400 font-medium">Review your past performance and outcomes</p>
        </div>
        
        <div className="flex items-center bg-gray-50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-gray-100 dark:border-slate-700 w-full md:w-fit overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {TABS.map(tab => {
            const isActive = activeTab === tab;
            let badgeCount = 0;
            if (tab === 'Rewards') badgeCount = pendingRewardsCount;
            if (tab === 'Punishments') badgeCount = pendingPunishmentsCount;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg text-[12px] md:text-[13px] font-bold transition-all whitespace-nowrap active:scale-[0.98] shrink-0 ${
                  isActive 
                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm border border-gray-200/50 dark:border-slate-600/50' 
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 border border-transparent'
                }`}
              >
                {tab}
                {/* 🟢 THE FIX: Exact matching pill styling from TaskBoard */}
                {badgeCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] md:text-[11px] font-black transition-colors ${
                    isActive 
                      ? 'bg-gray-100 dark:bg-slate-600 text-gray-900 dark:text-white' 
                      : 'bg-gray-200/80 dark:bg-slate-700 text-gray-500 dark:text-slate-300'
                  }`}>
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'Task Records' && (
        <div className="w-full flex flex-col gap-2">
          {sortedTasks.length > 0 && (
            <p className="md:hidden text-[11px] text-gray-400 dark:text-slate-400 font-bold bg-gray-50 dark:bg-slate-800 px-4 py-1.5 rounded-full border border-gray-100 dark:border-slate-700 w-fit mb-1">
              Swipe table ➔
            </p>
          )}

          <div className="w-full overflow-x-auto border border-gray-100 dark:border-slate-700 rounded-xl relative custom-scrollbar shadow-sm">
            <table className="w-full text-left min-w-[950px] table-fixed overflow-visible">
              <thead className="bg-gray-50/80 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-700">
                <tr>
                  <th className="w-[28%] py-4 pl-6 font-bold text-[11px] text-gray-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    <div className="flex items-center gap-1.5"><FileText size={14} className="text-gray-400 dark:text-slate-500"/> Task Name</div>
                  </th>
                  <th className="w-[15%] py-4 px-4 font-bold text-[11px] text-gray-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    <div className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400 dark:text-slate-500"/> Start Date</div>
                  </th>
                  <th className="w-[15%] py-4 px-4 font-bold text-[11px] text-gray-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    <div className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400 dark:text-slate-500"/> End Date</div>
                  </th>
                  <th className="w-[17%] py-4 px-4 font-bold text-[11px] text-gray-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    <div className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400 dark:text-slate-500"/> Completed On</div>
                  </th>
                  <th className="w-[25%] py-4 px-6 font-bold text-[11px] text-gray-500 dark:text-slate-400 uppercase tracking-widest overflow-visible">
                    <div className="flex items-center gap-1.5 group relative cursor-help w-fit">
                      Score <HelpCircle size={14} className="text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 transition-colors" />
                      
                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[200px] p-2.5 bg-slate-800 dark:bg-slate-700 text-white text-[11px] font-medium tracking-normal rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] normal-case leading-relaxed pointer-events-none text-center border border-slate-700 dark:border-slate-600">
                        Your Productivity Health Rating (0-100). Rewards finishing on time, penalizes late or missed tasks.
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800 dark:border-b-slate-700"></div>
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-50 dark:divide-slate-800/50">
                {sortedTasks.map((record) => {
                  const score = calculateScore(record);
                  const filledBars = Math.floor(score / 10);
                  
                  return (
                    <tr key={record.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="py-5 pl-6 pr-4 text-[13px] font-bold text-gray-900 dark:text-white truncate">
                        <div className="flex items-center gap-3">
                          {record.status === 'Missed' ? <AlertTriangle size={15} className="text-red-500 shrink-0" /> : <CheckCircle2 size={15} className="text-green-500 shrink-0" />}
                          <span className="truncate">{record.taskName || record.name}</span>
                        </div>
                      </td>
                      <td className="py-5 px-4 text-[13px] font-medium text-gray-500 dark:text-slate-400">{formatShortDate(record.startDate)}</td>
                      <td className="py-5 px-4 text-[13px] font-medium text-gray-500 dark:text-slate-400">{formatShortDate(record.endDate)}</td>
                      <td className="py-5 px-4 text-[13px] font-bold text-gray-800 dark:text-slate-300">{formatShortDate(record.completedAt)}</td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <span className={`text-[12px] font-black w-8 h-8 flex items-center justify-center rounded-lg ${score === 0 ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300'}`}>{score}</span>
                          <div className="flex gap-[3px] items-end h-4">
                            {[...Array(10)].map((_, i) => (
                              <div key={i} className={`w-[4px] rounded-full transition-all ${i < filledBars ? (score > 80 ? 'bg-green-500 h-full' : score > 40 ? 'bg-blue-500 h-full' : 'bg-orange-500 h-full') : (score === 0 ? 'bg-red-100 dark:bg-red-900/30 h-1/3' : 'bg-gray-200 dark:bg-slate-700 h-1/3')}`} />
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {sortedTasks.length === 0 && (
              <div className="w-full py-20 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 bg-white dark:bg-slate-900">
                <FileText size={40} className="mb-3 opacity-20" />
                <p className="text-[15px] font-bold">No task records found.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {(activeTab === 'Rewards' || activeTab === 'Punishments') && (
        <div className="w-full flex flex-col gap-2">
          <div className="w-full overflow-x-auto border border-gray-100 dark:border-slate-700 rounded-xl shadow-sm custom-scrollbar">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-gray-50/80 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-700">
                <tr>
                  <th className="py-4 pl-6 font-bold text-[11px] text-gray-500 dark:text-slate-400 uppercase tracking-widest w-[50%]">
                    <div className="flex items-center gap-1.5">
                      {activeTab === 'Rewards' ? <Gift size={14} className="text-gray-400 dark:text-slate-500" /> : <AlertTriangle size={14} className="text-gray-400 dark:text-slate-500" />} 
                      Message
                    </div>
                  </th>
                  <th className="py-4 px-4 font-bold text-[11px] text-gray-500 dark:text-slate-400 uppercase tracking-widest w-[25%]">
                    <div className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400 dark:text-slate-500" /> Date Issued</div>
                  </th>
                  <th className="py-4 px-6 font-bold text-[11px] text-gray-500 dark:text-slate-400 uppercase tracking-widest w-[25%]">
                    <div className="flex items-center gap-1.5"><Activity size={14} className="text-gray-400 dark:text-slate-500" /> Status</div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-50 dark:divide-slate-800/50">
                {[...(activeTab === 'Rewards' ? rewards : punishments)]
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-6 pl-6 pr-4 text-[13px] font-bold text-gray-900 dark:text-white">{item.text}</td>
                    <td className="py-6 px-4 text-[13px] font-medium text-gray-500 dark:text-slate-400">{formatShortDate(item.timestamp)}</td>
                    <td className="py-6 px-6">
                      {item.status === 'completed' ? (
                        <span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 flex w-fit items-center gap-1.5"><CheckCircle2 size={13} /> {activeTab === 'Rewards' ? 'Claimed' : 'Settled'}</span>
                      ) : (
                        <div className="relative w-fit flex items-center justify-center">
                          <button 
                            onClick={() => handleAction(item.id, activeTab)} 
                            className={`text-[12px] font-black px-5 py-2 rounded-full border shadow-sm transition-all duration-300 flex items-center gap-1.5
                              ${poppingId === item.id ? 'opacity-0 scale-50' : 'opacity-100 scale-100 hover:scale-105 active:scale-95'} 
                              ${activeTab === 'Rewards' ? 'bg-green-600 text-white border-green-700 hover:bg-green-500 shadow-green-600/20' : 'bg-red-600 text-white border-red-700 hover:bg-red-500 shadow-red-600/20'}`}
                          >
                            {activeTab === 'Rewards' ? 'Claim ✨' : 'Settle 💥'}
                          </button>

                          {poppingId === item.id && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                              <div className={`absolute font-black text-lg tracking-wider whitespace-nowrap ${activeTab === 'Rewards' ? 'text-green-500' : 'text-red-500'}`} style={{ animation: 'graffiti-pop 0.6s ease-out forwards', fontFamily: '"Comic Sans MS", "Marker Felt", "Caveat", cursive, sans-serif' }}>
                                {activeTab === 'Rewards' ? 'CLAIMED! ✨' : 'DONE! 💥'}
                              </div>
                              <div className={`absolute w-2.5 h-2.5 rounded-full ${activeTab === 'Rewards' ? 'bg-green-400' : 'bg-red-400'}`} style={{ animation: 'particle-1 0.5s ease-out forwards' }} />
                              <div className={`absolute w-2 h-2 rounded-full ${activeTab === 'Rewards' ? 'bg-blue-400' : 'bg-orange-400'}`} style={{ animation: 'particle-2 0.5s ease-out forwards' }} />
                              <div className={`absolute w-1.5 h-1.5 rounded-full ${activeTab === 'Rewards' ? 'bg-yellow-400' : 'bg-purple-400'}`} style={{ animation: 'particle-3 0.6s ease-out forwards' }} />
                              <div className={`absolute w-2 h-2 rounded-full ${activeTab === 'Rewards' ? 'bg-teal-400' : 'bg-black dark:bg-white'}`} style={{ animation: 'particle-4 0.4s ease-out forwards' }} />
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {(activeTab === 'Rewards' ? rewards : punishments).length === 0 && (
              <div className="w-full py-20 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 bg-white dark:bg-slate-900">
                {activeTab === 'Rewards' ? <Gift size={40} className="mb-3 opacity-20" /> : <AlertTriangle size={40} className="mb-3 opacity-20" />}
                <p className="text-[15px] font-bold">No {activeTab.toLowerCase()} found.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}