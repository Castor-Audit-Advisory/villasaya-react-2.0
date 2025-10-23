/**
 * Task Analytics System
 * Monitors task status transitions and provides insights into workflow performance
 */

export interface TaskTransition {
  taskId: string;
  taskTitle: string;
  fromStatus: string;
  toStatus: string;
  timestamp: Date;
  userId: string;
  villaId?: string;
}

export interface TaskAnalytics {
  totalTasks: number;
  statusBreakdown: Record<string, number>;
  pendingTasks: number;
  averageCompletionTime?: number;
  transitions: TaskTransition[];
}

class TaskAnalyticsService {
  private transitions: TaskTransition[] = [];
  private storageKey = 'villasaya_task_analytics';

  constructor() {
    this.loadTransitions();
  }

  /**
   * Track a task status transition
   */
  trackTransition(transition: Omit<TaskTransition, 'timestamp'>): void {
    const fullTransition: TaskTransition = {
      ...transition,
      timestamp: new Date(),
    };

    this.transitions.push(fullTransition);
    this.saveTransitions();

    console.log('[Task Analytics] Status change:', {
      task: transition.taskTitle,
      from: transition.fromStatus,
      to: transition.toStatus,
      timestamp: fullTransition.timestamp.toISOString(),
    });

    if (transition.toStatus === 'done') {
      this.trackCompletion(transition.taskId);
    }

    if (transition.fromStatus === 'pending') {
      this.trackPendingResolution(transition.taskId, transition.toStatus);
    }
  }

  /**
   * Get analytics for pending tasks
   */
  getPendingAnalytics(): {
    total: number;
    avgTimeInPending: number | null;
    resolutionRate: number;
  } {
    const pendingTransitions = this.transitions.filter(
      (t) => t.fromStatus === 'pending' || t.toStatus === 'pending'
    );

    const resolvedPending = this.transitions.filter(
      (t) => t.fromStatus === 'pending' && t.toStatus !== 'pending'
    );

    const pendingStartTimes = new Map<string, number>();
    const completedDurations: number[] = [];

    for (const transition of this.transitions) {
      if (transition.toStatus === 'pending') {
        pendingStartTimes.set(
          transition.taskId,
          transition.timestamp.getTime()
        );
      } else if (
        transition.fromStatus === 'pending' &&
        pendingStartTimes.has(transition.taskId)
      ) {
        const startTime = pendingStartTimes.get(transition.taskId)!;
        const duration = transition.timestamp.getTime() - startTime;
        completedDurations.push(duration);
        pendingStartTimes.delete(transition.taskId);
      }
    }

    const avgTimeInPending =
      completedDurations.length > 0
        ? completedDurations.reduce((a, b) => a + b, 0) / completedDurations.length
        : null;

    const resolutionRate =
      pendingTransitions.length > 0
        ? (resolvedPending.length / pendingTransitions.length) * 100
        : 0;

    return {
      total: pendingTransitions.length,
      avgTimeInPending,
      resolutionRate,
    };
  }

  /**
   * Get general task analytics
   */
  getAnalytics(villaId?: string): TaskAnalytics {
    let relevantTransitions = this.transitions;

    if (villaId) {
      relevantTransitions = this.transitions.filter(
        (t) => t.villaId === villaId
      );
    }

    const statusBreakdown: Record<string, number> = {};
    const latestStatusByTask = new Map<string, string>();

    for (const transition of relevantTransitions) {
      latestStatusByTask.set(transition.taskId, transition.toStatus);
    }

    for (const status of latestStatusByTask.values()) {
      statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
    }

    return {
      totalTasks: latestStatusByTask.size,
      statusBreakdown,
      pendingTasks: statusBreakdown['pending'] || 0,
      transitions: relevantTransitions,
    };
  }

  /**
   * Track task completion
   */
  private trackCompletion(taskId: string): void {
    const taskTransitions = this.transitions.filter((t) => t.taskId === taskId);

    if (taskTransitions.length > 1) {
      const firstTransition = taskTransitions[0];
      const lastTransition = taskTransitions[taskTransitions.length - 1];

      const completionTime =
        lastTransition.timestamp.getTime() -
        firstTransition.timestamp.getTime();

      console.log('[Task Analytics] Task completed:', {
        taskId,
        completionTime: `${(completionTime / 1000 / 60).toFixed(2)} minutes`,
        transitions: taskTransitions.length,
      });
    }
  }

  /**
   * Track pending task resolution
   */
  private trackPendingResolution(taskId: string, newStatus: string): void {
    const pendingStart = this.transitions.find(
      (t) => t.taskId === taskId && t.toStatus === 'pending'
    );

    if (pendingStart) {
      const pendingDuration = Date.now() - pendingStart.timestamp.getTime();

      console.log('[Task Analytics] Pending task resolved:', {
        taskId,
        newStatus,
        timeInPending: `${(pendingDuration / 1000 / 60).toFixed(2)} minutes`,
      });
    }
  }

  /**
   * Get transitions for a specific task
   */
  getTaskHistory(taskId: string): TaskTransition[] {
    return this.transitions.filter((t) => t.taskId === taskId);
  }

  /**
   * Save transitions to localStorage
   */
  private saveTransitions(): void {
    try {
      const last100 = this.transitions.slice(-100);
      localStorage.setItem(this.storageKey, JSON.stringify(last100));
    } catch (error) {
      console.error('[Task Analytics] Failed to save transitions:', error);
    }
  }

  /**
   * Load transitions from localStorage
   */
  private loadTransitions(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.transitions = parsed.map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp),
        }));
      }
    } catch (error) {
      console.error('[Task Analytics] Failed to load transitions:', error);
      this.transitions = [];
    }
  }

  /**
   * Clear all analytics data
   */
  clearAnalytics(): void {
    this.transitions = [];
    localStorage.removeItem(this.storageKey);
    console.log('[Task Analytics] Analytics data cleared');
  }

  /**
   * Export analytics as JSON
   */
  exportAnalytics(): string {
    return JSON.stringify(
      {
        transitions: this.transitions,
        summary: this.getAnalytics(),
        pendingAnalytics: this.getPendingAnalytics(),
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }
}

export const taskAnalytics = new TaskAnalyticsService();

export function logTaskStatusChange(
  taskId: string,
  taskTitle: string,
  fromStatus: string,
  toStatus: string,
  userId: string,
  villaId?: string
): void {
  taskAnalytics.trackTransition({
    taskId,
    taskTitle,
    fromStatus,
    toStatus,
    userId,
    villaId,
  });
}
