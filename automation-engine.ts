import type { RecordedAction } from '../App';

interface FinalState {
  completedTasks: string[];
  formValues: Record<string, string>;
  timestamp: number;
}

/**
 * Module 1: Goal Deduction Module
 * Identifies the User's Intention
 * Automatically determines the Terminal Success State (Z) by analyzing
 * the final moments of the teaching session.
 */
export function deduceGoal(actions: RecordedAction[]): FinalState {
  const finalState: FinalState = {
    completedTasks: [],
    formValues: {},
    timestamp: Date.now(),
  };

  // Analyze the end result by looking at final state of all targets
  const targetStates = new Map<string, { value: any; timestamp: number }>();

  // Process all actions to get final state of each target
  actions.forEach(action => {
    const existing = targetStates.get(action.target);
    
    // Keep the latest action for each target
    if (!existing || action.timestamp > existing.timestamp) {
      targetStates.set(action.target, {
        value: action.value,
        timestamp: action.timestamp,
      });
    }
  });

  // Build the final state
  targetStates.forEach((state, target) => {
    if (target.startsWith('task-') && state.value === true) {
      finalState.completedTasks.push(target);
    } else if (typeof state.value === 'string' && state.value.trim() !== '') {
      finalState.formValues[target] = state.value;
    }
  });

  return finalState;
}

/**
 * Module 2: Backward Tracing Module
 * Maps Causal Necessity
 * Traces backward from Z to preserve only the actions that were
 * causally required to achieve the goal.
 */
export function traceBackward(
  actions: RecordedAction[],
  goal: FinalState
): RecordedAction[] {
  const keepList: RecordedAction[] = [];
  const necessaryTargets = new Set<string>();

  // Identify all targets that are part of the goal state
  goal.completedTasks.forEach(taskId => necessaryTargets.add(taskId));
  Object.keys(goal.formValues).forEach(field => necessaryTargets.add(field));

  // Trace backward: find the last action for each necessary target
  const targetToLastAction = new Map<string, RecordedAction>();

  actions.forEach(action => {
    if (necessaryTargets.has(action.target)) {
      const existing = targetToLastAction.get(action.target);
      
      // Keep only the final action for each target (the one that matches goal state)
      if (!existing || action.timestamp > existing.timestamp) {
        const shouldKeep = 
          (action.type === 'toggle' && goal.completedTasks.includes(action.target)) ||
          (action.type === 'input' && action.value === goal.formValues[action.target]);
        
        if (shouldKeep) {
          targetToLastAction.set(action.target, action);
        }
      }
    }
  });

  // Convert to list, preserving chronological order
  const sortedActions = Array.from(targetToLastAction.values()).sort(
    (a, b) => a.timestamp - b.timestamp
  );

  return sortedActions;
}

/**
 * Module 3: Noise Pruning Module
 * Filters Out Mistakes and Noise
 * Removes all data that did not contribute to the final success,
 * strictly enforcing the Learning Law.
 */
export function pruneNoise(
  rawLog: RecordedAction[],
  keepList: RecordedAction[]
): RecordedAction[] {
  // Create a set of actions to keep (by timestamp + target for uniqueness)
  const keepSet = new Set(
    keepList.map(action => `${action.timestamp}-${action.target}`)
  );

  // Filter: only return actions that are in the keep list
  const refinedScript = rawLog.filter(action => 
    keepSet.has(`${action.timestamp}-${action.target}`)
  );

  // Additional noise removal: eliminate redundant actions
  const uniqueTargets = new Map<string, RecordedAction>();
  
  refinedScript.forEach(action => {
    const existing = uniqueTargets.get(action.target);
    
    // Keep only the latest meaningful action for each target
    if (!existing || action.timestamp > existing.timestamp) {
      uniqueTargets.set(action.target, action);
    }
  });

  // Return in chronological order
  return Array.from(uniqueTargets.values()).sort(
    (a, b) => a.timestamp - b.timestamp
  );
}

/**
 * Master Processing Function
 * Orchestrates all three modules to transform raw recordings into refined automation
 */
export function processRecording(rawLog: RecordedAction[]): RecordedAction[] {
  if (rawLog.length === 0) return [];

  // Module 1: Deduce the goal from the final state
  const goal = deduceGoal(rawLog);

  // Module 2: Trace backward to find causally necessary actions
  const keepList = traceBackward(rawLog, goal);

  // Module 3: Prune all noise and mistakes
  const refinedScript = pruneNoise(rawLog, keepList);

  return refinedScript;
}

/**
 * Generates a human-readable description of what the task does
 */
export function describeTask(actions: RecordedAction[]): string {
  if (actions.length === 0) return 'No actions recorded';

  const descriptions: string[] = [];
  
  actions.forEach(action => {
    if (action.type === 'toggle' && action.value === true) {
      descriptions.push('complete a task');
    } else if (action.type === 'input' && typeof action.value === 'string') {
      descriptions.push('fill a form field');
    }
  });

  const uniqueDescriptions = Array.from(new Set(descriptions));
  
  if (uniqueDescriptions.length === 0) return 'Perform actions';
  if (uniqueDescriptions.length === 1) return uniqueDescriptions[0];
  
  return uniqueDescriptions.join(' and ');
}
