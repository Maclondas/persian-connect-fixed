import { useState, useEffect } from 'react';

export interface FileChange {
  id: string;
  timestamp: Date;
  action: 'create' | 'edit' | 'delete';
  filePath: string;
  description: string;
  previousContent?: string;
  newContent?: string;
  canUndo: boolean;
  aiGenerated: boolean;
}

export interface ChangeTracker {
  changes: FileChange[];
  addChange: (change: Omit<FileChange, 'id' | 'timestamp' | 'canUndo' | 'aiGenerated'>) => void;
  undoChange: (changeId: string) => Promise<boolean>;
  clearHistory: () => void;
  exportHistory: () => void;
}

const STORAGE_KEY = 'persian-connect-changes';
const MAX_CHANGES = 50; // Keep last 50 changes

export function useChangeTracker(): ChangeTracker {
  const [changes, setChanges] = useState<FileChange[]>([]);

  // Load changes from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const restoredChanges = parsed.map((change: any) => ({
          ...change,
          timestamp: new Date(change.timestamp)
        }));
        setChanges(restoredChanges);
      }
    } catch (error) {
      console.error('Failed to load change history:', error);
    }
  }, []);

  // Save changes to localStorage when they update
  useEffect(() => {
    try {
      const toSave = changes.map(change => ({
        ...change,
        timestamp: change.timestamp.toISOString()
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error('Failed to save change history:', error);
    }
  }, [changes]);

  const addChange = (change: Omit<FileChange, 'id' | 'timestamp' | 'canUndo' | 'aiGenerated'>) => {
    const newChange: FileChange = {
      ...change,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      canUndo: true,
      aiGenerated: true
    };

    setChanges(prev => {
      const updated = [newChange, ...prev].slice(0, MAX_CHANGES);
      return updated;
    });
  };

  const undoChange = async (changeId: string): Promise<boolean> => {
    try {
      const change = changes.find(c => c.id === changeId);
      if (!change || !change.canUndo) {
        return false;
      }

      // Mark as undone
      setChanges(prev => prev.map(c => 
        c.id === changeId ? { ...c, canUndo: false } : c
      ));

      // In a real implementation, this would call the actual file restoration
      console.log('Undo operation for:', change);
      
      // Add an undo record
      const undoRecord: FileChange = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        action: 'edit',
        filePath: change.filePath,
        description: `Undone: ${change.description}`,
        previousContent: change.newContent,
        newContent: change.previousContent,
        canUndo: false,
        aiGenerated: false
      };

      setChanges(prev => [undoRecord, ...prev]);

      return true;
    } catch (error) {
      console.error('Undo failed:', error);
      return false;
    }
  };

  const clearHistory = () => {
    setChanges([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const exportHistory = () => {
    const historyData = {
      exportDate: new Date().toISOString(),
      projectName: 'Persian Connect Marketplace',
      changes: changes.map(change => ({
        ...change,
        timestamp: change.timestamp.toISOString()
      }))
    };
    
    const blob = new Blob([JSON.stringify(historyData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `persian-connect-changes-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    changes,
    addChange,
    undoChange,
    clearHistory,
    exportHistory
  };
}

// Singleton instance for global access
let globalChangeTracker: ChangeTracker | null = null;

export function getGlobalChangeTracker(): ChangeTracker {
  if (!globalChangeTracker) {
    throw new Error('Change tracker not initialized. Use within a component that calls useChangeTracker.');
  }
  return globalChangeTracker;
}

export function setGlobalChangeTracker(tracker: ChangeTracker) {
  globalChangeTracker = tracker;
}