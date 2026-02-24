import { useState, useEffect, useMemo, useRef } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Target, Flame, AlertCircle, BarChart2, Gift, ShieldAlert, HelpCircle } from 'lucide-react';
import { useStore } from '../store';

const TABS = ['Today', 'This Week', 'This Month', 'This Year'];

export default function EfficiencyStats() {
  const [activeTab, setActiveTab] = useState('Today');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // 🟢 Scroll Animation State
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const { tasks, rewards, punishments } = useStore();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🟢 Intersection Observer for Scroll Animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Only animate once
        }
      },
      { threshold: 0.1 } // Trigger when 10% of it is visible
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const formatDate = (date) => date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const calculateScore = (task) => {
    if (task.status === 'Missed') return 0;
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

  const getStats = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let currentStart, prevStart, prevEnd;
    let trendLabel = '';

    if (activeTab === 'Today') {
      currentStart = startOfToday;
      prevStart = new Date(startOfToday); prevStart.setDate(prevStart.getDate() - 1);
      prevEnd = new Date(startOfToday); prevEnd.setMilliseconds(-1);
      trendLabel = 'vs yesterday';
    } else if (activeTab === 'This Week') {
      const day = now.getDay();
      currentStart = new Date(startOfToday); currentStart.setDate(currentStart.getDate() - day);
      prevStart = new Date(currentStart); prevStart.setDate(prevStart.getDate() - 7);
      prevEnd = new Date(currentStart); prevEnd.setMilliseconds(-1);
      trendLabel = 'vs last week';
    } else if (activeTab === 'This Month') {
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevEnd = new Date(currentStart); prevEnd.setMilliseconds(-1);
      trendLabel = 'vs last month';
    } else {
      currentStart = new Date(now.getFullYear(), 0, 1);
      prevStart = new Date(now.getFullYear() - 1, 0, 1);
      prevEnd = new Date(currentStart); prevEnd.setMilliseconds(-1);
      trendLabel = 'vs last year';
    }

    const filterByDate = (items, start, end, dateKey = 'completedAt') => {
      return items.filter(item => {
        if (!item[dateKey]) return false;
        const d = new Date(item[dateKey]).getTime();
        return end ? (d >= start.getTime() && d <= end.getTime()) : (d >= start.getTime());
      });
    };

    const currDone = filterByDate(tasks.filter(t => t.status === 'Done'), currentStart, null);
    const currMissed = filterByDate(tasks.filter(t => t.status === 'Missed'), currentStart, null);
    const currRewards = filterByDate(rewards, currentStart, null, 'timestamp');
    const currPunishments = filterByDate(punishments, currentStart, null, 'timestamp');
    
    const prevDone = filterByDate(tasks.filter(t => t.status === 'Done'), prevStart, prevEnd);
    const prevMissed = filterByDate(tasks.filter(t => t.status === 'Missed'), prevStart, prevEnd);
    const prevRewards = filterByDate(rewards, prevStart, prevEnd, 'timestamp');
    const prevPunishments = filterByDate(punishments, prevStart, prevEnd, 'timestamp');

    const calcRate = (done, missed) => done.length + missed.length === 0 ? 0 : Math.round((done.length / (done.length + missed.length)) * 100);
    const calcAvg = (done) => done.length === 0 ? 0 : Math.round(done.reduce((acc, t) => acc + calculateScore(t), 0) / done.length);

    return [
      { id: 'completed', name: 'Tasks Completed', emoji: '🚀', value: currDone.length, trend: currDone.length - prevDone.length, trendLabel, lineColor: 'bg-blue-500', BgIcon: Target, goodIsUp: true },
      { id: 'missed', name: 'Tasks Missed', emoji: '⚠️', value: currMissed.length, trend: currMissed.length - prevMissed.length, trendLabel, lineColor: 'bg-red-500', BgIcon: AlertCircle, goodIsUp: false },
      { id: 'rate', name: 'Completion Rate', emoji: '📊', value: `${calcRate(currDone, currMissed)}%`, trend: calcRate(currDone, currMissed) - calcRate(prevDone, prevMissed), trendLabel, lineColor: 'bg-green-500', BgIcon: BarChart2, goodIsUp: true },
      { id: 'rewards', name: 'Rewards Claimed', emoji: '🎁', value: currRewards.length, trend: currRewards.length - prevRewards.length, trendLabel, lineColor: 'bg-purple-500', BgIcon: Gift, goodIsUp: true },
      { id: 'punishments', name: 'Punishments Faced', emoji: '⚖️', value: currPunishments.length, trend: currPunishments.length - prevPunishments.length, trendLabel, lineColor: 'bg-orange-500', BgIcon: ShieldAlert, goodIsUp: false },
      { id: 'avgScore', name: 'Average Score', emoji: '⭐', value: calcAvg(currDone), trend: calcAvg(currDone) - calcAvg(prevDone), trendLabel, lineColor: 'bg-yellow-400', BgIcon: Flame, goodIsUp: true, tooltip: "Your Productivity Health Rating (0-100). Rewards finishing on time, penalizes late or missed tasks." }
    ];
  }, [tasks, rewards, punishments, activeTab]);

  return (
    <section 
      ref={sectionRef} 
      className={`w-full bg-white dark:bg-slate-900 p-5 md:p-8 rounded-2xl border border-gray-100 dark:border-slate-800 flex flex-col gap-6 md:gap-8 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          {/* Top Date Badge */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 px-3 py-1.5 rounded-lg text-[12px] font-bold text-gray-500 dark:text-slate-400 mb-1 tabular-nums tracking-wide w-fit">
            <span className="text-blue-600 dark:text-blue-400">{formatDate(currentTime)}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600"></span>
            <span>{formatTime(currentTime)}</span>
          </div>
          <h2 className="text-[20px] md:text-[24px] font-semibold text-gray-900 dark:text-white tracking-tight leading-none">
            Efficiency Stats
          </h2>
          <p className="text-[13px] md:text-[14px] text-gray-400 dark:text-slate-400 font-medium">
            See how effective you are
          </p>
        </div>

        {/* Unified Tabs */}
        <div className="flex items-center bg-gray-50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-gray-100 dark:border-slate-700 w-full md:w-fit overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm border border-gray-200/50 dark:border-slate-600/50' 
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {getStats.map((stat) => {
          const isTrendPositiveNumber = stat.trend > 0;
          const isTrendNeutral = stat.trend === 0;
          let isGood = isTrendNeutral ? null : (stat.goodIsUp ? isTrendPositiveNumber : !isTrendPositiveNumber);
          const TrendIcon = isTrendPositiveNumber ? ArrowUpRight : (isTrendNeutral ? TrendingUp : ArrowDownRight);
          
          // 🟢 Trend Pill Badge Colors (Adjusted for dark mode legibility)
          const trendColor = isGood === true 
            ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' 
            : (isGood === false 
                ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' 
                : 'text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800');
          const trendBorder = isGood === true 
            ? 'border-green-100 dark:border-green-800/30' 
            : (isGood === false 
                ? 'border-red-100 dark:border-red-800/30' 
                : 'border-gray-200 dark:border-slate-700');
          
          const displayTrend = isTrendPositiveNumber ? `+${stat.trend}` : stat.trend; 

          return (
            <div key={stat.id} className="relative rounded-2xl border border-gray-100 dark:border-slate-700 flex flex-col bg-gray-50/50 dark:bg-slate-800/30 hover:shadow-md transition-shadow hover:z-50">
              
              <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-0">
                <stat.BgIcon className="absolute -right-4 -bottom-4 w-32 h-32 md:w-40 md:h-40 text-gray-900 dark:text-white opacity-[0.03] dark:opacity-[0.02] rotate-[-10deg]" strokeWidth={2} />
              </div>

              <div className="p-5 md:p-6 flex-1 relative z-10">
                <div className={`h-1 w-8 rounded-full mb-4 ${stat.lineColor}`} />
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{stat.emoji}</span>
                  <h3 className="text-[12px] md:text-[13px] font-extrabold text-gray-500 dark:text-slate-400 tracking-tight uppercase flex items-center gap-1.5">
                    {stat.name}
                    
                    {/* Tooltip */}
                    {stat.tooltip && (
                      <div className="relative group flex items-center" tabIndex="0">
                        <HelpCircle size={14} className="text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 cursor-help transition-colors outline-none" />
                        
                        {/* The Tooltip Box */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[200px] p-2.5 bg-slate-800 dark:bg-slate-700 text-white text-[11px] font-medium rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-focus:opacity-100 group-hover:visible group-focus:visible transition-all z-[100] normal-case pointer-events-none text-center leading-relaxed border border-slate-700 dark:border-slate-600">
                          {stat.tooltip}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-700"></div>
                        </div>
                      </div>
                    )}
                  </h3>
                </div>
                <div className="text-[32px] md:text-[40px] font-black text-gray-900 dark:text-white tracking-tight leading-none">
                  {stat.value}
                </div>
              </div>

              {/* Bottom Trend Bar */}
              <div className="bg-white dark:bg-slate-800/80 p-3 md:p-4 border-t border-gray-100 dark:border-slate-700/50 flex items-center gap-3 relative z-10 rounded-b-[15px]">
                <div className={`flex items-center gap-0.5 px-2.5 py-1 rounded-full border ${trendBorder} ${trendColor}`}>
                  <TrendIcon size={14} strokeWidth={3} />
                  <span className="text-[11px] md:text-[12px] font-black">{displayTrend}</span>
                </div>
                <span className="text-[11px] md:text-[12px] font-bold text-gray-400 dark:text-slate-500">
                  {stat.trendLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}