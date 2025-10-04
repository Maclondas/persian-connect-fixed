import realDataService from './services/real-data-service';

interface DuplicateCheckResult {
  hasDuplicates: boolean;
  existingAccount?: {
    id: string;
    email: string;
    username: string;
    name: string;
    createdAt: string;
  };
  message?: string;
}

export class DuplicatePreventionService {
  
  /**
   * Check if an email already has an account
   */
  static async checkEmailExists(email: string): Promise<DuplicateCheckResult> {
    try {
      console.log('🔍 Checking if email exists:', email);
      
      // Get all users to check for duplicates
      const allUsers = await realDataService.getAllUsers();
      const existingUser = allUsers.find(user => 
        user.email && user.email.toLowerCase() === email.toLowerCase()
      );
      
      if (existingUser) {
        return {
          hasDuplicates: true,
          existingAccount: {
            id: existingUser.id,
            email: existingUser.email,
            username: existingUser.username || 'No username',
            name: existingUser.name || 'No name',
            createdAt: existingUser.createdAt || new Date().toISOString()
          },
          message: `An account with this email already exists. Created on ${new Date(existingUser.createdAt || Date.now()).toLocaleDateString()}.`
        };
      }
      
      return {
        hasDuplicates: false,
        message: 'Email is available'
      };
      
    } catch (error) {
      console.error('❌ Error checking email duplicates:', error);
      // Don't block signup if we can't check - let the backend handle it
      return {
        hasDuplicates: false,
        message: 'Unable to verify email uniqueness'
      };
    }
  }
  
  /**
   * Check if a username is already taken
   */
  static async checkUsernameExists(username: string): Promise<DuplicateCheckResult> {
    try {
      console.log('🔍 Checking if username exists:', username);
      
      const allUsers = await realDataService.getAllUsers();
      const existingUser = allUsers.find(user => 
        user.username && user.username.toLowerCase() === username.toLowerCase()
      );
      
      if (existingUser) {
        return {
          hasDuplicates: true,
          existingAccount: {
            id: existingUser.id,
            email: existingUser.email,
            username: existingUser.username,
            name: existingUser.name || 'No name',
            createdAt: existingUser.createdAt || new Date().toISOString()
          },
          message: 'Username is already taken'
        };
      }
      
      return {
        hasDuplicates: false,
        message: 'Username is available'
      };
      
    } catch (error) {
      console.error('❌ Error checking username duplicates:', error);
      return {
        hasDuplicates: false,
        message: 'Unable to verify username uniqueness'
      };
    }
  }
  
  /**
   * Find and clean up duplicate accounts for a given email
   */
  static async cleanupDuplicatesForEmail(email: string): Promise<{
    cleaned: boolean;
    keepAccount?: any;
    removedCount: number;
    error?: string;
  }> {
    try {
      console.log('🧹 Cleaning up duplicates for email:', email);
      
      const allUsers = await realDataService.getAllUsers();
      const duplicateUsers = allUsers.filter(user => 
        user.email && user.email.toLowerCase() === email.toLowerCase()
      );
      
      if (duplicateUsers.length <= 1) {
        return {
          cleaned: false,
          removedCount: 0
        };
      }
      
      // Sort by creation date (keep the oldest)
      duplicateUsers.sort((a, b) => 
        new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      );
      
      const keepAccount = duplicateUsers[0];
      const removeAccounts = duplicateUsers.slice(1);
      
      let removedCount = 0;
      for (const account of removeAccounts) {
        try {
          await realDataService.deleteUser(account.id);
          removedCount++;
          console.log(`✅ Removed duplicate account: ${account.id}`);
        } catch (error) {
          console.error(`❌ Failed to remove account ${account.id}:`, error);
        }
      }
      
      return {
        cleaned: true,
        keepAccount,
        removedCount
      };
      
    } catch (error) {
      console.error('❌ Error cleaning up duplicates:', error);
      return {
        cleaned: false,
        removedCount: 0,
        error: (error as Error).message
      };
    }
  }
  
  /**
   * Suggest login instead of signup if user tries to create duplicate account
   */
  static getLoginSuggestionMessage(email: string): string {
    return `An account with ${email} already exists. Please sign in instead, or use the \"Forgot Password\" option if you've forgotten your password.`;
  }
}

export default DuplicatePreventionService;