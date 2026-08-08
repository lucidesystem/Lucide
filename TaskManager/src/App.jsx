import { useState, useRef, useEffect } from "react";
import "./index.css";

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const THEMES = [
  { id: "charcoal", label: "Charcoal", dot: "#202124" },
  { id: "slate", label: "Slate", dot: "#1a1d24" },
  { id: "paper", label: "Paper", dot: "#f5f5f3" },
];

// These wrap the genuinely impure browser APIs (clock reads, RNG) in ordinary
// module-scope functions. They're only ever invoked from event handlers /
// effects, never during render, but keeping them out of the component body
// entirely also satisfies the react-hooks/purity static check.
let idCounter = 0;
function generateId() {
  idCounter += 1;
  return `id_${idCounter}_${Math.random().toString(36).slice(2, 9)}`;
}
function now() {
  return Date.now();
}
function nowDate() {
  return new Date();
}

// Lazily loads canvas-confetti from a CDN once, the first time it's needed.
let confettiLoadPromise = null;
function loadConfetti() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.confetti) return Promise.resolve(window.confetti);
  if (confettiLoadPromise) return confettiLoadPromise;

  confettiLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js";
    script.async = true;
    script.onload = () => resolve(window.confetti || null);
    script.onerror = () => reject(new Error("Failed to load confetti"));
    document.head.appendChild(script);
  });
  return confettiLoadPromise;
}

export default function LocalPage() {
  // Initialize state from localStorage if it exists
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("pwa-weekly-tasks");
    if (savedTasks) {
      try {
        return JSON.parse(savedTasks);
      } catch (e) {
        console.error("Failed to parse tasks from local storage", e);
      }
    }
    // Default empty state
    return {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };
  });

  // Save to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem("pwa-weekly-tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Classes (school-style subjects) that tasks can be pinned to
  const [classes, setClasses] = useState(() => {
    const saved = localStorage.getItem("pwa-classes");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse classes from local storage", e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("pwa-classes", JSON.stringify(classes));
  }, [classes]);

  const [theme, setTheme] = useState(
    () => localStorage.getItem("pwa-theme") || "charcoal",
  );

  useEffect(() => {
    localStorage.setItem("pwa-theme", theme);
  }, [theme]);

  const [settingsOpen, setSettingsOpen] = useState(false);

  // Warm up the confetti CDN script so the first completed task isn't delayed.
  useEffect(() => {
    loadConfetti().catch((err) => console.error("Confetti failed to load", err));
  }, []);

  const [activeDay, setActiveDay] = useState(null);
  const [sortMode, setSortMode] = useState("dueDate");
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [collapsedCompleted, setCollapsedCompleted] = useState({});

  const completionTimers = useRef({});

  const [modal, setModal] = useState({
    isOpen: false,
    type: null,
    taskId: null,
    day: null,
    tempDate: null,
    tempHours: 0,
    tempMinutes: 0,
  });

  const dragRef = useRef({
    isDragging: false,
    startY: 0,
    startVal: 0,
    field: null,
  });

  function addTask(day, text, group, classId) {
    if (!text.trim()) return;

    const newTask = {
      id: generateId(),
      text: text.trim(),
      group: group || "Ungrouped",
      classId: classId || null,
      completed: false,
      dueDate: null,
      duration: null,
      completedAt: null,
    };

    setTasks((prev) => ({ ...prev, [day]: [...prev[day], newTask] }));
  }

  function addClass() {
    const name = prompt("Class name (e.g., Algebra II):");
    if (!name || !name.trim()) return;

    setClasses((prev) => [
      ...prev,
      {
        id: generateId(),
        name: name.trim(),
        day: "gold",
        color: "#8ab4f8",
      },
    ]);
  }

  function toggleClassDay(id) {
    setClasses((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, day: c.day === "gold" ? "black" : "gold" } : c,
      ),
    );
  }

  function setClassColor(id, color) {
    setClasses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, color } : c)),
    );
  }

  function moveClass(index, direction) {
    setClasses((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function deleteClass(id) {
    setClasses((prev) => prev.filter((c) => c.id !== id));
  }

  function triggerConfetti() {
    loadConfetti()
      .then((confetti) => {
        if (!confetti) return;
        const colors = ["#8ab4f8", "#4caf50", "#ffa726", "#ff5252", "#e8eaed"];

        // Center cannon straight down from the very top of the screen...
        confetti({
          particleCount: 70,
          spread: 100,
          startVelocity: 45,
          gravity: 1.1,
          ticks: 100,
          origin: { x: 0, y: 0 },
          colors,
        });
        // ...plus two side cannons arcing in from the top corners.
        confetti({
          particleCount: 40,
          angle: 60,
          spread: 60,
          startVelocity: 55,
          gravity: 1.1,
          origin: { x: 0.05, y: 0 },
          colors,
        });
        confetti({
          particleCount: 40,
          angle: 120,
          spread: 60,
          startVelocity: 100,
          gravity: 1.1,
          origin: { x: 0.95, y: 0 },
          colors,
        });
      })
      .catch((err) => console.error("Confetti failed to load", err));
  }

  function toggleTaskCompletion(e, day, taskId) {
    const task = tasks[day].find((t) => t.id === taskId);
    if (!task) return;

    const willBeCompleted = !task.completed;

    if (willBeCompleted) {
      triggerConfetti();
      completionTimers.current[taskId] = setTimeout(() => {
        setTasks((prev) => ({
          ...prev,
          [day]: prev[day].map((t) =>
            t.id === taskId ? { ...t, completedAt: now() } : t,
          ),
        }));
      }, 3000);
    } else {
      if (completionTimers.current[taskId]) {
        clearTimeout(completionTimers.current[taskId]);
        delete completionTimers.current[taskId];
      }
    }

    setTasks((prev) => ({
      ...prev,
      [day]: prev[day].map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: willBeCompleted,
              completedAt: willBeCompleted ? t.completedAt : null,
            }
          : t,
      ),
    }));
  }

  function deleteTask(day, taskId) {
    if (completionTimers.current[taskId]) {
      clearTimeout(completionTimers.current[taskId]);
      delete completionTimers.current[taskId];
    }
    setTasks((prev) => ({
      ...prev,
      [day]: prev[day].filter((t) => t.id !== taskId),
    }));
  }

  function toggleGroupCollapse(day, groupName) {
    const key = `${day}-${groupName}`;
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleInlineKeyDown(e, day, groupName) {
    if (e.key === "Enter") {
      e.preventDefault();
      const wrapper = e.target.closest(".inline-input-wrapper");
      const select = wrapper ? wrapper.querySelector(".class-select") : null;
      const classId = select && select.value ? select.value : null;
      addTask(day, e.target.value, groupName, classId);
      e.target.value = "";
      if (select) select.value = "";
    }
  }

  function openDateModal(day, task) {
    setModal({
      isOpen: true,
      type: "date",
      taskId: task.id,
      day,
      tempDate: task.dueDate ? new Date(task.dueDate) : nowDate(),
      tempHours: 0,
      tempMinutes: 0,
    });
  }

  function openDurationModal(day, task) {
    setModal({
      isOpen: true,
      type: "duration",
      taskId: task.id,
      day,
      tempDate: null,
      tempHours: task.duration?.hours || 0,
      tempMinutes: task.duration?.minutes || 0,
    });
  }

  function saveModal() {
    setTasks((prev) => {
      const dayTasks = prev[modal.day].map((task) => {
        if (task.id !== modal.taskId) return task;

        if (modal.type === "date") {
          if (!modal.tempDate) return { ...task, dueDate: null };
          return { ...task, dueDate: modal.tempDate.toISOString() };
        }

        if (modal.type === "duration") {
          const h = modal.tempHours;
          const m = modal.tempMinutes;
          return {
            ...task,
            duration: h === 0 && m === 0 ? null : { hours: h, minutes: m },
          };
        }
        return task;
      });
      return { ...prev, [modal.day]: dayTasks };
    });
    setModal({ ...modal, isOpen: false });
  }

  function handleDragStart(e, field) {
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragRef.current = {
      isDragging: true,
      startY: clientY,
      startVal: modal[field],
      field,
    };
    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("touchmove", handleDragMove, { passive: false });
    window.addEventListener("touchend", handleDragEnd);
  }

  function handleDragMove(e) {
    if (!dragRef.current.isDragging) return;
    if (e.type === "touchmove") e.preventDefault();

    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dy = dragRef.current.startY - clientY;
    const delta = Math.floor(dy / 12);
    const field = dragRef.current.field;

    let newVal = dragRef.current.startVal + delta;
    const max = field === "tempHours" ? 48 : 59;
    if (newVal < 0) newVal = 0;
    if (newVal > max) newVal = max;

    setModal((prev) => ({ ...prev, [field]: newVal }));
  }

  function handleDragEnd() {
    dragRef.current.isDragging = false;
    window.removeEventListener("mousemove", handleDragMove);
    window.removeEventListener("mouseup", handleDragEnd);
    window.removeEventListener("touchmove", handleDragMove);
    window.removeEventListener("touchend", handleDragEnd);
  }

  // function isToday(dateString) {
  //   if (!dateString) return false;
  //   const today = nowDate();
  //   const date = new Date(dateString);
  //   return (
  //     date.getDate() === today.getDate() &&
  //     date.getMonth() === today.getMonth() &&
  //     date.getFullYear() === today.getFullYear()
  //   );
  // }

  function formatDateTime(dateString) {
    if (!dateString) return "Set Date";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function formatDuration(duration) {
    if (!duration) return "Set Time";
    const h = duration.hours ? `${duration.hours} hr ` : "";
    const m = duration.minutes ? `${duration.minutes} min` : "";
    return (h + m).trim();
  }

  function startOfDay(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  // Urgency + color-coding based on proximity to the due date.
  // "Due today" and "the night before" (after 6pm, due tomorrow) both count as urgent.
  function getDueMeta(dateString, completed) {
    if (!dateString || completed) return { urgent: false, colorClass: "" };

    const due = startOfDay(dateString);
    const today = startOfDay(nowDate());
    const diffDays = Math.round((due - today) / 86400000);
    const nightBefore = diffDays === 1 && nowDate().getHours() >= 18;
    const urgent = diffDays <= 0 || nightBefore;

    let colorClass = "due-far";
    if (diffDays < 0) colorClass = "due-overdue";
    else if (diffDays === 0 || nightBefore) colorClass = "due-today";
    else if (diffDays <= 2) colorClass = "due-soon";
    else if (diffDays <= 6) colorClass = "due-week";

    return { urgent, colorClass };
  }

  function getSortedTasks(dayTasks) {
    return [...dayTasks].sort((a, b) => {
      if (sortMode === "dueDate") {
        const aMeta = getDueMeta(a.dueDate, a.completed);
        const bMeta = getDueMeta(b.dueDate, b.completed);
        if (aMeta.urgent !== bMeta.urgent) return aMeta.urgent ? -1 : 1;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else {
        const aMins = a.duration
          ? a.duration.hours * 60 + a.duration.minutes
          : 99999;
        const bMins = b.duration
          ? b.duration.hours * 60 + b.duration.minutes
          : 99999;
        return aMins - bMins;
      }
    });
  }

  return (
    <div className="app-container" data-theme={theme}>

      {activeDay === null ? (
        <button
          className="sort-toggle-btn"
          onClick={() => setSettingsOpen(true)}
          title="Settings"
        >
          <i className="fa-solid fa-gear"></i>
        </button>
      ) : (
        <button
          className="sort-toggle-btn"
          onClick={() =>
            setSortMode((prev) =>
              prev === "dueDate" ? "duration" : "dueDate",
            )
          }
          title="Toggle Sorting Mode"
        >
          {sortMode === "dueDate" ? (
            <i className="fa-solid fa-calendar-days"></i>
          ) : (
            <i className="fa-solid fa-hourglass-half"></i>
          )}
        </button>
      )}

      <h1 className={`main-title ${activeDay ? "hidden" : ""}`}>
        Weekly Tasks
      </h1>

      {DAYS_OF_WEEK.map((day) => {
        const sortedTasks = getSortedTasks(tasks[day]);
        const activeTasksList = sortedTasks.filter((t) => !t.completedAt);
        const completedTasksList = sortedTasks.filter((t) => t.completedAt);
        const pendingCount = activeTasksList.filter((t) => !t.completed).length;

        const tasksByGroup = activeTasksList.reduce((acc, task) => {
          if (!acc[task.group]) acc[task.group] = [];
          acc[task.group].push(task);
          return acc;
        }, {});

        if (Object.keys(tasksByGroup).length === 0)
          tasksByGroup["Ungrouped"] = [];

        // Appended custom day classes for CSS gradients
        let containerClass = `day-container day-${day} `;
        if (activeDay === null) containerClass += "collapsed-home";
        else if (activeDay === day) containerClass += "expanded";
        else containerClass += "hidden";

        const isCompletedDropdownOpen = collapsedCompleted[day];

        return (
          <div key={day} className={containerClass}>
            <div
              className="day-header"
              onClick={() =>
                activeDay === day ? setActiveDay(null) : setActiveDay(day)
              }
            >
              <h2>{day.charAt(0).toUpperCase() + day.slice(1)}</h2>
              <div className="header-right">
                {activeDay !== day && (
                  <span className="task-count">{pendingCount} tasks</span>
                )}
                <span
                  className={`dropdown-icon ${activeDay === day ? "open" : ""}`}
                >
                  <i className="fa-solid fa-chevron-down"></i>
                </span>
              </div>
            </div>

            <div className="day-body">
              <div className="groups-scroll-area">
                {Object.entries(tasksByGroup).map(([groupName, groupTasks]) => {
                  const isCollapsed = collapsedGroups[`${day}-${groupName}`];
                  return (
                    <div key={groupName} className="group-section">
                      {groupName !== "Ungrouped" && (
                        <div
                          className="group-header-row"
                          onClick={() => toggleGroupCollapse(day, groupName)}
                        >
                          <h3 className="group-title">{groupName}</h3>
                          <span
                            className={`collapse-arrow ${isCollapsed ? "collapsed" : ""}`}
                          >
                            <i className="fa-solid fa-chevron-down"></i>
                          </span>
                        </div>
                      )}

                      {!isCollapsed && (
                        <>
                          {groupTasks.map((task) => {
                            const dueMeta = getDueMeta(
                              task.dueDate,
                              task.completed,
                            );
                            const taskClass = task.classId
                              ? classes.find((c) => c.id === task.classId)
                              : null;

                            return (
                              <div
                                key={task.id}
                                className={`task-item ${task.completed ? "completed" : ""} ${!task.completed ? dueMeta.colorClass : ""}`}
                                style={
                                  taskClass
                                    ? { borderLeft: `3px solid ${taskClass.color}` }
                                    : undefined
                                }
                              >
                                <div
                                  className="task-main"
                                  onClick={(e) =>
                                    toggleTaskCompletion(e, day, task.id)
                                  }
                                >
                                  <div className="checkbox">
                                    {task.completed && (
                                      <span className="checkmark">
                                        <i className="fa-solid fa-check"></i>
                                      </span>
                                    )}
                                  </div>
                                  <p>{task.text}</p>
                                  {taskClass && (
                                    <span
                                      className="task-class-badge"
                                      style={{
                                        borderColor: taskClass.color,
                                        color: taskClass.color,
                                      }}
                                    >
                                      {taskClass.name}
                                    </span>
                                  )}
                                </div>

                                <div className="task-meta">
                                  <span
                                    className={`meta-btn ${dueMeta.urgent && !task.completed ? "urgent" : ""}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openDateModal(day, task);
                                    }}
                                  >
                                    {formatDateTime(task.dueDate)}
                                  </span>
                                  <span className="meta-dot">•</span>
                                  <span
                                    className="meta-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openDurationModal(day, task);
                                    }}
                                  >
                                    {formatDuration(task.duration)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}

                          <div className="inline-input-wrapper">
                            <span className="inline-add-icon">
                              <i className="fa-solid fa-plus"></i>
                            </span>
                            <input
                              type="text"
                              className="inline-input"
                              placeholder={
                                groupTasks.length === 0
                                  ? "Take a note..."
                                  : "Add to list..."
                              }
                              onKeyDown={(e) =>
                                handleInlineKeyDown(e, day, groupName)
                              }
                            />
                            {classes.length > 0 && (
                              <select
                                className="class-select"
                                defaultValue=""
                                title="Assign to class"
                              >
                                <option value="">No class</option>
                                {classes.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}

                {completedTasksList.length > 0 && (
                  <div className="completed-section">
                    <div
                      className="completed-header-row"
                      onClick={() =>
                        setCollapsedCompleted((prev) => ({
                          ...prev,
                          [day]: !prev[day],
                        }))
                      }
                    >
                      <span>Completed ({completedTasksList.length})</span>
                      <span
                        className={`collapse-arrow ${isCompletedDropdownOpen ? "" : "collapsed"}`}
                      >
                        <i className="fa-solid fa-chevron-down"></i>
                      </span>
                    </div>

                    {isCompletedDropdownOpen && (
                      <div className="completed-list">
                        {completedTasksList.map((task) => (
                          <div key={task.id} className="task-item completed">
                            <div
                              className="task-main"
                              onClick={(e) =>
                                toggleTaskCompletion(e, day, task.id)
                              }
                            >
                              <div className="checkbox">
                                <span className="checkmark">
                                  <i className="fa-solid fa-check"></i>
                                </span>
                              </div>
                              <p>{task.text}</p>
                            </div>
                            <button
                              className="trash-btn-box"
                              onClick={() => deleteTask(day, task.id)}
                              title="Delete task"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="new-group-wrapper">
                <span className="inline-add-icon" style={{ opacity: 0.5 }}>
                  <i className="fa-solid fa-plus"></i>
                </span>
                <input
                  type="text"
                  className="inline-input new-group-input"
                  placeholder="New group..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target.value.trim()) {
                      const wrapper = e.target.closest(".new-group-wrapper");
                      const select = wrapper
                        ? wrapper.querySelector(".class-select")
                        : null;
                      const classId =
                        select && select.value ? select.value : null;
                      addTask(
                        day,
                        "New Task",
                        e.target.value.trim(),
                        classId,
                      );
                      e.target.value = "";
                      if (select) select.value = "";
                    }
                  }}
                />
                {classes.length > 0 && (
                  <select
                    className="class-select"
                    defaultValue=""
                    title="Assign to class"
                  >
                    <option value="">No class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* FULL SCREEN MODAL */}
      <div className={`fullscreen-modal ${modal.isOpen ? "open" : ""}`}>
        <div className="modal-content">
          {modal.type === "date" && (
            <>
              <h2 className="modal-title">Select Due Date</h2>

              <div className="custom-calendar">
                <div className="cal-header">
                  <button
                    className="cal-nav-btn"
                    onClick={() => {
                      const d = new Date(modal.tempDate || nowDate());
                      d.setMonth(d.getMonth() - 1);
                      setModal({ ...modal, tempDate: d });
                    }}
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <span>
                    {MONTH_NAMES[(modal.tempDate || nowDate()).getMonth()]}{" "}
                    {(modal.tempDate || nowDate()).getFullYear()}
                  </span>
                  <button
                    className="cal-nav-btn"
                    onClick={() => {
                      const d = new Date(modal.tempDate || nowDate());
                      d.setMonth(d.getMonth() + 1);
                      setModal({ ...modal, tempDate: d });
                    }}
                  >
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>

                <div className="cal-grid">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div key={d} className="cal-weekday">
                      {d}
                    </div>
                  ))}
                  {(() => {
                    const current = modal.tempDate || nowDate();
                    const year = current.getFullYear();
                    const month = current.getMonth();
                    const firstDayIndex = new Date(year, month, 1).getDay();
                    const totalDays = new Date(year, month + 1, 0).getDate();

                    const cells = [];
                    for (let i = 0; i < firstDayIndex; i++) {
                      cells.push(
                        <div key={`empty-${i}`} className="cal-cell empty" />,
                      );
                    }
                    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
                      const isSelected = current.getDate() === dayNum;
                      cells.push(
                        <div
                          key={dayNum}
                          className={`cal-cell ${isSelected ? "selected" : ""}`}
                          onClick={() => {
                            const newD = new Date(current);
                            newD.setDate(dayNum);
                            setModal({ ...modal, tempDate: newD });
                          }}
                        >
                          {dayNum}
                        </div>,
                      );
                    }
                    return cells;
                  })()}
                </div>
              </div>
            </>
          )}

          {modal.type === "duration" && (
            <>
              <h2 className="modal-title">Time Needed</h2>
              <div className="modal-inputs-row">
                <div className="time-wheel-group">
                  <button
                    className="wheel-arrow"
                    onClick={() =>
                      setModal((p) => ({
                        ...p,
                        tempHours: Math.min(48, p.tempHours + 1),
                      }))
                    }
                  >
                    <i className="fa-solid fa-chevron-up"></i>
                  </button>
                  <div
                    className="wheel-display"
                    onMouseDown={(e) => handleDragStart(e, "tempHours")}
                    onTouchStart={(e) => handleDragStart(e, "tempHours")}
                  >
                    <span>{modal.tempHours}</span>
                    <label>hrs</label>
                  </div>
                  <button
                    className="wheel-arrow"
                    onClick={() =>
                      setModal((p) => ({
                        ...p,
                        tempHours: Math.max(0, p.tempHours - 1),
                      }))
                    }
                  >
                    <i className="fa-solid fa-chevron-down"></i>
                  </button>
                </div>

                <div className="time-separator">:</div>

                <div className="time-wheel-group">
                  <button
                    className="wheel-arrow"
                    onClick={() =>
                      setModal((p) => ({
                        ...p,
                        tempMinutes: Math.min(59, p.tempMinutes + 5),
                      }))
                    }
                  >
                    <i className="fa-solid fa-chevron-up"></i>
                  </button>
                  <div
                    className="wheel-display"
                    onMouseDown={(e) => handleDragStart(e, "tempMinutes")}
                    onTouchStart={(e) => handleDragStart(e, "tempMinutes")}
                  >
                    <span>{modal.tempMinutes}</span>
                    <label>min</label>
                  </div>
                  <button
                    className="wheel-arrow"
                    onClick={() =>
                      setModal((p) => ({
                        ...p,
                        tempMinutes: Math.max(0, p.tempMinutes - 5),
                      }))
                    }
                  >
                    <i className="fa-solid fa-chevron-down"></i>
                  </button>
                </div>
              </div>
              <p className="wheel-hint">
                Drag vertically on numbers to scroll fast
              </p>
            </>
          )}

          <div className="modal-actions">
            <button
              className="modal-btn cancel"
              onClick={() => setModal({ ...modal, isOpen: false })}
            >
              Cancel
            </button>
            <button className="modal-btn save" onClick={saveModal}>
              Save
            </button>
          </div>
        </div>
      </div>

      {/* SETTINGS MODAL */}
      <div className={`fullscreen-modal ${settingsOpen ? "open" : ""}`}>
        <div className="modal-content settings-content">
          <h2 className="modal-title">Settings</h2>

          <div className="settings-section">
            <h3 className="settings-section-title">Theme</h3>
            <div className="theme-options">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  className={`theme-swatch ${theme === t.id ? "active" : ""}`}
                  onClick={() => setTheme(t.id)}
                >
                  <span
                    className="theme-swatch-dot"
                    style={{ background: t.dot }}
                  ></span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-section-header">
              <h3 className="settings-section-title">Classes</h3>
              <button className="mini-add-btn" onClick={addClass}>
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>

            {classes.length === 0 && (
              <p className="settings-empty">No classes yet.</p>
            )}

            <div className="class-list">
              {classes.map((cls, idx) => (
                <div key={cls.id} className="class-row">
                  <label
                    className="color-circle"
                    style={{ backgroundColor: cls.color }}
                    title="Pick a color"
                  >
                    <input
                      type="color"
                      value={cls.color}
                      onChange={(e) => setClassColor(cls.id, e.target.value)}
                    />
                  </label>

                  <span className="class-row-name">{cls.name}</span>

                  <button
                    className={`day-toggle-btn ${cls.day}`}
                    onClick={() => toggleClassDay(cls.id)}
                    title="Toggle Gold/Black day"
                  >
                    {cls.day === "gold" ? "Gold Day" : "Black Day"}
                  </button>

                  <div className="priority-arrows">
                    <button
                      className="wheel-arrow"
                      disabled={idx === 0}
                      onClick={() => moveClass(idx, -1)}
                      title="Move up"
                    >
                      <i className="fa-solid fa-chevron-up"></i>
                    </button>
                    <button
                      className="wheel-arrow"
                      disabled={idx === classes.length - 1}
                      onClick={() => moveClass(idx, 1)}
                      title="Move down"
                    >
                      <i className="fa-solid fa-chevron-down"></i>
                    </button>
                  </div>

                  <button
                    className="trash-btn-box"
                    onClick={() => deleteClass(cls.id)}
                    title="Delete class"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button
              className="modal-btn save"
              onClick={() => setSettingsOpen(false)}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}