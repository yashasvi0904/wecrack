import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { toKey, toggleLog, removeHabitFromLog } from "./habitStats";

// Habits are always saved in this browser (localStorage). If both endpoints below
// are set in client/.env, they are also synced to the logged-in user's account:
//   REACT_APP_GET_HABITS=<server>/habits
//   REACT_APP_SAVE_HABITS=<server>/habits
const STORAGE_KEY = "wecrack.habits.v1";
const GET_URL = process.env.REACT_APP_GET_HABITS;
const SAVE_URL = process.env.REACT_APP_SAVE_HABITS;
export const SYNC_ENABLED = Boolean(GET_URL && SAVE_URL);

const EMPTY = { habits: [], log: {}, updatedAt: 0 };

const normalize = (raw) => {
  if (!raw || typeof raw !== "object") return EMPTY;
  return {
    habits: Array.isArray(raw.habits) ? raw.habits : [],
    log: raw.log && typeof raw.log === "object" && !Array.isArray(raw.log) ? raw.log : {},
    updatedAt: Number(raw.updatedAt) || 0,
  };
};

const readLocal = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalize(JSON.parse(raw)) : EMPTY;
  } catch {
    return EMPTY;
  }
};

const writeLocal = (data) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* storage full or blocked: the in-memory state still works */
  }
};

const newId = () => `h${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// Today's date key, kept fresh so the grid rolls over at midnight without a reload.
export const useTodayKey = () => {
  const [todayKey, setTodayKey] = useState(() => toKey(new Date()));
  useEffect(() => {
    const id = setInterval(() => setTodayKey(toKey(new Date())), 60 * 1000);
    return () => clearInterval(id);
  }, []);
  return todayKey;
};

export default function useHabitData() {
  const [data, setData] = useState(readLocal);
  // "local" | "syncing" | "synced" | "offline"
  const [status, setStatus] = useState(SYNC_ENABLED ? "syncing" : "local");
  const [ready, setReady] = useState(!SYNC_ENABLED);
  const dataRef = useRef(data);
  const syncedStamp = useRef(0);

  useEffect(() => {
    dataRef.current = data;
    writeLocal(data);
  }, [data]);

  // Pull once: the newer copy (account vs this browser) wins.
  useEffect(() => {
    if (!SYNC_ENABLED) return undefined;
    let cancelled = false;
    axios
      .get(GET_URL, { withCredentials: true })
      .then((res) => {
        if (cancelled) return;
        const remote = normalize(res.data);
        syncedStamp.current = remote.updatedAt;
        if (remote.updatedAt > dataRef.current.updatedAt) setData(remote);
        setStatus("synced");
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("offline");
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Push local edits (debounced) once the first pull has finished.
  useEffect(() => {
    if (!SYNC_ENABLED || !ready || data.updatedAt <= syncedStamp.current) return undefined;
    setStatus("syncing");
    const timer = setTimeout(() => {
      axios
        .post(SAVE_URL, data, { withCredentials: true })
        .then(() => {
          syncedStamp.current = Math.max(syncedStamp.current, data.updatedAt);
          setStatus("synced");
        })
        .catch(() => setStatus("offline"));
    }, 800);
    return () => clearTimeout(timer);
  }, [data, ready]);

  const commit = useCallback((update) => {
    const updatedAt = Date.now();
    setData((prev) => ({ ...update(prev), updatedAt }));
  }, []);

  const addHabit = useCallback(
    ({ name, icon }) =>
      commit((prev) => ({
        ...prev,
        habits: [...prev.habits, { id: newId(), name, icon, createdAt: toKey(new Date()) }],
      })),
    [commit]
  );

  const renameHabit = useCallback(
    (id, name) =>
      commit((prev) => ({
        ...prev,
        habits: prev.habits.map((h) => (h.id === id ? { ...h, name } : h)),
      })),
    [commit]
  );

  const removeHabit = useCallback(
    (id) =>
      commit((prev) => ({
        habits: prev.habits.filter((h) => h.id !== id),
        log: removeHabitFromLog(prev.log, id),
      })),
    [commit]
  );

  const toggle = useCallback(
    (dateKey, id) => commit((prev) => ({ ...prev, log: toggleLog(prev.log, dateKey, id) })),
    [commit]
  );

  return {
    habits: data.habits,
    log: data.log,
    status,
    addHabit,
    renameHabit,
    removeHabit,
    toggle,
  };
}
