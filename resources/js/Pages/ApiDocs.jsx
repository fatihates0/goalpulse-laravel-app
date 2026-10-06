import React, { useState } from 'react';
import MainLayout from '../Layouts/MainLayout';
import {
  Code2,
  Terminal,
  Play,
  Copy,
  Check,
  Globe,
  Database,
  ShieldCheck,
  Zap,
  Server,
  ChevronRight,
  Loader2
} from 'lucide-react';
import axios from 'axios';

export default function ApiDocs({ endpoints, baseUrl }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedId, setCopiedId] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [testLoading, setTestLoading] = useState({});

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTestEndpoint = async (endpoint) => {
    setTestLoading((prev) => ({ ...prev, [endpoint.id]: true }));
    try {
      let testUrl = endpoint.path.replace('{date?}', '').replace('{id}', '984512');
      if (testUrl.endsWith('/')) testUrl = testUrl.slice(0, -1);

      let res;
      if (endpoint.method === 'GET') {
        res = await axios.get(testUrl);
      } else {
        res = await axios.post(testUrl, { endpoint: 'https://example.com/push', keys: { auth: '123', p256dh: '456' } });
      }

      setTestResults((prev) => ({
        ...prev,
        [endpoint.id]: {
          status: res.status,
          data: res.data
        }
      }));
    } catch (err) {
      setTestResults((prev) => ({
        ...prev,
        [endpoint.id]: {
          status: err.response?.status || 500,
          data: err.response?.data || { error: err.message }
        }
      }));
    } finally {
      setTestLoading((prev) => ({ ...prev, [endpoint.id]: false }));
    }
  };

  return (
    <MainLayout activeNavItem="api-docs">
      {/* Hero Header Banner */}
      <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0E1B2E] via-[#0B131F] to-[#122238] border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>Misli.com REST API v1.0</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              API Kullanım Dokümantasyonu
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Mobil uygulamalar ve harici istemciler için yüksek hızlı, JSON formatında Misli.com canlı skor ve lig API servis rehberi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/api/v1/matches/live"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all duration-200 flex items-center space-x-2"
            >
              <Globe className="w-4 h-4" />
              <span>Canlı API Test Et</span>
            </a>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <Database className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Veritabanı Öncelikli</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>CORS & JSON Desteği</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <Server className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Yedeksiz Misli Altyapısı</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Mobil Uygulama Uyumlu</span>
          </div>
        </div>
      </div>

      {/* Base URL Info Box */}
      <div className="mb-8 p-4 rounded-2xl bg-[#0B131F] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">API Base URL Endpoint:</span>
            <code className="text-emerald-400 font-mono font-bold">{baseUrl}/api/v1</code>
          </div>
        </div>

        <button
          onClick={() => copyToClipboard(`${baseUrl}/api/v1`, 'baseurl')}
          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center space-x-1.5 self-start sm:self-auto"
        >
          {copiedId === 'baseurl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          <span>{copiedId === 'baseurl' ? 'Kopyalandı' : 'Base URL Kopyala'}</span>
        </button>
      </div>

      {/* Endpoints List */}
      <div className="space-y-6">
        <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
          <Code2 className="w-5 h-5 text-emerald-400" />
          <span>Tüm API Endpoint Servisleri</span>
        </h2>

        {endpoints.map((ep) => {
          const isGet = ep.method === 'GET';
          const testRes = testResults[ep.id];
          const isLoading = testLoading[ep.id];

          return (
            <div
              key={ep.id}
              id={ep.id}
              className="rounded-3xl bg-[#0B131F] border border-slate-800/80 overflow-hidden shadow-xl"
            >
              {/* Header Bar */}
              <div className="p-5 bg-[#0E1726] border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black tracking-wide shrink-0 ${
                      isGet
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <code className="text-xs font-mono font-bold text-slate-100 truncate">
                    {ep.path}
                  </code>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleTestEndpoint(ep)}
                    disabled={isLoading}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all flex items-center space-x-1.5"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-emerald-400" />
                    )}
                    <span>{isLoading ? 'Test Ediliyor...' : 'Canlı Test Et'}</span>
                  </button>

                  <button
                    onClick={() => copyToClipboard(`curl -X ${ep.method} "${baseUrl}${ep.path}"`, ep.id)}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                    title="cURL Kopyala"
                  >
                    {copiedId === ep.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">{ep.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{ep.description}</p>
                </div>

                {/* Parameters Table */}
                {ep.params.length > 0 && (
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                      Parametreler
                    </h4>
                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#070D17] text-slate-400 font-semibold border-b border-slate-800">
                          <tr>
                            <th className="p-3">Parametre</th>
                            <th className="p-3">Tip</th>
                            <th className="p-3">Zorunlu</th>
                            <th className="p-3">Açıklama</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {ep.params.map((p, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/40">
                              <td className="p-3 font-mono text-emerald-400 font-bold">{p.name}</td>
                              <td className="p-3 font-mono text-slate-400">{p.type}</td>
                              <td className="p-3">
                                {p.required ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400">Evet</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">Opsiyonel</span>
                                )}
                              </td>
                              <td className="p-3 text-slate-400">{p.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Code Examples & Sample Response */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* cURL Example */}
                  <div>
                    <span className="text-[11px] font-extrabold text-slate-400 block mb-1.5 uppercase tracking-wider">
                      cURL Kodu:
                    </span>
                    <div className="p-3 rounded-2xl bg-[#070D17] border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                      <code>
                        curl -X {ep.method} "{baseUrl}{ep.path}"
                      </code>
                    </div>
                  </div>

                  {/* JS Fetch Example */}
                  <div>
                    <span className="text-[11px] font-extrabold text-slate-400 block mb-1.5 uppercase tracking-wider">
                      JavaScript (Fetch):
                    </span>
                    <div className="p-3 rounded-2xl bg-[#070D17] border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
                      <code>
                        fetch('{baseUrl}{ep.path}').then(r =&gt; r.json())
                      </code>
                    </div>
                  </div>
                </div>

                {/* Live Test Results / Sample JSON Output */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      {testRes ? `Canlı Test Yanıtı (HTTP ${testRes.status})` : 'Örnek JSON Yanıtı:'}
                    </span>
                  </div>
                  <pre className="p-4 rounded-2xl bg-[#070D17] border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-64 scrollbar-thin">
                    {JSON.stringify(testRes ? testRes.data : ep.sample_response, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </MainLayout>
  );
}
