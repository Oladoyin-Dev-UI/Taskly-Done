import { User } from 'lucide-react';
import { useStore } from '../store';

export default function BriefInfo() {
  const { user, productivityScore } = useStore();
  
  const totalBars = 40;
  const filledBars = Math.floor(productivityScore / (100 / totalBars));

  // Dynamic Color Logic based on your thresholds
  const getColorTheme = (score) => {
    if (score <= 20) return { bar: 'bg-red-500', badge: 'bg-red-500 text-white border-red-600' };
    if (score <= 50) return { bar: 'bg-orange-500', badge: 'bg-orange-500 text-white border-orange-600' };
    if (score <= 80) return { bar: 'bg-blue-600', badge: 'bg-blue-600 text-white border-blue-700' };
    return { bar: 'bg-green-500', badge: 'bg-green-500 text-white border-green-600' };
  };

  const theme = getColorTheme(productivityScore);

  return (
    <section className="w-full bg-white p-8 rounded-2xl border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
      
      {/* Left: User Identity */}
      <div className="flex items-center gap-3">
        <div className="w-20 h-20 rounded-full bg-blue-50 border-[6px] border-gray-50 shadow-sm flex items-center justify-center text-blue-600 overflow-hidden shrink-0">
           {user?.dp ? (
             <img src={user.dp} alt="User Profile" className="w-full h-full object-cover" /> 
           ) : (
             <User size={36} strokeWidth={1.5} />
           )}
        </div>
        
        <div className="font-sans">
          <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight leading-none mb-2">
            {user?.name || 'Hi, Task Master'}
          </h2>
          <p className="text-gray-400 font-medium text-[16px] tracking-tight">
            Ready to get things done?
          </p>
        </div>
      </div>

      {/* Right: Productivity Visual Section */}
      <div className="w-full md:w-[320px]">
        
        {/* Top Row: Labels */}
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            Productivity Score
          </span>
          
          {/* Badge: Now uses the dynamic theme colors and turns solid with white text */}
          <div className={`px-3 py-0.5 rounded-full border transition-all duration-500 flex items-center ${theme.badge}`}>
            <span className="text-[11px] font-black tracking-wider">
              {productivityScore}/100
            </span>
          </div>
        </div>

        {/* Bottom Row: Visual Bar Counter */}
        <div className="flex gap-[4px] items-end h-8 mt-1 w-full">
          {[...Array(totalBars)].map((_, i) => (
            <div 
              key={i} 
              className={`w-[4px] rounded-full transition-all duration-700 ease-out ${
                i < filledBars 
                  ? `${theme.bar} h-full shadow-sm` 
                  : 'bg-gray-100 h-1/2'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}