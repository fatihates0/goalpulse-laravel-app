import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function FilterBar({
  selectedLeague,
  onSelectLeague,
  selectedCountry,
  onSelectCountry,
  selectedStatus,
  onSelectStatus,
  sortOrder,
  onSelectSortOrder,
  leaguesList = [],
  isDark = true,
}) {
  const selectClasses = `appearance-none text-xs font-semibold px-4 py-2 pr-8 rounded-xl focus:outline-none focus:border-emerald-500/80 cursor-pointer border transition-colors ${
    isDark
      ? 'bg-[#0B131F] border-slate-800 text-slate-200'
      : 'bg-white border-slate-200 text-slate-800 shadow-sm'
  }`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      {/* Dropdowns Group */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Tüm Ligler Dropdown */}
        <div className="relative">
          <select
            value={selectedLeague || ''}
            onChange={(e) => onSelectLeague(e.target.value)}
            className={selectClasses}
          >
            <option value="">Tüm Ligler</option>
            {leaguesList.map((l) => (
              <option key={l.league_id} value={l.league_id}>
                {l.league_name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Tüm Ülkeler Dropdown */}
        <div className="relative">
          <select
            value={selectedCountry || ''}
            onChange={(e) => onSelectCountry(e.target.value)}
            className={selectClasses}
          >
            <option value="">Tüm Ülkeler</option>
            <option value="türkiye">Türkiye</option>
            <option value="ingiltere">İngiltere</option>
            <option value="ispanya">İspanya</option>
            <option value="italya">İtalya</option>
            <option value="almanya">Almanya</option>
            <option value="fransa">Fransa</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Tüm Maçlar / Statü Dropdown */}
        <div className="relative">
          <select
            value={selectedStatus || 'all'}
            onChange={(e) => onSelectStatus(e.target.value)}
            className={selectClasses}
          >
            <option value="all">Tüm Maçlar</option>
            <option value="live">Canlı Maçlar</option>
            <option value="upcoming">Başlamamış Maçlar</option>
            <option value="finished">Bitmiş Maçlar</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Sort Order Dropdown */}
      <div className="relative">
        <select
          value={sortOrder || 'asc'}
          onChange={(e) => onSelectSortOrder(e.target.value)}
          className={selectClasses}
        >
          <option value="asc">Saat (Erken - Geç)</option>
          <option value="desc">Saat (Geç - Erken)</option>
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}
