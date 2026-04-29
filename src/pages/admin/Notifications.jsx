import { useState } from 'react';
import { MainLayout } from '../../layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Bell, Settings, BarChart3, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Dialog, DialogContent } from '../../components/ui/dialog';
import NotificationForm from '../../components/notifications/NotificationForm';
import NotificationAnalytics from '../../components/notifications/NotificationAnalytics';
import NotificationSettings from '../../components/notifications/NotificationSettings';
import NotificationsList from '../../components/notifications/NotificationsList';

export default function NotificationsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleCreateNotification = (data) => {
    console.log('Creating notification:', data);
    setShowCreateDialog(false);
    // Refresh the list here
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Notifications Management</h1>
            <p className="text-slate-600 mt-1">Event-driven notification system with automated delivery</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-orange-500 hover:bg-orange-600 gap-2">
            <Plus className="w-4 h-4" />
            Create Notification
          </Button>
        </div>

        {/* Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <NotificationForm 
              onSubmit={handleCreateNotification}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Tabs */}
        <Tabs defaultValue="deliveries" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="deliveries" className="gap-2">
              <Bell className="w-4 h-4" />
              Deliveries
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deliveries">
            <NotificationsList />
          </TabsContent>

          <TabsContent value="analytics">
            <NotificationAnalytics />
          </TabsContent>

          <TabsContent value="settings">
            <NotificationSettings />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}