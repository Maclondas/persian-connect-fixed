import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { useAuth } from './hooks/useAuth';
import realDataService from './services/real-data-service';
import { toast } from 'sonner';
import { CheckCircle, Clock, AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

interface AdminQuickActionsProps {
  onNavigate: (page: string) => void;
}

export function AdminQuickActions({ onNavigate }: AdminQuickActionsProps) {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pendingAds, setPendingAds] = useState<any[]>([]);
  const [approvedAds, setApprovedAds] = useState<any[]>([]);

  const isAdmin = currentUser?.email?.toLowerCase() === 'ommzadeh@gmail.com' || currentUser?.role === 'admin';

  const checkAdStatus = async () => {
    if (!isAdmin) {
      toast.error('Only admin users can access this feature');
      return;
    }

    setLoading(true);
    try {
      // Check both backend and localStorage for ads
      const backendResult = await realDataService.getAds();
      const allAds = backendResult?.ads || [];
      
      // Also check localStorage for demo mode ads
      const localAds = JSON.parse(localStorage.getItem('demo_ads') || '[]');
      
      // Combine and deduplicate
      const combinedAds = [...allAds, ...localAds];
      const uniqueAds = combinedAds.filter((ad, index, self) => 
        index === self.findIndex(a => a.id === ad.id)
      );

      const pending = uniqueAds.filter(ad => ad.status === 'pending');
      const approved = uniqueAds.filter(ad => ad.status === 'approved');

      setPendingAds(pending);
      setApprovedAds(approved);

      toast.success(`Found ${pending.length} pending ads and ${approved.length} approved ads`);
    } catch (error) {
      console.error('Error checking ad status:', error);
      toast.error('Failed to check ad status');
    } finally {
      setLoading(false);
    }
  };

  const approveAllPending = async () => {
    if (!isAdmin) {
      toast.error('Only admin users can approve ads');
      return;
    }

    setLoading(true);
    try {
      const result = await realDataService.approveAllPendingAdsForAdmin();
      
      if (result.approved > 0) {
        toast.success(`✅ Successfully approved ${result.approved} pending ads!`);
        // Refresh the status check
        await checkAdStatus();
      } else {
        toast.info('ℹ️ No pending ads found to approve');
      }
    } catch (error) {
      console.error('Error approving ads:', error);
      toast.error('Failed to approve ads');
    } finally {
      setLoading(false);
    }
  };

  const approveAllPendingForAllUsers = async () => {
    if (!isAdmin) {
      toast.error('Only admin users can approve ads');
      return;
    }

    setLoading(true);
    try {
      // For localStorage/demo mode, approve all pending ads
      const localAds = JSON.parse(localStorage.getItem('demo_ads') || '[]');
      let approved = 0;
      
      const updatedAds = localAds.map((ad: any) => {
        if (ad.status === 'pending') {
          console.log('✅ Approving ad for all users:', ad.title);
          approved++;
          return {
            ...ad,
            status: 'approved',
            paymentStatus: 'completed',
            paymentId: `admin_bulk_approval_${Date.now()}`,
            moderationResult: {
              status: 'approved',
              reason: 'Admin bulk approval',
              reviewedAt: new Date(),
              reviewedBy: currentUser?.id
            }
          };
        }
        return ad;
      });

      localStorage.setItem('demo_ads', JSON.stringify(updatedAds));
      
      if (approved > 0) {
        toast.success(`✅ Successfully approved ${approved} pending ads from all users!`);
        // Refresh the status check
        await checkAdStatus();
      } else {
        toast.info('ℹ️ No pending ads found to approve');
      }
    } catch (error) {
      console.error('Error approving all ads:', error);
      toast.error('Failed to approve ads');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Only admin users can access this page.</p>
              <Button 
                onClick={() => onNavigate('home')} 
                className="mt-4"
                variant="outline"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            onClick={() => onNavigate('home')} 
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <h1 className="text-2xl font-bold mb-2">Admin Quick Actions</h1>
          <p className="text-muted-foreground">Manage ad approvals and check system status</p>
        </div>

        <div className="grid gap-6">
          {/* Ad Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Ad Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button 
                    onClick={checkAdStatus}
                    disabled={loading}
                    variant="outline"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Check Ad Status
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Pending Ads</h3>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        {pendingAds.length}
                      </Badge>
                    </div>
                    {pendingAds.length > 0 && (
                      <div className="space-y-2">
                        {pendingAds.slice(0, 3).map(ad => (
                          <div key={ad.id} className="text-sm">
                            <p className="font-medium truncate">{ad.title || ad.titlePersian}</p>
                            <p className="text-muted-foreground text-xs">
                              {ad.userEmail} • {new Date(ad.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                        {pendingAds.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{pendingAds.length - 3} more...
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Approved Ads</h3>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {approvedAds.length}
                      </Badge>
                    </div>
                    {approvedAds.length > 0 && (
                      <div className="space-y-2">
                        {approvedAds.slice(0, 3).map(ad => (
                          <div key={ad.id} className="text-sm">
                            <p className="font-medium truncate">{ad.title || ad.titlePersian}</p>
                            <p className="text-muted-foreground text-xs">
                              {ad.userEmail} • {new Date(ad.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                        {approvedAds.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{approvedAds.length - 3} more...
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-medium mb-2">Approve All Pending Ads</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    This will approve pending ads and make them visible to users. This affects both homepage visibility and user's "Active" ads.
                  </p>
                  <div className="space-y-2 mb-3">
                    <Button 
                      onClick={approveAllPending}
                      disabled={loading || pendingAds.length === 0}
                      className="bg-primary hover:bg-primary/90 w-full"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve My Pending Ads ({pendingAds.filter(ad => ad.userEmail === currentUser?.email).length})
                    </Button>
                    <Button 
                      onClick={approveAllPendingForAllUsers}
                      disabled={loading}
                      variant="outline"
                      className="w-full border-primary text-primary hover:bg-primary/10"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve ALL Pending Ads (All Users)
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The first button approves only your pending ads. The second approves all pending ads from all users.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium mb-2">Admin Dashboard</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Access the full admin dashboard for comprehensive management.
                  </p>
                  <Button 
                    onClick={() => onNavigate('admin')}
                    variant="outline"
                  >
                    Open Admin Dashboard
                  </Button>
                </div>

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-medium mb-2">Debug Admin Status</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Check why admin ads might not be auto-approved.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Current User Email:</strong> {currentUser?.email || 'Not logged in'}
                    </div>
                    <div>
                      <strong>User Role:</strong> {currentUser?.role || 'Not set'}
                    </div>
                    <div>
                      <strong>Is Admin Email:</strong> {currentUser?.email?.toLowerCase() === 'ommzadeh@gmail.com' ? 'Yes ✅' : 'No ❌'}
                    </div>
                    <div>
                      <strong>Is Admin Role:</strong> {currentUser?.role === 'admin' ? 'Yes ✅' : 'No ❌'}
                    </div>
                    <div>
                      <strong>Should Auto-Approve:</strong> {(currentUser?.role === 'admin' || currentUser?.email?.toLowerCase() === 'ommzadeh@gmail.com') ? 'Yes ✅' : 'No ❌'}
                    </div>
                    <div>
                      <strong>LocalStorage Ads:</strong> {JSON.parse(localStorage.getItem('demo_ads') || '[]').length} total
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}