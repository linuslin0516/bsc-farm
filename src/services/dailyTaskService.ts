import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { PlayerDailyTasks, DailyTask } from '../types';
import { generateDailyTasks, getDailyTaskById } from '../data/dailyTasks';

const DAILY_TASKS_COLLECTION = 'dailyTasks';

// Get today's date string
const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Get or create player's daily tasks
export const getPlayerDailyTasks = async (oderId: string): Promise<PlayerDailyTasks> => {
  const today = getTodayString();
  const docRef = doc(db, DAILY_TASKS_COLLECTION, oderId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data() as PlayerDailyTasks;
    // Check if tasks are for today
    if (data.date === today) {
      return data;
    }
  }

  // Generate new tasks for today
  const newTasks = generateDailyTasks(oderId);
  const playerTasks: PlayerDailyTasks = {
    oderId,
    date: today,
    tasks: newTasks.map(task => ({
      taskId: task.id,
      progress: 0,
      completed: false,
      claimed: false,
    })),
  };

  await setDoc(docRef, playerTasks);
  return playerTasks;
};

// Update task progress
export const updateTaskProgress = async (
  oderId: string,
  type: 'plant' | 'harvest' | 'steal' | 'earn' | 'visit',
  value: number = 1
): Promise<{ completedTasks: DailyTask[]; playerTasks: PlayerDailyTasks }> => {
  const playerTasks = await getPlayerDailyTasks(oderId);
  const completedTasks: DailyTask[] = [];

  // Update progress for matching tasks
  for (const taskProgress of playerTasks.tasks) {
    const task = getDailyTaskById(taskProgress.taskId);
    if (!task || task.type !== type) continue;
    if (taskProgress.completed) continue;

    // Update progress
    taskProgress.progress += value;

    // Check if completed
    if (taskProgress.progress >= task.requirement) {
      taskProgress.completed = true;
      completedTasks.push(task);
    }
  }

  // Save to Firebase (use setDoc to handle both create and update)
  const docRef = doc(db, DAILY_TASKS_COLLECTION, oderId);
  await setDoc(docRef, {
    oderId: playerTasks.oderId,
    date: playerTasks.date,
    tasks: playerTasks.tasks,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  return { completedTasks, playerTasks };
};

// Claim task reward
export const claimTaskReward = async (
  oderId: string,
  taskId: string
): Promise<{ xp: number; tokens: number } | null> => {
  const playerTasks = await getPlayerDailyTasks(oderId);
  const taskProgress = playerTasks.tasks.find(t => t.taskId === taskId);

  if (!taskProgress || !taskProgress.completed || taskProgress.claimed) {
    return null;
  }

  const task = getDailyTaskById(taskId);
  if (!task) return null;

  // Mark as claimed
  taskProgress.claimed = true;

  // Save to Firebase (use setDoc with merge to handle both create and update)
  const docRef = doc(db, DAILY_TASKS_COLLECTION, oderId);
  await setDoc(docRef, {
    oderId: playerTasks.oderId,
    date: playerTasks.date,
    tasks: playerTasks.tasks,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  return {
    xp: task.rewardXp,
    tokens: task.rewardTokens,
  };
};

// Get daily tasks with full info
export const getDailyTasksWithProgress = async (oderId: string): Promise<{
  task: DailyTask;
  progress: number;
  completed: boolean;
  claimed: boolean;
}[]> => {
  const playerTasks = await getPlayerDailyTasks(oderId);

  return playerTasks.tasks.map(taskProgress => {
    const task = getDailyTaskById(taskProgress.taskId);
    return {
      task: task!,
      progress: taskProgress.progress,
      completed: taskProgress.completed,
      claimed: taskProgress.claimed,
    };
  }).filter(t => t.task !== undefined);
};

// Check if all daily tasks are completed
export const areAllDailyTasksCompleted = async (oderId: string): Promise<boolean> => {
  const playerTasks = await getPlayerDailyTasks(oderId);
  return playerTasks.tasks.every(t => t.completed);
};

// Get remaining time until daily reset (midnight UTC)
export const getTimeUntilReset = (): number => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow.getTime() - now.getTime();
};
