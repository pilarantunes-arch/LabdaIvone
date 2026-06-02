import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { format, subDays } from "date-fns";

type TrackerContextType = {
  streak: number;
  goalsCompletedToday: boolean;
  completeDailyGoal: () => void;
  resetTodayGoal: () => void;
  streakRewardUnlocked: boolean;
};

const STORAGE_KEY = "Labdaivone-tracker-streak";

type StoredData = {
  completedDates: string[];
  lastCheckedDate: string | null;
};

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

function loadStored(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { completedDates: [], lastCheckedDate: null };
}

function saveStored(data: StoredData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function computeStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;
  const sorted = [...completedDates].sort().reverse();
  let streak = 0;
  let checkDate = new Date();

  for (let i = 0; i < 365; i++) {
    const dateStr = format(checkDate, "yyyy-MM-dd");
    if (sorted.includes(dateStr)) {
      streak++;
      checkDate = subDays(checkDate, 1);
    } else if (i === 0) {
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }
  return streak;
}

export function TrackerProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<StoredData>(loadStored);
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const goalsCompletedToday = stored.completedDates.includes(todayStr);
  const streak = computeStreak(stored.completedDates);
  const streakRewardUnlocked = streak >= 7;

  useEffect(() => {
    saveStored(stored);
  }, [stored]);

  const completeDailyGoal = useCallback(() => {
    setStored((prev) => {
      if (prev.completedDates.includes(todayStr)) return prev;
      return {
        ...prev,
        completedDates: [...prev.completedDates, todayStr],
        lastCheckedDate: todayStr,
      };
    });
  }, [todayStr]);

  const resetTodayGoal = useCallback(() => {
    setStored((prev) => ({
      ...prev,
      completedDates: prev.completedDates.filter((d) => d !== todayStr),
    }));
  }, [todayStr]);

  return (
    <TrackerContext.Provider
      value={{ streak, goalsCompletedToday, completeDailyGoal, resetTodayGoal, streakRewardUnlocked }}
    >
      {children}
    </TrackerContext.Provider>
  );
}

export function useTracker() {
  const context = useContext(TrackerContext);
  if (!context) throw new Error("useTracker must be used within TrackerProvider");
  return context;
}
