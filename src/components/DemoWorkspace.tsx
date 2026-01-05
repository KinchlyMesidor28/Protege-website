import { useState, useEffect } from 'react';
import type { RecordedAction } from '../App';

interface DemoWorkspaceProps {
  isTeaching: boolean;
  onStartTeaching: () => void;
  onRecordAction: (action: RecordedAction) => void;
  savedTask: RecordedAction[] | null;
  isAutomating: boolean;
  onRunAutomation: () => void;
  onTeachingFinished?: () => void;
}

interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
}

type FormMode = 'default' | 'reports' | 'spreadsheet' | 'emails';

interface AdaptiveFormData {
  // Default mode
  email: string;
  status: string;
  // Reports mode
  reportId: string;
  findingsSummary: string;
  // Spreadsheet mode
  clientName: string;
  revenueValue: string;
  // Emails mode
  prospectName: string;
  customMessage: string;
}

export function DemoWorkspace({
  isTeaching,
  onStartTeaching,
  onRecordAction,
  savedTask,
  isAutomating,
  onRunAutomation,
  onTeachingFinished,
}: DemoWorkspaceProps) {
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: 'task-1', title: 'Review quarterly reports', completed: false },
    { id: 'task-2', title: 'Update client spreadsheet', completed: false },
    { id: 'task-3', title: 'Send follow-up emails', completed: false },
  ]);

  const [formData, setFormData] = useState<AdaptiveFormData>({
    email: '',
    status: '',
    reportId: '',
    findingsSummary: '',
    clientName: '',
    revenueValue: '',
    prospectName: '',
    customMessage: '',
  });

  const [formMode, setFormMode] = useState<FormMode>('default');

  // Auto-clear form when teaching finishes
  useEffect(() => {
    if (!isTeaching && onTeachingFinished) {
      // Clear form data
      setFormData({
        email: '',
        status: '',
        reportId: '',
        findingsSummary: '',
        clientName: '',
        revenueValue: '',
        prospectName: '',
        customMessage: '',
      });
      // Reset tasks
      setTasks([
        { id: 'task-1', title: 'Review quarterly reports', completed: false },
        { id: 'task-2', title: 'Update client spreadsheet', completed: false },
        { id: 'task-3', title: 'Send follow-up emails', completed: false },
      ]);
    }
  }, [isTeaching, onTeachingFinished]);

  // Replay saved task
  useEffect(() => {
    if (isAutomating && savedTask) {
      // First, reset everything to ensure clean state
      setTasks([
        { id: 'task-1', title: 'Review quarterly reports', completed: false },
        { id: 'task-2', title: 'Update client spreadsheet', completed: false },
        { id: 'task-3', title: 'Send follow-up emails', completed: false },
      ]);
      setFormData({
        email: '',
        status: '',
        reportId: '',
        findingsSummary: '',
        clientName: '',
        revenueValue: '',
        prospectName: '',
        customMessage: '',
      });
      setFormMode('default');

      const replayActions = async () => {
        for (let i = 0; i < savedTask.length; i++) {
          const action = savedTask[i];
          
          // Small delay between actions for visual effect
          await new Promise(resolve => setTimeout(resolve, 300));

          if (action.type === 'toggle' && typeof action.value === 'boolean') {
            // Only update the specific task that was toggled
            setTasks(prev =>
              prev.map(task =>
                task.id === action.target 
                  ? { ...task, completed: action.value } 
                  : task  // Keep other tasks as they are
              )
            );
            // Update form mode based on which task was toggled to true
            if (action.value === true) {
              if (action.target === 'task-1') {
                setFormMode('reports');
              } else if (action.target === 'task-2') {
                setFormMode('spreadsheet');
              } else if (action.target === 'task-3') {
                setFormMode('emails');
              }
            }
          } else if (action.type === 'input' && typeof action.value === 'string') {
            setFormData(prev => ({
              ...prev,
              [action.target]: action.value,
            }));
          }
        }
      };

      replayActions();
    }
  }, [isAutomating, savedTask]);

  const handleToggleTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newCompletedState = !task.completed;
    
    // If checking a task, uncheck all others for clean adaptive form demo
    if (newCompletedState) {
      // Record unchecking of other tasks if teaching
      if (isTeaching) {
        tasks.forEach(t => {
          if (t.id !== taskId && t.completed) {
            onRecordAction({
              type: 'toggle',
              target: t.id,
              value: false,
              timestamp: Date.now(),
            });
          }
        });
      }
      
      setTasks(prev =>
        prev.map(t => ({ ...t, completed: t.id === taskId }))
      );
    } else {
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, completed: false } : t))
      );
    }

    // Adaptive Form Logic: Update form mode based on task
    if (newCompletedState) {
      // Task was just checked - adapt form
      if (taskId === 'task-1') {
        setFormMode('reports');
      } else if (taskId === 'task-2') {
        setFormMode('spreadsheet');
      } else if (taskId === 'task-3') {
        setFormMode('emails');
      }
    } else {
      // Task was unchecked - return to default
      setFormMode('default');
    }

    if (isTeaching) {
      onRecordAction({
        type: 'toggle',
        target: taskId,
        value: newCompletedState,
        timestamp: Date.now(),
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (isTeaching) {
      onRecordAction({
        type: 'input',
        target: field,
        value: value,
        timestamp: Date.now(),
      });
    }
  };

  const handleTeachClick = () => {
    // The End Product Reset: When teaching begins, reset everything to initial state
    setTasks([
      { id: 'task-1', title: 'Review quarterly reports', completed: false },
      { id: 'task-2', title: 'Update client spreadsheet', completed: false },
      { id: 'task-3', title: 'Send follow-up emails', completed: false },
    ]);
    setFormData({
      email: '',
      status: '',
      reportId: '',
      findingsSummary: '',
      clientName: '',
      revenueValue: '',
      prospectName: '',
      customMessage: '',
    });
    setFormMode('default');
    onStartTeaching();
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <h3 className="text-neutral-900">Sample Workspace</h3>
          <div className="flex gap-3">
            {!isTeaching && savedTask && savedTask.length > 0 && (
              <button
                onClick={onRunAutomation}
                disabled={isAutomating}
                className="px-4 py-2 bg-neutral-100 text-neutral-900 rounded hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                Run Task
              </button>
            )}
            {!isTeaching && (
              <button
                onClick={handleTeachClick}
                className="px-4 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors"
              >
                Teach Protégé
              </button>
            )}
          </div>
        </div>

        {isTeaching && (
          <div className="bg-neutral-50 border border-neutral-200 rounded p-4">
            <p className="text-neutral-800 mb-2">Protégé is silently observing...</p>
            <p className="text-neutral-600 text-sm">
              Try completing tasks, filling out the form, or any combination. Click "Finish" when done.
            </p>
          </div>
        )}

        {/* Task List */}
        <div>
          <p className="text-neutral-700 mb-3">Daily Tasks</p>
          <div className="space-y-2">
            {tasks.map(task => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 border border-neutral-200 rounded hover:border-neutral-300 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleTask(task.id)}
                  className="w-4 h-4 cursor-pointer"
                  disabled={isAutomating}
                />
                <span className={task.completed ? 'text-neutral-400 line-through' : 'text-neutral-800'}>
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Adaptive Form Section */}
        <div className="pt-4 border-t border-neutral-200">
          <p className="text-neutral-700 mb-3">Quick Form</p>
          
          <div className="space-y-3 transition-all duration-300">
            {/* Default Mode */}
            {formMode === 'default' && (
              <>
                <div className="animate-fade-in">
                  <label className="block text-neutral-600 text-sm mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 border border-neutral-200 rounded focus:outline-none focus:border-neutral-400 transition-colors"
                    disabled={isAutomating}
                  />
                </div>
                <div className="animate-fade-in">
                  <label className="block text-neutral-600 text-sm mb-1">
                    Status
                  </label>
                  <input
                    type="text"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    placeholder="e.g., In Progress"
                    className="w-full px-3 py-2 border border-neutral-200 rounded focus:outline-none focus:border-neutral-400 transition-colors"
                    disabled={isAutomating}
                  />
                </div>
              </>
            )}

            {/* Reports Mode */}
            {formMode === 'reports' && (
              <>
                <div className="animate-fade-in">
                  <label className="block text-neutral-600 text-sm mb-1">
                    Report ID
                  </label>
                  <input
                    type="text"
                    value={formData.reportId}
                    onChange={(e) => handleInputChange('reportId', e.target.value)}
                    placeholder="Q4-2024-REP"
                    className="w-full px-3 py-2 border border-neutral-200 rounded focus:outline-none focus:border-neutral-400 transition-colors"
                    disabled={isAutomating}
                  />
                </div>
                <div className="animate-fade-in">
                  <label className="block text-neutral-600 text-sm mb-1">
                    Key Findings
                  </label>
                  <textarea
                    value={formData.findingsSummary}
                    onChange={(e) => handleInputChange('findingsSummary', e.target.value)}
                    placeholder="Brief summary of key findings..."
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-200 rounded focus:outline-none focus:border-neutral-400 transition-colors resize-none"
                    disabled={isAutomating}
                  />
                </div>
              </>
            )}

            {/* Spreadsheet Mode */}
            {formMode === 'spreadsheet' && (
              <>
                <div className="animate-fade-in">
                  <label className="block text-neutral-600 text-sm mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    placeholder="Acme Corporation"
                    className="w-full px-3 py-2 border border-neutral-200 rounded focus:outline-none focus:border-neutral-400 transition-colors"
                    disabled={isAutomating}
                  />
                </div>
                <div className="animate-fade-in">
                  <label className="block text-neutral-600 text-sm mb-1">
                    Revenue/Value
                  </label>
                  <input
                    type="text"
                    value={formData.revenueValue}
                    onChange={(e) => handleInputChange('revenueValue', e.target.value)}
                    placeholder="$125,000"
                    className="w-full px-3 py-2 border border-neutral-200 rounded focus:outline-none focus:border-neutral-400 transition-colors"
                    disabled={isAutomating}
                  />
                </div>
              </>
            )}

            {/* Emails Mode */}
            {formMode === 'emails' && (
              <>
                <div className="animate-fade-in">
                  <label className="block text-neutral-600 text-sm mb-1">
                    Recipient
                  </label>
                  <input
                    type="text"
                    value={formData.prospectName}
                    onChange={(e) => handleInputChange('prospectName', e.target.value)}
                    placeholder="Sarah Johnson"
                    className="w-full px-3 py-2 border border-neutral-200 rounded focus:outline-none focus:border-neutral-400 transition-colors"
                    disabled={isAutomating}
                  />
                </div>
                <div className="animate-fade-in">
                  <label className="block text-neutral-600 text-sm mb-1">
                    Message
                  </label>
                  <textarea
                    value={formData.customMessage}
                    onChange={(e) => handleInputChange('customMessage', e.target.value)}
                    placeholder="Hi Sarah, following up on our conversation..."
                    rows={4}
                    className="w-full px-3 py-2 border border-neutral-200 rounded focus:outline-none focus:border-neutral-400 transition-colors resize-none"
                    disabled={isAutomating}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {!isTeaching && savedTask && savedTask.length > 0 && (
          <div className="pt-4 border-t border-neutral-200">
            <p className="text-neutral-600 text-sm text-center">
              Task learned with {savedTask.length} action{savedTask.length !== 1 ? 's' : ''}. Click "Run Task" to automate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}