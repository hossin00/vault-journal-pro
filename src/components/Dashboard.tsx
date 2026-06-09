import { useState, useEffect } from 'react';
import { PenLine, BarChart2, Lock, Search, Plus, Calendar, Sparkles, Loader2 } from 'lucide-react';
import type { JournalEntry } from '../types';
import { EntryList } from './EntryList';
import { EntryEditor } from './EntryEditor';
import { Analytics } from './Analytics';
import { MOOD_CONFIG } from '../types';
import { generateInsight } from '../utils/ai';

interface Props {
  entries: JournalEntry[];
  onSaveEntries: (entries: JournalEntry[]) => void;
  onLock: () => void;
}

type View = 'journal' | 'analytics';

export function Dashboard({ entries, onSaveEntries, onLock }: Props) {
  const [view, setView] = useState<View>('journal');
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [weeklyInsight, setWeeklyInsight] = useState('');
  const [insightLoading, setInsightLoading] = useState(false);

  const handleSaveEntry = (entry: JournalEntry) => {
    const exists = entries.find(e => e.id === entry.id);
    const updated = exists ? entries.map(e => e.id === entry.id ? entry : e) : [entry, ...entries];
    onSaveEntries(updated);
    setEditingEntry(null);
    setIsCreating(false);
  };

  const handleDeleteEntry = (id: string) => onSaveEntries(entries.filter(e => e.id !== id));

  const filteredEntries = entries.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.content.toLowerCase().includes(search.toLowerCase()) ||
    e.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const todayMood = entries.find(e => e.date === new Date().toISOString().split('T')[0])?.mood;

  const handleWeeklyInsight = async () => {
    if (entries.length === 0) return;
    setInsightLoading(true);
    try {
      const texts = entries.slice(0, 5).map(e => `${e.date}: ${e.content}`);
      const insight = await generateInsight(texts);
      setWeeklyInsight(insight);
    } finally {
      setInsightLoading(false);
    }
  };

  if (isCreating || editingEntry) {
    return (
      <EntryEditor
        entry={editingEntry}
        onSave={handleSaveEntry}
        onCancel={() => { setIsCreating(false); setEditingEntry(null); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#1e1e2e] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <span className="text-violet-400 text-sm">🔐</span>
          </div>
          <span className="font-semibold text-white">Vault Journal</span>
          {todayMood && <span className="text-lg">{MOOD_CONFIG[todayMood].emoji}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-sm">{entries.length} entries</span>
          <button onClick={onLock} className="p-2 text-slate-500 hover:text-slate-300 hover:bg-[#111118] rounded-lg transition-colors">
            <Lock className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Nav */}
      <nav className="border-b border-[#1e1e2e] px-6 flex gap-1 pt-2">
        {[{ id: 'journal', icon: PenLine, label: 'Journal' }, { id: 'analytics', icon: BarChart2, label: 'Analytics' }].map(tab => (
          <button key={tab.id} onClick={() => setView(tab.id as View)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              view === tab.id ? 'border-violet-500 text-violet-400' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-auto p-6">
        {view === 'journal' && (
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Search + New */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search entries..."
                  className="w-full bg-[#111118] border border-[#1e1e2e] rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors text-sm" />
              </div>
              <button onClick={() => { setEditingEntry(null); setIsCreating(true); }}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" /> New Entry
              </button>
            </div>

            {/* Weekly AI Insight */}
            {entries.length >= 3 && (
              <div className="border border-violet-500/20 rounded-xl p-4 bg-violet-600/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <span className="text-violet-300 text-sm font-medium">AI Weekly Insight</span>
                  </div>
                  <button onClick={handleWeeklyInsight} disabled={insightLoading}
                    className="text-xs text-violet-400 hover:text-violet-300 disabled:opacity-40 flex items-center gap-1">
                    {insightLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    {insightLoading ? 'Analyzing...' : 'Generate'}
                  </button>
                </div>
                {weeklyInsight ? (
                  <p className="text-slate-300 text-sm leading-relaxed">{weeklyInsight}</p>
                ) : (
                  <p className="text-slate-500 text-sm">Click Generate to get AI insights about your recent entries</p>
                )}
              </div>
            )}

            {/* Today prompt */}
            {!entries.find(e => e.date === new Date().toISOString().split('T')[0]) && (
              <div onClick={() => { setEditingEntry(null); setIsCreating(true); }}
                className="border border-dashed border-[#1e1e2e] rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-violet-500/50 transition-colors group">
                <Calendar className="w-5 h-5 text-slate-500 group-hover:text-violet-400 transition-colors" />
                <div>
                  <p className="text-white text-sm font-medium">Write today's entry</p>
                  <p className="text-slate-500 text-xs">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            )}

            <EntryList entries={filteredEntries} onEdit={setEditingEntry} onDelete={handleDeleteEntry} />
          </div>
        )}
        {view === 'analytics' && <Analytics entries={entries} />}
      </main>
    </div>
  );
}
