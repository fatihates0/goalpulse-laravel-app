import React, { useState } from 'react';
import { Star, Bell, ChevronRight } from 'lucide-react';

export default function MatchRow({ match, isFavorite, onToggleFavorite, onClickMatch, isDark = true }) {
  const [bellActive, setBellActive] = useState(false);

  const formatTimeOnly = (val) => {
    if (!val) return '--:--';
    if (typeof val === 'string' && val.includes('T')) {
      const timePart = val.split('T')[1]?.substring(0, 5);
      if (timePart) return timePart;
    }
    if (typeof val === 'string' && val.length > 5 && val.includes(':')) {
      const parts = val.split(' ');
      const timePart = parts.length > 1 ? parts[1] : parts[0];
      return timePart.substring(0, 5);
    }
    return val;
  };

  const homeRedCards = match.match_red_cards?.home || 0;
  const awayRedCards = match.match_red_cards?.away || 0;

  return (
    <div
      onClick={() => onClickMatch && onClickMatch(match)}
      className={`group flex items-center justify-between px-4 py-3 border-b transition-all duration-150 cursor-pointer text-xs ${
        isDark
          ? 'bg-[#0B131F]/60 hover:bg-[#121c2e] border-slate-800/40'
          : 'bg-white hover:bg-slate-50 border-slate-100'
      }`}
    >
      {/* Time & Status Badge & Star */}
      <div className="flex items-center space-x-2.5 w-36 shrink-0">
        <span className={`font-semibold w-11 text-left ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {formatTimeOnly(match.match_startTime)}
        </span>

        {/* Status Badge */}
        <div className="w-14 flex items-center justify-center">
          {match.is_live ? (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 animate-pulse truncate">
              {match.badge_text || `${match.match_minute || '0'}'`}
            </span>
          ) : match.is_finished ? (
            <span className={`text-[10px] font-bold border px-1.5 py-0.5 rounded ${
              isDark
                ? 'text-slate-300 bg-slate-800/90 border-slate-700/80'
                : 'text-slate-700 bg-slate-100 border-slate-200'
            }`}>
              {match.badge_text || 'MS'}
            </span>
          ) : match.is_postponed ? (
            <span className="text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-500/30 px-1.5 py-0.5 rounded">
              ERT
            </span>
          ) : match.is_cancelled ? (
            <span className="text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-500/30 px-1.5 py-0.5 rounded">
              İPT
            </span>
          ) : (
            <span className={`text-[10px] font-semibold border px-1.5 py-0.5 rounded ${
              isDark
                ? 'text-slate-400 bg-slate-900 border-slate-800'
                : 'text-slate-500 bg-slate-100 border-slate-200'
            }`}>
              BKL
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(match.match_id);
          }}
          className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
        </button>
      </div>

      {/* Teams & Logos */}
      <div className="flex items-center justify-between flex-1 max-w-xl mx-4">
        {/* Home Team */}
        <div className="flex items-center space-x-2.5 justify-end flex-1 min-w-0 pr-4">
          {homeRedCards > 0 && (
            <span className="w-3 h-4 bg-red-600 rounded-[2px] text-[9px] font-bold text-white flex items-center justify-center shrink-0">
              {homeRedCards}
            </span>
          )}
          <span className={`font-medium truncate group-hover:text-emerald-500 transition-colors text-right ${
            isDark ? 'text-slate-100' : 'text-slate-900'
          }`}>
            {match.match_home_team_name}
          </span>
          {match.match_home_logo ? (
            <img
              src={match.match_home_logo}
              alt=""
              className="w-5 h-5 object-contain shrink-0"
              onError={(e) => (e.target.style.display = 'none')}
            />
          ) : (
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
              isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
            }`}>
              {match.match_home_team_name.charAt(0)}
            </div>
          )}
        </div>

        {/* VS / Score Divider */}
        <div className="px-3 shrink-0 flex items-center justify-center min-w-[50px]">
          {match.is_live ? (
            <span className="font-extrabold text-sm text-emerald-500">
              {match.match_current_score || '0-0'}
            </span>
          ) : match.is_finished ? (
            <span className={`font-bold text-sm border px-2 py-0.5 rounded ${
              isDark
                ? 'text-slate-200 bg-slate-800/80 border-slate-700/60'
                : 'text-slate-800 bg-slate-100 border-slate-200'
            }`}>
              {match.match_current_score || '0-0'}
            </span>
          ) : (
            <span className="text-slate-400 font-bold text-xs">vs</span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center space-x-2.5 justify-start flex-1 min-w-0 pl-4">
          {match.match_away_logo ? (
            <img
              src={match.match_away_logo}
              alt=""
              className="w-5 h-5 object-contain shrink-0"
              onError={(e) => (e.target.style.display = 'none')}
            />
          ) : (
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
              isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
            }`}>
              {match.match_away_team_name.charAt(0)}
            </div>
          )}
          <span className={`font-medium truncate group-hover:text-emerald-500 transition-colors text-left ${
            isDark ? 'text-slate-100' : 'text-slate-900'
          }`}>
            {match.match_away_team_name}
          </span>
          {awayRedCards > 0 && (
            <span className="w-3 h-4 bg-red-600 rounded-[2px] text-[9px] font-bold text-white flex items-center justify-center shrink-0">
              {awayRedCards}
            </span>
          )}
        </div>
      </div>

      {/* Right Controls: Bell Notification, Chevron */}
      <div className="flex items-center space-x-3 w-20 justify-end shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setBellActive(!bellActive);
          }}
          className={`p-1.5 rounded-lg transition-colors ${
            bellActive
              ? 'text-emerald-500 bg-emerald-500/10'
              : isDark
                ? 'text-slate-500 hover:text-slate-300'
                : 'text-slate-400 hover:text-slate-700'
          }`}
          title="Bildirim Al"
        >
          <Bell className="w-3.5 h-3.5" />
        </button>

        <ChevronRight className={`w-4 h-4 transition-colors ${
          isDark ? 'text-slate-500 group-hover:text-slate-200' : 'text-slate-400 group-hover:text-slate-700'
        }`} />
      </div>
    </div>
  );
}
