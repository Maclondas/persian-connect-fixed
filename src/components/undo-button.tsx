import { useState } from 'react';
import { Button } from './ui/button';
import { RotateCcw, History } from 'lucide-react';
import { UndoSystem } from './undo-system';
import { useLanguage } from './hooks/useLanguage';
import { useChangeTracker, setGlobalChangeTracker } from './hooks/useChangeTracker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function UndoButton() {
  const [isUndoSystemOpen, setIsUndoSystemOpen] = useState(false);
  const { currentLanguage } = useLanguage();
  const changeTracker = useChangeTracker();
  
  // Set global tracker for AI assistant access
  setGlobalChangeTracker(changeTracker);

  const undoableChanges = changeTracker.changes.filter(c => c.canUndo).length;

  return (
    <>
      {/* Floating Undo Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsUndoSystemOpen(true)}
              className="fixed bottom-24 right-4 z-40 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90 md:bottom-6 md:right-6"
              size="sm"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{currentLanguage === 'en' ? 'Undo System' : 'سیستم برگشت'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Quick Access Badge - Shows recent changes count */}
      {undoableChanges > 0 && (
        <div className="fixed bottom-32 right-4 z-30 md:bottom-14 md:right-6">
          <div className="bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium animate-pulse">
            {undoableChanges}
          </div>
        </div>
      )}

      {/* Undo System Modal */}
      <UndoSystem 
        isOpen={isUndoSystemOpen} 
        onClose={() => setIsUndoSystemOpen(false)} 
      />
    </>
  );
}