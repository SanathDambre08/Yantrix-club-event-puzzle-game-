import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, AlertTriangle } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { Card, CardHeader } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import type { EventSettings } from '../../types';

export function Settings() {
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('event_settings')
          .select('*')
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        setSettings(data);
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('event_settings')
        .update({
          event_name: settings.event_name,
          registration_enabled: settings.registration_enabled,
          leaderboard_enabled: settings.leaderboard_enabled,
          max_attempts: settings.max_attempts,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);

      if (error) throw error;
      alert('Settings saved!');
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearLeaderboard = async () => {
    try {
      const { error } = await supabase
        .from('game_sessions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;
      setShowClearConfirm(false);
      alert('Leaderboard cleared!');
    } catch (err) {
      console.error('Failed to clear:', err);
      alert('Failed to clear leaderboard.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-text-muted">No event settings found. Please seed the database.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon className="text-primary" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-text">Event Settings</h1>
          <p className="text-text-muted text-sm">Configure event behavior</p>
        </div>
      </div>

      <Card className="mb-6">
        <div className="space-y-5">
          <Input
            label="Event Name"
            value={settings.event_name}
            onChange={(e) =>
              setSettings({ ...settings, event_name: e.target.value })
            }
          />

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated border border-border">
              <div>
                <span className="text-sm font-medium text-text">Registration</span>
                <p className="text-xs text-text-muted">Allow new student registrations</p>
              </div>
              <input
                type="checkbox"
                checked={settings.registration_enabled}
                onChange={(e) =>
                  setSettings({ ...settings, registration_enabled: e.target.checked })
                }
                className="accent-primary w-5 h-5"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated border border-border">
              <div>
                <span className="text-sm font-medium text-text">Leaderboard</span>
                <p className="text-xs text-text-muted">Show public leaderboard</p>
              </div>
              <input
                type="checkbox"
                checked={settings.leaderboard_enabled}
                onChange={(e) =>
                  setSettings({ ...settings, leaderboard_enabled: e.target.checked })
                }
                className="accent-primary w-5 h-5"
              />
            </label>
          </div>

          <Input
            label="Max Attempts"
            type="number"
            min={1}
            max={10}
            value={settings.max_attempts.toString()}
            onChange={(e) =>
              setSettings({ ...settings, max_attempts: parseInt(e.target.value) || 1 })
            }
          />

          <div className="p-3 rounded-lg bg-surface-elevated border border-border">
            <p className="text-xs text-text-muted">
              Scoring Version: <span className="text-text font-mono">{settings.scoring_version}</span>
            </p>
          </div>

          <Button onClick={handleSave} isLoading={isSaving} icon={<Save size={16} />} fullWidth>
            Save Settings
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-danger/30">
        <CardHeader title="Danger Zone" subtitle="Irreversible actions" />
        <Button
          variant="danger"
          onClick={() => setShowClearConfirm(true)}
          icon={<AlertTriangle size={16} />}
        >
          Clear All Game Sessions
        </Button>
      </Card>

      {/* Clear confirmation */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-xl p-6 max-w-sm mx-4 shadow-card scale-in">
            <h3 className="text-lg font-bold text-danger mb-2">⚠️ Clear Leaderboard?</h3>
            <p className="text-sm text-text-muted mb-6">
              This will <strong>permanently delete all game sessions</strong> and reset the leaderboard.
              Student registrations and answers will be preserved. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setShowClearConfirm(false)}>
                Cancel
              </Button>
              <Button variant="danger" fullWidth onClick={handleClearLeaderboard}>
                Yes, Clear Everything
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
