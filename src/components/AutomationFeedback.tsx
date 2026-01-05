interface AutomationFeedbackProps {
  message: string;
}

export function AutomationFeedback({ message }: AutomationFeedbackProps) {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="bg-neutral-900 text-white px-6 py-3 rounded-lg shadow-lg">
        <p>{message}</p>
      </div>
    </div>
  );
}
