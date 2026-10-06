import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '../Layouts/MainLayout';
import DateCarousel from '../Components/DateCarousel';
import FilterBar from '../Components/FilterBar';
import LeagueCard from '../Components/LeagueCard';
import MatchDetailModal from '../Components/MatchDetailModal';
import { playGoalSound } from '../Components/AudioPlayer';
import { AlertCircle, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import axios from 'axios';

export default function Home({ leagues: initialLeagues, stats: initialStats, filters: initialFilters }) {
  const [leagues, setLeagues] = useState(initialLeagues || []);
  const [stats, setStats] = useState(initialStats || { total_matches: 0, live_count: 0, finished_count: 0 });
  const [activeNavItem, setActiveNavItem] = useState('maclar');
  const [activeSport, setActiveSport] = useState('futbol');
  const [activeTab, setActiveTab] = useState(initialFilters?.tab || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(initialFilters?.date || new Date().toISOString().split('T')[0]);
  const [favoriteMatchIds, setFavoriteMatchIds] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingDate, setIsLoadingDate] = useState(false);
  const [dateFetchError, setDateFetchError] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false); // Default OFF
  const [isDark, setIsDark] = useState(true); // Default Dark Mode

  // Filter Bar state
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState('');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const prevScoresRef = useRef({});
  const favoriteMatchIdsRef = useRef([]);
  const selectedDateRef = useRef(selectedDate);

  // Load theme preference from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('goalpulse_theme');
      if (savedTheme === 'light') {
        setIsDark(false);
      }
    } catch (e) {}
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('goalpulse_theme', next ? 'dark' : 'light');
      } catch (e) {}
      return next;
    });
  };

  // Keep refs updated for intervals and callbacks
  useEffect(() => {
    favoriteMatchIdsRef.current = favoriteMatchIds;
  }, [favoriteMatchIds]);

  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('misli_fav_matches');
      if (saved) {
        setFavoriteMatchIds(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (matchId) => {
    setFavoriteMatchIds((prev) => {
      const next = prev.includes(matchId)
        ? prev.filter((id) => id !== matchId)
        : [...prev, matchId];
      try {
        localStorage.setItem('misli_fav_matches', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Handle Date Change (With 10-second timeout protection)
  const handleDateChange = async (newDate) => {
    setSelectedDate(newDate);
    selectedDateRef.current = newDate;
    setIsLoadingDate(true);
    setDateFetchError(null);

    try {
      const res = await axios.get(`/api/v1/matches/date/${newDate}`, { timeout: 10000 });
      if (res.data && res.data.leagues) {
        const newLeagues = res.data.leagues;
        let liveC = 0;
        let finishedC = 0;
        let totalC = 0;
        newLeagues.forEach(l => {
          l.matches.forEach(m => {
            totalC++;
            if (m.is_live) liveC++;
            if (m.is_finished) finishedC++;
          });
        });

        setLeagues(newLeagues);
        setStats({
          total_matches: totalC,
          live_count: liveC,
          finished_count: finishedC,
        });
      }
    } catch (err) {
      console.error('Date fetch error:', err);
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setDateFetchError('Zaman Aşımı: Sunucu yanıt vermedi (10 saniye). Lütfen tekrar deneyin.');
      } else {
        setDateFetchError('Veriler alınırken bir sorun oluştu. Lütfen bağlantınızı kontrol edin.');
      }
    } finally {
      setIsLoadingDate(false);
    }
  };

  // Poll live data every 15 seconds from DB for the CURRENTLY selected date
  const refreshLiveScores = async () => {
    setIsSyncing(true);
    const currentDateToFetch = selectedDateRef.current || new Date().toISOString().split('T')[0];
    try {
      const res = await axios.get(`/api/v1/matches/date/${currentDateToFetch}`, { timeout: 10000 });
      if (res.data && res.data.leagues) {
        const newLeagues = res.data.leagues;

        // Trigger goal sound ONLY for FAVORITE matches when score changes
        if (soundEnabled) {
          newLeagues.forEach((l) => {
            l.matches.forEach((m) => {
              const oldScore = prevScoresRef.current[m.match_id];
              if (oldScore && oldScore !== m.match_current_score) {
                if (favoriteMatchIdsRef.current.includes(m.match_id)) {
                  playGoalSound();
                }
              }
              prevScoresRef.current[m.match_id] = m.match_current_score;
            });
          });
        }

        let liveC = 0;
        let finishedC = 0;
        let totalC = 0;
        newLeagues.forEach(l => {
          l.matches.forEach(m => {
            totalC++;
            if (m.is_live) liveC++;
            if (m.is_finished) finishedC++;
          });
        });

        setLeagues(newLeagues);
        setStats({
          total_matches: totalC,
          live_count: liveC,
          finished_count: finishedC,
        });
      }
    } catch (err) {
      console.error('Score sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refreshLiveScores();
    }, 15000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  // Handle Sidebar Nav Selection
  const handleSelectNavItem = (navId) => {
    setActiveNavItem(navId);
    if (navId === 'canli') setActiveTab('live');
    else if (navId === 'favoriler') setActiveTab('favorites');
    else if (navId === 'maclar') setActiveTab('all');
  };

  // Filter leagues & matches
  const filteredLeagues = leagues
    .filter((league) => {
      if (selectedLeagueFilter && league.league_id !== selectedLeagueFilter) return false;
      if (selectedCountryFilter && !(league.league_country || '').toLowerCase().includes(selectedCountryFilter.toLowerCase())) return false;
      return true;
    })
    .map((league) => {
      const matches = league.matches.filter((m) => {
        // Search filter
        if (searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase();
          const matchHome = (m.match_home_team_name || '').toLowerCase();
          const matchAway = (m.match_away_team_name || '').toLowerCase();
          const leagueName = (league.league_name || '').toLowerCase();
          if (!matchHome.includes(query) && !matchAway.includes(query) && !leagueName.includes(query)) {
            return false;
          }
        }

        // Tab / Status filter
        if (activeTab === 'favorites') {
          return favoriteMatchIds.includes(m.match_id);
        }
        if (activeTab === 'live') {
          return m.is_live;
        }
        if (activeTab === 'upcoming') {
          return !m.is_live && !m.is_finished && !m.is_postponed && !m.is_cancelled;
        }
        if (activeTab === 'finished') {
          return m.is_finished;
        }

        return true;
      });

      // Sort matches inside league if needed
      const sortedMatches = [...matches].sort((a, b) => {
        const timeA = a.match_startTime || '';
        const timeB = b.match_startTime || '';
        return sortOrder === 'desc' ? timeB.localeCompare(timeA) : timeA.localeCompare(timeB);
      });

      return { ...league, matches: sortedMatches };
    })
    .filter((league) => league.matches.length > 0);

  return (
    <MainLayout
      activeNavItem={activeNavItem}
      onSelectNavItem={handleSelectNavItem}
      activeSport={activeSport}
      onSelectSport={setActiveSport}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      soundEnabled={soundEnabled}
      onToggleSound={() => setSoundEnabled(!soundEnabled)}
      favCount={favoriteMatchIds.length}
      isDark={isDark}
      onToggleTheme={toggleTheme}
    >
      {/* Page Title */}
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {activeTab === 'live' ? 'Canlı Maçlar' : activeTab === 'finished' ? 'Bitmiş Maçlar' : activeTab === 'upcoming' ? 'Başlamamış Maçlar' : activeTab === 'favorites' ? 'Favori Maçlar' : 'Tüm Maçlar'}
        </h1>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl border flex items-center space-x-2 ${
          isDark ? 'bg-[#0B131F] border-slate-800 text-emerald-500' : 'bg-white border-slate-200 text-emerald-600 shadow-sm'
        }`}>
          {isLoadingDate && <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin" />}
          <span>Toplam {stats.total_matches} Maç ({selectedDate})</span>
        </span>
      </div>

      {/* Date Carousel Bar */}
      <DateCarousel
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        onToggleFilter={() => {}}
        isDark={isDark}
      />

      {/* Dropdown Filters Bar */}
      <FilterBar
        selectedLeague={selectedLeagueFilter}
        onSelectLeague={setSelectedLeagueFilter}
        selectedCountry={selectedCountryFilter}
        onSelectCountry={setSelectedCountryFilter}
        selectedStatus={activeTab}
        onSelectStatus={setActiveTab}
        sortOrder={sortOrder}
        onSelectSortOrder={setSortOrder}
        leaguesList={leagues}
        isDark={isDark}
      />

      {/* Timeout Error Banner if occurs */}
      {dateFetchError && (
        <div className="mb-4 p-4 rounded-2xl bg-red-950/40 border border-red-800/80 flex items-center space-x-3 text-red-300 text-xs">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <span className="flex-1">{dateFetchError}</span>
          <button
            onClick={() => handleDateChange(selectedDate)}
            className="px-3 py-1 bg-red-800 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
          >
            Yeniden Denet
          </button>
        </div>
      )}

      {/* Matches List Section */}
      <div className="space-y-4">
        {isLoadingDate ? (
          <div className="space-y-4">
            {/* Loading Indicator Banner */}
            <div className={`flex items-center justify-center space-x-3 p-6 border rounded-2xl shadow-xl ${
              isDark ? 'bg-[#0B131F] border-slate-800/80' : 'bg-white border-slate-200'
            }`}>
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin shrink-0" />
              <div>
                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Veriler Yükleniyor...</h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Seçilen tarihe ({selectedDate}) ait maçlar getiriliyor, lütfen bekleyin.
                </p>
              </div>
            </div>

            {/* Skeleton Animated Cards */}
            {[1, 2, 3].map((i) => (
              <div key={i} className={`rounded-2xl border overflow-hidden p-4 space-y-3 animate-pulse ${
                isDark ? 'bg-[#0B131F] border-slate-800/80' : 'bg-white border-slate-200'
              }`}>
                <div className={`h-5 rounded-lg w-1/4 ${isDark ? 'bg-slate-800/80' : 'bg-slate-200'}`}></div>
                <div className={`h-10 rounded-xl w-full ${isDark ? 'bg-slate-800/40' : 'bg-slate-100'}`}></div>
                <div className={`h-10 rounded-xl w-full ${isDark ? 'bg-slate-800/40' : 'bg-slate-100'}`}></div>
              </div>
            ))}
          </div>
        ) : filteredLeagues.length > 0 ? (
          filteredLeagues.map((league) => (
            <LeagueCard
              key={league.league_id}
              league={league}
              favoriteMatchIds={favoriteMatchIds}
              onToggleFavorite={toggleFavorite}
              onClickMatch={(match) => setSelectedMatch(match)}
              isDark={isDark}
            />
          ))
        ) : (
          <div className={`flex flex-col items-center justify-center py-20 px-4 border rounded-3xl text-center shadow-xl ${
            isDark ? 'bg-[#0B131F] border-slate-800/80' : 'bg-white border-slate-200'
          }`}>
            <AlertCircle className="w-12 h-12 text-emerald-500/80 mb-3 animate-bounce" />
            <h3 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Maç Bulunamadı</h3>
            <p className={`text-xs max-w-sm mb-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Seçili tarihte ({selectedDate}), kategoride veya arama filtrenize uygun maç bulunmuyor.
            </p>
            <button
              onClick={() => {
                setActiveTab('all');
                setSearchQuery('');
                setSelectedLeagueFilter('');
                setSelectedCountryFilter('');
                handleDateChange(new Date().toISOString().split('T')[0]);
              }}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all duration-200"
            >
              Bugüne Dön ve Filtreleri Temizle
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </MainLayout>
  );
}
