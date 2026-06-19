import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../services/db';
import { ai } from '../services/ai';

const TaskContext = createContext();

export const useTasksContext = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [energyLevel, setEnergyLevel] = useState(null);
  const [aiInsight, setAiInsight] = useState('');
  const [top3Ids, setTop3Ids] = useState([]);
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const [loading, setLoading] = useState(true);

  const runAIPrioritization = useCallback(async (tasksList, energy) => {
    const savedSettings = localStorage.getItem('myradar_settings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    
    if (!settings.geminiApiKey) {
      // Fallback to local heuristic priorities
      const fallbackPrioritized = tasksList.map(task => {
        const mapVal = (v) => v === 'High' ? 3 : v === 'Medium' ? 2 : 1;
        let score = (mapVal(task.urgency) * 0.35) + (mapVal(task.importance || 'Medium') * 0.30);
        if (task.domain === 'BHEL') score *= 1.5;
        
        let q = "Q4 — ELIMINATE";
        if (task.urgency === 'High' && (task.importance === 'High' || !task.importance)) q = "Q1 — DO NOW";
        else if (task.urgency !== 'High' && (task.importance === 'High' || !task.importance)) q = "Q2 — SCHEDULE";
        else if (task.urgency === 'High' && task.importance !== 'High') q = "Q3 — DELEGATE";
        
        return {
          ...task,
          priorityScore: Number(Math.min(10, score * 2.2).toFixed(1)),
          quadrant: q,
          microAction: `Spend 5 minutes drafting the outline / setting environment for: ${task.title}`,
          timeBlockSuggestion: task.urgency === 'High' ? 'Morning Focus Block' : 'Afternoon Review'
        };
      });

      setTasks(fallbackPrioritized);
      const fallbackInsight = "Welcome back! Please enter your Gemini API Key in Settings to unlock real-time contextual priorities, proactive daily briefings, and procrastination micro-actions.";
      setAiInsight(fallbackInsight);
      const sortedIds = [...fallbackPrioritized]
        .filter(t => t.status !== 'completed')
        .sort((a,b) => b.priorityScore - a.priorityScore)
        .slice(0, 5)
        .map(t => t.id);
      setTop3Ids(sortedIds);
      
      db.syncPriorities(fallbackPrioritized, fallbackInsight, sortedIds, energy);
      return;
    }

    setIsPrioritizing(true);
    try {
      const result = await ai.prioritizeTasks(tasksList, settings, energy);
      if (result && result.tasks) {
        const updated = tasksList.map(task => {
          const aiTask = result.tasks.find(t => Number(t.id) === Number(task.id));
          if (aiTask) {
            return {
              ...task,
              urgency: aiTask.urgency,
              importance: aiTask.importance,
              priorityScore: aiTask.priorityScore,
              quadrant: aiTask.quadrant,
              microAction: aiTask.microAction,
              timeBlockSuggestion: aiTask.timeBlockSuggestion
            };
          }
          return task;
        });

        setTasks(updated);
        setAiInsight(result.insight || '');
        setTop3Ids(result.top3Ids || []);

        db.syncPriorities(updated, result.insight || '', result.top3Ids || [], energy);
      }
    } catch (e) {
      console.error("AI Prioritization failed", e);
    } finally {
      setIsPrioritizing(false);
    }
  }, []);

  const handleCheckIn = async (energy) => {
    setEnergyLevel(energy);
    localStorage.setItem('myradar_energy_level', energy);
    localStorage.setItem('myradar_last_checkin_date', new Date().toDateString());
    await runAIPrioritization(tasks, energy);
  };

  useEffect(() => {
    const lastCheckin = localStorage.getItem('myradar_last_checkin_date');
    const today = new Date().toDateString();
    let currentEnergy = null;

    db.getTasks().then(data => {
      const fetchedTasks = data.tasks || [];
      const fetchedMeta = data.metadata || {};
      
      setTasks(fetchedTasks);
      
      if (fetchedMeta.aiInsight) setAiInsight(fetchedMeta.aiInsight);
      if (fetchedMeta.top3Ids) setTop3Ids(fetchedMeta.top3Ids);
      
      // If today is the same day as the last checkin from Metadata or LocalStorage, restore energy
      const savedEnergy = localStorage.getItem('myradar_energy_level') || fetchedMeta.energyLevel;
      if (lastCheckin === today && savedEnergy) {
        currentEnergy = savedEnergy;
        setEnergyLevel(savedEnergy);
        if (!localStorage.getItem('myradar_energy_level')) {
          localStorage.setItem('myradar_energy_level', savedEnergy);
          localStorage.setItem('myradar_last_checkin_date', today);
        }
      }

      setLoading(false);
      
      // Only run auto-prioritization if we have an energy level but the cloud didn't have an AI Insight yet
      if (currentEnergy && !fetchedMeta.aiInsight) {
        runAIPrioritization(fetchedTasks, currentEnergy);
      }
    });
  }, [runAIPrioritization]);

  const handleAddTask = async (newTask) => {
    const addedTask = await db.addTask(newTask);
    const updatedTasks = [...tasks, addedTask];
    setTasks(updatedTasks);
    if (energyLevel) {
      runAIPrioritization(updatedTasks, energyLevel);
    }
  };

  const handleUpdateTasks = (updatedTasks) => {
    setTasks(updatedTasks);
  };

  const forceRecalculate = () => {
    runAIPrioritization(tasks, energyLevel);
  };

  const handleResetEnergy = () => {
    setEnergyLevel(null);
    localStorage.removeItem('myradar_last_checkin_date');
    localStorage.removeItem('myradar_energy_level');
  };

  const handleUpdateTaskData = async (taskId, updates) => {
    const updatedTasks = await db.updateTask(taskId, updates);
    handleUpdateTasks(updatedTasks);
  };

  const value = {
    tasks,
    energyLevel,
    aiInsight,
    top3Ids,
    isPrioritizing,
    loading,
    handleCheckIn,
    handleAddTask,
    handleUpdateTasks,
    handleUpdateTaskData,
    forceRecalculate,
    handleResetEnergy
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
