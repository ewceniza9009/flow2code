import { useStore } from "@/store/useStore";
import { X, Lightbulb, Zap } from "lucide-react";

export default function SuggestionsPanel() {
  const { 
    suggestions, 
    isSuggestionsPanelOpen, 
    setIsSuggestionsPanelOpen 
  } = useStore();

  if (!isSuggestionsPanelOpen) {
    return null;
  }

  const handleApplyAction = (action: any) => {
    alert(`Action "${action.label}" clicked. Apply logic needs to be implemented.`);
    console.log("Apply action payload:", action.payload);
  };

  return (
    <div className="absolute top-0 right-0 h-full w-[400px] z-20 bg-surface dark:bg-dark-surface p-3 overflow-y-auto flex flex-col shadow-2xl border-l-2 border-border dark:border-dark-border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-text-main dark:text-dark-text-main flex items-center gap-2">
          <Lightbulb size={18} className="text-yellow-400" />
          AI Suggestions
        </h2>
        <button
          onClick={() => setIsSuggestionsPanelOpen(false)}
          className="text-text-muted dark:text-dark-text-muted hover:text-text-main dark:hover:text-dark-text-main"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4 flex-grow">
        {suggestions.length > 0 ? (
          suggestions.map((suggestion) => (
            <div key={suggestion.id} className="bg-background dark:bg-dark-background p-3 rounded-lg border border-border dark:border-dark-border">
              <h3 className="font-bold text-sm text-text-main dark:text-dark-text-main mb-1">{suggestion.title}</h3>
              <p className="text-xs text-text-muted dark:text-dark-text-muted mb-3">{suggestion.description}</p>
              <div className="flex flex-wrap gap-2">
                {suggestion.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleApplyAction(action)}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors"
                  >
                    <Zap size={14} />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-text-muted dark:text-dark-text-muted text-sm p-4">
            <p>Great job! The AI found no major issues to suggest.</p>
          </div>
        )}
      </div>
    </div>
  );
}