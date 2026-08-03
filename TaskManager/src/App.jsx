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

  const [activeDay, setActiveDay] = useState(null);
  const [sortMode, setSortMode] = useState("dueDate");
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [collapsedCompleted, setCollapsedCompleted] = useState({});

  const [confetti, setConfetti] = useState([]);
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

  function addTask(day, text, group) {
    if (!text.trim()) return;

    const newTask = {
      id: Date.now() + Math.random(),
      text: text.trim(),
      group: group || "Ungrouped",
      completed: false,
      dueDate: null,
      duration: null,
      completedAt: null,
    };

    setTasks((prev) => ({ ...prev, [day]: [...prev[day], newTask] }));
  }

  function triggerConfetti(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const colors = ["#8ab4f8", "#4caf50", "#ffa726", "#ff5252", "#e8eaed"];
    const newParticles = Array.from({ length: 14 }).map(() => ({
      id: Math.random(),
      x,
      y,
      vx: (Math.random() - 0.5) * 80,
      vy: (Math.random() - 0.8) * 80,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    setConfetti((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setConfetti((prev) => prev.filter((p) => !newParticles.includes(p)));
    }, 1000);
  }

  function toggleTaskCompletion(e, day, taskId) {
    const task = tasks[day].find((t) => t.id === taskId);
    if (!task) return;

    const willBeCompleted = !task.completed;

    if (willBeCompleted) {
      triggerConfetti(e);
      completionTimers.current[taskId] = setTimeout(() => {
        setTasks((prev) => ({
          ...prev,
          [day]: prev[day].map((t) =>
            t.id === taskId ? { ...t, completedAt: Date.now() } : t,
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
      addTask(day, e.target.value, groupName);
      e.target.value = "";
    }
  }

  function openDateModal(day, task) {
    setModal({
      isOpen: true,
      type: "date",
      taskId: task.id,
      day,
      tempDate: task.dueDate ? new Date(task.dueDate) : new Date(),
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

  function isToday(dateString) {
    if (!dateString) return false;
    const today = new Date();
    const date = new Date(dateString);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

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

  function getSortedTasks(dayTasks) {
    return [...dayTasks].sort((a, b) => {
      if (sortMode === "dueDate") {
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
    <div className="app-container">
      {confetti.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            backgroundColor: p.color,
            left: `${p.x}px`,
            top: `${p.y}px`,
            transform: `translate(${p.vx}px, ${p.vy}px)`,
          }}
        />
      ))}

      <button
        className="sort-toggle-btn"
        onClick={() =>
          setSortMode((prev) => (prev === "dueDate" ? "duration" : "dueDate"))
        }
        title="Toggle Sorting Mode"
      >
        {sortMode === "dueDate" ? (
          <i className="fa-solid fa-calendar-days"></i>
        ) : (
          <i className="fa-solid fa-hourglass-half"></i>
        )}
      </button>

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
                          {groupTasks.map((task) => (
                            <div
                              key={task.id}
                              className={`task-item ${task.completed ? "completed" : ""}`}
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
                              </div>

                              <div className="task-meta">
                                <span
                                  className={`meta-btn ${isToday(task.dueDate) && !task.completed ? "urgent" : ""}`}
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
                          ))}

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
                      addTask(day, "New Task", e.target.value.trim());
                      e.target.value = "";
                    }
                  }}
                />
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
                      const d = new Date(modal.tempDate || new Date());
                      d.setMonth(d.getMonth() - 1);
                      setModal({ ...modal, tempDate: d });
                    }}
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <span>
                    {MONTH_NAMES[(modal.tempDate || new Date()).getMonth()]}{" "}
                    {(modal.tempDate || new Date()).getFullYear()}
                  </span>
                  <button
                    className="cal-nav-btn"
                    onClick={() => {
                      const d = new Date(modal.tempDate || new Date());
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
                    const current = modal.tempDate || new Date();
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
    </div>
  );
}