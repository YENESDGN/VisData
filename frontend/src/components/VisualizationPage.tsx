import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, BarChart3, LineChart, PieChart, Save, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useChat } from '../contexts/ChatContext';
import { apiGetVisualizationData, apiAnalyzeFileForChart } from '../lib/api';

interface VisualizationPageProps {
  fileId: string;
  fileName: string;
  onBack: () => void;
}

export const VisualizationPage = ({ fileId, fileName, onBack }: VisualizationPageProps) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'table'>('bar');
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<Array<Record<string, any>>>([]);
  const [selectedColumns, setSelectedColumns] = useState<{ x: string; y: string }>({ x: '', y: '' });
  
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<{ chartType: string; xColumn: string; yColumn: string; reason: string } | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();
  const { addMessage } = useChat();

  useEffect(() => {
    loadFileData();
  }, [fileId]);

  const loadFileData = async () => {
    try {
      const res = await apiGetVisualizationData(Number(fileId));
      setColumns(res.columns || []);
      setRows(res.data || []);
      
      // AI analizi yap
      setAnalyzing(true);
      try {
        const aiAnalysis = await apiAnalyzeFileForChart(Number(fileId));
        setAiRecommendation(aiAnalysis);
        
        // AI önerilerini uygula
        if (aiAnalysis.xColumn && aiAnalysis.yColumn) {
          setSelectedColumns({ 
            x: aiAnalysis.xColumn, 
            y: aiAnalysis.yColumn 
          });
        }
        
        if (aiAnalysis.chartType) {
          const validChartTypes: ('bar' | 'line' | 'pie' | 'scatter' | 'area' | 'table')[] = ['bar', 'line', 'pie', 'scatter', 'area', 'table'];
          if (validChartTypes.includes(aiAnalysis.chartType as any)) {
            setChartType(aiAnalysis.chartType as any);
          }
        }
        
        // Chatbot'a AI analizi sonuçlarını gönder
        const chartTypeNames: Record<string, string> = {
          'bar': 'Çubuk Grafik',
          'line': 'Çizgi Grafik',
          'pie': 'Pasta Grafik',
          'scatter': 'Dağılım Grafiği',
          'area': 'Alan Grafiği',
          'table': 'Tablo'
        };
        
        // Eğer hata varsa, chatbot'a özel mesaj gönder
        if (aiAnalysis.error) {
          const errorMessage = `⚠️ ${aiAnalysis.reason}\n\n` +
            `Grafik ayarları otomatik olarak varsayılan değerlere ayarlandı:\n` +
            `• Grafik Tipi: ${chartTypeNames[aiAnalysis.chartType] || aiAnalysis.chartType}\n` +
            `• X Ekseni: ${aiAnalysis.xColumn}\n` +
            `• Y Ekseni: ${aiAnalysis.yColumn}\n\n` +
            `İsterseniz bu ayarları manuel olarak değiştirebilirsiniz.`;
          
          addMessage(errorMessage, 'assistant');
          showToast(aiAnalysis.reason, 7000);
        } else {
          const chatMessage = `📊 Dosya Analizi Tamamlandı!\n\n` +
            `Önerilen Grafik Tipi: ${chartTypeNames[aiAnalysis.chartType] || aiAnalysis.chartType}\n` +
            `X Ekseni: ${aiAnalysis.xColumn}\n` +
            `Y Ekseni: ${aiAnalysis.yColumn}\n\n` +
            `📝 Açıklama: ${aiAnalysis.reason}\n\n` +
            `Grafik ayarları otomatik olarak uygulandı. İsterseniz değiştirebilirsiniz.`;
          
          addMessage(chatMessage, 'assistant');
          showToast(`AI önerisi: ${aiAnalysis.reason}`, 7000);
        }
      } catch (err) {
        console.error('AI analizi hatası:', err);
        // Hata durumunda varsayılan ayarlar
        if ((res.columns || []).length >= 2) {
          setSelectedColumns({ x: res.columns[0], y: res.columns[1] });
        }
        
        // Chatbot'a hata mesajı gönder
        addMessage(
          '⚠️ AI analizi şu anda kullanılamıyor. Varsayılan grafik ayarları kullanıldı. ' +
          'Grafik tipini ve eksenleri manuel olarak ayarlayabilirsiniz.',
          'assistant'
        );
      } finally {
        setAnalyzing(false);
      }
      
      setTitle(`${fileName} Visualization`);
    } catch {
      setColumns([]);
      setRows([]);
      setAnalyzing(false);
    }
  };

  const handleSaveVisualization = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const payload = {
        id: crypto.randomUUID(),
        fileId,
        fileName,
        title: title || `${fileName} Visualization`,
        chartType,
        selectedColumns,
        aggregation: 'sum',
        timeUnit: 'year',
        filter: { filterCol: '', filterVal: '' },
        createdAt: new Date().toISOString(),
      };
      const key = 'visdata_library';
      const current = JSON.parse(localStorage.getItem(key) || '[]');
      current.unshift(payload);
      localStorage.setItem(key, JSON.stringify(current.slice(0, 100)));
      window.dispatchEvent(new Event('visdata-library-changed'));
      showToast('Dosya başarıyla kütüphaneye eklendi', 5000);
    } finally {
      setSaving(false);
    }
  };

  const isLoading = !columns.length;

  const chartTypes = [
    { type: 'bar' as const, icon: BarChart3, label: 'Bar' },
    { type: 'line' as const, icon: LineChart, label: 'Line' },
    { type: 'area' as const, icon: LineChart, label: 'Area' },
    { type: 'scatter' as const, icon: LineChart, label: 'Scatter' },
    { type: 'pie' as const, icon: PieChart, label: 'Pie' },
    { type: 'table' as const, icon: BarChart3, label: 'Table' },
  ];

  const isNumeric = (v: any) => typeof v === 'number' || (!isNaN(parseFloat(v)) && isFinite(v));
  const parseVal = (v: any) => (typeof v === 'number' ? v : parseFloat(v));
  const isDateLike = (v: any) => {
    if (v instanceof Date) return true;
    if (typeof v !== 'string' && typeof v !== 'number') return false;
    const t = Date.parse(String(v));
    return !isNaN(t);
  };

  // derived series and scales below
  const sampleRows = useMemo(() => rows.slice(0, 200), [rows]);
  const xIsNumeric = useMemo(() => sampleRows.length > 0 && sampleRows.every(r => isNumeric(r[selectedColumns.x]) || isDateLike(r[selectedColumns.x])), [sampleRows, selectedColumns.x]);
  const yIsNumeric = useMemo(() => rows.slice(0, 50).every(r => isNumeric(r[selectedColumns.y])), [rows, selectedColumns.y]);
  const xIsDate = useMemo(() => sampleRows.length > 0 && sampleRows.every(r => isDateLike(r[selectedColumns.x])), [sampleRows, selectedColumns.x]);

  const series = useMemo(() => {
    if (!selectedColumns.x || !selectedColumns.y) return [] as Array<{ x: any; y: number }>;
    const input = rows;
    // Date grouping if needed
    const toX = (v: any) => {
      if (xIsDate) {
        const d = new Date(v);
        return `${d.getFullYear()}`;
      }
      return v;
    };

    if (xIsNumeric && yIsNumeric && !xIsDate) {
      return input.map(r => ({ x: parseVal(r[selectedColumns.x]), y: parseVal(r[selectedColumns.y]) }));
    }
    // Aggregate by categorical X
    const map = new Map<any, { sum: number; count: number }>();
    for (const r of input) {
      const key = toX(r[selectedColumns.x]);
      const y = yIsNumeric ? parseVal(r[selectedColumns.y]) : 1;
      const prev = map.get(key) || { sum: 0, count: 0 };
      map.set(key, { sum: prev.sum + y, count: prev.count + 1 });
    }
    const arr = Array.from(map.entries()).map(([k, v]) => ({ x: k, y: yIsNumeric ? v.sum : v.count }));
    // Stable sort for readability
    if (xIsDate) {
      return arr.sort((a, b) => String(a.x).localeCompare(String(b.x)));
    }
    if (typeof arr[0]?.x === 'number') return arr.sort((a, b) => (a.x as number) - (b.x as number));
    return arr.sort((a, b) => (typeof a.x === 'string' && typeof b.x === 'string' ? a.x.localeCompare(b.x) : 0));
  }, [rows, selectedColumns, xIsNumeric, yIsNumeric, xIsDate]);

  const chartPadding = 40;
  const chartW = 800;
  const chartH = 400;
  const innerW = chartW - chartPadding * 2;
  const innerH = chartH - chartPadding * 2;

  const minX = useMemo(() => Math.min(...series.map(p => (typeof p.x === 'number' ? p.x : 0))), [series]);
  const maxX = useMemo(() => Math.max(...series.map(p => (typeof p.x === 'number' ? p.x : 1))), [series]);
  const minY = useMemo(() => Math.min(0, ...series.map(p => p.y)), [series]);
  const maxY = useMemo(() => Math.max(1, ...series.map(p => p.y)), [series]);

  const scaleX = (x: any, i: number, n: number) => {
    if (xIsNumeric) {
      const t = (x - minX) / (maxX - minX || 1);
      return chartPadding + t * innerW;
    }
    // Categorical: center bars within band so they don't overflow the plot area
    const bands = Math.max(1, n);
    return chartPadding + ((i + 0.5) / bands) * innerW;
  };
  const scaleY = (y: number) => {
    const t = (y - minY) / (maxY - minY || 1);
    return chartPadding + (1 - t) * innerH;
  };

  const bars = useMemo(() => {
    if (xIsNumeric) return [] as Array<{ x: number; y: number; w: number; h: number; label: string }>; 
    const n = series.length;
    const bw = (innerW / Math.max(1, n)) * 0.7; // leave gutters so bars don't touch bounds
    return series.map((p, i) => {
      const x = scaleX(p.x, i, n) - bw / 2;
      const y = scaleY(p.y);
      const h = chartPadding + innerH - y;
      return { x, y, w: bw, h, label: String(p.x) };
    });
  }, [series, xIsNumeric]);

  return (
    <div className="min-h-screen p-8">
      <div className="w-full">
        <button
          onClick={onBack}
          className="group flex items-center space-x-2 text-neutral-200 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Home</span>
        </button>

        <div className="glass-dark border border-white/10 rounded-3xl p-10">
          <div className="mb-8">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-4xl font-bold bg-gradient-to-r from-white via-neutral-300 to-neutral-500 bg-clip-text text-transparent border-b-2 border-transparent hover:border-white/30 focus:border-neutral-300 focus:outline-none w-full pb-2"
              placeholder="Enter visualization title"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
            <div className="lg:col-span-1 space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-200 mb-3">
                  Chart Type
                </label>
                <div className="space-y-3">
                  {chartTypes.map(({ type, icon: Icon, label }) => (
                    <button
                      key={type}
                      onClick={() => setChartType(type)}
                      className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 ${
                        chartType === type
                          ? 'bg-gradient-to-r from-white to-neutral-600 text-white shadow-lg shadow-neutral-700/50 scale-105'
                          : 'glass-effect border border-white/10 text-neutral-200 hover:bg-white/10'
                      }`}
                    >
                      <Icon size={22} />
                      <span className="font-semibold">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-200 mb-3">
                  X-Axis Column
                </label>
                <select
                  value={selectedColumns.x}
                  onChange={(e) => setSelectedColumns({ ...selectedColumns, x: e.target.value })}
                  className="w-full px-4 py-3 glass-effect border border-white/10 rounded-xl text-white focus:outline-none focus:border-neutral-300 transition-colors"
                >
                  {columns.map((col: string) => (
                    <option key={col} value={col} className="bg-slate-800">
                      {col}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-200 mb-3">
                  Y-Axis Column
                </label>
                <select
                  value={selectedColumns.y}
                  onChange={(e) => setSelectedColumns({ ...selectedColumns, y: e.target.value })}
                  className="w-full px-4 py-3 glass-effect border border-white/10 rounded-xl text-white focus:outline-none focus:border-neutral-300 transition-colors"
                >
                  {columns.map((col: string) => (
                    <option key={col} value={col} className="bg-slate-800">
                      {col}
                    </option>
                  ))}
                </select>
              </div>

              {/* Removed Aggregation / Time Unit / Filter controls per request */}

              <button
                onClick={handleSaveVisualization}
                disabled={saving}
                className="group relative w-full py-4 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white to-neutral-600 group-hover:from-white group-hover:to-neutral-500"></div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity shimmer"></div>
                <div className="relative flex items-center justify-center space-x-2 text-white font-bold">
                  <Save size={20} />
                  <span>{saving ? 'Saving...' : 'Save to Library'}</span>
                </div>
              </button>
            </div>

            <div className="lg:col-span-3 glass-effect border border-white/10 rounded-2xl p-8">
              {analyzing && (
                <div className="mb-4 glass-effect border border-purple-500/30 bg-purple-500/10 rounded-xl p-4 flex items-center space-x-3">
                  <Sparkles size={20} className="text-purple-400 animate-pulse" />
                  <span className="text-purple-200">AI dosyanızı analiz ediyor...</span>
                </div>
              )}
              {aiRecommendation && !analyzing && (
                <div className="mb-4 glass-effect border border-blue-500/30 bg-blue-500/10 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles size={18} className="text-blue-400" />
                    <span className="text-blue-200 font-semibold">AI Önerisi</span>
                  </div>
                  <p className="text-sm text-blue-100">{aiRecommendation.reason}</p>
                </div>
              )}
              <div className="h-[500px] w-full flex items-center justify-center">
                {isLoading && (
                  <div className="text-xl text-white">Loading...</div>
                )}
                {!isLoading && chartType !== 'table' && (
                  <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <clipPath id="plotClip">
                        <rect x={chartPadding} y={chartPadding} width={innerW} height={innerH} rx="8" />
                      </clipPath>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    {/* Axes */}
                    <line x1={chartPadding} y1={chartPadding} x2={chartPadding} y2={chartPadding + innerH} stroke="#94a3b8" strokeWidth="1" />
                    <line x1={chartPadding} y1={chartPadding + innerH} x2={chartPadding + innerW} y2={chartPadding + innerH} stroke="#94a3b8" strokeWidth="1" />

                    {/* Grid lines */}
                    {Array.from({ length: 5 }).map((_, i) => {
                      const y = chartPadding + (i / 4) * innerH;
                      return <line key={`gy-${i}`} x1={chartPadding} y1={y} x2={chartPadding + innerW} y2={y} stroke="#475569" strokeWidth="1" opacity="0.3" />
                    })}

                    {/* Axis labels */}
                    <text x={chartPadding} y={chartPadding - 10} fill="#cbd5e1" fontSize="12">{selectedColumns.y}</text>
                    <text x={chartPadding + innerW} y={chartPadding + innerH + 20} fill="#cbd5e1" fontSize="12" textAnchor="end">{selectedColumns.x}{xIsDate ? ' (year)' : ''}</text>

                    {/* X ticks (categorical) */}
                    {!xIsNumeric && series.length > 0 && (
                      (() => {
                        const step = Math.max(1, Math.ceil(series.length / 12));
                        return (
                          <g>
                            {series.map((p, i) => (
                              i % step === 0 ? (
                                <text key={`xt-${i}`} x={scaleX(p.x, i, series.length)} y={chartPadding + innerH + 18} fill="#94a3b8" fontSize="10" textAnchor="end" transform={`rotate(-30 ${scaleX(p.x, i, series.length)} ${chartPadding + innerH + 18})`}>{String(p.x)}</text>
                              ) : null
                            ))}
                          </g>
                        );
                      })()
                    )}

                    {/* Y ticks */}
                    {Array.from({ length: 5 }).map((_, i) => {
                      const ly = chartPadding + (i / 4) * innerH;
                      const val = (maxY - ((i / 4) * (maxY - minY)));
                      const fmt = new Intl.NumberFormat('en-US', { notation: 'compact' }).format(val);
                      return <text key={`yt-${i}`} x={chartPadding - 8} y={ly + 4} fill="#94a3b8" fontSize="10" textAnchor="end">{fmt}</text>
                    })}

                    {/* BAR / AREA background shapes */}
                    <g clipPath="url(#plotClip)">
                      {chartType === 'bar' && bars.map((b, i) => (
                        <g key={`b-${i}`}> 
                          <rect x={Math.max(chartPadding, b.x)} y={Math.min(chartPadding + innerH, b.y)} width={Math.min(b.w, chartPadding + innerW - Math.max(chartPadding, b.x))} height={Math.max(0, b.h)} fill="#06b6d4" opacity="0.9" rx="6" />
                        </g>
                      ))}
                    </g>

                    {(chartType === 'line' || chartType === 'area' || chartType === 'scatter') && (
                      <>
                        {/* Path for line/area */}
                        {series.length > 0 && (
                          (() => {
                            const pts = series.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x, i, series.length)} ${scaleY(p.y)}`).join(' ');
                            const areaD = `M ${chartPadding} ${chartPadding + innerH} ${pts} L ${chartPadding + innerW} ${chartPadding + innerH} Z`;
                            return (
                              <g>
                                {chartType === 'area' && <path d={areaD} fill="url(#areaGrad)" />}
                                {chartType !== 'scatter' && <path d={pts} fill="none" stroke="#06b6d4" strokeWidth="2" />}
                              </g>
                            );
                          })()
                        )}
                        {/* Scatter points */}
                        {series.map((p, i) => (
                          <circle key={`pt-${i}`} cx={scaleX(p.x, i, series.length)} cy={scaleY(p.y)} r={chartType === 'scatter' ? 4 : 2.5} fill="#67e8f9" stroke="#0ea5e9" />
                        ))}
                      </>
                    )}

                    {/* PIE chart uses different layout */}
                    {chartType === 'pie' && (() => {
                      // top N slices + others
                      const top = [...series].sort((a,b)=>b.y-a.y).slice(0, 20);
                      const others = series.slice(20).reduce((s,p)=>s+p.y,0);
                      const pieSeries = others > 0 ? [...top, { x: 'Others', y: others }] : top;
                      const total = pieSeries.reduce((s, p) => s + Math.max(0, p.y), 0) || 1;
                      let acc = 0;
                      const cx = chartW / 2, cy = chartH / 2, r = Math.min(innerW, innerH) / 2;
                      const polar = (cx: number, cy: number, r: number, a: number) => ({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
                      return (
                        <g>
                          {pieSeries.map((p, i) => {
                            const start = (acc / total) * Math.PI * 2 - Math.PI / 2; acc += Math.max(0, p.y);
                            const end = (acc / total) * Math.PI * 2 - Math.PI / 2;
                            const mid = (start + end) / 2;
                            const s = polar(cx, cy, r, start); const e = polar(cx, cy, r, end);
                            const laf = end - start > Math.PI ? 1 : 0;
                            const d = [`M`, cx, cy, `L`, s.x, s.y, `A`, r, r, 0, laf, 1, e.x, e.y, `Z`].join(' ');
                            const hue = (i * 47) % 360;
                            const label = `${Math.round((p.y / total) * 100)}%`;
                            const lx = cx + (r * 0.6) * Math.cos(mid);
                            const ly = cy + (r * 0.6) * Math.sin(mid);
                            return (
                              <g key={`pie-${i}`}>
                                <path d={d} fill={`hsl(${hue} 70% 45%)`} opacity="0.9" />
                                <text x={lx} y={ly} fill="#f8fafc" fontSize="11" textAnchor="middle" dominantBaseline="middle" fontWeight="600">{label}</text>
                              </g>
                            );
                          })}
                        </g>
                      );
                    })()}
                  </svg>
                )}

                {!isLoading && chartType === 'table' && (
                  <div className="w-full overflow-auto max-h-[500px]">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr>
                          {columns.map((c) => (
                            <th key={c} className="text-left px-3 py-2 border-b border-white/10 text-neutral-200 sticky top-0 bg-slate-800">{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.slice(0, 1000).map((r, i) => (
                          <tr key={i} className="odd:bg-white/5">
                            {columns.map((c) => (
                              <td key={c} className="px-3 py-2 text-neutral-100 whitespace-nowrap">{String(r[c])}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="glass-effect border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-xl bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent mb-4">File Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div>
                <span className="text-gray-400">File Name:</span>
                <div className="font-semibold text-white mt-1">{fileName}</div>
              </div>
              <div>
                <span className="text-gray-400">Type:</span>
                <div className="font-semibold text-white mt-1 uppercase">{fileName.endsWith('.csv') ? 'CSV' : fileName.endsWith('.xlsx') ? 'XLSX' : 'FILE'}</div>
              </div>
              <div>
                <span className="text-gray-400">Rows:</span>
                <div className="font-semibold text-white mt-1">{rows.length}</div>
              </div>
              <div>
                <span className="text-gray-400">Columns:</span>
                <div className="font-semibold text-white mt-1">{columns.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
