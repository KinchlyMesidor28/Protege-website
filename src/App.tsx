import { useState } from "react";
import { TeachModeBar } from "./components/TeachModeBar";
import { SuggestionBubble } from "./components/SuggestionBubble";
import { AutomationFeedback } from "./components/AutomationFeedback";
import { DemoWorkspace } from "./components/DemoWorkspace";
import { ProcessingVisualization } from "./components/ProcessingVisualization";
import { AutopilotScheduler } from "./components/AutopilotScheduler";
import { processRecording } from "./lib/automation-engine";

export interface RecordedAction {
  type: "click" | "input" | "toggle";
  target: string;
  value?: string | boolean;
  timestamp: number;
}

export default function App() {
  const [isTeaching, setIsTeaching] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [recordedActions, setRecordedActions] = useState<
    RecordedAction[]
  >([]);
  const [savedTask, setSavedTask] = useState<
    RecordedAction[] | null
  >(null);
  const [isAutomating, setIsAutomating] = useState(false);
  const [rawActionCount, setRawActionCount] = useState(0);
  const [scheduledTime, setScheduledTime] = useState<
    string | null
  >(null);
  const [teachingJustFinished, setTeachingJustFinished] =
    useState(false);

  const handleStartTeaching = () => {
    setIsTeaching(true);
    setShowSuggestion(false);
    setRecordedActions([]);
    setRawActionCount(0);
  };

  const handleRecordAction = (action: RecordedAction) => {
    if (isTeaching) {
      setRecordedActions((prev) => [...prev, action]);
    }
  };

  const handleFinishTeaching = () => {
    setIsTeaching(false);
    setTeachingJustFinished(true);

    if (recordedActions.length > 0) {
      // Store raw count before processing
      setRawActionCount(recordedActions.length);

      // Process the raw log through the three-module system
      const refinedScript = processRecording(recordedActions);

      // Only show suggestion if refined script has meaningful actions
      if (refinedScript.length > 0) {
        setRecordedActions(refinedScript);
        setTimeout(() => {
          setShowSuggestion(true);
          setTeachingJustFinished(false);
        }, 500);
      }
    }
  };

  const handleCancelTeaching = () => {
    setIsTeaching(false);
    setRecordedActions([]);
  };

  const handleYesSuggestion = () => {
    setShowSuggestion(false);
    setSavedTask(recordedActions);
    setFeedbackMessage("Task saved. I'll handle it next time.");
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
    }, 2500);
  };

  const handleNotNow = () => {
    setShowSuggestion(false);
    setRecordedActions([]);
  };

  const handleSchedule = () => {
    setShowSuggestion(false);
    setShowScheduler(true);
  };

  const handleScheduleAutomation = (time: string) => {
    setShowScheduler(false);
    setSavedTask(recordedActions);
    setScheduledTime(time);
    setFeedbackMessage(
      `Autopilot scheduled for ${time} daily.`,
    );
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
    }, 2500);
  };

  const handleCancelScheduler = () => {
    setShowScheduler(false);
    setShowSuggestion(true);
  };

  const handleRunAutomation = async () => {
    if (!savedTask || savedTask.length === 0) return;

    setIsAutomating(true);
    setFeedbackMessage("Protégé is automating…");
    setShowFeedback(true);

    // Let the feedback show, then emit actions for the workspace to handle
    setTimeout(() => {
      // The workspace will handle the actual automation
      setShowFeedback(false);
      setTimeout(() => {
        setFeedbackMessage("Task completed ✓");
        setShowFeedback(true);
        setTimeout(() => {
          setShowFeedback(false);
          setIsAutomating(false);
        }, 2000);
      }, 100);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {isTeaching && (
        <TeachModeBar
          onFinish={handleFinishTeaching}
          onCancel={handleCancelTeaching}
        />
      )}

      {showSuggestion && (
        <SuggestionBubble
          onYes={handleYesSuggestion}
          onNotNow={handleNotNow}
          onSchedule={handleSchedule}
        />
      )}

      {showScheduler && (
        <AutopilotScheduler
          onSchedule={handleScheduleAutomation}
          onCancel={handleCancelScheduler}
        />
      )}

      {showFeedback && (
        <AutomationFeedback message={feedbackMessage} />
      )}

      <div className={isTeaching ? "mt-11" : ""}>
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-6 pt-24 pb-16">
          <div className="text-center space-y-6">
            <h1 className="text-neutral-900">PROTÉGÉ</h1>
            <p className="text-neutral-800 max-w-2xl mx-auto">
              An automation system you teach by doing. It silently observes a task once, refines away mistakes, and later offers to handle it automatically — without configuration, logic building, or cognitive load.
            </p>
          </div>
        </section>

        {/* Principle */}
        <section className="max-w-4xl mx-auto px-6 py-12 border-t border-neutral-200">
          <div className="text-center">
            <p className="text-neutral-900 mb-4">
              Design Philosophy
            </p>
            <p className="text-neutral-700 text-2xl">
              Perfect automation removes decision-making.
            </p>
          </div>
        </section>

        {/* Interactive Demo */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-8">
            <h2 className="text-neutral-900 mb-3">
              Interactive Demo
            </h2>
            <p className="text-neutral-600">
              Experience how Protégé learns and assists
            </p>
          </div>

          <DemoWorkspace
            isTeaching={isTeaching}
            onStartTeaching={handleStartTeaching}
            onRecordAction={handleRecordAction}
            savedTask={savedTask}
            isAutomating={isAutomating}
            onRunAutomation={handleRunAutomation}
            onTeachingFinished={
              teachingJustFinished ? () => {} : undefined
            }
          />

          {rawActionCount > 0 && recordedActions.length > 0 && (
            <div className="mt-6">
              <ProcessingVisualization
                rawCount={rawActionCount}
                refinedCount={recordedActions.length}
              />
            </div>
          )}
        </section>

        {/* Modes */}
        <section className="max-w-4xl mx-auto px-6 py-16 border-t border-neutral-200">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-neutral-900 mb-3">
                Teach Mode
              </h3>
              <p className="text-neutral-600">
                Silently observes. No questions. No interruptions.
              </p>
            </div>

            <div>
              <h3 className="text-neutral-900 mb-3">
                Assist Mode
              </h3>
              <p className="text-neutral-600">
                One confirmation. Then automates.
              </p>
            </div>
          </div>
        </section>

        {/* Visual Tone */}
        <section className="max-w-4xl mx-auto px-6 py-16 border-t border-neutral-200">
          <div className="text-center mb-12">
            <h2 className="text-neutral-900">Visual Tone</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-neutral-900 rounded-sm"></div>
              <p className="text-neutral-600">Intelligent</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-neutral-800 rounded-sm"></div>
              <p className="text-neutral-600">Restrained</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-neutral-700 rounded-sm"></div>
              <p className="text-neutral-600">Confident</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-neutral-600 rounded-sm"></div>
              <p className="text-neutral-600">Minimal</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-neutral-500 rounded-sm"></div>
              <p className="text-neutral-600">Professional</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-4xl mx-auto px-6 py-12 border-t border-neutral-200">
          <p className="text-center text-neutral-500">
            Protégé is not cute. It is competent.
          </p>
        </footer>
      </div>
    </div>
  );
}