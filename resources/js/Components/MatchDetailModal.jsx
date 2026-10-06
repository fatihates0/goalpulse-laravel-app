import React, { useEffect, useState } from 'react';
import { X, Tv, Clock, Trophy, Layers, Activity } from 'lucide-react';
import axios from 'axios';

export default function MatchDetailModal({ match, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('odds'); // odds, commentary

  useEffect(() => {
    if (match?.match_id) {
      setLoading(true);
      axios.get(`/api/v1/matches/${match.match_id}/details`)
        .then(res => {
          if (res.data?.data) {
            setDetails(res.data.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [match]);

  if (!match) return null;

  const rates = match.match_rates || {};
  const iyRates = rates.ilkYariOranlari || {};
  const msRates = rates.macGeneliOranlari || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-900 via-[#151e30] to-slate-900 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm text-white">Maç Detayları & Oran Tablosu</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Match Overview Banner */}
        <div className="p-6 bg-gradient-to-b from-[#131b2e] to-[#0f172a] border-b border-slate-800">
          <div className="flex items-center justify-between">
            {/* Home Team */}
            <div className="flex flex-col items-center flex-1 text-center">
              {match.match_home_logo ? (
                <img src={match.match_home_logo} alt="" className="w-12 h-12 object-contain mb-2" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-lg font-bold text-amber-400 mb-2">
                  {match.match_home_team_name.charAt(0)}
                </div>
              )}
              <span className="font-bold text-sm text-white">{match.match_home_team_name}</span>
            </div>

            {/* Score & Time */}
            <div className="flex flex-col items-center px-4">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-2">
                {match.is_live ? `${match.match_minute || '0'}' (Canlı)` : match.match_abbr || 'Sürededir'}
              </span>
              <span className="text-3xl font-extrabold tracking-wider text-amber-400">
                {match.match_current_score || '0-0'}
              </span>
              {match.match_half_time_score && (
                <span className="text-xs text-slate-400 mt-1 font-medium">
                  İlk Yarı: {match.match_half_time_score}
                </span>
              )}
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center flex-1 text-center">
              {match.match_away_logo ? (
                <img src={match.match_away_logo} alt="" className="w-12 h-12 object-contain mb-2" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-lg font-bold text-amber-400 mb-2">
                  {match.match_away_team_name.charAt(0)}
                </div>
              )}
              <span className="font-bold text-sm text-white">{match.match_away_team_name}</span>
            </div>
          </div>

          {match.match_broadcaster && (
            <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-slate-400 bg-slate-900/60 py-1.5 px-3 rounded-xl border border-slate-800 max-w-xs mx-auto">
              <Tv className="w-4 h-4 text-amber-400" />
              <span>Yayıncı: <strong className="text-slate-200">{match.match_broadcaster}</strong></span>
            </div>
          )}
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/50">
          <button
            onClick={() => setActiveTab('odds')}
            className={`flex-1 py-3 text-xs font-bold text-center transition-colors border-b-2 ${
              activeTab === 'odds'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            İDDAA & MİSLİ ORANLARI
          </button>
          <button
            onClick={() => setActiveTab('commentary')}
            className={`flex-1 py-3 text-xs font-bold text-center transition-colors border-b-2 ${
              activeTab === 'commentary'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            CANLI MAÇ ANLATIMI
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'odds' ? (
            <div className="space-y-6">
              {/* Maç Sonucu Oranları */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Maç Sonucu (MS 1 - MS X - MS 2)</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <span className="block text-[10px] text-slate-400 mb-1">MS 1</span>
                    <span className="text-sm font-bold text-amber-400">{msRates.macSonucu?.home || '-'}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <span className="block text-[10px] text-slate-400 mb-1">MS X</span>
                    <span className="text-sm font-bold text-amber-400">{msRates.macSonucu?.draw || '-'}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <span className="block text-[10px] text-slate-400 mb-1">MS 2</span>
                    <span className="text-sm font-bold text-amber-400">{msRates.macSonucu?.away || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Alt / Üst Oranları */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Altı / Üstü Oranları</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
                    <span className="text-xs text-slate-300">2.5 ALT</span>
                    <span className="text-sm font-bold text-amber-400">{msRates.macSonucuAltUstu25?.alt || '-'}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
                    <span className="text-xs text-slate-300">2.5 ÜST</span>
                    <span className="text-sm font-bold text-amber-400">{msRates.macSonucuAltUstu25?.ust || '-'}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
                    <span className="text-xs text-slate-300">1.5 ALT</span>
                    <span className="text-sm font-bold text-amber-400">{msRates.macSonucuAltUstu15?.alt || '-'}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
                    <span className="text-xs text-slate-300">1.5 ÜST</span>
                    <span className="text-sm font-bold text-amber-400">{msRates.macSonucuAltUstu15?.ust || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Karşılıklı Gol Oranları */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Karşılıklı Gol (KG)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
                    <span className="text-xs text-slate-300">KG VAR</span>
                    <span className="text-sm font-bold text-amber-400">{msRates.macSonuKg?.var || '-'}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
                    <span className="text-xs text-slate-300">KG YOK</span>
                    <span className="text-sm font-bold text-amber-400">{msRates.macSonuKg?.yok || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {loading ? (
                <div className="py-8 text-center text-slate-400 text-xs animate-pulse">
                  Maç anlatım detayları yükleniyor...
                </div>
              ) : details && Array.isArray(details) && details.length > 0 ? (
                details.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-start space-x-3 text-xs">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                      {item.minute || item.min}'
                    </span>
                    <p className="text-slate-200">{item.comment || item.text}</p>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Bu maç için henüz detaylı canlı anlatım verisi bulunmuyor.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
