import React, { useState } from 'react';
import { ChevronRight, BarChart2 } from 'lucide-react';
import MatchRow from './MatchRow';

export default function LeagueCard({ league, favoriteMatchIds, onToggleFavorite, onClickMatch, isDark = true }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`mb-4 rounded-2xl border shadow-xl overflow-hidden transition-all duration-200 ${
      isDark ? 'bg-[#0B131F] border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
    }`}>
      {/* League Card Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-5 py-3.5 border-b cursor-pointer select-none transition-colors ${
          isDark
            ? 'bg-[#0e1726] border-slate-800/80 hover:bg-[#121d30]'
            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
        }`}
      >
        <div className="flex items-center space-x-3 min-w-0">
          {league.league_flag ? (
            <img
              src={league.league_flag}
              alt=""
              className="w-5 h-5 rounded-full object-cover shrink-0"
              onError={(e) => (e.target.style.display = 'none')}
            />
          ) : (
            <span className="text-base shrink-0">⚽</span>
          )}

          <div className="flex items-center space-x-2 min-w-0">
            <h3 className={`text-xs font-extrabold uppercase tracking-wider truncate ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {league.league_name}
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {league.matches.length} Maç
          </span>
          <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-90' : ''
          } ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
        </div>
      </div>

      {/* Matches List */}
      {isOpen && (
        <>
          <div className={`divide-y ${isDark ? 'divide-slate-800/30' : 'divide-slate-100'}`}>
            {league.matches.map((match) => (
              <MatchRow
                key={match.match_id}
                match={match}
                isFavorite={favoriteMatchIds.includes(match.match_id)}
                onToggleFavorite={onToggleFavorite}
                onClickMatch={onClickMatch}
                isDark={isDark}
              />
            ))}
          </div>

          {/* League Card Footer: Puan Durumu & Fikstür */}
          <div className={`flex items-center justify-between px-5 py-2.5 border-t text-[11px] font-semibold ${
            isDark ? 'bg-[#09101A] border-slate-800/50 text-slate-400' : 'bg-slate-50/80 border-slate-200 text-slate-600'
          }`}>
            <button className="flex items-center space-x-1.5 hover:text-emerald-500 transition-colors">
              <BarChart2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Puan Durumu</span>
            </button>

            <button className="flex items-center space-x-1 hover:text-emerald-500 transition-colors">
              <span>Fikstür</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
