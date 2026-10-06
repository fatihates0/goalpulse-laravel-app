import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter } from 'lucide-react';

export default function DateCarousel({ selectedDate, onDateChange, onToggleFilter, isDark = true }) {
  const dateInputRef = useRef(null);

  // Safe YYYY-MM-DD parsing without timezone shift
  const parseYMD = (dateStr) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return new Date(dateStr);
  };

  const formatYMD = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Generate 5 days around selected date
  const generateDateItems = () => {
    const baseObj = parseYMD(selectedDate);
    const items = [];
    const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

    const todayStr = formatYMD(new Date());
    const tomorrowStr = formatYMD(new Date(Date.now() + 86400000));
    const yesterdayStr = formatYMD(new Date(Date.now() - 86400000));

    for (let offset = -2; offset <= 2; offset++) {
      const d = new Date(baseObj.getFullYear(), baseObj.getMonth(), baseObj.getDate() + offset);
      const fullStr = formatYMD(d);

      let title = dayNames[d.getDay()];
      if (fullStr === todayStr) title = 'Bugün';
      else if (fullStr === tomorrowStr) title = 'Yarın';
      else if (fullStr === yesterdayStr) title = 'Dün';

      const dateLabel = `${d.getDate()} ${monthNames[d.getMonth()]}`;

      items.push({
        dateStr: fullStr,
        title,
        dateLabel,
        isToday: fullStr === todayStr,
      });
    }

    return items;
  };

  const handleStepDay = (days) => {
    const baseObj = parseYMD(selectedDate);
    baseObj.setDate(baseObj.getDate() + days);
    onDateChange(formatYMD(baseObj));
  };

  const dateItems = generateDateItems();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      {/* Date Carousel */}
      <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1">
        {/* Left Step Arrow */}
        <button
          onClick={() => handleStepDay(-1)}
          className={`p-3 rounded-2xl border transition-colors shrink-0 ${
            isDark
              ? 'bg-[#0B131F] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-sm'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Date Cards */}
        {dateItems.map((item) => {
          const isActive = selectedDate === item.dateStr;
          return (
            <button
              key={item.dateStr}
              onClick={() => onDateChange(item.dateStr)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-semibold flex flex-col items-center justify-center shrink-0 transition-all duration-200 min-w-[90px] ${
                isActive
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25 scale-105 font-bold'
                  : isDark
                    ? 'bg-[#0B131F] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                    : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-sm'
              }`}
            >
              <span className={`text-[11px] ${isActive ? 'text-black font-extrabold' : isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {item.title}
              </span>
              <span className={`text-[10px] mt-0.5 ${isActive ? 'text-black/80 font-bold' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {item.dateLabel}
              </span>
            </button>
          );
        })}

        {/* Right Step Arrow */}
        <button
          onClick={() => handleStepDay(1)}
          className={`p-3 rounded-2xl border transition-colors shrink-0 ${
            isDark
              ? 'bg-[#0B131F] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-sm'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Action Buttons: Takvim & Filtrele */}
      <div className="flex items-center space-x-2 shrink-0">
        <div className="relative">
          <input
            type="date"
            ref={dateInputRef}
            value={selectedDate || formatYMD(new Date())}
            onChange={(e) => onDateChange(e.target.value)}
            className={`absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10 ${!isDark ? '[color-scheme:light]' : '[color-scheme:dark]'}`}
          />
          <button className={`px-4 py-2.5 rounded-2xl border transition-colors flex items-center space-x-2 text-xs font-semibold ${
            isDark
              ? 'bg-[#0B131F] border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-sm'
          }`}>
            <CalendarIcon className="w-4 h-4 text-emerald-500" />
            <span>Takvim</span>
          </button>
        </div>

        <button
          onClick={onToggleFilter}
          className={`px-4 py-2.5 rounded-2xl border transition-colors flex items-center space-x-2 text-xs font-semibold ${
            isDark
              ? 'bg-[#0B131F] border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-sm'
          }`}
        >
          <Filter className="w-4 h-4 text-emerald-500" />
          <span>Filtrele</span>
        </button>
      </div>
    </div>
  );
}
