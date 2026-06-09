import { useState, useCallback } from 'react';
import { ArrowLeft, Save, Tag, X, Sparkles, Lightbulb, PenLine, Loader2 } from 'lucide-react';
import type { JournalEntry, Mood } from '../types';
import { MOOD_CONFIG } from '../types';
import { analyzeMood, getWritingSuggestion, continueWriting } from '../utils/ai';

interface Props {
  entry: JournalEntry | null;
  onSave: (entry: JournalEntry) => void;
  onCancel: () => void;
}

export function EntryEditor({ entry, onSave, onCancel }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [mood, setMood] = useState<Mood>(entry?.mood || 'neutral');
  const [tags, setTags] = useState<string[]>(entry?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [date, setDate] = useState(entry?.date || today);
  const [aiInsight, setAiInsight] = useState('');
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  const handleSave = () => {
    if (!content.trim()) return;
    const now = Date.now();
    onSave({
      id: entry?.id || crypto.randomUUID(),
      date,
      title: title || new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
      content,
      mood,
      tags,
      createdAt: entry?.createdAt || now,
      updatedAt: now,
    });
  };

  const handleAnalyzeMood = async () => {
    if (!content.trim()) return;
    setAiLoading('mood');
    try {
      const insight = await analyzeMood(content);
      setAiInsight(insight);
    } finally {
      setAiLoading(null);
    }
  };

  const handleSuggest = async () => {
    if (!content.trim()) return;
    setAiLoading('suggest');
    try {
      const suggestion = await getWritingSuggestion(content);
      setAiInsight(suggestion);
    } finally {
      setAiLoading(null);
    }
  };

  const handleContinue = async () => {
    if (!content.trim()) return;
    setAiLoading('continue');
    try {
      const continuation = await continueWriting(content);
      setContent(prev => prev + '\n\n' + continuation);
    } finally {
      setAiLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#1e1e2e] px-6 py-4 flex items-center justify-between">
        <button onClick={onCancel} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="bg-transparent text-slate-400 text-sm focus:outline-none" />
        <button onClick={handleSave} disabled={!content.trim()}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Save className="w-4 h-4" /> Save
        </button>
      </header>

      <div className="flex-1 overflow-auto p-6 max-w-2xl mx-auto w-full space-y-5">
        {/* Mood */}
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">How are you feeling?</p>
          <div className="flex gap-2">
            {(Object.entries(MOOD_CONFIG) as [Mood, typeof MOOD_CONFIG[Mood]][]).map(([key, config]) => (
              <button key={key} onClick={() => setMood(key)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border transition-all ${
                  mood === key ? 'border-violet-500 bg-violet-600/10' : 'border-[#1e1e2e] bg-[#111118] hover:border-[#2e2e3e]'
                }`}>
                <span className="text-2xl">{config.emoji}</span>
                <span className="text-xs text-slate-500">{config.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Entry title (optional)"
          className="w-full bg-transparent text-xl font-semibold text-white placeholder-slate-600 focus:outline-none border-b border-[#1e1e2e] pb-3" />

        {/* Content */}
        <textarea value={content} onChange={e => setContent(e.target.value)}
          placeholder="Write your thoughts..." rows={10}
          className="w-full bg-transparent text-slate-300 placeholder-slate-600 focus:outline-none resize-none leading-relaxed text-base"
          autoFocus />

        {/* AI Toolbar */}
        <div className="border border-[#1e1e2e] rounded-xl p-4 space-y-3">
          <p className="text-slate-500 text-xs uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" /> AI Assistant
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleAnalyzeMood} disabled={!content.trim() || !!aiLoading}
              className="flex items-center gap-2 bg-[#1e1e2e] hover:bg-violet-600/20 hover:border-violet-500/50 border border-[#1e1e2e] text-slate-300 hover:text-violet-300 px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40">
              {aiLoading === 'mood' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Analyze Mood
            </button>
            <button onClick={handleSuggest} disabled={!content.trim() || !!aiLoading}
              className="flex items-center gap-2 bg-[#1e1e2e] hover:bg-violet-600/20 hover:border-violet-500/50 border border-[#1e1e2e] text-slate-300 hover:text-violet-300 px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40">
              {aiLoading === 'suggest' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lightbulb className="w-3.5 h-3.5" />}
              Get Prompts
            </button>
            <button onClick={handleContinue} disabled={!content.trim() || !!aiLoading}
              className="flex items-center gap-2 bg-[#1e1e2e] hover:bg-violet-600/20 hover:border-violet-500/50 border border-[#1e1e2e] text-slate-300 hover:text-violet-300 px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40">
              {aiLoading === 'continue' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PenLine className="w-3.5 h-3.5" />}
              Continue Writing
            </button>
          </div>
          {aiInsight && (
            <div className="bg-violet-600/10 border border-violet-500/20 rounded-lg p-3 text-slate-300 text-sm leading-relaxed animate-fade-in">
              {aiInsight}
              <button onClick={() => setAiInsight('')} className="ml-2 text-slate-500 hover:text-slate-300">
                <X className="w-3.5 h-3.5 inline" />
              </button>
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500 text-xs uppercase tracking-wider">Tags</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 bg-[#111118] border border-[#1e1e2e] text-slate-300 text-xs px-2.5 py-1 rounded-full">
                #{tag}
                <button onClick={() => removeTag(tag)} className="text-slate-500 hover:text-red-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add tag..."
              className="flex-1 bg-[#111118] border border-[#1e1e2e] rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 text-sm" />
            <button onClick={addTag} className="px-3 py-1.5 bg-[#111118] border border-[#1e1e2e] text-slate-400 hover:text-white rounded-lg text-sm transition-colors">
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
