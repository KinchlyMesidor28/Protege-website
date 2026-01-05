import { useState } from 'react';
import { Clock } from 'lucide-react';

interface AutopilotSchedulerProps {
  onSchedule: (time: string) => void;
  onCancel: () => void;
}

export function AutopilotScheduler({ onSchedule, onCancel }: AutopilotSchedulerProps) {
  const [selectedTime, setSelectedTime] = useState('09:00');

  const handleConfirm = () => {
    onSchedule(selectedTime);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl border border-neutral-200 max-w-md w-full mx-4">
        {/* Header */}
        <div className="border-b border-neutral-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-100 rounded flex items-center justify-center">
              <Clock className="w-5 h-5 text-neutral-700" />
            </div>
            <div>
              <p className="text-neutral-900">Schedule Autopilot</p>
              <p className="text-neutral-600 text-sm">Set a daily execution time</p>
            </div>
          </div>
        </div>

        {/* Time Picker */}
        <div className="p-6">
          <label className="block text-neutral-700 mb-3">
            What time should I run this task daily?
          </label>
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400 transition-colors text-lg"
          />
          <p className="text-neutral-500 text-sm mt-3">
            The task will run automatically every day at this time
          </p>
        </div>

        {/* Actions */}
        <div className="border-t border-neutral-200 px-6 py-4 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-neutral-700 hover:text-neutral-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors"
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
