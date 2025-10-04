import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Undo2, RotateCcw, Trash2, Eye, Clock, FileText, X, Download, Bot, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { useLanguage } from './hooks/useLanguage';
import { useChangeTracker, FileChange } from './hooks/useChangeTracker';
import { toast } from 'sonner';

interface UndoSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UndoSystem({ isOpen, onClose }: UndoSystemProps) {
  const { currentLanguage } = useLanguage();
  const { changes: fileChanges, undoChange, exportHistory } = useChangeTracker();
  const [selectedChange, setSelectedChange] = useState<FileChange | null>(null);
  const [undoConfirmId, setUndoConfirmId] = useState<string | null>(null);

  const handleUndo = async (changeId: string) => {
    const change = fileChanges.find(c => c.id === changeId);
    if (!change || !change.canUndo) return;

    try {
      const success = await undoChange(changeId);
      
      if (success) {
        setUndoConfirmId(null);
        toast.success(currentLanguage === 'en' 
          ? `Successfully undone: ${change.description}` 
          : `با موفقیت برگردانده شد: ${change.description}`
        );
      } else {
        toast.error(currentLanguage === 'en' 
          ? 'Failed to undo change. Please try again.' 
          : 'برگرداندن تغییر ناموفق بود. لطفاً دوباره تلاش کنید.'
        );
      }
    } catch (error) {
      console.error('Undo failed:', error);
      toast.error(currentLanguage === 'en' 
        ? 'Failed to undo change. Please try again.' 
        : 'برگرداندن تغییر ناموفق بود. لطفاً دوباره تلاش کنید.'
      );
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 1) {
      return currentLanguage === 'en' ? 'Just now' : 'همین الان';
    } else if (diffMins < 60) {
      return currentLanguage === 'en' ? `${diffMins} min ago` : `${diffMins} دقیقه پیش`;
    } else if (diffHours < 24) {
      return currentLanguage === 'en' ? `${diffHours} hour ago` : `${diffHours} ساعت پیش`;
    } else {
      return date.toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'fa-IR');
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <FileText className="h-4 w-4" />;
      case 'edit': return <Eye className="h-4 w-4" />;
      case 'delete': return <Trash2 className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'edit': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'create': return currentLanguage === 'en' ? 'Created' : 'ایجاد';
      case 'edit': return currentLanguage === 'en' ? 'Edited' : 'ویرایش';
      case 'delete': return currentLanguage === 'en' ? 'Deleted' : 'حذف';
      default: return action;
    }
  };



  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-4xl max-h-[80vh] ${currentLanguage === 'fa' ? 'rtl' : 'ltr'}`} dir={currentLanguage === 'fa' ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            {currentLanguage === 'en' ? 'Undo System - Recent Changes' : 'سیستم برگشت - تغییرات اخیر'}
          </DialogTitle>
          <DialogDescription>
            {currentLanguage === 'en' 
              ? 'Review and undo recent changes made to your Persian Connect marketplace. Click undo to restore previous versions.'
              : 'تغییرات اخیر در بازار Persian Connect خود را بررسی و برگردانید. برای بازگردانی نسخه‌های قبلی، روی برگشت کلیک کنید.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 h-[60vh]">
          {/* Changes List */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">
                {currentLanguage === 'en' ? 'Recent Changes' : 'تغییرات اخیر'}
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportHistory}>
                  <Download className="h-4 w-4 mr-2" />
                  {currentLanguage === 'en' ? 'Export' : 'خروجی'}
                </Button>
                <Badge variant="secondary">
                  {fileChanges.length} {currentLanguage === 'en' ? 'changes' : 'تغییر'}
                </Badge>
              </div>
            </div>

            <ScrollArea className="h-[50vh]">
              <div className="space-y-3">
                {fileChanges.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <RotateCcw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{currentLanguage === 'en' ? 'No changes to undo' : 'تغییری برای برگشت وجود ندارد'}</p>
                  </div>
                ) : (
                  fileChanges.map((change) => (
                    <Card 
                      key={change.id} 
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedChange?.id === change.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedChange(change)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`p-2 rounded-full ${getActionColor(change.action)}`}>
                              {getActionIcon(change.action)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary" className="text-xs">
                                  {getActionText(change.action)}
                                </Badge>
                                <Badge variant={change.aiGenerated ? "default" : "outline"} className="text-xs">
                                  {change.aiGenerated ? (
                                    <>
                                      <Bot className="h-3 w-3 mr-1" />
                                      {currentLanguage === 'en' ? 'AI' : 'هوش مصنوعی'}
                                    </>
                                  ) : (
                                    <>
                                      <User className="h-3 w-3 mr-1" />
                                      {currentLanguage === 'en' ? 'Manual' : 'دستی'}
                                    </>
                                  )}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTimeAgo(change.timestamp)}
                                </span>
                              </div>
                              <p className="font-medium text-sm mb-1 truncate" title={change.description}>
                                {change.description}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono truncate" title={change.filePath}>
                                {change.filePath}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {change.canUndo ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUndoConfirmId(change.id);
                                }}
                                className="text-xs"
                              >
                                <Undo2 className="h-3 w-3 mr-1" />
                                {currentLanguage === 'en' ? 'Undo' : 'برگشت'}
                              </Button>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                {currentLanguage === 'en' ? 'Applied' : 'اعمال شده'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Change Details */}
          {selectedChange && (
            <>
              <Separator orientation="vertical" />
              <div className="flex-1">
                <h3 className="font-medium mb-4">
                  {currentLanguage === 'en' ? 'Change Details' : 'جزئیات تغییر'}
                </h3>
                <ScrollArea className="h-[50vh]">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">{currentLanguage === 'en' ? 'File' : 'فایل'}</label>
                      <p className="text-sm font-mono bg-muted p-2 rounded">{selectedChange.filePath}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">{currentLanguage === 'en' ? 'Description' : 'توضیحات'}</label>
                      <p className="text-sm bg-muted p-2 rounded">{selectedChange.description}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium">{currentLanguage === 'en' ? 'Timestamp' : 'زمان'}</label>
                      <p className="text-sm bg-muted p-2 rounded">
                        {selectedChange.timestamp.toLocaleString(currentLanguage === 'en' ? 'en-US' : 'fa-IR')}
                      </p>
                    </div>

                    {selectedChange.previousContent && (
                      <div>
                        <label className="text-sm font-medium">{currentLanguage === 'en' ? 'Previous Content' : 'محتوای قبلی'}</label>
                        <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-32">
                          {selectedChange.previousContent}
                        </pre>
                      </div>
                    )}

                    {selectedChange.newContent && (
                      <div>
                        <label className="text-sm font-medium">{currentLanguage === 'en' ? 'New Content' : 'محتوای جدید'}</label>
                        <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-32">
                          {selectedChange.newContent}
                        </pre>
                      </div>
                    )}

                    {selectedChange.canUndo && (
                      <Alert>
                        <Undo2 className="h-4 w-4" />
                        <AlertDescription>
                          {currentLanguage === 'en' 
                            ? 'This change can be undone. The file will be restored to its previous state.'
                            : 'این تغییر قابل برگشت است. فایل به حالت قبلی خود بازگردانده خواهد شد.'
                          }
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </div>

        {/* Undo Confirmation */}
        {undoConfirmId && (
          <Dialog open={!!undoConfirmId} onOpenChange={() => setUndoConfirmId(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {currentLanguage === 'en' ? 'Confirm Undo' : 'تأیید برگشت'}
                </DialogTitle>
                <DialogDescription>
                  {currentLanguage === 'en' 
                    ? 'Are you sure you want to undo this change? This action cannot be reversed.'
                    : 'آیا از برگرداندن این تغییر اطمینان دارید؟ این عمل قابل برگشت نیست.'
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setUndoConfirmId(null)}
                >
                  {currentLanguage === 'en' ? 'Cancel' : 'لغو'}
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleUndo(undoConfirmId)}
                >
                  <Undo2 className="h-4 w-4 mr-2" />
                  {currentLanguage === 'en' ? 'Undo Change' : 'برگرداندن تغییر'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}