import type { JournalEntry, Mood } from '../types';
import { MOOD_CONFIG } from '../types';
import { format, subDays, eachDayOfInterval } from 'date-fns';

interface Props {
  entries: JournalEntry[];
}

export function Analytics({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500 max-w-2xl mx-auto">
        <p className="text-4xl mb-3">📊</p>
        <p className="text-sm">Start writing to see your analytics</p>
      </div>
    );
  }

  // Mood distribution
  const moodCounts = entries.reduce((acc, e) => {
    acc[e.mood] = (acc[e.mood] || 0) + 1;
    return acc;
  }, {} as Record<Mood, number>);

  // Last 30 days streak
  const last30 = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
  const entryDates = new Set(entries.map(e => e.date));

  // Streak calculation
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  let checkDate = new Date();
  while (entryDates.has(checkDate.toISOString().split('T')[0])) {
    streak++;
    checkDate = subDays(checkDate, 1);
  }

  // Most used tags
  const tagCounts = entries.flatMap(e => e.tags).reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Average mood score
  const moodScore: Record<Mood, number> = { amazing: 5, good: 4, neutral: 3, bad: 2, terrible: 1 };
  const avgMood = entries.length > 0
    ? entries.reduce((sum, e) => sum + moodScore[e.mood], 0) / entries.length
    : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Entries', value: entries.length, icon: '📖' },
          { label: 'Current Streak', value: `${streak}d`, icon: '🔥' },
          { label: 'Avg Mood', value: avgMood.toFixed(1) + '/5', icon: '💫' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 text-center">
            <p className="text-2xl mb-1">{stat.icon}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-slate-500 text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Last 30 days heatmap */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
        <h3 className="text-white font-medium mb-4 text-sm">Last 30 Days</h3>
        <div className="grid grid-cols-10 gap-1.5">
          {last30.map(day => {
            const dateStr = day.toISOString().split('T')[0];
            const entry = entries.find(e => e.date === dateStr);
            const isToday = dateStr === today;
            return (
              <div
                key={dateStr}
                title={format(day, 'MMM d')}
                className={`aspect-square rounded-md transition-colors ${
                  entry
                    ? 'bg-violet-500'
                    : isToday
                    ? 'bg-[#1e1e2e] border border-violet-500/50'
                    : 'bg-[#1a1a24]'
                }`}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
          <div className="w-3 h-3 rounded-sm bg-[#1a1a24]" />
          <span>No entry</span>
          <div className="w-3 h-3 rounded-sm bg-violet-500 ml-2" />
          <span>Entry written</span>
        </div>
      </div>

      {/* Mood distribution */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
        <h3 className="text-white font-medium mb-4 text-sm">Mood Distribution</h3>
        <div className="space-y-3">
          {(Object.entries(MOOD_CONFIG) as [Mood, typeof MOOD_CONFIG[Mood]][]).map(([key, config]) => {
            const count = moodCounts[key] || 0;
            const pct = entries.length > 0 ? (count / entries.length) * 100 : 0;
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="text-lg w-6">{config.emoji}</span>
                <span className="text-slate-400 text-sm w-16">{config.label}</span>
                <div className="flex-1 bg-[#1a1a24] rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: config.color }}
                  />
                </div>
                <span className="text-slate-500 text-xs w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top tags */}
      {topTags.length > 0 && (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
          <h3 className="text-white font-medium mb-4 text-sm">Top Tags</h3>
          <div className="flex flex-wrap gap-2">
            {topTags.map(([tag, count]) => (
              <span key={tag} className="flex items-center gap-1.5 bg-[#1a1a24] border border-[#1e1e2e] text-slate-300 text-sm px-3 py-1.5 rounded-full">
                #{tag}
                <span className="text-violet-400 text-xs font-medium">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
