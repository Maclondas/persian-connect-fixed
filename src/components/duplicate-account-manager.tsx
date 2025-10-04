import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { UserX, Mail, User, Calendar, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import realDataService from './services/real-data-service';

interface DuplicateAccount {
  email: string;
  accounts: {
    id: string;
    username: string;
    name: string;
    createdAt: string;
    authProvider: string;
  }[];
}

export function DuplicateAccountManager() {
  const [duplicates, setDuplicates] = useState<DuplicateAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  const findDuplicateAccounts = async () => {
    setLoading(true);
    try {
      console.log('🔍 Searching for duplicate accounts...');
      
      // Get all users from the system
      const allUsers = await realDataService.getAllUsers();
      console.log('📊 Found users:', allUsers.length);
      
      // Group users by email
      const emailGroups: { [email: string]: any[] } = {};
      
      allUsers.forEach(user => {
        if (user.email) {
          if (!emailGroups[user.email]) {
            emailGroups[user.email] = [];
          }
          emailGroups[user.email].push(user);
        }
      });
      
      // Find emails with multiple accounts
      const duplicateEmails: DuplicateAccount[] = [];
      
      Object.entries(emailGroups).forEach(([email, accounts]) => {
        if (accounts.length > 1) {
          duplicateEmails.push({
            email,
            accounts: accounts.map(account => ({
              id: account.id,
              username: account.username || 'No username',
              name: account.name || 'No name',
              createdAt: account.createdAt || new Date().toISOString(),
              authProvider: account.authProvider || 'unknown'
            })).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          });
        }
      });
      
      setDuplicates(duplicateEmails);
      
      if (duplicateEmails.length === 0) {
        toast.success('✅ No duplicate accounts found!');
      } else {
        toast.warning(`⚠️ Found ${duplicateEmails.length} emails with multiple accounts`);
      }
      
    } catch (error) {
      console.error('❌ Error finding duplicates:', error);
      toast.error('Failed to search for duplicate accounts');
    } finally {
      setLoading(false);
    }
  };

  const removeAccount = async (accountId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete this account? This action cannot be undone.`)) {
      return;
    }
    
    setCleaning(true);
    try {
      await realDataService.deleteUser(accountId);
      toast.success('Account deleted successfully');
      
      // Refresh the duplicates list
      await findDuplicateAccounts();
      
    } catch (error) {
      console.error('❌ Error deleting account:', error);
      toast.error('Failed to delete account');
    } finally {
      setCleaning(false);
    }
  };

  const cleanOlderDuplicates = async () => {
    if (!confirm(`This will delete all duplicate accounts, keeping only the oldest account for each email. Are you sure?`)) {
      return;
    }
    
    setCleaning(true);
    try {
      let deletedCount = 0;
      
      for (const duplicate of duplicates) {
        // Keep the first account (oldest), delete the rest
        const accountsToDelete = duplicate.accounts.slice(1);
        
        for (const account of accountsToDelete) {
          try {
            await realDataService.deleteUser(account.id);
            deletedCount++;
            console.log(`✅ Deleted duplicate account: ${account.username} (${account.id})`);
          } catch (error) {
            console.error(`❌ Failed to delete account ${account.id}:`, error);
          }
        }
      }
      
      toast.success(`✅ Cleaned up ${deletedCount} duplicate accounts`);
      
      // Refresh the list
      await findDuplicateAccounts();
      
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
      toast.error('Failed to complete cleanup');
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="w-5 h-5" />
            Duplicate Account Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={findDuplicateAccounts}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? 'Searching...' : 'Find Duplicates'}
            </Button>
            
            {duplicates.length > 0 && (
              <Button 
                onClick={cleanOlderDuplicates}
                disabled={cleaning}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {cleaning ? 'Cleaning...' : 'Clean All Duplicates'}
              </Button>
            )}
          </div>
          
          {duplicates.length > 0 && (
            <Alert>
              <AlertDescription>
                Found {duplicates.length} emails with duplicate accounts. 
                The "Clean All Duplicates" button will keep the oldest account for each email and delete the newer ones.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {duplicates.length > 0 && (
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {duplicates.map((duplicate, index) => (
              <Card key={duplicate.email}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Mail className="w-5 h-5" />
                    {duplicate.email}
                    <Badge variant="destructive">
                      {duplicate.accounts.length} accounts
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {duplicate.accounts.map((account, accountIndex) => (
                      <div key={account.id}>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span className="font-medium">{account.name}</span>
                              <Badge variant="outline">@{account.username}</Badge>
                              {accountIndex === 0 && (
                                <Badge variant="default">Oldest</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {new Date(account.createdAt).toLocaleDateString()}
                              <Badge variant="secondary" className="text-xs">
                                {account.authProvider}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ID: {account.id}
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => removeAccount(account.id, duplicate.email)}
                            disabled={cleaning}
                            variant="destructive"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </Button>
                        </div>
                        
                        {accountIndex < duplicate.accounts.length - 1 && (
                          <Separator className="my-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}