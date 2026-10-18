// Pure helpers for the Habit Tracker: dates, streaks and monthly statistics.
// No React and no I/O, so the maths is easy to test on its own.
//
// Data model
//   habits: [{ id, name, icon, createdAt: "YYYY-MM-DD" }]
//   log:    { "YYYY-MM-DD": [habitId, ...] }   // habits completed that day
//
// All dates are local calendar days as "YYYY-MM-DD" strings, so time zones can
// never shift a tick onto the wrong day.

const pad = (n) => String(n).padStart(2, "0");

export const toKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const fromKey = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (key, n) => {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
};

// `month` is 0-based, like Date.
export const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

export const monthDays = (year, month) =>
  Array.from({ length: daysInMonth(year, month) }, (_, i) => {
    const day = i + 1;
    return {
      key: `${year}-${pad(month + 1)}-${pad(day)}`,
      day,
      weekday: new Date(year, month, day).getDay(),
    };
  });

// The first day a habit counts from: its creation date, or an earlier day the
// user back-filled by ticking it. Days before this are never counted as missed.
export const habitStartKeys = (habits, log) => {
  const starts = {};
  habits.forEach((h) => {
    starts[h.id] = h.createdAt || null;
  });
  Object.entries(log).forEach(([key, ids]) => {
    ids.forEach((id) => {
      if (id in starts && (starts[id] === null || key < starts[id])) starts[id] = key;
    });
  });
  return starts;
};

// Longest and current run of consecutive "done" days between startKey and
// todayKey. Today is still in progress: ticking it extends the streak, but
// leaving it empty never breaks it.
const runStats = (isDone, startKey, todayKey) => {
  if (!startKey || startKey > todayKey) return { current: 0, best: 0 };
  let run = 0;
  let best = 0;
  for (let key = startKey; key < todayKey; key = addDays(key, 1)) {
    run = isDone(key) ? run + 1 : 0;
    if (run > best) best = run;
  }
  if (isDone(todayKey)) {
    run += 1;
    if (run > best) best = run;
  }
  return { current: run, best };
};

export const computeStats = ({ habits, log, year, month, todayKey }) => {
  const starts = habitStartKeys(habits, log);
  const doneOn = (key, id) => (log[key] || []).includes(id);

  const days = monthDays(year, month).map((d) => {
    const isFuture = d.key > todayKey;
    let tracked = 0;
    let done = 0;
    let upcoming = 0;
    habits.forEach((h) => {
      const start = starts[h.id];
      if (!start || d.key < start) return;
      if (isFuture) {
        upcoming += 1;
      } else {
        tracked += 1;
        if (doneOn(d.key, h.id)) done += 1;
      }
    });
    return {
      ...d,
      isFuture,
      isToday: d.key === todayKey,
      tracked,
      done,
      upcoming,
      pct: tracked > 0 ? Math.round((done / tracked) * 100) : null,
    };
  });

  const done = days.reduce((sum, d) => sum + d.done, 0);
  const elapsed = days.reduce((sum, d) => sum + d.tracked, 0);
  const upcoming = days.reduce((sum, d) => sum + d.upcoming, 0);
  const totals = {
    done,
    notDone: elapsed - done,
    upcoming,
    elapsed,
    pct: elapsed > 0 ? Math.round((done / elapsed) * 100) : null,
  };

  const perHabit = habits.map((h) => {
    const start = starts[h.id];
    let possible = 0;
    let doneCount = 0;
    days.forEach((d) => {
      if (d.isFuture || !start || d.key < start) return;
      possible += 1;
      if (doneOn(d.key, h.id)) doneCount += 1;
    });
    const streak = runStats((key) => doneOn(key, h.id), start, todayKey);
    return {
      id: h.id,
      name: h.name,
      icon: h.icon,
      done: doneCount,
      possible,
      pct: possible > 0 ? Math.round((doneCount / possible) * 100) : null,
      currentStreak: streak.current,
      bestStreak: streak.best,
    };
  });

  // Overall streak: consecutive days on which at least one habit was done.
  const startList = Object.values(starts).filter(Boolean).sort();
  const anyDone = (key) => habits.some((h) => doneOn(key, h.id));
  const streak = runStats(anyDone, startList[0] || null, todayKey);

  const perfectDays = days.filter((d) => !d.isFuture && d.tracked > 0 && d.done === d.tracked).length;

  return { days, totals, perHabit, streak, perfectDays };
};

// Immutable helpers used by the data hook.
export const toggleLog = (log, key, id) => {
  const current = log[key] || [];
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  const out = { ...log };
  if (next.length) out[key] = next;
  else delete out[key];
  return out;
};

export const removeHabitFromLog = (log, id) => {
  const out = {};
  Object.entries(log).forEach(([key, ids]) => {
    const next = ids.filter((x) => x !== id);
    if (next.length) out[key] = next;
  });
  return out;
};
