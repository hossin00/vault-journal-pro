import { Trash2, Edit2 } from 'lucide-react';
import type { JournalEntry } from '../types';
import { MOOD_CONFIG } from '../types';
import { format } from 'date-fns';

interface Props {
  entries: JournalEntry[];
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

export function EntryList({ entries, onEdit, onDelete }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <p className="text-4xl mb-3">📖</p>
        <p className="text-sm">No entries yet. Start writing!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map(entry => {
        const moodConfig = MOOD_CONFIG[entry.mood];
        return (
          <div
            key={entry.id}
            className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 hover:border-[#2e2e3e] transition-all group cursor-pointer"
            onClick={() => onEdit(entry)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{moodConfig.emoji}</span>
                  <span className="text-white font-medium text-sm truncate">{entry.title}</span>
                </div>
                <p className="text-slate-500 text-xs mb-2">
                  {format(new Date(entry.date), 'MMMM d, yyyy')}
                </p>
                <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">
                  {entry.content}
                </p>
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {entry.tags.map(tag => (
                      <span key={tag} className="text-xs text-slate-500 bg-[#1a1a24] px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={e => { e.stopPropagation(); onEdit(entry); }}
                  className="p-1.5 text-slate-500 hover:text-violet-400 hover:bg-violet-600/10 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(entry.id); }}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-600/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
