import { useState, useRef } from 'react';
import { CircleDashed, Loader2, AlertCircle, CheckCircle2, Trash, Calendar as CalendarIcon, MoreHorizontal, ChevronLeft, ChevronRight, ArrowRight, X, AlertTriangle, Eye } from 'lucide-react';
import { useStore } from '../store';

const COLUMNS = [
  { id: 'To Do', title: 'To-Do', headerBg: 'bg-slate-800', textColor: 'text-white', Icon: CircleDashed, color: 'bg-slate-500', textAccent: 'text-slate-600 dark:text-slate-400' },
  { id: 'In Progress', title: 'In Progress', headerBg: 'bg-blue-600', textColor: 'text-white', Icon: Loader2, color: 'bg-blue-500', textAccent: 'text-blue-600 dark:text-blue-400' },
  { id: 'In Review', title: 'In Review', headerBg: 'bg-purple-600', textColor: 'text-white', Icon: Eye, color: 'bg-purple-500', textAccent: 'text-purple-600 dark:text-purple-400' },
  { id: 'Missed', title: 'Missed', headerBg: 'bg-red-600', textColor: 'text-white', Icon: AlertCircle, color: 'bg-red-500', textAccent: 'text-red-600 dark:text-red-400' },
  { id: 'Done', title: 'Done', headerBg: 'bg-green-600', textColor: 'text-white', Icon: CheckCircle2, color: 'bg-green-500', textAccent: 'text-green-600 dark:text-green-400' },
];

const HOLIDAYS = { 'default': ['01-01', '12-25', '12-31'] };
const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const getStatusColors = (percentage) => {
  if (percentage >= 80) return { bar: 'bg-red-500', text: 'text-red-600 dark:text-red-400' };
  if (percentage >= 50) return { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' };
  return { bar: 'bg-green-500', text: 'text-green-600 dark:text-green-400' };
};

const formatDateBadge = (dateStr) => {
  if (!dateStr) return 'Select';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return dateStr;
  } catch (e) { return 'Select'; }
};

export default function TaskBoard() {
  const { tasks = [], updateTask, deleteTask, timezone } = useStore();
  const userHolidays = HOLIDAYS[timezone] || HOLIDAYS['default'];
  
  const [activeTab, setActiveTab] = useState('To Do');
  const [activeIndex, setActiveIndex] = useState(0);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [openDatePicker, setOpenDatePicker] = useState({ id: null, type: null });
  const [calendarView, setCalendarView] = useState(new Date());

  const [confirmAction, setConfirmAction] = useState(null);

  const clickAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'));
  const playClick = () => {
    clickAudio.current.currentTime = 0;
    clickAudio.current.play().catch(() => {});
  };

  const handleOpenDate = (id, type, currentDateStr) => {
    playClick();
    setOpenDropdownId(null);
    if (currentDateStr) {
      const [y, m] = currentDateStr.split('-');
      setCalendarView(new Date(y, m - 1, 1));
    } else {
      setCalendarView(new Date());
    }
    setOpenDatePicker({ id, type });
  };

  const changeMonth = (offset) => {
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);
    const newView = new Date(calendarView.getFullYear(), calendarView.getMonth() + offset, 1);
    if (newView < currentMonthStart) return; 
    playClick();
    setCalendarView(newView);
  };

  const getCalendarDays = () => {
    const year = calendarView.getFullYear();
    const month = calendarView.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);
  const isCurrentMonth = calendarView.getTime() <= currentMonthStart.getTime();

  const touchStartX = useRef(null);
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (diff > 40) {
      playClick();
      setActiveIndex((prev) => (prev + 1) % COLUMNS.length);
    } else if (diff < -40) {
      playClick();
      setActiveIndex((prev) => (prev - 1 + COLUMNS.length) % COLUMNS.length);
    }
    touchStartX.current = null;
  };

  const renderTaskCard = (task) => {
    let timeElapsed = 0;
    if (task.status === 'In Progress') timeElapsed = 40;
    else if (task.status === 'In Review') timeElapsed = 75;
    else if (task.status === 'Missed' || task.status === 'Done') timeElapsed = 100;
    
    let statusColors;
    if (task.status === 'Done') {
      statusColors = { bar: 'bg-green-500', text: 'text-green-600 dark:text-green-400' };
    } else if (task.status === 'Missed') {
      statusColors = { bar: 'bg-red-500', text: 'text-red-600 dark:text-red-400' };
    } else {
      statusColors = getStatusColors(timeElapsed);
    }

    return (
      <div key={task.id} className="bg-white dark:bg-slate-800 p-4 md:p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col relative transition-all w-full pointer-events-auto">
        <div className="flex justify-between items-start mb-4 gap-2 relative z-20">
          <input 
            value={task.taskName || task.name || ''}
            onChange={(e) => updateTask(task.id, { taskName: e.target.value })}
            onKeyDown={(e) => e.stopPropagation()} 
            placeholder="Untitled Task..."
            className="text-[14px] md:text-[15px] font-extrabold text-gray-900 dark:text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 rounded px-1 -ml-1 w-full pr-2 placeholder:text-gray-400 dark:placeholder:text-slate-500"
          />
          <div className="flex items-center gap-1 shrink-0">
            
            <div className="relative">
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  playClick(); 
                  setOpenDropdownId(openDropdownId === task.id ? null : task.id); 
                  setOpenDatePicker({id: null, type: null});
                }} 
                className={`p-1.5 rounded-lg transition-colors ${openDropdownId === task.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-300 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700'}`}
              >
                <MoreHorizontal size={20} strokeWidth={2.5} />
              </button>

              {openDropdownId === task.id && (
                <>
                  <div className="fixed inset-0 z-[100]" onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }}></div>
                  <div className="absolute right-0 top-full mt-2 w-[180px] md:w-[200px] bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] rounded-[18px] p-2 z-[110] animate-in zoom-in-95 duration-200">
                    <div className="px-3 py-2 mb-1 border-b border-gray-50 dark:border-slate-800 flex items-center gap-1.5 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                      Move Task To <ArrowRight size={12} />
                    </div>
                    <div className="flex flex-col gap-1">
                      {COLUMNS.map(col => {
                        // Don't show the current status
                        if (col.id === task.status) return null;
                        
                        // 🟢 THE FIX: If the task is 'Done', hide the 'Missed' option
                        if (task.status === 'Done' && col.id === 'Missed') return null;

                        return (
                          <button 
                            key={col.id} 
                            onClick={(e) => {
                              e.stopPropagation();
                              playClick();
                              if (col.id === 'Missed') {
                                setConfirmAction({ type: 'missed', taskId: task.id });
                              } else {
                                updateTask(task.id, { status: col.id });
                              }
                              setOpenDropdownId(null);
                            }} 
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left group"
                          >
                            <div className={`w-3 h-3 rounded-full shadow-sm ${col.color} group-hover:scale-110 transition-transform`}></div>
                            <span className={`text-[12px] md:text-[13px] font-bold text-gray-600 dark:text-slate-300 group-hover:${col.textAccent}`}>{col.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                playClick(); 
                setConfirmAction({ type: 'delete', taskId: task.id }); 
              }} 
              className="text-gray-300 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col gap-2.5 mb-6 z-10">
          <div className="flex items-center gap-2 text-[11px] md:text-[12px] font-bold text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 w-fit px-3 py-1.5 rounded-lg">
            <CalendarIcon size={14} className="text-gray-400 dark:text-slate-500 shrink-0" />
            <button onClick={() => handleOpenDate(task.id, 'startDate', task.startDate)} className={`transition-colors flex items-center ${openDatePicker.id === task.id && openDatePicker.type === 'startDate' ? 'text-blue-600 dark:text-blue-400' : 'hover:text-blue-600 dark:hover:text-blue-400'}`}>
              {formatDateBadge(task.startDate)}
            </button>
            <span className="text-gray-300 dark:text-slate-600 mx-0.5">•</span>
            <button onClick={() => handleOpenDate(task.id, 'endDate', task.endDate)} className={`transition-colors flex items-center ${openDatePicker.id === task.id && openDatePicker.type === 'endDate' ? 'text-blue-600 dark:text-blue-400' : 'hover:text-blue-600 dark:hover:text-blue-400'}`}>
              {formatDateBadge(task.endDate)}
            </button>
          </div>

          <div className="flex items-center text-[11px] md:text-[12px] font-bold text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 w-fit px-3 py-1.5 rounded-lg">
            <input 
              type="time" 
              value={task.time || ''} 
              onChange={(e) => updateTask(task.id, { time: e.target.value })} 
              className="bg-transparent font-bold text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 focus:text-blue-600 dark:focus:text-blue-400 focus:outline-none cursor-text w-[75px] [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:opacity-0" 
            />
          </div>
        </div>

        <div className="mt-auto pt-2 border-t border-gray-50 dark:border-slate-700/50 relative z-0">
          <div className="flex justify-between items-end mb-2 mt-1">
            <span className="text-[10px] md:text-[11px] font-extrabold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Time Elapsed</span>
            <span className={`text-[11px] md:text-[12px] font-black ${statusColors.text}`}>{timeElapsed}%</span>
          </div>
          <div className="h-1.5 md:h-2 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
            <div className={`h-full rounded-full transition-all duration-500 ${statusColors.bar}`} style={{ width: `${timeElapsed}%` }} />
          </div>
        </div>
      </div>
    );
  };

  const activeCalendarTask = tasks.find(t => t.id === openDatePicker.id);

  return (
    <section className="w-full max-w-full bg-white dark:bg-slate-900 p-4 md:p-8 rounded-[24px] md:rounded-3xl border border-gray-100 dark:border-slate-800 flex flex-col gap-6 md:gap-8 relative overflow-hidden md:overflow-visible shadow-sm transition-colors duration-300">
      
      {openDatePicker.id && <div className="fixed inset-0 z-40" onClick={() => setOpenDatePicker({id: null, type: null})}></div>}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 w-full relative z-10">
        <div className="text-left shrink-0">
          <h2 className="text-[20px] md:text-[24px] font-semibold text-gray-900 dark:text-white tracking-tight mb-1">Your Task Board</h2>
          <p className="text-[12px] md:text-[14px] text-gray-400 dark:text-slate-400 font-medium">Swipe cards or use tabs to navigate stages.</p>
        </div>

        <div className="flex items-center bg-gray-50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-gray-100 dark:border-slate-700 w-full md:w-fit overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {COLUMNS.map((col, index) => {
            const isActive = activeIndex === index;
            const taskCount = tasks.filter(t => t.status === col.id && !t.archived).length;
            return (
              <button
                key={col.id}
                onClick={() => { playClick(); setActiveIndex(index); }}
                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg text-[12px] md:text-[13px] font-bold transition-all whitespace-nowrap active:scale-[0.98] shrink-0 ${
                  isActive 
                    ? `${col.headerBg} ${col.textColor} shadow-md` 
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 border border-transparent'
                }`}
              >
                {col.title}
                <span className={`px-2 py-0.5 rounded-full text-[10px] md:text-[11px] font-black transition-colors ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-200/80 dark:bg-slate-700 text-gray-500 dark:text-slate-300'
                }`}>
                  {taskCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-full mt-4 md:mt-10 min-h-[500px] md:min-h-[600px]">
        <div className="relative w-[260px] sm:w-[280px] md:w-[380px] h-[450px] sm:h-[480px] md:h-[520px] touch-pan-y" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          {COLUMNS.map((col, index) => {
            const columnTasks = tasks.filter(t => t.status === col.id && !t.archived);
            const offset = (index - activeIndex + COLUMNS.length) % COLUMNS.length;
            const isActive = offset === 0;
            
            let transX = 0, transY = 0, rot = 0, scale = 1, zIndex = 40;
            const isDesktop = typeof window !== 'undefined' && window.innerWidth > 768;
            
            const spreadX = isDesktop ? 35 : 14; 
            const spreadY = isDesktop ? 15 : 8;

            if (offset === 0) {
              transX = 0; transY = 0; rot = 0; scale = 1; zIndex = 40;
            } else if (offset === 1) { 
              transX = spreadX; transY = spreadY; rot = 5; scale = 0.95; zIndex = 39;
            } else if (offset === 2) { 
              transX = spreadX * 1.9; transY = spreadY * 2.2; rot = 10; scale = 0.9; zIndex = 38;
            } else if (offset === 3) { 
              transX = -spreadX * 1.9; transY = spreadY * 2.2; rot = -10; scale = 0.9; zIndex = 38;
            } else if (offset === 4) { 
              transX = -spreadX; transY = spreadY; rot = -5; scale = 0.95; zIndex = 39;
            }

            return (
              <div 
                key={col.id} 
                onClick={() => !isActive && setActiveIndex(index)} 
                className={`absolute top-0 left-0 w-full h-full flex flex-col rounded-[24px] border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 shadow-2xl transition-all duration-500 ${isActive ? '' : 'cursor-pointer hover:border-gray-300 dark:hover:border-slate-600'}`} 
                style={{ 
                  transform: `translateX(${transX}px) translateY(${transY}px) rotate(${rot}deg) scale(${scale})`, 
                  zIndex: zIndex, 
                  transformOrigin: 'center center' 
                }}
              >
                <div className={`flex items-center gap-3 p-4 md:p-5 rounded-t-[24px] ${col.headerBg}`}>
                  <col.Icon size={18} className={`md:w-[20px] md:h-[20px] ${col.textColor}`} strokeWidth={2.5} />
                  <h3 className={`text-[14px] md:text-[16px] font-black ${col.textColor} uppercase tracking-widest`}>{col.title}</h3>
                  <span className="bg-white/20 text-white text-[11px] md:text-[12px] font-black px-2.5 py-0.5 md:px-3 md:py-1 rounded-full shadow-inner ml-auto">{columnTasks.length}</span>
                </div>
                
                <div className={`flex-1 p-3 md:p-5 space-y-3 md:space-y-4 ${isActive ? 'overflow-y-auto pointer-events-auto' : 'overflow-hidden pointer-events-none select-none'} [&::-webkit-scrollbar]:hidden`}>
                  {columnTasks.map(t => renderTaskCard(t))}
                  
                  {columnTasks.length === 0 && (
                    <div className="h-28 w-full flex flex-col items-center justify-center text-gray-300 dark:text-slate-500 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 mt-2">
                      <span className="text-[12px] md:text-[13px] font-bold">No tasks in {col.title}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 mt-12 md:mt-16 text-gray-400 dark:text-slate-500 z-10">
           <button onClick={() => { playClick(); setActiveIndex(prev => (prev - 1 + COLUMNS.length) % COLUMNS.length); }} className="p-3.5 md:p-4 bg-white dark:bg-slate-800 rounded-full border border-gray-200 dark:border-slate-700 shadow-sm active:scale-95 transition-transform hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-slate-500">
             <ChevronLeft size={22} strokeWidth={2.5} />
           </button>
           <button onClick={() => { playClick(); setActiveIndex(prev => (prev + 1) % COLUMNS.length); }} className="p-3.5 md:p-4 bg-white dark:bg-slate-800 rounded-full border border-gray-200 dark:border-slate-700 shadow-sm active:scale-95 transition-transform hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-slate-500">
             <ChevronRight size={22} strokeWidth={2.5} />
           </button>
        </div>
      </div>

      {confirmAction && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setConfirmAction(null)}>
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[24px] shadow-2xl p-6 md:p-8 w-full max-w-[340px] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center gap-4">
              
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${confirmAction.type === 'delete' ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-500 dark:text-orange-400'}`}>
                {confirmAction.type === 'delete' ? <Trash size={28} strokeWidth={2.5} /> : <AlertTriangle size={28} strokeWidth={2.5} />}
              </div>
              
              <div>
                <h3 className="text-[18px] font-bold text-gray-900 dark:text-white mb-1.5">
                  {confirmAction.type === 'delete' ? 'Remove Task?' : 'Move to Missed?'}
                </h3>
                <p className="text-[13px] font-medium text-gray-500 dark:text-slate-400 leading-relaxed">
                  {confirmAction.type === 'delete' 
                    ? 'Are you sure you want to remove this task? This action cannot be undone.'
                    : 'Are you sure? Moving this task to Missed means you will face your active punishment.'}
                </p>
              </div>

              <div className="flex w-full gap-3 mt-4">
                <button onClick={() => { playClick(); setConfirmAction(null); }} className="flex-1 py-3 rounded-xl font-bold text-[13px] bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    playClick();
                    if (confirmAction.type === 'delete') {
                      deleteTask(confirmAction.taskId);
                    } else {
                      updateTask(confirmAction.taskId, { status: 'Missed' });
                    }
                    setConfirmAction(null);
                  }} 
                  className={`flex-1 py-3 rounded-xl font-bold text-[13px] text-white shadow-md transition-transform active:scale-95 ${confirmAction.type === 'delete' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'}`}
                >
                  {confirmAction.type === 'delete' ? 'Remove' : 'Move Task'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {openDatePicker.id && activeCalendarTask && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setOpenDatePicker({id: null, type: null})}>
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[24px] shadow-2xl p-6 w-full max-w-[320px] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-[14px] font-black text-gray-800 dark:text-white uppercase tracking-widest">
                Select {openDatePicker.type === 'startDate' ? 'Start' : 'End'} Date
              </span>
              <button onClick={() => { playClick(); setOpenDatePicker({id: null, type: null}); }} className="p-1 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-slate-800">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex items-center justify-between mb-5">
              <button onClick={() => changeMonth(-1)} disabled={isCurrentMonth} className="p-2 bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"><ChevronLeft size={18} strokeWidth={2.5} /></button>
              <span className="text-[14px] font-bold text-gray-800 dark:text-white">{MONTHS[calendarView.getMonth()]} {calendarView.getFullYear()}</span>
              <button onClick={() => changeMonth(1)} className="p-2 bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"><ChevronRight size={18} strokeWidth={2.5} /></button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-3">
              {DAYS_OF_WEEK.map(day => (<div key={day} className="text-[11px] font-bold text-gray-400 dark:text-slate-500 text-center">{day}</div>))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {getCalendarDays().map((day, i) => {
                if (!day) return <div key={`empty-${i}`} className="w-9 md:w-10 h-9 md:h-10" />;
                
                const dateObj = new Date(calendarView.getFullYear(), calendarView.getMonth(), day);
                const today = new Date(); today.setHours(0, 0, 0, 0);
                
                let isBeforeStart = false;
                if (openDatePicker.type === 'endDate' && activeCalendarTask.startDate) {
                  const [sy, sm, sd] = activeCalendarTask.startDate.split('-');
                  const startD = new Date(sy, sm - 1, sd);
                  if (dateObj < startD) isBeforeStart = true;
                }

                const isDisabled = dateObj < today || isBeforeStart;
                const dateStr = `${calendarView.getFullYear()}-${(calendarView.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                const isSelected = activeCalendarTask[openDatePicker.type] === dateStr;
                const isHoliday = userHolidays.includes(`${(calendarView.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);

                return (
                  <button 
                    key={i} 
                    disabled={isDisabled} 
                    onClick={() => { 
                      playClick(); 
                      updateTask(activeCalendarTask.id, { [openDatePicker.type]: dateStr }); 
                      setOpenDatePicker({id: null, type: null}); 
                    }} 
                    className={`relative w-9 md:w-10 h-9 md:h-10 rounded-full text-[13px] md:text-[14px] font-bold flex items-center justify-center transition-all 
                      ${isDisabled ? 'text-gray-300 dark:text-slate-600 cursor-not-allowed opacity-50' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'} 
                      ${isSelected ? 'bg-blue-600 dark:bg-blue-600 text-white shadow-md hover:bg-blue-700 dark:hover:bg-blue-700' : ''}`}
                  >
                    {day}
                    {isHoliday && !isDisabled && <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-orange-400 dark:bg-orange-500'}`}></span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}