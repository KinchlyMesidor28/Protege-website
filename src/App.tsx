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
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Universal automation assistant (digital
              apprentice)
            </p>
            <p className="text-neutral-800 max-w-2xl mx-auto mt-8">
              An automation system you teach by doing. It
              silently observes a task once, refines away
              mistakes, and later offers to handle it
              automatically — without configuration, logic
              building, or cognitive load.
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

        {/* Adaptive Intelligence Demo */}
        <section className="max-w-4xl mx-auto px-6 py-16 border-t border-neutral-200">
          <div className="text-center mb-12">
            <span className="text-neutral-500 text-sm uppercase tracking-wide">
              The Refinement Law
            </span>
            <h2 className="text-neutral-900 mt-2 mb-4">
              Adaptive Form Intelligence
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Watch the form transform in real-time as you check
              different tasks. Protégé intelligently removes
              irrelevant fields and materializes exactly what's
              needed for the End Product.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Reports Card */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded flex items-center justify-center mb-4">
                📊
              </div>
              <h3 className="text-neutral-900 mb-2 text-base">
                Review Quarterly Reports
              </h3>
              <p className="text-neutral-600 text-sm mb-4">
                Check the first task to see the form adapt
              </p>
              <div className="bg-neutral-50 border border-neutral-200 rounded p-3 text-xs space-y-2">
                <div>
                  <p className="text-neutral-500 mb-1">
                    Shows:
                  </p>
                  <p className="text-neutral-700">
                    • Report ID
                  </p>
                  <p className="text-neutral-700">
                    • Key Findings
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500 mb-1">
                    Header:
                  </p>
                  <p className="text-neutral-800 text-xs">
                    PROTÉGÉ AUTOMATING: REPORT ANALYSIS
                  </p>
                </div>
                <div className="pt-2 border-t border-neutral-200">
                  <p className="text-neutral-500 mb-1">
                    The Logic:
                  </p>
                  <p className="text-neutral-700">
                    Identifies end product as report synthesis
                    and ignores email-related fields as noise
                  </p>
                </div>
              </div>
            </div>

            {/* Spreadsheet Card */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded flex items-center justify-center mb-4">
                📈
              </div>
              <h3 className="text-neutral-900 mb-2 text-base">
                Update Client Spreadsheet
              </h3>
              <p className="text-neutral-600 text-sm mb-4">
                Check the second task for spreadsheet fields
              </p>
              <div className="bg-neutral-50 border border-neutral-200 rounded p-3 text-xs space-y-2">
                <div>
                  <p className="text-neutral-500 mb-1">
                    Shows:
                  </p>
                  <p className="text-neutral-700">
                    • Client Name
                  </p>
                  <p className="text-neutral-700">
                    • Revenue/Value
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500 mb-1">
                    Header:
                  </p>
                  <p className="text-neutral-800 text-xs">
                    PROTÉGÉ AUTOMATING: DATABASE UPDATE
                  </p>
                </div>
                <div className="pt-2 border-t border-neutral-200">
                  <p className="text-neutral-500 mb-1">
                    The Logic:
                  </p>
                  <p className="text-neutral-700">
                    Applies Adaptive Automation to map form to
                    spreadsheet structure
                  </p>
                </div>
              </div>
            </div>

            {/* Emails Card */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <div className="w-10 h-10 bg-green-100 text-green-700 rounded flex items-center justify-center mb-4">
                ✉️
              </div>
              <h3 className="text-neutral-900 mb-2 text-base">
                Send Follow-up Emails
              </h3>
              <p className="text-neutral-600 text-sm mb-4">
                Check the third task for email composition
              </p>
              <div className="bg-neutral-50 border border-neutral-200 rounded p-3 text-xs space-y-2">
                <div>
                  <p className="text-neutral-500 mb-1">
                    Shows:
                  </p>
                  <p className="text-neutral-700">
                    • Recipient
                  </p>
                  <p className="text-neutral-700">• Message</p>
                </div>
                <div>
                  <p className="text-neutral-500 mb-1">
                    Header:
                  </p>
                  <p className="text-neutral-800 text-xs">
                    PROTÉGÉ AUTOMATING: CLIENT OUTREACH
                  </p>
                </div>
                <div className="pt-2 border-t border-neutral-200">
                  <p className="text-neutral-500 mb-1">
                    The Logic:
                  </p>
                  <p className="text-neutral-700">
                    Uses Goal-Oriented Imagination to bridge gap
                    between task list and drafted email
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Insight */}
          <div className="mt-8 bg-neutral-900 text-white rounded-lg p-6 text-center">
            <p className="text-neutral-300 text-sm mb-2">
              The Adaptive Mind Principle
            </p>
            <p className="text-base">
              Protégé doesn't just record actions—it understands
              context and adapts the interface to eliminate
              cognitive load. The form becomes an extension of
              your intent.
            </p>
          </div>
        </section>

        {/* Modes */}
        <section className="max-w-4xl mx-auto px-6 py-16 border-t border-neutral-200">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="mb-4">
                <span className="text-neutral-500 text-sm uppercase tracking-wide">
                  Mode 1
                </span>
                <h3 className="text-neutral-900 mt-2">
                  Teach Mode
                </h3>
              </div>
              <p className="text-neutral-600 mb-4">
                Observe Only
              </p>
              <ul className="space-y-2 text-neutral-700">
                <li>• Completely silent</li>
                <li>• No questions</li>
                <li>• No interruptions</li>
                <li>• Fixed bar at top</li>
                <li>• Like an apprentice watching quietly</li>
              </ul>
            </div>

            <div>
              <div className="mb-4">
                <span className="text-neutral-500 text-sm uppercase tracking-wide">
                  Mode 2
                </span>
                <h3 className="text-neutral-900 mt-2">
                  Assist Mode
                </h3>
              </div>
              <p className="text-neutral-600 mb-4">
                Ask + Automate
              </p>
              <ul className="space-y-2 text-neutral-700">
                <li>• One simple confirmation</li>
                <li>• Never during task execution</li>
                <li>• Small suggestion bubble</li>
                <li>• Clear yes/no choice</li>
                <li>• Maintains user flow</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Processing Architecture */}
        <section className="max-w-4xl mx-auto px-6 py-16 border-t border-neutral-200">
          <div className="text-center mb-12">
            <h2 className="text-neutral-900">
              Intelligence Architecture
            </h2>
            <p className="text-neutral-600 mt-2">
              Three-module system that transforms raw recordings
              into refined automation
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-neutral-900 text-white rounded flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-neutral-900 mb-2">
                    Goal Deduction Module
                  </h3>
                  <p className="text-neutral-700 mb-3">
                    Identifies the User's Intention
                  </p>
                  <p className="text-neutral-600 text-sm mb-2">
                    Automatically determines the Terminal
                    Success State (Z) by analyzing the final
                    moments of the teaching session.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <p className="text-neutral-500 mb-1">
                        Input
                      </p>
                      <p className="text-neutral-700">
                        End of raw log
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-500 mb-1">
                        Output
                      </p>
                      <p className="text-neutral-700">
                        Terminal success state (Z)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-neutral-900 text-white rounded flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-neutral-900 mb-2">
                    Backward Tracing Module
                  </h3>
                  <p className="text-neutral-700 mb-3">
                    Maps Causal Necessity
                  </p>
                  <p className="text-neutral-600 text-sm mb-2">
                    Traces backward from Z to preserve only the
                    actions that were causally required to
                    achieve the goal.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <p className="text-neutral-500 mb-1">
                        Input
                      </p>
                      <p className="text-neutral-700">
                        End state (Z) + raw log
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-500 mb-1">
                        Output
                      </p>
                      <p className="text-neutral-700">
                        Keep list of necessary steps
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-neutral-900 text-white rounded flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-neutral-900 mb-2">
                    Noise Pruning Module
                  </h3>
                  <p className="text-neutral-700 mb-3">
                    Filters Out Mistakes and Noise
                  </p>
                  <p className="text-neutral-600 text-sm mb-2">
                    Removes all data that did not contribute to
                    the final success, strictly enforcing the
                    Learning Law.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <p className="text-neutral-500 mb-1">
                        Input
                      </p>
                      <p className="text-neutral-700">
                        Raw log + keep list
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-500 mb-1">
                        Output
                      </p>
                      <p className="text-neutral-700">
                        Refined executable script
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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