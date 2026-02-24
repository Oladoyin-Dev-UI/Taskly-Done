import { useState, useEffect, useRef } from 'react';
import { Paperclip, Calendar as CalendarIcon, Clock, Plus, X, CircleDashed, Timer, Eye, ChevronDown, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, MousePointerClick } from 'lucide-react'; // 🟢 Added Eye here
import { useStore } from '../store';

// 🟢 NEW: Added In Review to the dropdown
const STATUS_OPTIONS = [
  { id: 'To Do', label: 'To Do', color: 'bg-slate-500', icon: CircleDashed },
  { id: 'In Progress', label: 'In Progress', color: 'bg-blue-500', icon: Timer },
  { id: 'In Review', label: 'In Review', color: 'bg-purple-500', icon: Eye } 
];

const HOLIDAYS = { 'default': ['01-01', '12-25', '12-31'] };
const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function AddTaskModal({ isOpen, onClose }) {
  const { timezone, addTask, addTasks, setAddModalOpen } = useStore();
  const userHolidays = HOLIDAYS[timezone] || HOLIDAYS['default'];

  const [isFlipped, setIsFlipped] = useState(false);
  const [openStatusId, setOpenStatusId] = useState(null); 
  const [openDatePicker, setOpenDatePicker] = useState({ id: null, type: null });
  const [calendarView, setCalendarView] = useState(new Date()); 
  
  const [tasks, setTasks] = useState([
    { id: 1, name: '', startDate: '', endDate: '', time: '', status: 'To Do' }
  ]);

  const clickAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'));
  const pageTurnAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2381/2381-preview.mp3'));
  
  const lastInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsFlipped(false);
      setTasks([{ id: Date.now(), name: '', startDate: '', endDate: '', time: '', status: 'To Do' }]);
      closeAllPopups();
      const timer = setTimeout(() => handleFlip(true), 800);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  useEffect(() => {
    if (isFlipped && lastInputRef.current) {
      const focusTimer = setTimeout(() => {
        if (lastInputRef.current) lastInputRef.current.focus();
      }, 150);
      return () => clearTimeout(focusTimer);
    }
  }, [isFlipped, tasks.length]);

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

  const closeAllPopups = () => {
    setOpenStatusId(null);
    setOpenDatePicker({ id: null, type: null });
  };

  const updateTask = (id, field, value) => setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));

  const addNewTaskCard = () => {
    playClick();
    closeAllPopups();
    setTasks([...tasks, { id: Date.now(), name: '', startDate: '', endDate: '', time: '', status: 'To Do' }]);
  };

  const removeTaskCard = (id) => {
    playClick();
    if (tasks.length > 1) setTasks(tasks.filter(t => t.id !== id));
  };

  const handleSubmit = () => {
    try {
      playClick();
      
      const validTasks = tasks
        .filter(t => t.name.trim() !== '')
        .map(t => ({
          taskName: t.name, 
          startDate: t.startDate,
          endDate: t.endDate, 
          time: t.time, 
          status: t.status 
        }));

      if (validTasks.length > 0) {
        if (addTasks) {
          addTasks(validTasks);
        } else {
          validTasks.forEach(task => addTask(task));
        }
      }
    } catch (error) {
      console.error("Error saving tasks:", error);
    } finally {
      setAddModalOpen(false);
      if (typeof onClose === 'function') onClose(); 
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Select';
    const [y, m, d] = dateString.split('-');
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleOpenDate = (taskId, type, currentDateStr) => {
    playClick();
    closeAllPopups();
    if (currentDateStr) {
      const [y, m] = currentDateStr.split('-');
      setCalendarView(new Date(y, m - 1, 1));
    } else {
      setCalendarView(new Date());
    }
    setOpenDatePicker({ id: taskId, type });
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 overflow-hidden transition-colors duration-300" onClick={() => { playClick(); setAddModalOpen(false); if(onClose) onClose(); }}>
      
      <button onClick={() => { playClick(); setAddModalOpen(false); if(onClose) onClose(); }} className="fixed top-6 right-6 z-[160] p-3 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 text-gray-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-full shadow-lg backdrop-blur-md transition-all active:scale-95">
        <X size={24} strokeWidth={2.5} />
      </button>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.4); border-radius: 10px; transition: background 0.3s ease; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.8); }
        @keyframes slideUpReveal { 0% { transform: translateY(300px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        .animate-paper-reveal { animation: slideUpReveal 0.8s cubic-bezier(0.17, 0.84, 0.44, 1) forwards; }
        .cover-page { transform-origin: 0% 0%; transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease; }
        .cover-page.flipped { transform: rotate(-100deg) translate(-20px, 10px); pointer-events: none; }
        .fun-font { font-family: 'Comic Sans MS', 'Marker Felt', 'Caveat', cursive, sans-serif; }
        input[type="time"]::-webkit-calendar-picker-indicator { display: none; }
      `}</style>

      <div className="relative w-full max-w-[440px] h-[750px] flex items-end justify-center" onClick={(e) => e.stopPropagation()}>
        
        <div className="absolute bottom-0 w-[420px] h-[300px] bg-gradient-to-b from-[#E2B94A] to-[#C9A032] border border-[#B38D28] rounded-2xl rounded-tl-none shadow-inner z-0">
           <div className="absolute -top-10 left-[-1px] w-36 h-10 bg-[#E2B94A] rounded-t-2xl border-t border-l border-r border-[#B38D28] flex items-center px-4 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-white/40"></div>
             <span className="text-[10px] font-bold text-[#7A5C13] tracking-widest uppercase">New Mission</span>
           </div>
        </div>

        <div className="absolute bottom-[90px] w-[380px] h-[600px] z-10 animate-paper-reveal perspective-1000">
          
          <div className="absolute -top-5 -left-4 z-[60]">
            <button onClick={() => handleFlip(!isFlipped)} className="relative group p-2 outline-none transition-transform cursor-pointer hover:scale-110">
              <Paperclip size={36} strokeWidth={1.5} className="rotate-[-20deg] drop-shadow-md transition-colors duration-300 text-gray-400 group-hover:text-blue-500" />
              <div className="absolute top-10 left-2 bg-gray-900 dark:bg-slate-700 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap flex items-center gap-1 shadow-lg">
                {isFlipped ? <><ArrowLeft size={10} /> Flip Back</> : <>Open <ArrowRight size={10} /></>}
              </div>
            </button>
          </div>

          <div className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col z-10 p-6 pb-4 transition-colors duration-300">
            <div className="text-left mb-4 px-1 shrink-0">
              <h2 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-tight">Mission Brief</h2>
              <p className="text-[14px] text-gray-400 dark:text-slate-400 font-medium mt-1">Lock in the coordinates for your tasks.</p>
            </div>

            <div className="flex-1 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden relative bg-gray-50/50 dark:bg-slate-800 flex flex-col transition-colors duration-300">
              <div className="flex-1 overflow-y-auto p-4 pb-32 custom-scrollbar flex flex-col gap-4" onClick={closeAllPopups}>
                
                {tasks.map((task, index) => {
                  const currentStatus = STATUS_OPTIONS.find(s => s.id === task.status) || STATUS_OPTIONS[0];
                  const StatusIcon = currentStatus.icon;

                  return (
                    <div key={task.id} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-4 shadow-sm relative group transition-colors flex flex-col">
                      {tasks.length > 1 && (
                        <button onClick={() => removeTaskCard(task.id)} className="absolute -top-2 -right-2 bg-red-50 dark:bg-red-900/30 text-red-500 border border-red-100 dark:border-red-800/30 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-500 hover:text-white z-20">
                          <X size={14} strokeWidth={3} />
                        </button>
                      )}

                      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100 dark:border-slate-800 relative z-30">
                        <span className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Task 0{index + 1}</span>
                        <div className="relative">
                          <button onClick={() => { playClick(); closeAllPopups(); setOpenStatusId(openStatusId === task.id ? null : task.id); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm transition-transform active:scale-95 ${currentStatus.color}`}>
                            <StatusIcon size={14} strokeWidth={2.5} /> {currentStatus.label} <ChevronDown size={14} className="ml-1 opacity-80" />
                          </button>
                          
                          {openStatusId === task.id && (
                            <div className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden py-1 z-50">
                              {STATUS_OPTIONS.map((option) => (
                                <button key={option.id} onClick={() => { updateTask(task.id, 'status', option.id); setOpenStatusId(null); playClick(); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left">
                                  <div className={`w-2.5 h-2.5 rounded-full ${option.color}`}></div> {option.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <input 
                        ref={index === tasks.length - 1 ? lastInputRef : null}
                        value={task.name} 
                        onFocus={() => { playClick(); closeAllPopups(); }} 
                        onChange={(e) => updateTask(task.id, 'name', e.target.value)}
                        placeholder="What are we crushing today?" 
                        className="w-full text-[16px] font-bold text-gray-900 dark:text-white focus:outline-none mb-5 placeholder:text-gray-300 dark:placeholder:text-slate-600 bg-transparent relative z-20 transition-colors"
                      />

                      <div className="flex flex-col gap-2.5 relative z-20">
                        <div className="flex gap-2.5 w-full">
                          
                          <div className="relative w-1/2">
                            <button onClick={() => openDatePicker.id === task.id && openDatePicker.type === 'startDate' ? closeAllPopups() : handleOpenDate(task.id, 'startDate', task.startDate)} className={`w-full bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-100 dark:border-slate-700 rounded-xl px-3 py-2 flex items-center transition-colors group text-left ${openDatePicker.id === task.id && openDatePicker.type === 'startDate' ? 'ring-2 ring-blue-500/20 border-blue-200 dark:border-blue-500/50' : ''}`}>
                              <CalendarIcon size={14} className={`mr-2 shrink-0 transition-colors ${task.startDate ? 'text-blue-500' : 'text-gray-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400'}`}/>
                              <div className="flex flex-col flex-1 overflow-hidden">
                                <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-0.5">Start</span>
                                <span className={`text-[12px] font-medium truncate ${task.startDate ? 'text-gray-800 dark:text-slate-200' : 'text-gray-400 dark:text-slate-500'}`}>{formatDate(task.startDate)}</span>
                              </div>
                            </button>
                            
                            {openDatePicker.id === task.id && openDatePicker.type === 'startDate' && (
                              <div className="absolute left-0 top-full mt-2 p-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-xl z-50 w-[260px]">
                                <div className="flex items-center justify-between mb-4">
                                  <button onClick={() => changeMonth(-1)} disabled={isCurrentMonth} className={`p-1.5 rounded-lg transition-colors ${isCurrentMonth ? 'text-gray-300 dark:text-slate-600 cursor-not-allowed' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}><ChevronLeft size={16} /></button>
                                  <span className="text-sm font-bold text-gray-800 dark:text-white">{MONTHS[calendarView.getMonth()]} {calendarView.getFullYear()}</span>
                                  <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-500 dark:text-slate-400"><ChevronRight size={16} /></button>
                                </div>
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                  {DAYS_OF_WEEK.map(day => (<div key={day} className="text-[10px] font-bold text-gray-400 dark:text-slate-500 text-center">{day}</div>))}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                  {getCalendarDays().map((day, i) => {
                                    if (!day) return <div key={`empty-${i}`} className="w-8 h-8" />;
                                    const dateObj = new Date(calendarView.getFullYear(), calendarView.getMonth(), day);
                                    const today = new Date(); today.setHours(0, 0, 0, 0);
                                    const isPast = dateObj < today;
                                    const isToday = dateObj.getTime() === today.getTime();
                                    const dateStr = `${calendarView.getFullYear()}-${(calendarView.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                                    const isSelected = task.startDate === dateStr;
                                    const isHoliday = userHolidays.includes(`${(calendarView.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
                                    
                                    return (
                                      <button 
                                        key={i} disabled={isPast}
                                        onClick={() => { playClick(); updateTask(task.id, 'startDate', dateStr); setOpenDatePicker({id: null, type: null}); }}
                                        className={`relative w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center transition-all 
                                          ${isPast ? 'text-gray-300 dark:text-slate-600 cursor-not-allowed opacity-50' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'} 
                                          ${isSelected ? 'bg-blue-600 text-white shadow-md' : ''} 
                                          ${isToday && !isSelected ? 'ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-extrabold' : ''}
                                          ${isHoliday && !isPast && !isSelected ? 'text-orange-500 font-bold' : ''}`}
                                      >
                                        {day}
                                        {isHoliday && !isPast && <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-orange-400 dark:bg-orange-500'}`}></span>}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="relative w-1/2">
                            <button onClick={() => openDatePicker.id === task.id && openDatePicker.type === 'endDate' ? closeAllPopups() : handleOpenDate(task.id, 'endDate', task.endDate)} className={`w-full bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-100 dark:border-slate-700 rounded-xl px-3 py-2 flex items-center transition-colors group text-left ${openDatePicker.id === task.id && openDatePicker.type === 'endDate' ? 'ring-2 ring-blue-500/20 border-blue-200 dark:border-blue-500/50' : ''}`}>
                              <CalendarIcon size={14} className={`mr-2 shrink-0 transition-colors ${task.endDate ? 'text-blue-500' : 'text-gray-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400'}`}/>
                              <div className="flex flex-col flex-1 overflow-hidden">
                                <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-0.5">End</span>
                                <span className={`text-[12px] font-medium truncate ${task.endDate ? 'text-gray-800 dark:text-slate-200' : 'text-gray-400 dark:text-slate-500'}`}>{formatDate(task.endDate)}</span>
                              </div>
                            </button>
                            
                            {openDatePicker.id === task.id && openDatePicker.type === 'endDate' && (
                              <div className="absolute right-0 top-full mt-2 p-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-xl z-50 w-[260px]">
                                <div className="flex items-center justify-between mb-4">
                                  <button onClick={() => changeMonth(-1)} disabled={isCurrentMonth} className={`p-1.5 rounded-lg transition-colors ${isCurrentMonth ? 'text-gray-300 dark:text-slate-600 cursor-not-allowed' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}><ChevronLeft size={16} /></button>
                                  <span className="text-sm font-bold text-gray-800 dark:text-white">{MONTHS[calendarView.getMonth()]} {calendarView.getFullYear()}</span>
                                  <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-500 dark:text-slate-400"><ChevronRight size={16} /></button>
                                </div>
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                  {DAYS_OF_WEEK.map(day => (<div key={day} className="text-[10px] font-bold text-gray-400 dark:text-slate-500 text-center">{day}</div>))}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                  {getCalendarDays().map((day, i) => {
                                    if (!day) return <div key={`empty-${i}`} className="w-8 h-8" />;
                                    const dateObj = new Date(calendarView.getFullYear(), calendarView.getMonth(), day);
                                    const today = new Date(); today.setHours(0, 0, 0, 0);
                                    
                                    let isBeforeStart = false;
                                    if (task.startDate) {
                                      const [sy, sm, sd] = task.startDate.split('-');
                                      const startD = new Date(sy, sm - 1, sd);
                                      if (dateObj < startD) isBeforeStart = true;
                                    }
                                    const isDisabled = dateObj < today || isBeforeStart;
                                    const isToday = dateObj.getTime() === today.getTime();
                                    const dateStr = `${calendarView.getFullYear()}-${(calendarView.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                                    const isSelected = task.endDate === dateStr;
                                    const isHoliday = userHolidays.includes(`${(calendarView.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
                                    
                                    return (
                                      <button 
                                        key={i} disabled={isDisabled}
                                        onClick={() => { playClick(); updateTask(task.id, 'endDate', dateStr); setOpenDatePicker({id: null, type: null}); }}
                                        className={`relative w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center transition-all 
                                          ${isDisabled ? 'text-gray-300 dark:text-slate-600 cursor-not-allowed opacity-50' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'} 
                                          ${isSelected ? 'bg-blue-600 text-white shadow-md' : ''} 
                                          ${isToday && !isSelected ? 'ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-extrabold' : ''}
                                          ${isHoliday && !isDisabled && !isSelected ? 'text-orange-500 font-bold' : ''}`}
                                      >
                                        {day}
                                        {isHoliday && !isDisabled && <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-orange-400 dark:bg-orange-500'}`}></span>}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="w-full bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-100 dark:border-slate-700 rounded-xl px-3 py-2 flex items-center transition-colors group">
                          <Clock size={16} className={`mr-3 shrink-0 transition-colors ${task.time ? 'text-blue-500' : 'text-gray-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400'}`}/>
                          <div className="flex flex-col flex-1">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-0.5">Deadline</span>
                            <input 
                              type="time" 
                              value={task.time} 
                              onClick={playClick}
                              onChange={(e) => updateTask(task.id, 'time', e.target.value)} 
                              className="w-full bg-transparent text-[14px] font-medium text-gray-800 dark:text-slate-200 focus:outline-none [color-scheme:light] dark:[color-scheme:dark]" 
                            />
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}

                <button 
                  type="button"
                  onClick={addNewTaskCard} 
                  className="w-full border-2 border-dashed border-blue-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-bold text-sm py-4 flex items-center justify-center gap-1.5 hover:bg-blue-50/80 dark:hover:bg-slate-800 rounded-xl transition-colors mt-2 shrink-0"
                >
                  <Plus size={18} strokeWidth={3} /> Add Another Task
                </button>

                <div className="mt-4 pt-4 border-t border-gray-200/60 dark:border-slate-700/50 shrink-0">
                  <button 
                    type="button"
                    onClick={handleSubmit}
                    disabled={tasks.every(t => !t.name.trim())}
                    className="w-full font-bold py-4 rounded-xl transition-all active:scale-[0.98] disabled:active:scale-100 disabled:bg-gray-200 dark:disabled:bg-slate-800 disabled:text-gray-400 dark:disabled:text-slate-600 disabled:shadow-none disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                  >
                    Lock In Tasks
                  </button>
                </div>

              </div>
            </div>
          </div>

          <div 
            onClick={!isFlipped ? () => handleFlip(true) : undefined}
            className={`cover-page absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-6 z-20 ${isFlipped ? 'flipped' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800'} transition-colors duration-300`}
          >
            <div className="w-full h-full border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center pt-[40px] px-6 pb-6 relative bg-white dark:bg-slate-900 transition-colors duration-300">
              <div className="text-center space-y-4">
                <h1 className="fun-font text-[44px] font-bold text-gray-800 dark:text-white leading-[1.1] rotate-[-2deg]">
                  Drop a<br/><span className="text-blue-600 dark:text-blue-500">New Task!</span>
                </h1>
                <div className="w-16 h-1 bg-blue-100 dark:bg-blue-900/50 rounded-full mx-auto my-4 rotate-[1deg]" />
                <p className="text-gray-400 dark:text-slate-400 font-medium text-[16px] max-w-[200px] mx-auto">
                  Time to get things done.
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

        <div className="absolute bottom-0 w-[420px] h-[150px] bg-gradient-to-b from-[#FAD66D] to-[#E2B94A] border border-[#C9A032] rounded-2xl shadow-[0_-8px_25px_rgba(0,0,0,0.15)] z-40 pointer-events-none overflow-hidden">
           <div className="absolute top-0 w-full h-[2px] bg-gradient-to-r from-white/20 via-white/60 to-white/20"></div>
           <div className="absolute inset-0 shadow-[inset_0_-4px_10px_rgba(0,0,0,0.05)] rounded-2xl"></div>
        </div>

      </div>
    </div>
  );
}