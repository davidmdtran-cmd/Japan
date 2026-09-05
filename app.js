(function () {
  "use strict";

  const DATA = window.TRIP_DATA;
  if (!DATA) return;

  const STORAGE_KEY = `japan-autumn-itinerary-v${DATA.version}`;
  const MAX_HISTORY = 30;
  const durationChoices = [30, 45, 60, 75, 90, 120, 150, 180, 240, 300, 360, 480, 600, 720];

  const draftSlots = [
    { time: "00:00", phase: "Late" },
    { time: "01:30", phase: "Overnight" },
    { time: "03:00", phase: "Overnight" },
    { time: "04:30", phase: "Early" },
    { time: "06:00", phase: "Early" },
    { time: "07:30", phase: "Morning" },
    { time: "09:00", phase: "Morning" },
    { time: "10:30", phase: "Morning" },
    { time: "12:00", phase: "Lunch" },
    { time: "13:30", phase: "Afternoon" },
    { time: "15:00", phase: "Afternoon" },
    { time: "16:30", phase: "Afternoon" },
    { time: "18:00", phase: "Evening" },
    { time: "19:30", phase: "Evening" },
    { time: "21:00", phase: "Night" },
    { time: "22:30", phase: "Late" },
  ];

  const categoryStyles = {
    food: { icon: "utensils", color: "#d85431", position: "EAT" },
    culture: { icon: "landmark", color: "#8b4d9f", position: "CUL" },
    nature: { icon: "trees", color: "#26764b", position: "NAT" },
    shopping: { icon: "shopping-bag", color: "#c0446f", position: "SHP" },
    "theme park": { icon: "ticket", color: "#3768bd", position: "FUN" },
    "anime & games": { icon: "gamepad-2", color: "#7255bd", position: "ANI" },
    museum: { icon: "building-2", color: "#3f6f91", position: "MUS" },
    view: { icon: "binoculars", color: "#167a83", position: "VIEW" },
    experience: { icon: "sparkles", color: "#bc7020", position: "EXP" },
    relax: { icon: "waves", color: "#2a76a4", position: "SPA" },
    "day trip": { icon: "route", color: "#7a6333", position: "TRIP" },
    neighbourhood: { icon: "map-pinned", color: "#9b5c3e", position: "AREA" },
    art: { icon: "palette", color: "#a64e77", position: "ART" },
    entertainment: { icon: "sparkles", color: "#9b4fad", position: "FUN" },
    cruise: { icon: "ship", color: "#337c92", position: "BOAT" },
    flight: { icon: "plane", color: "#253c72", position: "FLT" },
    arrival: { icon: "house", color: "#4d6c59", position: "HOME" },
    logistics: { icon: "car-front", color: "#606b72", position: "MOVE" },
    landmark: { icon: "landmark", color: "#8d573c", position: "LAND" },
  };

  const regionLabels = {
    current: "This day",
    tokyo: "Tokyo",
    hokkaido: "Hokkaido",
    narita: "Narita",
    all: "All Japan",
  };

  const elements = {
    workspace: document.getElementById("workspace"),
    gameweekNumber: document.getElementById("gameweekNumber"),
    gameweekDate: document.getElementById("gameweekDate"),
    gameweekLocation: document.getElementById("gameweekLocation"),
    dateRail: document.getElementById("dateRail"),
    dateBackButton: document.getElementById("dateBackButton"),
    dateForwardButton: document.getElementById("dateForwardButton"),
    previousDayButton: document.getElementById("previousDayButton"),
    nextDayButton: document.getElementById("nextDayButton"),
    fixtureLocation: document.getElementById("fixtureLocation"),
    fixtureTitle: document.getElementById("fixtureTitle"),
    fixtureHotel: document.getElementById("fixtureHotel"),
    eventCount: document.getElementById("eventCount"),
    dayHours: document.getElementById("dayHours"),
    conflictMetric: document.getElementById("conflictMetric"),
    conflictCount: document.getElementById("conflictCount"),
    dayAlert: document.getElementById("dayAlert"),
    draftBoard: document.getElementById("draftBoard"),
    draftRows: document.getElementById("draftRows"),
    draftBoardSummary: document.getElementById("draftBoardSummary"),
    overflowBench: document.getElementById("overflowBench"),
    activityList: document.getElementById("activityList"),
    poolCount: document.getElementById("poolCount"),
    totalActivityCount: document.getElementById("totalActivityCount"),
    poolRegionHint: document.getElementById("poolRegionHint"),
    ratingFilters: document.getElementById("ratingFilters"),
    ratingFilterCount: document.getElementById("ratingFilterCount"),
    clearRatingFilters: document.getElementById("clearRatingFilters"),
    searchInput: document.getElementById("searchInput"),
    clearSearchButton: document.getElementById("clearSearchButton"),
    regionFilter: document.getElementById("regionFilter"),
    categoryFilter: document.getElementById("categoryFilter"),
    favouritesOnly: document.getElementById("favouritesOnly"),
    customButton: document.getElementById("customButton"),
    overviewContent: document.getElementById("overviewContent"),
    saveState: document.getElementById("saveState"),
    undoButton: document.getElementById("undoButton"),
    exportCsvButton: document.getElementById("exportCsvButton"),
    exportJsonButton: document.getElementById("exportJsonButton"),
    printButton: document.getElementById("printButton"),
    resetButton: document.getElementById("resetButton"),
    detailDialog: document.getElementById("detailDialog"),
    detailContent: document.getElementById("detailContent"),
    editDialog: document.getElementById("editDialog"),
    editForm: document.getElementById("editForm"),
    editTitle: document.getElementById("editTitle"),
    editSubtitle: document.getElementById("editSubtitle"),
    editDate: document.getElementById("editDate"),
    editDuration: document.getElementById("editDuration"),
    editRemoveButton: document.getElementById("editRemoveButton"),
    customDialog: document.getElementById("customDialog"),
    customForm: document.getElementById("customForm"),
    toast: document.getElementById("toast"),
  };

  let history = [];
  let toastTimer = null;
  let saveTimer = null;
  let dragPayload = null;
  let state = loadState();

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function initialState() {
    return {
      dataRevision: 6,
      selectedDate: "2026-10-06",
      schedules: clone(DATA.starterSchedule),
      favourites: [],
      customActivities: [],
      filters: {
        query: "",
        region: "current",
        category: "all",
        favouritesOnly: false,
        minRatings: {},
      },
      overviewTab: "bench",
      mobilePanel: "squad",
    };
  }

  function loadState() {
    const base = initialState();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved || typeof saved !== "object") return base;
      const selectedDate = DATA.days.some((day) => day.date === saved.selectedDate) ? saved.selectedDate : base.selectedDate;
      const savedSchedules = saved.schedules && typeof saved.schedules === "object" ? saved.schedules : base.schedules;
      const schedules = {};
      Object.entries(savedSchedules).forEach(([date, entries]) => {
        if (!Array.isArray(entries)) return;
        schedules[date] = entries.map((entry, index) => ({
          ...entry,
          uid: entry.uid || entry.id || `migrated-${date}-${index}`,
        }));
      });

      if (Number(saved.dataRevision || 1) < 2) {
        // Reconcile the original starter picks after the 6 October transfer was confirmed.
        Object.keys(schedules).forEach((date) => {
          schedules[date] = schedules[date].filter((entry) => entry.uid !== "starter-kawatoyo" && entry.uid !== "starter-nikko-breakfast");
        });
        if (!Array.isArray(schedules["2026-10-06"])) schedules["2026-10-06"] = [];
        schedules["2026-10-06"].push(clone(DATA.starterSchedule["2026-10-06"][0]));
      }
      if (Number(saved.dataRevision || 1) < 3) {
        Object.keys(schedules).forEach((date) => {
          schedules[date] = schedules[date].filter((entry) => entry.activityId !== "tokyo-disneyland" && entry.uid !== "starter-disneyland");
        });
        if (!Array.isArray(schedules["2026-10-18"])) schedules["2026-10-18"] = [];
        schedules["2026-10-18"].push(clone(DATA.starterSchedule["2026-10-18"][0]));
      }
      if (Number(saved.dataRevision || 1) < 4) {
        const existing = new Set(Object.values(schedules).flat().map((entry) => entry.activityId));
        Object.entries(DATA.logisticsSchedule || {}).forEach(([date, entries]) => {
          if (!Array.isArray(schedules[date])) schedules[date] = [];
          entries.forEach((entry) => {
            if (!existing.has(entry.activityId)) schedules[date].push(clone(entry));
          });
        });
      }
      if (Number(saved.dataRevision || 1) < 5) {
        const moved = [];
        Object.keys(schedules).forEach((date) => {
          schedules[date] = schedules[date].filter((entry) => {
            if (entry.activityId !== "checkin-mercure") return true;
            moved.push({ ...entry, notes: String(entry.notes || "").replace(
              "Recorded booking starts 7 October, but you fly to Sapporo on the 6th: confirm the extra night or corrected booking date.",
              "Stay confirmed: 6-14 October (8 nights). Arrival time remains estimated."
            ) });
            return false;
          });
        });
        if (moved.length) (schedules["2026-10-06"] ||= []).push(...moved);
        Object.values(schedules).flat().forEach((entry) => {
          if (entry.activityId === "bus-cts-sapporo") entry.notes = String(entry.notes || "").replace(
            "Accommodation for the night of 6 October still needs confirmation.",
            "Grand Mercure check-in confirmed for 6 October."
          );
        });
      }
      if (Number(saved.dataRevision || 1) < 6) {
        const bus = DATA.activities.find((activity) => activity.id === "bus-ikebukuro-narita");
        const oldNote = "05:00-07:30 is a provisional door-to-door allowance including travel from Hisoca to the boarding stop. Select an actual operating service that reaches Terminal 2 in time for MH089 at 10:05 and airline check-in requirements. A direct Hisoca pickup and a 05:00 bus departure are not assumed; use rail or taxi if no suitable early bus is available.";
        if (bus) Object.values(schedules).flat().forEach((entry) => {
          if (entry.activityId === bus.id) entry.notes = String(entry.notes || "").replace(oldNote, bus.note);
        });
      }
      return {
        ...base,
        ...saved,
        dataRevision: 6,
        selectedDate,
        schedules,
        favourites: Array.isArray(saved.favourites) ? saved.favourites : [],
        customActivities: Array.isArray(saved.customActivities) ? saved.customActivities : [],
        filters: { ...base.filters, ...(saved.filters || {}), minRatings: normalizeMinRatings(saved.filters?.minRatings) },
        overviewTab: ["bench", "stays", "budget"].includes(saved.overviewTab) ? saved.overviewTab : "bench",
        mobilePanel: ["market", "squad", "manager"].includes(saved.mobilePanel) ? saved.mobilePanel : "squad",
      };
    } catch (error) {
      return base;
    }
  }

  function persist() {
    elements.saveState.classList.add("saving");
    elements.saveState.innerHTML = `${icon("loader-circle")} Saving`;
    refreshIcons(elements.saveState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        elements.saveState.classList.remove("saving");
        elements.saveState.innerHTML = `${icon("hard-drive")} Saved`;
        refreshIcons(elements.saveState);
      }, 260);
    } catch (error) {
      elements.saveState.classList.remove("saving");
      elements.saveState.textContent = "Memory only";
    }
  }

  function commit(message, mutator) {
    history.push(clone(state));
    if (history.length > MAX_HISTORY) history.shift();
    mutator();
    persist();
    renderAll();
    if (message) showToast(message);
  }

  function undo() {
    if (!history.length) return;
    state = history.pop();
    persist();
    renderAll();
    showToast("Last draft change undone.");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function icon(name) {
    return `<i data-lucide="${name}" aria-hidden="true"></i>`;
  }

  function refreshIcons(root) {
    if (!window.lucide || !window.lucide.createIcons) return;
    try {
      window.lucide.createIcons({
        attrs: { "aria-hidden": "true" },
        ...(root ? { root } : {}),
      });
    } catch (error) {
      window.lucide.createIcons({ attrs: { "aria-hidden": "true" } });
    }
  }

  function styleFor(category) {
    return categoryStyles[String(category || "").toLowerCase()] || {
      icon: "sparkles",
      color: "#596b75",
      position: "PLAY",
    };
  }

  function dayByDate(date) {
    return DATA.days.find((day) => day.date === date);
  }

  function allActivities() {
    return [...DATA.activities, ...state.customActivities];
  }

  function activityById(id) {
    return allActivities().find((activity) => activity.id === id);
  }

  function scheduleFor(date) {
    return Array.isArray(state.schedules[date]) ? state.schedules[date] : [];
  }

  function lockedFor(date) {
    return DATA.lockedItems.filter((item) => item.date === date);
  }

  function findScheduled(activityId) {
    for (const day of DATA.days) {
      const entry = scheduleFor(day.date).find((item) => item.activityId === activityId);
      if (entry) return { date: day.date, entry };
    }
    return null;
  }

  function findEntry(uid, preferredDate) {
    if (preferredDate) {
      const entry = scheduleFor(preferredDate).find((item) => item.uid === uid);
      if (entry) return { date: preferredDate, entry };
    }
    for (const day of DATA.days) {
      const entry = scheduleFor(day.date).find((item) => item.uid === uid);
      if (entry) return { date: day.date, entry };
    }
    return null;
  }

  function isAllowed(activity, date) {
    const day = dayByDate(date);
    return Boolean(day && day.allowedRegions.includes(activity.region) && (!activity.fixedDate || activity.fixedDate === date));
  }

  function isUniqueActivity(activityId) {
    return DATA.floatingItems.some((item) => item.activityId === activityId);
  }

  function timeToMinutes(time) {
    const match = String(time || "").match(/^(\d{1,2}):(\d{2})/);
    if (!match) return 0;
    return Number(match[1]) * 60 + Number(match[2]);
  }

  function minutesToTime(total) {
    const safe = ((Math.round(total) % 1440) + 1440) % 1440;
    return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
  }

  function durationForLocked(item) {
    const start = timeToMinutes(item.start);
    let end = timeToMinutes(item.end);
    if (String(item.end).includes("+1") || end < start) end += 1440;
    return Math.max(15, end - start);
  }

  function formatDuration(minutes, compact) {
    const value = Number(minutes) || 0;
    if (value >= 600 && value % 60 === 0) return compact ? `${value / 60}h` : `${value / 60} hours`;
    const hours = Math.floor(value / 60);
    const mins = value % 60;
    if (!hours) return `${mins}m`;
    if (!mins) return compact ? `${hours}h` : `${hours} hour${hours === 1 ? "" : "s"}`;
    return `${hours}h ${mins}m`;
  }

  function formatAud(value) {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 2,
    }).format(value);
  }

  function mapUrl(query) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || "Japan")}`;
  }

  function currentDay() {
    return dayByDate(state.selectedDate) || DATA.days[0];
  }

  function regionCode(day) {
    if (!day.allowedRegions.length) return "PER";
    if (day.allowedRegions.length > 1) return "XFER";
    return { tokyo: "TYO", hokkaido: "CTS", narita: "NRT" }[day.allowedRegions[0]] || "JPN";
  }

  function entryInterval(entry) {
    return {
      uid: entry.uid,
      start: timeToMinutes(entry.start),
      end: timeToMinutes(entry.start) + Number(entry.duration || 0),
    };
  }

  function conflictUids(entries) {
    const conflicts = new Set();
    const intervals = entries.map(entryInterval).filter((item) => item.end > item.start);
    for (let i = 0; i < intervals.length; i += 1) {
      for (let j = i + 1; j < intervals.length; j += 1) {
        if (intervals[i].start < intervals[j].end && intervals[j].start < intervals[i].end) {
          conflicts.add(intervals[i].uid);
          conflicts.add(intervals[j].uid);
        }
      }
    }
    return conflicts;
  }

  function normalizedEntries(date) {
    const flexible = scheduleFor(date)
      .map((entry) => {
        const activity = activityById(entry.activityId);
        if (!activity) return null;
        return {
          kind: "scheduled",
          uid: entry.uid,
          activityId: activity.id,
          title: activity.title,
          area: activity.area,
          category: activity.category,
          start: entry.start,
          duration: Number(entry.duration || activity.duration),
          notes: entry.notes || "",
          activity,
        };
      })
      .filter(Boolean);

    const locked = lockedFor(date).map((item) => ({
      kind: "locked",
      uid: `locked-${item.id}`,
      lockedId: item.id,
      title: item.title,
      area: item.subtitle,
      category: item.category,
      start: item.start,
      duration: durationForLocked(item),
      end: item.end,
      notes: item.subtitle,
    }));

    return [...flexible, ...locked].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
  }

  function assignDraftBoard(entries) {
    const rows = draftSlots.map((slot, index) => ({ ...slot, index, entry: null, starts: [], blockedBy: [] }));
    const overflow = [];

    entries
      .slice()
      .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
      .forEach((entry) => {
        const entryStart = timeToMinutes(entry.start);
        const entryEnd = entryStart + Number(entry.duration || 0);
        const earlierRows = rows.filter((row) => timeToMinutes(row.time) <= entryStart);
        const startRow = earlierRows.length ? earlierRows[earlierRows.length - 1] : rows[0];
        startRow.starts.push(entry);

        rows.forEach((row) => {
          const rowTime = timeToMinutes(row.time);
          if (row.index > startRow.index && rowTime < entryEnd) row.blockedBy.push(entry);
        });
      });

    rows.forEach((row) => {
      row.entry = row.starts[0] || null;
      if (row.starts.length > 1) overflow.push(...row.starts.slice(1));
    });

    return { rows, overflow };
  }

  function endMinutesForEntry(entry) {
    return timeToMinutes(entry.start) + Number(entry.duration || 0);
  }

  function endLabelForEntry(entry) {
    if (entry.end) return entry.end;
    const endMinutes = endMinutesForEntry(entry);
    return `${minutesToTime(endMinutes)}${endMinutes >= 1440 ? " +1" : ""}`;
  }

  function overlappingEntries(date, start, duration, excludedUid) {
    const candidateStart = timeToMinutes(start);
    const candidateEnd = candidateStart + Number(duration || 0);
    return normalizedEntries(date).filter((entry) => {
      if (entry.uid === excludedUid) return false;
      return candidateStart < endMinutesForEntry(entry) && timeToMinutes(entry.start) < candidateEnd;
    });
  }

  function nextOpenTime(date, activity) {
    const defaultStart = timeToMinutes(activity.defaultStart || "10:00");
    const duration = Number(activity.duration || 90);
    const entries = normalizedEntries(date);
    let candidate = defaultStart;
    for (let attempts = 0; attempts < 32; attempts += 1) {
      const end = candidate + duration;
      const blocked = entries.some((entry) => {
        const startOther = timeToMinutes(entry.start);
        const endOther = startOther + Number(entry.duration || 0);
        return candidate < endOther && startOther < end;
      });
      if (!blocked) return minutesToTime(candidate);
      candidate += 30;
    }
    return activity.defaultStart || "10:00";
  }

  function renderCategoryOptions() {
    const categories = [...new Set(allActivities().map((activity) => activity.category))].sort((a, b) => a.localeCompare(b));
    elements.categoryFilter.innerHTML = [
      `<option value="all">All types</option>`,
      ...categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`),
    ].join("");
    if (categories.includes(state.filters.category)) {
      elements.categoryFilter.value = state.filters.category;
    } else {
      state.filters.category = "all";
      elements.categoryFilter.value = "all";
    }
  }

  function renderDates() {
    elements.dateRail.innerHTML = DATA.days
      .map((day, index) => {
        const count = scheduleFor(day.date).length + lockedFor(day.date).length;
        const active = day.date === state.selectedDate;
        return `
          <button class="date-chip${active ? " active" : ""}" type="button" data-date="${day.date}" draggable="false" aria-current="${active ? "date" : "false"}" title="${escapeHtml(day.label)} · ${escapeHtml(day.location)}">
            <span class="gw">Day ${String(index + 1).padStart(2, "0")}</span>
            <strong>${escapeHtml(day.short)}</strong>
            <small>${regionCode(day)}</small>
            ${count ? `<span class="date-count">${count}</span>` : ""}
            ${day.recommendedForDisney ? `<span class="recommended-star" title="Recommended Disneyland day">${icon("star")}</span>` : ""}
          </button>`;
      })
      .join("");

    requestAnimationFrame(() => {
      const active = elements.dateRail.querySelector(".date-chip.active");
      if (active) active.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    });
  }

  function draftStatusHtml(entry, hasConflict) {
    if (hasConflict) return `<span class="draft-status clash">${icon("triangle-alert")} Clash</span>`;
    if (entry.kind === "locked") return `<span class="draft-status locked">${icon("lock")} Locked</span>`;
    if (entry.activityId === "tokyo-disneyland") return `<span class="draft-status paid">${icon("circle-check")} Paid</span>`;
    if (entry.notes) return `<span class="draft-status noted">${icon("notebook-pen")} Notes</span>`;
    return `<span class="draft-status picked">${icon("check")} Picked</span>`;
  }

  function draftRowHtml(row, conflicts) {
    const pickNumber = String(row.index + 1).padStart(2, "0");
    const entry = row.entry;
    if (!entry && row.blockedBy.length) {
      const blockers = row.blockedBy.slice().sort((a, b) => endMinutesForEntry(b) - endMinutesForEntry(a));
      const blocker = blockers[0];
      const style = styleFor(blocker.category);
      const locked = blocker.kind === "locked";
      const actionAttrs = locked
        ? `data-locked-id="${escapeHtml(blocker.lockedId)}"`
        : `data-edit-player data-uid="${escapeHtml(blocker.uid)}" data-from-date="${state.selectedDate}"`;
      const endLabel = endLabelForEntry(blocker);
      return `
        <tr class="draft-row blocked${blockers.length > 1 ? " has-clash" : ""}" data-blocked="true" data-blocked-title="${escapeHtml(blocker.title)}" data-blocked-until="${escapeHtml(endLabel)}">
          <td class="draft-pick-cell"><strong>#${pickNumber}</strong><span>${escapeHtml(row.phase)}</span></td>
          <td class="draft-time-cell"><span class="draft-suggested-time">${row.time}</span></td>
          <td colspan="4" class="blocked-draft-cell">
            <div class="blocked-draft-banner" style="--category:${style.color}">
              <span class="blocked-icon">${icon("lock-keyhole")}</span>
              <span><strong>Blocked until ${escapeHtml(endLabel)}</strong><small>${escapeHtml(blocker.title)} is still in progress${blockers.length > 1 ? ` · ${blockers.length} overlapping picks` : ""}</small></span>
            </div>
          </td>
          <td class="draft-action-col draft-action-cell"><button type="button" class="icon-button draft-edit" ${actionAttrs} aria-label="Open blocking activity" title="Open blocking activity">${icon("info")}</button></td>
        </tr>`;
    }
    if (!entry) {
      return `
        <tr class="draft-row empty" data-slot-time="${row.time}">
          <td class="draft-pick-cell"><strong>#${pickNumber}</strong><span>${escapeHtml(row.phase)}</span></td>
          <td class="draft-time-cell"><span class="draft-suggested-time">${row.time}</span></td>
          <td colspan="4" class="empty-draft-cell">
            <button type="button" class="empty-draft-pick" data-empty-slot data-slot-time="${row.time}">
              ${icon("plus")}<span><strong>Open pick</strong><small>Drop an activity here to start at ${row.time}</small></span>
            </button>
          </td>
          <td class="draft-action-cell"></td>
        </tr>`;
    }

    const style = styleFor(entry.category);
    const locked = entry.kind === "locked";
    const hasConflict = conflicts.has(entry.uid);
    const attrs = locked
      ? `data-locked-id="${escapeHtml(entry.lockedId)}"`
      : `data-edit-player data-uid="${escapeHtml(entry.uid)}" data-from-date="${state.selectedDate}" draggable="true"`;
    const area = entry.activity ? entry.activity.area : entry.area;
    const cost = entry.activity ? entry.activity.cost : "Fixed booking";
    return `
      <tr class="draft-row filled${hasConflict ? " has-clash" : ""}${locked ? " is-locked" : ""}${row.blockedBy.length ? " shares-window" : ""}" data-slot-time="${row.time}">
        <td class="draft-pick-cell"><strong>#${pickNumber}</strong><span>${escapeHtml(row.phase)}</span></td>
        <td class="draft-time-cell">
          ${locked
            ? `<span class="locked-time">${icon("lock")} ${escapeHtml(entry.start)}</span>`
            : `<input type="time" value="${escapeHtml(entry.start)}" data-inline-time data-uid="${escapeHtml(entry.uid)}" data-from-date="${state.selectedDate}" aria-label="Start time for ${escapeHtml(entry.title)}">`}
        </td>
        <td class="draft-selection-cell">
          <button type="button" class="draft-selection" style="--category:${style.color}" ${attrs} title="Open ${escapeHtml(entry.title)}">
            <span class="draft-type-icon">${icon(style.icon)}</span>
            <span class="draft-selection-copy">
              <strong>${escapeHtml(entry.title)}</strong>
              <small>${escapeHtml(entry.category)} · ${escapeHtml(cost || "Cost TBD")}</small>
            </span>
            ${entry.activityId === "tokyo-disneyland" ? `<span class="draft-paid-mark" title="Paid booking">Paid</span>` : ""}
          </button>
        </td>
        <td class="draft-area-col draft-area-cell" title="${escapeHtml(area)}">${icon("map-pin")}<span>${escapeHtml(area)}</span></td>
        <td class="draft-duration-col draft-duration-cell"><strong>${formatDuration(entry.duration, true)}</strong><small>to ${escapeHtml(endLabelForEntry(entry))}</small></td>
        <td class="draft-status-col">${draftStatusHtml(entry, hasConflict)}</td>
        <td class="draft-action-col draft-action-cell">
          <button type="button" class="icon-button draft-edit" ${locked ? `data-locked-id="${escapeHtml(entry.lockedId)}"` : `data-edit-player data-uid="${escapeHtml(entry.uid)}" data-from-date="${state.selectedDate}"`} aria-label="${locked ? "View locked booking" : "Edit activity"}" title="${locked ? "View locked booking" : "Edit activity"}">${icon(locked ? "info" : "pencil")}</button>
        </td>
      </tr>`;
  }

  function renderDraftBoard(entries, conflicts) {
    const draft = assignDraftBoard(entries);
    const draftedCount = entries.length;
    const blockedCount = draft.rows.filter((row) => !row.entry && row.blockedBy.length).length;
    const openCount = draft.rows.filter((row) => !row.entry && !row.blockedBy.length).length;
    elements.draftBoardSummary.textContent = `${draftedCount} pick${draftedCount === 1 ? "" : "s"} · ${blockedCount} blocked · ${openCount} open${draft.overflow.length ? ` · ${draft.overflow.length} reserve` : ""}`;
    elements.draftBoard.classList.toggle("complete", openCount === 0);
    elements.draftRows.innerHTML = draft.rows.map((row) => draftRowHtml(row, conflicts)).join("");

    const benchEntries = draft.overflow;
    const emptyCount = Math.max(0, 4 - benchEntries.length);
    elements.overflowBench.innerHTML = [
      ...benchEntries.map((entry) => {
        const style = styleFor(entry.category);
        const attrs = entry.kind === "locked"
          ? `data-locked-id="${escapeHtml(entry.lockedId)}"`
          : `data-edit-player data-uid="${escapeHtml(entry.uid)}" data-from-date="${state.selectedDate}" draggable="true"`;
        return `
          <button type="button" class="sub-card" style="--category:${style.color}" ${attrs} title="${escapeHtml(entry.title)}">
            <span>${icon(style.icon)}</span>
            <span><strong>${escapeHtml(entry.title)}</strong><small>${escapeHtml(entry.start)} · ${formatDuration(entry.duration, true)}</small></span>
          </button>`;
      }),
      ...Array.from({ length: emptyCount }, () => `<div class="sub-empty">Open reserve</div>`),
    ].join("");
  }

  function renderFixture() {
    const day = currentDay();
    const dayIndex = DATA.days.findIndex((item) => item.date === day.date);
    const entries = normalizedEntries(day.date);
    const conflicts = conflictUids(entries);
    const totalMinutes = entries.reduce((sum, entry) => sum + Number(entry.duration || 0), 0);

    elements.gameweekNumber.textContent = `Trip day ${String(dayIndex + 1).padStart(2, "0")}`;
    elements.gameweekDate.textContent = day.short;
    elements.gameweekLocation.textContent = day.location;
    elements.fixtureLocation.textContent = day.location;
    elements.fixtureTitle.textContent = day.label;
    elements.fixtureHotel.textContent = day.lodging;
    elements.eventCount.textContent = String(entries.length);
    elements.dayHours.textContent = (totalMinutes / 60).toFixed(totalMinutes % 60 ? 1 : 0);
    elements.conflictCount.textContent = String(conflicts.size);
    elements.conflictMetric.classList.toggle("has-conflict", conflicts.size > 0);
    elements.previousDayButton.disabled = dayIndex <= 0;
    elements.nextDayButton.disabled = dayIndex >= DATA.days.length - 1;

    elements.dayAlert.hidden = !day.alert;
    const alertText = elements.dayAlert.querySelector("span");
    if (alertText) alertText.textContent = day.alert || "";

    renderDraftBoard(entries, conflicts);
  }

  function normalizeMinRatings(value) {
    const result = {};
    for (const key of ["accessibility", "autumn", "fun", "novelty", "lifetime"]) {
      const number = Number(value?.[key]);
      result[key] = Number.isFinite(number) ? Math.max(0, Math.min(10, Math.floor(number))) : 0;
    }
    return result;
  }

  function meetsMinimumRatings(activity) {
    const minimums = state.filters.minRatings || {};
    const scores = window.ACTIVITY_RATINGS?.rate(activity).scores || {};
    const accessibility = window.ACCESSIBILITY_RATINGS?.rate(activity).score;
    return Object.entries(normalizeMinRatings(minimums)).every(([key, minimum]) =>
      minimum === 0 || (key === "accessibility" ? accessibility : scores[key]) >= minimum
    );
  }

  function filteredActivities() {
    const day = currentDay();
    const query = state.filters.query.trim().toLowerCase();
    const allowed = new Set(day.allowedRegions);
    return allActivities()
      .filter((activity) => {
        if (state.filters.region === "current" && !allowed.has(activity.region)) return false;
        if (!["current", "all"].includes(state.filters.region) && activity.region !== state.filters.region) return false;
        if (state.filters.category !== "all" && activity.category !== state.filters.category) return false;
        if (state.filters.favouritesOnly && !state.favourites.includes(activity.id)) return false;
        if (!meetsMinimumRatings(activity)) return false;
        if (!query) return true;
        const haystack = [activity.title, activity.area, activity.category, activity.cost, activity.note, ...(activity.tags || [])]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      })
      .sort((a, b) => {
        const favDifference = Number(state.favourites.includes(b.id)) - Number(state.favourites.includes(a.id));
        if (favDifference) return favDifference;
        const ratingDifference = Number(b.rating || 0) - Number(a.rating || 0);
        if (ratingDifference) return ratingDifference;
        const distanceDifference = Number(a.outsideCore) - Number(b.outsideCore);
        if (distanceDifference) return distanceDifference;
        return a.title.localeCompare(b.title);
      });
  }

  function activityScoresHtml(activity, detailed = false) {
    const ratings = window.ACTIVITY_RATINGS;
    if (!ratings) return "";
    const result = ratings.rate(activity);
    return `<div class="activity-scores${detailed ? " detailed" : ""}" aria-label="Subjective activity ratings out of 10">
      ${ratings.metrics.map((metric) => `<div class="activity-score score-${metric.key}" title="${escapeHtml(metric.description)} ${escapeHtml(result.basis)}.">
        <span>${icon(metric.icon)}${escapeHtml(metric.label)}</span><strong>${result.scores[metric.key]}<small>/10</small></strong>
      </div>`).join("")}
    </div>${detailed ? `<p class="score-basis">Subjective trip ratings. ${escapeHtml(result.basis)}. ${escapeHtml(result.season)} Fun and novelty depend on personal interests; these are separate from Tabelog reviews.</p>` : ""}`;
  }

  function transferCardHtml(activity) {
    const style = styleFor(activity.category);
    const favourite = state.favourites.includes(activity.id);
    return `
      <article class="transfer-card" style="--category:${style.color}" draggable="true" data-activity-id="${escapeHtml(activity.id)}">
        <div class="scout-kit" aria-hidden="true">${icon(style.icon)}</div>
        <div class="scout-copy">
          <div class="scout-topline">
            <span class="scout-position">${style.position}</span>
            ${activity.rating ? `<span class="rating">${icon("star")} ${escapeHtml(activity.rating.toFixed(2))}</span>` : ""}
          </div>
          <h3 title="${escapeHtml(activity.title)}">${escapeHtml(activity.title)}</h3>
          <span class="scout-location">${icon("map-pin")} ${escapeHtml(activity.area || regionLabels[activity.region])}</span>
          <span class="scout-value">${icon("clock-3")} ${formatDuration(activity.duration, true)} · ${escapeHtml(activity.cost || "Cost TBD")}</span>
        </div>
        <div class="scout-actions">
          <button class="icon-button favourite${favourite ? " active" : ""}" type="button" data-action="favourite" aria-label="${favourite ? "Remove from saved" : "Save activity"}" title="${favourite ? "Remove from saved" : "Save activity"}">${icon("heart")}</button>
          <button class="icon-button" type="button" data-action="details" aria-label="View details" title="View details">${icon("info")}</button>
          <button class="icon-button add-player" type="button" data-action="add" aria-label="Add to selected trip day" title="Add to selected trip day">${icon("plus")}</button>
        </div>
        ${activityScoresHtml(activity)}
        ${accessibilityHtml(activity)}
      </article>`;
  }

  function accessibilityHtml(activity, detailed = false) {
    if (!window.ACCESSIBILITY_RATINGS) return "";
    const info = window.ACCESSIBILITY_RATINGS.rate(activity);
    return `<div class="accessibility-rating" title="${escapeHtml(info.note)}">
      <div class="accessibility-score"><span>${icon("footprints")} Accessibility <small>(estimate)</small></span><strong>${info.score}<small>/10</small></strong></div>
      ${detailed ? `<p class="score-basis">${escapeHtml(info.note)}</p>` : ""}
    </div>`;
  }

  function renderMarket() {
    const minimums = normalizeMinRatings(state.filters.minRatings);
    const activeRatings = Object.values(minimums).filter((value) => value > 0).length;
    elements.ratingFilterCount.textContent = activeRatings ? `${activeRatings} active` : "Any score";
    elements.clearRatingFilters.disabled = activeRatings === 0;
    elements.ratingFilters.querySelectorAll("select[data-min-rating]").forEach((select) => {
      if (!select.options.length) select.innerHTML = `<option value="0">Any score</option>${Array.from({length: 10}, (_, i) => `<option value="${i + 1}">${i + 1}/10 or higher</option>`).join("")}`;
      select.value = String(minimums[select.dataset.minRating]);
    });
    elements.totalActivityCount.textContent = allActivities().length.toLocaleString("en-AU");
    const activities = filteredActivities();
    const visible = activities;
    const regionName = state.filters.region === "current" ? currentDay().location : regionLabels[state.filters.region];
    elements.poolCount.textContent = `${activities.length} of ${allActivities().length} options`;
    elements.poolRegionHint.textContent = regionName;
    elements.searchInput.value = state.filters.query;
    elements.clearSearchButton.hidden = !state.filters.query;
    elements.favouritesOnly.checked = state.filters.favouritesOnly;
    elements.categoryFilter.value = state.filters.category;

    elements.regionFilter.querySelectorAll("button[data-region]").forEach((button) => {
      button.classList.toggle("active", button.dataset.region === state.filters.region);
    });

    if (!visible.length) {
      elements.activityList.innerHTML = `
        <div class="market-empty">
          ${icon("search-x")}
          <strong>No activities found</strong>
          <span>Try lower minimum ratings, another region, or a different search.</span>
        </div>`;
      return;
    }
    elements.activityList.innerHTML = visible.map(transferCardHtml).join("");
  }

  function floatingBenchHtml() {
    const cards = DATA.floatingItems.map((item) => {
      const activity = activityById(item.activityId);
      if (!activity) return "";
      const existing = findScheduled(activity.id);
      const style = styleFor(activity.category);
      let controls;
      if (existing) {
        const scheduledDay = dayByDate(existing.date);
        controls = `
          <span class="signed-badge">${icon("circle-check")} Selected for ${escapeHtml(scheduledDay.short)}</span>
          <div class="suggested-dates">
            <button type="button" data-open-date="${existing.date}">Open trip day</button>
            <button type="button" data-edit-uid="${escapeHtml(existing.entry.uid)}" data-edit-date="${existing.date}">Edit pick</button>
          </div>`;
      } else {
        controls = `
          <div class="suggested-dates">
            ${item.suggestedDates.map((date) => {
              const day = dayByDate(date);
              return `<button type="button" class="${day.recommendedForDisney ? "recommended" : ""}" data-bench-schedule="${escapeHtml(activity.id)}" data-target-date="${date}">${day.recommendedForDisney ? `${icon("star")} ` : ""}${escapeHtml(day.short)}</button>`;
            }).join("")}
          </div>`;
      }
      return `
        <article class="bench-card">
          <div class="bench-card-head">
            <span style="background:${style.color}">${icon(style.icon)}</span>
            <div><strong>${escapeHtml(activity.title)}</strong><small>${escapeHtml(item.label)}</small></div>
          </div>
          <div class="bench-card-body">
            <p>${escapeHtml(item.detail)}</p>
            ${controls}
          </div>
        </article>`;
    }).join("");

    const day = currentDay();
    const note = day.alert
      ? `<article class="day-note-card"><strong>${icon("clipboard-check")} Manager note</strong><p>${escapeHtml(day.alert)}</p></article>`
      : `<article class="day-note-card"><strong>${icon("circle-check")} Day clear</strong><p>No locked warning for this day. Build the itinerary from the activity pool.</p></article>`;

    return `
      <div class="manager-section-title"><strong>Paid &amp; unresolved</strong><span>${DATA.floatingItems.length} open items</span></div>
      ${cards}
      <div class="manager-section-title"><strong>Current fixture</strong><span>${escapeHtml(day.short)}</span></div>
      ${note}`;
  }

  function staysHtml() {
    return `
      <div class="manager-section-title"><strong>Locked stays</strong><span>${DATA.hotels.length} paid</span></div>
      ${DATA.hotels.map((hotel) => `
        <article class="stay-card">
          <div class="stay-card-top"><h3>${escapeHtml(hotel.name)}</h3><span class="paid-pill">${escapeHtml(hotel.status)}</span></div>
          <span>${escapeHtml(hotel.dates)}</span>
          <p>${escapeHtml(hotel.people)}</p>
          <div class="stay-actions">
            <a href="${mapUrl(hotel.mapQuery)}" target="_blank" rel="noopener">${icon("map-pin")} Map</a>
            <a href="${escapeHtml(hotel.sourceUrl)}" target="_blank" rel="noopener">${icon("external-link")} Hotel</a>
          </div>
        </article>`).join("")}`;
  }

  function budgetHtml() {
    const workbook = DATA.workbook;
    return `
      <div class="manager-section-title"><strong>Trip budget</strong><span>Workbook totals</span></div>
      <article class="budget-card">
        <h3>Confirmed trip costs</h3>
        <div class="budget-total"><span>Grand total</span><strong>${formatAud(workbook.totalAud)}</strong></div>
        <div class="budget-row"><span>Business-class flights</span><strong>${formatAud(workbook.airfareAud)}</strong></div>
        <div class="budget-row"><span>Paid hotels</span><strong>${formatAud(workbook.hotelAud)}</strong></div>
        <div class="budget-row"><span>Car rental</span><strong>${formatAud(workbook.carRentalAud)}</strong></div>
        <div class="budget-row"><span>Disneyland paid</span><strong>JPY ${workbook.disneyJpy.toLocaleString("en-AU")}</strong></div>
      </article>
      <article class="payer-card"><span>Flora &amp; David</span><strong>${formatAud(workbook.floraDavidAud)}</strong></article>
      <article class="payer-card"><span>Helen</span><strong>${formatAud(workbook.helenAud)}</strong></article>`;
  }

  function renderOverview() {
    document.querySelectorAll("[data-overview-tab]").forEach((button) => {
      button.setAttribute("aria-selected", String(button.dataset.overviewTab === state.overviewTab));
    });
    if (state.overviewTab === "stays") elements.overviewContent.innerHTML = staysHtml();
    else if (state.overviewTab === "budget") elements.overviewContent.innerHTML = budgetHtml();
    else elements.overviewContent.innerHTML = floatingBenchHtml();
  }

  function renderMobileState() {
    elements.workspace.dataset.mobilePanel = state.mobilePanel;
    document.querySelectorAll("[data-mobile-target]").forEach((button) => {
      button.classList.toggle("active", button.dataset.mobileTarget === state.mobilePanel);
    });
  }

  function renderAll() {
    renderDates();
    renderFixture();
    renderMarket();
    renderOverview();
    renderMobileState();
    elements.undoButton.disabled = !history.length;
    refreshIcons();
  }

  function selectDate(date, moveToSquad) {
    if (!dayByDate(date)) return;
    state.selectedDate = date;
    if (moveToSquad) state.mobilePanel = "squad";
    persist();
    renderAll();
  }

  function changeDay(offset) {
    const index = DATA.days.findIndex((day) => day.date === state.selectedDate);
    const next = DATA.days[index + offset];
    if (next) selectDate(next.date, true);
  }

  function newUid(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function scheduleActivity(activityId, date, requestedTime) {
    const activity = activityById(activityId);
    const day = dayByDate(date);
    if (!activity || !day) return;
    if (!isAllowed(activity, date)) {
      showToast(`${activity.title} is not available for ${day.location}.`);
      return;
    }

    const existing = isUniqueActivity(activityId) ? findScheduled(activityId) : null;
    if (existing) {
      if (existing.date === date) {
        showToast(`${activity.title} is already on this draft board.`);
        if (date !== state.selectedDate) selectDate(date, true);
        return;
      }
      moveScheduled(existing.entry.uid, existing.date, date, requestedTime || activity.defaultStart);
      return;
    }

    const start = requestedTime || nextOpenTime(date, activity);
    const blockers = overlappingEntries(date, start, activity.duration);
    if (blockers.length) {
      const blocker = blockers.sort((a, b) => endMinutesForEntry(b) - endMinutesForEntry(a))[0];
      showToast(`${start} is blocked by ${blocker.title} until ${endLabelForEntry(blocker)}.`);
      return;
    }
    commit(`${activity.title} added to ${day.short}.`, () => {
      if (!Array.isArray(state.schedules[date])) state.schedules[date] = [];
      state.schedules[date].push({
        uid: newUid("pick"),
        activityId,
        start,
        duration: Number(activity.duration || 90),
        notes: "",
      });
      state.selectedDate = date;
    });
  }

  function moveScheduled(uid, fromDate, toDate, requestedTime) {
    const located = findEntry(uid, fromDate);
    if (!located) return;
    const activity = activityById(located.entry.activityId);
    const targetDay = dayByDate(toDate);
    if (!activity || !targetDay) return;
    if (!isAllowed(activity, toDate)) {
      showToast(`${activity.title} cannot play in ${targetDay.location}.`);
      return;
    }
    const start = requestedTime || located.entry.start;
    if (located.date === toDate && located.entry.start === start) return;
    const blockers = overlappingEntries(toDate, start, located.entry.duration, uid);
    if (blockers.length) {
      const blocker = blockers.sort((a, b) => endMinutesForEntry(b) - endMinutesForEntry(a))[0];
      showToast(`${start} is blocked by ${blocker.title} until ${endLabelForEntry(blocker)}.`);
      renderAll();
      return;
    }
    commit(`${activity.title} moved to ${targetDay.short} at ${start}.`, () => {
      state.schedules[located.date] = scheduleFor(located.date).filter((item) => item.uid !== uid);
      if (!Array.isArray(state.schedules[toDate])) state.schedules[toDate] = [];
      state.schedules[toDate].push({ ...located.entry, start });
      state.selectedDate = toDate;
    });
  }

  function removeScheduled(uid, date) {
    const located = findEntry(uid, date);
    if (!located) return;
    const activity = activityById(located.entry.activityId);
    commit(`${activity ? activity.title : "Activity"} removed from the draft.`, () => {
      state.schedules[located.date] = scheduleFor(located.date).filter((item) => item.uid !== uid);
    });
  }

  function toggleFavourite(activityId) {
    const activity = activityById(activityId);
    if (!activity) return;
    const isFavourite = state.favourites.includes(activityId);
    commit(isFavourite ? `${activity.title} removed from saved options.` : `${activity.title} added to saved options.`, () => {
      state.favourites = isFavourite
        ? state.favourites.filter((id) => id !== activityId)
        : [...state.favourites, activityId];
    });
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add("show");
    toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 2600);
  }

  function openDialog(dialog) {
    if (dialog.showModal) dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function closeDialog(dialog) {
    if (dialog.close) dialog.close();
    else dialog.removeAttribute("open");
  }

  function openActivityDetails(activityId) {
    const activity = activityById(activityId);
    if (!activity) return;
    const style = styleFor(activity.category);
    const current = currentDay();
    const existing = isUniqueActivity(activityId) ? findScheduled(activityId) : null;
    const favourite = state.favourites.includes(activity.id);
    let primaryAction;
    if (existing) {
      primaryAction = `<button type="button" class="button primary" data-detail-open-date="${existing.date}">${icon("table-2")} Open selected day</button>`;
    } else if (isAllowed(activity, current.date)) {
      primaryAction = `<button type="button" class="button primary" data-detail-add="${escapeHtml(activity.id)}">${icon("plus")} Add to day ${DATA.days.indexOf(current) + 1}</button>`;
    } else {
      primaryAction = `<button type="button" class="button primary" disabled>${icon("ban")} Not available this day</button>`;
    }
    elements.detailContent.innerHTML = `
      <div class="detail-hero" style="--category:${style.color}">
        <div class="detail-kit">${icon(style.icon)}</div>
        <div><p class="dialog-kicker">${escapeHtml(activity.category)} · ${escapeHtml(regionLabels[activity.region] || activity.region)}</p><h2>${escapeHtml(activity.title)}</h2><p>${escapeHtml(activity.area)}</p></div>
      </div>
      <div class="detail-chips">
        <span>${icon("clock-3")} ${formatDuration(activity.duration)}</span>
        <span>${icon("wallet-cards")} ${escapeHtml(activity.cost || "Cost TBD")}</span>
        ${activity.rating ? `<span>${icon("star")} Tabelog ${escapeHtml(activity.rating.toFixed(2))}</span>` : ""}
        ${activity.outsideCore ? `<span>${icon("route")} Outside main tourist core</span>` : ""}
      </div>
      ${activityScoresHtml(activity, true)}
      ${accessibilityHtml(activity, true)}
      <p class="detail-note">${escapeHtml(activity.note || "No scouting notes yet.")}</p>
      <div class="detail-links">
        <a href="${mapUrl(activity.mapQuery)}" target="_blank" rel="noopener">${icon("map-pin")} Open map</a>
        ${activity.sourceUrl ? `<a href="${escapeHtml(activity.sourceUrl)}" target="_blank" rel="noopener">${icon("external-link")} ${escapeHtml(activity.sourceLabel || "Source")}</a>` : ""}
        <button type="button" class="button secondary" data-detail-favourite="${escapeHtml(activity.id)}">${icon("heart")} ${favourite ? "Unsave" : "Save option"}</button>
      </div>
      <div class="dialog-actions">${primaryAction}</div>`;
    refreshIcons(elements.detailContent);
    openDialog(elements.detailDialog);
  }

  function openLockedDetails(lockedId) {
    const item = DATA.lockedItems.find((locked) => locked.id === lockedId);
    if (!item) return;
    const day = dayByDate(item.date);
    const style = styleFor(item.category);
    elements.detailContent.innerHTML = `
      <div class="detail-hero" style="--category:${style.color}">
        <div class="detail-kit">${icon(style.icon)}</div>
        <div><p class="dialog-kicker">Locked fixture</p><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(day.label)}</p></div>
      </div>
      <div class="detail-chips">
        <span>${icon("clock-3")} ${escapeHtml(item.start)} to ${escapeHtml(item.end)}</span>
        <span>${icon("lock")} Cannot be moved</span>
      </div>
      <p class="detail-note">${escapeHtml(item.subtitle)}</p>
      <div class="dialog-actions"><button type="button" class="button secondary" data-close-detail>Close</button></div>`;
    refreshIcons(elements.detailContent);
    openDialog(elements.detailDialog);
  }

  function openEditor(uid, date) {
    const located = findEntry(uid, date);
    if (!located) return;
    const activity = activityById(located.entry.activityId);
    if (!activity) return;
    const compatibleDays = DATA.days.filter((day) => day.allowedRegions.includes(activity.region));
    const form = elements.editForm.elements;
    elements.editTitle.textContent = activity.title;
    elements.editSubtitle.textContent = `${activity.category} · ${activity.area} · ${activity.cost || "Cost TBD"}`;
    form.uid.value = located.entry.uid;
    form.fromDate.value = located.date;
    elements.editDate.innerHTML = compatibleDays
      .map((day) => `<option value="${day.date}">${escapeHtml(day.short)} · ${escapeHtml(day.location)}</option>`)
      .join("");
    elements.editDate.value = located.date;
    form.start.value = located.entry.start;
    const choices = [...new Set([...durationChoices, Number(located.entry.duration)])].sort((a, b) => a - b);
    elements.editDuration.innerHTML = choices
      .map((duration) => `<option value="${duration}">${formatDuration(duration)}</option>`)
      .join("");
    elements.editDuration.value = String(located.entry.duration);
    form.notes.value = located.entry.notes || "";
    elements.editRemoveButton.dataset.uid = located.entry.uid;
    elements.editRemoveButton.dataset.date = located.date;
    openDialog(elements.editDialog);
  }

  function handleEditSubmit(event) {
    event.preventDefault();
    const formData = new FormData(elements.editForm);
    const uid = String(formData.get("uid"));
    const fromDate = String(formData.get("fromDate"));
    const toDate = String(formData.get("date"));
    const located = findEntry(uid, fromDate);
    if (!located) return;
    const activity = activityById(located.entry.activityId);
    if (!activity || !isAllowed(activity, toDate)) return;
    const start = String(formData.get("start"));
    const duration = Number(formData.get("duration"));
    const notes = String(formData.get("notes") || "").trim();
    const blockers = overlappingEntries(toDate, start, duration, uid);
    if (blockers.length) {
      const blocker = blockers.sort((a, b) => endMinutesForEntry(b) - endMinutesForEntry(a))[0];
      showToast(`${start} is blocked by ${blocker.title} until ${endLabelForEntry(blocker)}.`);
      return;
    }
    commit(`${activity.title} selection updated.`, () => {
      state.schedules[located.date] = scheduleFor(located.date).filter((item) => item.uid !== uid);
      if (!Array.isArray(state.schedules[toDate])) state.schedules[toDate] = [];
      state.schedules[toDate].push({ ...located.entry, start, duration, notes });
      state.selectedDate = toDate;
    });
    closeDialog(elements.editDialog);
  }

  function handleCustomSubmit(event) {
    event.preventDefault();
    const formData = new FormData(elements.customForm);
    const activity = {
      id: newUid("custom"),
      title: String(formData.get("title") || "").trim(),
      region: String(formData.get("region") || "tokyo"),
      area: String(formData.get("area") || "Area to confirm").trim(),
      category: String(formData.get("category") || "Experience"),
      duration: Number(formData.get("duration") || 90),
      defaultStart: String(formData.get("defaultStart") || "10:00"),
      cost: String(formData.get("cost") || "TBD").trim(),
      note: String(formData.get("note") || "User-created activity.").trim(),
      tags: ["custom"],
      sourceUrl: "",
      sourceLabel: "User added",
      mapQuery: `${String(formData.get("title") || "")}, ${String(formData.get("area") || "")}, Japan`,
      outsideCore: false,
    };
    if (!activity.title) {
      elements.customForm.elements.namedItem("title").focus();
      showToast("Enter a name for your activity.");
      return;
    }
    const scheduleNow = formData.get("scheduleNow") === "on";
    const regionAllowed = isAllowed(activity, state.selectedDate);
    const scheduleStart = scheduleNow && regionAllowed ? nextOpenTime(state.selectedDate, activity) : activity.defaultStart;
    const canSchedule = scheduleNow && regionAllowed &&
      timeToMinutes(scheduleStart) + activity.duration <= 1440 &&
      overlappingEntries(state.selectedDate, scheduleStart, activity.duration).length === 0;
    commit(`${activity.title} added to the activity pool.`, () => {
      state.customActivities.push(activity);
      // Reveal the new option even when the previous pool filters excluded it.
      state.filters = { query: activity.title, region: activity.region, category: "all", favouritesOnly: false, minRatings: {} };
      state.mobilePanel = "market";
      if (canSchedule) {
        if (!Array.isArray(state.schedules[state.selectedDate])) state.schedules[state.selectedDate] = [];
        state.schedules[state.selectedDate].push({
          uid: newUid("pick"),
          activityId: activity.id,
          start: scheduleStart,
          duration: activity.duration,
          notes: "",
        });
      }
    });
    renderCategoryOptions();
    elements.activityList.scrollTop = 0;
    elements.customForm.reset();
    closeDialog(elements.customDialog);
    if (scheduleNow && !canSchedule) showToast(regionAllowed
      ? `${activity.title} was added to the pool; there is no available time on this trip day.`
      : `${activity.title} was added to the pool; its region does not match this trip day.`);
  }

  function beginDrag(event, payload) {
    dragPayload = payload;
    const draggedElement = event.target.closest('[draggable="true"]');
    if (draggedElement) draggedElement.classList.add("dragging");
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = payload.type === "scheduled" ? "move" : "copy";
      event.dataTransfer.setData("application/json", JSON.stringify(payload));
      event.dataTransfer.setData("text/plain", payload.activityId || payload.uid || "activity");
    }
  }

  function readDragPayload(event) {
    if (event.dataTransfer) {
      try {
        const value = event.dataTransfer.getData("application/json");
        if (value) return JSON.parse(value);
      } catch (error) {
        return dragPayload;
      }
    }
    return dragPayload;
  }

  function clearDragState() {
    dragPayload = null;
    document.querySelectorAll(".dragging, .drag-over, .drag-denied").forEach((element) => {
      element.classList.remove("dragging", "drag-over", "drag-denied");
    });
  }

  function handleDrop(payload, date, time) {
    if (!payload) return;
    if (payload.type === "activity") scheduleActivity(payload.activityId, date, time);
    if (payload.type === "scheduled") moveScheduled(payload.uid, payload.fromDate, date, time);
    clearDragState();
  }

  function downloadBlob(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function csvCell(value) {
    return `"${String(value ?? "").replace(/"/g, '""')}"`;
  }

  function exportCsv() {
    const rows = [["Trip day", "Date", "Start", "Duration", "Activity", "Area", "Category", "Cost", "Status", "Notes"]];
    DATA.days.forEach((day, index) => {
      normalizedEntries(day.date).forEach((entry) => {
        rows.push([
          index + 1,
          day.date,
          entry.start,
          formatDuration(entry.duration),
          entry.title,
          entry.area,
          entry.category,
          entry.activity ? entry.activity.cost : "Locked",
          entry.kind === "locked" ? "Locked" : "Selected",
          entry.notes,
        ]);
      });
    });
    downloadBlob("japan-autumn-trip-draft.csv", rows.map((row) => row.map(csvCell).join(",")).join("\r\n"), "text/csv;charset=utf-8");
    showToast("Draft board downloaded as CSV.");
  }

  function exportJson() {
    downloadBlob(
      "japan-autumn-tour-backup.json",
      JSON.stringify({ app: "Autumn Draft Board", version: DATA.version, exportedAt: new Date().toISOString(), state }, null, 2),
      "application/json"
    );
    showToast("Planner backup downloaded.");
  }

  function bindEvents() {
    elements.dateRail.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-date]");
      if (button) selectDate(button.dataset.date, true);
    });

    elements.dateRail.addEventListener("dragover", (event) => {
      const button = event.target.closest("button[data-date]");
      if (!button || !dragPayload) return;
      event.preventDefault();
      button.classList.add("drag-over");
    });

    elements.dateRail.addEventListener("dragleave", (event) => {
      const button = event.target.closest("button[data-date]");
      if (button) button.classList.remove("drag-over");
    });

    elements.dateRail.addEventListener("drop", (event) => {
      const button = event.target.closest("button[data-date]");
      if (!button) return;
      event.preventDefault();
      const payload = readDragPayload(event);
      const activity = payload && activityById(payload.activityId);
      handleDrop(payload, button.dataset.date, activity ? activity.defaultStart : undefined);
    });

    elements.dateBackButton.addEventListener("click", () => elements.dateRail.scrollBy({ left: -330, behavior: "smooth" }));
    elements.dateForwardButton.addEventListener("click", () => elements.dateRail.scrollBy({ left: 330, behavior: "smooth" }));
    elements.previousDayButton.addEventListener("click", () => changeDay(-1));
    elements.nextDayButton.addEventListener("click", () => changeDay(1));

    elements.regionFilter.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-region]");
      if (!button) return;
      state.filters.region = button.dataset.region;
      persist();
      renderMarket();
      refreshIcons(elements.activityList);
    });

    elements.searchInput.addEventListener("input", () => {
      state.filters.query = elements.searchInput.value;
      renderMarket();
      refreshIcons(elements.activityList);
    });

    elements.clearSearchButton.addEventListener("click", () => {
      state.filters.query = "";
      elements.searchInput.focus();
      persist();
      renderMarket();
      refreshIcons(elements.activityList);
    });

    elements.categoryFilter.addEventListener("change", () => {
      state.filters.category = elements.categoryFilter.value;
      persist();
      renderMarket();
      refreshIcons(elements.activityList);
    });

    elements.ratingFilters.addEventListener("change", (event) => {
      const key = event.target.dataset.minRating;
      if (!key) return;
      state.filters.minRatings = normalizeMinRatings({ ...state.filters.minRatings, [key]: event.target.value });
      persist();
      renderMarket();
      refreshIcons(elements.activityList);
    });
    elements.clearRatingFilters.addEventListener("click", () => {
      state.filters.minRatings = {};
      persist();
      renderMarket();
      refreshIcons(elements.activityList);
    });

    elements.favouritesOnly.addEventListener("change", () => {
      state.filters.favouritesOnly = elements.favouritesOnly.checked;
      persist();
      renderMarket();
      refreshIcons(elements.activityList);
    });

    elements.activityList.addEventListener("click", (event) => {
      const action = event.target.closest("button[data-action]");
      const card = event.target.closest("[data-activity-id]");
      if (!action || !card) return;
      const activityId = card.dataset.activityId;
      if (action.dataset.action === "add") scheduleActivity(activityId, state.selectedDate);
      if (action.dataset.action === "details") openActivityDetails(activityId);
      if (action.dataset.action === "favourite") toggleFavourite(activityId);
    });

    elements.activityList.addEventListener("dblclick", (event) => {
      const card = event.target.closest("[data-activity-id]");
      if (card && !event.target.closest("button")) scheduleActivity(card.dataset.activityId, state.selectedDate);
    });

    elements.activityList.addEventListener("dragstart", (event) => {
      const card = event.target.closest("[data-activity-id]");
      if (!card) return;
      beginDrag(event, { type: "activity", activityId: card.dataset.activityId });
    });

    elements.draftRows.addEventListener("click", (event) => {
      const player = event.target.closest("[data-edit-player]");
      const locked = event.target.closest("[data-locked-id]");
      const empty = event.target.closest("[data-empty-slot]");
      if (player) openEditor(player.dataset.uid, player.dataset.fromDate);
      else if (locked) openLockedDetails(locked.dataset.lockedId);
      else if (empty) {
        state.mobilePanel = "market";
        renderMobileState();
        showToast(`Choose an activity, then drag it to pick ${empty.dataset.slotTime}.`);
      }
    });

    elements.draftRows.addEventListener("change", (event) => {
      const timeInput = event.target.closest("[data-inline-time]");
      if (!timeInput) return;
      moveScheduled(timeInput.dataset.uid, timeInput.dataset.fromDate, timeInput.dataset.fromDate, timeInput.value);
    });

    elements.draftRows.addEventListener("dragstart", (event) => {
      const player = event.target.closest("[data-edit-player]");
      if (!player) return;
      const located = findEntry(player.dataset.uid, player.dataset.fromDate);
      if (!located) return;
      beginDrag(event, {
        type: "scheduled",
        uid: player.dataset.uid,
        fromDate: player.dataset.fromDate,
        activityId: located.entry.activityId,
      });
    });

    elements.draftRows.addEventListener("dragover", (event) => {
      const row = event.target.closest("tr[data-slot-time]");
      if (!row || !dragPayload) return;
      event.preventDefault();
      row.classList.add("drag-over");
    });

    elements.draftRows.addEventListener("dragleave", (event) => {
      const row = event.target.closest("tr[data-slot-time]");
      if (row && !row.contains(event.relatedTarget)) row.classList.remove("drag-over");
    });

    elements.draftRows.addEventListener("drop", (event) => {
      const row = event.target.closest("tr[data-slot-time]");
      if (!row) return;
      event.preventDefault();
      event.stopPropagation();
      handleDrop(readDragPayload(event), state.selectedDate, row.dataset.slotTime);
    });

    elements.draftBoard.addEventListener("dragover", (event) => {
      if (!dragPayload) return;
      event.preventDefault();
      const blockedRow = event.target.closest('tr[data-blocked="true"]');
      if (blockedRow) blockedRow.classList.add("drag-denied");
      elements.draftBoard.classList.add("drag-over");
    });

    elements.draftBoard.addEventListener("dragleave", (event) => {
      if (!elements.draftBoard.contains(event.relatedTarget)) elements.draftBoard.classList.remove("drag-over");
    });

    elements.draftBoard.addEventListener("drop", (event) => {
      event.preventDefault();
      const blockedRow = event.target.closest('tr[data-blocked="true"]');
      if (blockedRow) {
        event.stopPropagation();
        showToast(`${blockedRow.dataset.blockedTitle} blocks this time until ${blockedRow.dataset.blockedUntil}.`);
        clearDragState();
        return;
      }
      const payload = readDragPayload(event);
      const activity = payload && activityById(payload.activityId);
      handleDrop(payload, state.selectedDate, activity ? nextOpenTime(state.selectedDate, activity) : undefined);
    });

    elements.overflowBench.addEventListener("click", (event) => {
      const player = event.target.closest("[data-edit-player]");
      const locked = event.target.closest("[data-locked-id]");
      if (player) openEditor(player.dataset.uid, player.dataset.fromDate);
      else if (locked) openLockedDetails(locked.dataset.lockedId);
    });

    elements.overflowBench.addEventListener("dragstart", (event) => {
      const player = event.target.closest("[data-edit-player]");
      if (!player) return;
      const located = findEntry(player.dataset.uid, player.dataset.fromDate);
      if (!located) return;
      beginDrag(event, {
        type: "scheduled",
        uid: player.dataset.uid,
        fromDate: player.dataset.fromDate,
        activityId: located.entry.activityId,
      });
    });

    document.addEventListener("dragend", clearDragState);

    document.querySelectorAll("[data-overview-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        state.overviewTab = button.dataset.overviewTab;
        persist();
        renderOverview();
        refreshIcons(elements.overviewContent);
      });
    });

    elements.overviewContent.addEventListener("click", (event) => {
      const scheduleButton = event.target.closest("[data-bench-schedule]");
      const openButton = event.target.closest("[data-open-date]");
      const editButton = event.target.closest("[data-edit-uid]");
      if (scheduleButton) scheduleActivity(scheduleButton.dataset.benchSchedule, scheduleButton.dataset.targetDate);
      if (openButton) selectDate(openButton.dataset.openDate, true);
      if (editButton) openEditor(editButton.dataset.editUid, editButton.dataset.editDate);
    });

    document.querySelectorAll("[data-mobile-target]").forEach((button) => {
      button.addEventListener("click", () => {
        state.mobilePanel = button.dataset.mobileTarget;
        persist();
        renderMobileState();
      });
    });

    elements.detailContent.addEventListener("click", (event) => {
      const addButton = event.target.closest("[data-detail-add]");
      const openButton = event.target.closest("[data-detail-open-date]");
      const favouriteButton = event.target.closest("[data-detail-favourite]");
      if (addButton) {
        closeDialog(elements.detailDialog);
        scheduleActivity(addButton.dataset.detailAdd, state.selectedDate);
      }
      if (openButton) {
        closeDialog(elements.detailDialog);
        selectDate(openButton.dataset.detailOpenDate, true);
      }
      if (favouriteButton) {
        const activityId = favouriteButton.dataset.detailFavourite;
        closeDialog(elements.detailDialog);
        toggleFavourite(activityId);
      }
    });

    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-close-detail]")) closeDialog(elements.detailDialog);
      if (event.target.closest("[data-close-edit]")) closeDialog(elements.editDialog);
      if (event.target.closest("[data-close-custom]")) closeDialog(elements.customDialog);
    });

    [elements.detailDialog, elements.editDialog, elements.customDialog].forEach((dialog) => {
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) closeDialog(dialog);
      });
    });

    elements.editForm.addEventListener("submit", handleEditSubmit);
    elements.editRemoveButton.addEventListener("click", () => {
      const uid = elements.editRemoveButton.dataset.uid;
      const date = elements.editRemoveButton.dataset.date;
      closeDialog(elements.editDialog);
      removeScheduled(uid, date);
    });

    elements.customButton.addEventListener("click", () => openDialog(elements.customDialog));
    elements.customForm.addEventListener("submit", handleCustomSubmit);
    elements.undoButton.addEventListener("click", undo);
    elements.exportCsvButton.addEventListener("click", exportCsv);
    elements.exportJsonButton.addEventListener("click", exportJson);
    elements.printButton.addEventListener("click", () => window.print());
    elements.resetButton.addEventListener("click", () => {
      if (!window.confirm("Reset the whole itinerary draft to its original starter picks?")) return;
      history.push(clone(state));
      state = initialState();
      persist();
      renderCategoryOptions();
      renderAll();
      showToast("Itinerary reset to the original draft.");
    });

    document.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      if (event.key === "Escape") clearDragState();
    });
  }

  renderCategoryOptions();
  bindEvents();
  renderAll();
})();
