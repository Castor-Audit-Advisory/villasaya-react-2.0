import React from 'react';
import { Calendar, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { useCalendarIntegration } from '../hooks/useCalendarIntegration';

interface UserPreferencesProps {
  onBack?: () => void;
}

export function UserPreferences({ onBack }: UserPreferencesProps) {
  // Use custom hook for all calendar integration logic
  const {
    googleConnected,
    outlookConnected,
    syncEnabled,
    connectGoogle,
    connectOutlook,
    toggleSync,
  } = useCalendarIntegration();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">User Preferences</h2>
        <p className="text-muted-foreground">Manage your calendar integrations and sync settings</p>
      </div>

      {/* Calendar Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendar Integration
          </CardTitle>
          <CardDescription>
            Connect your Google Calendar or Microsoft Outlook to sync events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google Calendar */}
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#4285F4]/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M19.5 3H4.5A2.5 2.5 0 0 0 2 5.5v13A2.5 2.5 0 0 0 4.5 21h15a2.5 2.5 0 0 0 2.5-2.5v-13A2.5 2.5 0 0 0 19.5 3z"
                  />
                  <path
                    fill="#fff"
                    d="M16.5 13h-2v2h-2v-2h-2v-2h2V9h2v2h2v2z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-foreground">Google Calendar</p>
                <p className="text-sm text-muted-foreground">
                  {googleConnected ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>
            <Button
              variant={googleConnected ? 'outline' : 'default'}
              onClick={connectGoogle}
              className={googleConnected ? 'text-destructive hover:text-destructive' : ''}
            >
              {googleConnected ? (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Disconnect
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Connect
                </>
              )}
            </Button>
          </div>

          {/* Microsoft Outlook */}
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#0078D4]/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#0078D4"
                    d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-foreground">Microsoft Outlook</p>
                <p className="text-sm text-muted-foreground">
                  {outlookConnected ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>
            <Button
              variant={outlookConnected ? 'outline' : 'default'}
              onClick={connectOutlook}
              className={outlookConnected ? 'text-destructive hover:text-destructive' : ''}
            >
              {outlookConnected ? (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Disconnect
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Connect
                </>
              )}
            </Button>
          </div>

          {/* Sync Settings */}
          {(googleConnected || outlookConnected) && (
            <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="sync-toggle" className="text-base font-medium">
                  Enable Calendar Sync
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically sync events between VillaSaya and{' '}
                  {googleConnected ? 'Google Calendar' : 'Microsoft Outlook'}
                </p>
              </div>
              <Switch
                id="sync-toggle"
                checked={syncEnabled}
                onCheckedChange={toggleSync}
              />
            </div>
          )}

          {!googleConnected && !outlookConnected && (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">
                Connect a calendar service to start syncing your events
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional preferences can be added here */}
      <Card>
        <CardHeader>
          <CardTitle>Other Preferences</CardTitle>
          <CardDescription>
            Additional settings and preferences (coming soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            More preference options will be available in future updates
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
