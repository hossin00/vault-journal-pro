import { useState, useEffect } from 'react';
import { LockScreen } from './components/LockScreen';
import { Dashboard } from './components/Dashboard';
import { hasStoredPassword, verifyPassword, savePasswordHash, loadEntries, saveEntries } from './utils/crypto';
import type { JournalEntry } from './types';

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [password, setPassword] = useState('');

  useEffect(() => {
    setHasPassword(hasStoredPassword());
  }, []);

  const handleUnlock = (pwd: string): boolean => {
    if (!hasPassword) {
      savePasswordHash(pwd);
      setPassword(pwd);
      setHasPassword(true);
      setEntries([]);
      setIsUnlocked(true);
      return true;
    }
    if (verifyPassword(pwd)) {
      const loaded = loadEntries(pwd);
      if (loaded !== null) {
        setEntries(loaded as JournalEntry[]);
        setPassword(pwd);
        setIsUnlocked(true);
        return true;
      }
    }
    return false;
  };

  const handleSaveEntries = (newEntries: JournalEntry[]) => {
    setEntries(newEntries);
    saveEntries(newEntries, password);
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setPassword('');
    setEntries([]);
  };

  if (!isUnlocked) {
    return <LockScreen onUnlock={handleUnlock} hasPassword={hasPassword} />;
  }

  return (
    <Dashboard
      entries={entries}
      onSaveEntries={handleSaveEntries}
      onLock={handleLock}
    />
  );
}
