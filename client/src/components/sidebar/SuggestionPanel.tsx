import { useStore } from "@/store/useStore";
import { X, Lightbulb, Zap, Check, XCircle } from "lucide-react";

const getLabelFromAction = (action: any): string => {
  if (action.label && action.label.trim() !== '') {
    return action.label;
  }
  switch (action.action) {
    case 'add':
      return `Add ${action.payload.type} node`;
    case 'remove':
      return `Remove element`;
    case 'update':
      if (action.payload.architecture) {
        return `Change to ${action.payload.architecture}`;
      }
      return 'Update element';
    default:
      return 'Apply Fix';
  }
};

export default function SuggestionsPanel() {
  const { 
    suggestions, 
    isSuggestionsPanelOpen, 
    setIsSuggestionsPanelOpen,
    applySuggestionAction,
    dismissSuggestion,
    setHighlightedElements,
  } = useStore();

  if (!isSuggestionsPanelOpen) {
    return null;
  }

  const handleApplyAction = (suggestionId: string, action: any) => {
    applySuggestionAction(suggestionId, action);
  };
  
  const getHighlightedIds = (suggestion: any) => {
    const ids: string[] = [];
    suggestion.actions.forEach((action: any) => {
      if (action.payload.nodeId) {
        ids.push(action.payload.nodeId);
      }
      if (action.payload.edgeId) {
        ids.push(action.payload.edgeId);
      }
    });
    return ids;
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
            <div
              key={suggestion.id}
              className={`p-3 rounded-lg border dark:border-dark-border transition-colors relative
                ${suggestion.applied
                  ? 'bg-primary/20 border-primary'
                  : 'bg-background dark:bg-dark-background hover:bg-border/50'
                }`}
              onMouseEnter={() => setHighlightedElements(getHighlightedIds(suggestion))}
              onMouseLeave={() => setHighlightedElements([])}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-sm text-text-main dark:text-dark-text-main">
                  {suggestion.title}
                </h3>
                {suggestion.applied && (
                  <span className="flex items-center gap-1 text-xs text-primary">
                    <Check size={14} /> Applied
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted dark:text-dark-text-muted mb-3">{suggestion.description}</p>
              <div className="flex flex-wrap gap-2">
                {suggestion.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleApplyAction(suggestion.id, action)}
                    disabled={suggestion.applied}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap size={14} className="flex-shrink-0" />
                    {getLabelFromAction(action)}
                  </button>
                ))}
                <button
                  onClick={() => dismissSuggestion(suggestion.id)}
                  className="ml-auto p-1 text-text-muted dark:text-dark-text-muted hover:bg-red-500/20 hover:text-red-400 rounded-md transition-colors"
                >
                  <XCircle size={16} />
                </button>
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