import { useState, useEffect } from "react";

const DAYS_OF_WEEK = [
  "monday", "tuesday", "wednesday", "thursday", 
  "friday", "saturday", "sunday"
];

export default function LocalPage() {
  // State now holds an object of groups, which in turn hold days and tasks
  const [taskData, setTaskData] = useState({});

  useEffect(() => {
    console.log("Updated taskData:", taskData);
  }, [taskData]);

  // 1. Create a global group that will appear across all days
  function addGroup() {
    let groupName = prompt("Name the new Task Group (e.g., Work, Chores):");
    if (!groupName) return;

    setTaskData(prev => ({
      ...prev,
      [groupName]: {} // Initialize the group with an empty object
    }));
  }

  // 2. Add a specific task to a specific group on a specific day
  function addTask(groupName, day) {
    let taskName = prompt(`New task for ${groupName} on ${day}:`);
    if (!taskName) return;

    setTaskData(prev => {
      // Get existing tasks for this day/group, or default to an empty array
      const existingTasks = prev[groupName][day] || [];

      return {
        ...prev,
        [groupName]: {
          ...prev[groupName],
          [day]: [...existingTasks, taskName] // Append the new task
        }
      };
    });
  }

  return (
    <>
      <h1>Weekly Task Tracker</h1>
      {/* Button to add a new overarching group */}
  

      <div id="days" className="days-container">
        <button onClick={addGroup}>+ Add New Task Group</button>
        {/* Loop 1: Go through all 7 days */}
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} id={day} className="day-div">
            <h2>{day.charAt(0).toUpperCase() + day.slice(1)}</h2>
            
            {/* Loop 2: Inside each day, go through every group we've created */}
            {Object.keys(taskData).map((groupName) => (
              <div key={groupName} className="group-section">
                <h3>{groupName}</h3>
                <button onClick={() => addTask(groupName, day)}>+ Add Task</button>

                {/* Loop 3: Map out the actual tasks saved to this specific day and group */}
                {(taskData[groupName][day] || []).map((task, index) => (
                  <div key={index} className="task-item">
                    <p>- {task}</p>
                  </div>
                ))}
              </div>
            ))}

          </div>
        ))}
      </div>
    </>
  );
}