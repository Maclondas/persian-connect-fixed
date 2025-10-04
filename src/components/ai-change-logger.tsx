import { useEffect } from 'react';
import { getGlobalChangeTracker } from './hooks/useChangeTracker';

// This component helps track AI changes automatically
export function AIChangeLogger() {
  useEffect(() => {
    // Function to log AI changes
    const logAIChange = (action: 'create' | 'edit' | 'delete', filePath: string, description: string, previousContent?: string, newContent?: string) => {
      try {
        const tracker = getGlobalChangeTracker();
        tracker.addChange({
          action,
          filePath,
          description,
          previousContent,
          newContent
        });
        console.log('✅ AI Change logged:', { action, filePath, description });
      } catch (error) {
        console.warn('Could not log AI change:', error);
      }
    };

    // Make logAIChange available globally for the AI assistant
    (window as any).logAIChange = logAIChange;

    return () => {
      // Cleanup
      delete (window as any).logAIChange;
    };
  }, []);

  return null; // This component doesn't render anything
}

// Helper function for the AI assistant to use
export function logChange(action: 'create' | 'edit' | 'delete', filePath: string, description: string, previousContent?: string, newContent?: string) {
  if (typeof window !== 'undefined' && (window as any).logAIChange) {
    (window as any).logAIChange(action, filePath, description, previousContent, newContent);
  }
}