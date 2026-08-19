'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Lock, LogOut, Shield, Eye, EyeOff, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { type AppSettings } from './SettingsShell';
import SettingsToggle from './SettingsToggle';

interface Props {
  settings: AppSettings;
  onUpdate: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  onLogout: () => void;
}

interface ProfileForm {
  name: string;
  email: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function AccountSettings({ settings, onUpdate, onLogout }: Props) {
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const profileForm = useForm<ProfileForm>({
    defaultValues: { name: settings.name, email: settings.email },
  });

  const passwordForm = useForm<PasswordForm>({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const handleProfileSave = async (data: ProfileForm) => {
    setIsSavingProfile(true);
    // Backend integration point: update user profile
    await new Promise(r => setTimeout(r, 600));
    onUpdate('name', data.name);
    onUpdate('email', data.email);
    setIsSavingProfile(false);
    toast.success('Profile updated');
  };

  const handlePasswordSave = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      passwordForm.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    if (data.newPassword.length < 8) {
      passwordForm.setError('newPassword', { message: 'Minimum 8 characters' });
      return;
    }
    setIsSavingPassword(true);
    // Backend integration point: change password
    await new Promise(r => setTimeout(r, 600));
    setIsSavingPassword(false);
    passwordForm.reset();
    toast.success('Password updated successfully');
  };

  return (
    <div className="space-y-6">
      {/* Profile */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-lg font-semibold text-primary">
              {settings.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{settings.name}</p>
            <p className="text-xs text-muted-foreground">{settings.email}</p>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-foreground mb-4">Edit Profile</h3>
        <form onSubmit={profileForm.handleSubmit(handleProfileSave)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1" htmlFor="acc-name">
              Full name
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                id="acc-name"
                type="text"
                className="w-full pl-9 pr-4 py-2 bg-input border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150"
                {...profileForm.register('name', { required: 'Name is required' })}
              />
            </div>
            {profileForm.formState.errors.name && (
              <p className="text-xs text-red-500 mt-1">{profileForm.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1" htmlFor="acc-email">
              Email address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                id="acc-email"
                type="email"
                className="w-full pl-9 pr-4 py-2 bg-input border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150"
                {...profileForm.register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })}
              />
            </div>
            {profileForm.formState.errors.email && (
              <p className="text-xs text-red-500 mt-1">{profileForm.formState.errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSavingProfile}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 active:scale-95 transition-all duration-150 disabled:opacity-60"
          >
            {isSavingProfile ? 'Saving…' : 'Update Profile'}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={15} className="text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Change Password</h3>
        </div>
        <form onSubmit={passwordForm.handleSubmit(handlePasswordSave)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1" htmlFor="current-pw">Current password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                id="current-pw"
                type={showCurrentPw ? 'text' : 'password'}
                className="w-full pl-9 pr-10 py-2 bg-input border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150"
                {...passwordForm.register('currentPassword', { required: 'Current password is required' })}
              />
              <button type="button" onClick={() => setShowCurrentPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {passwordForm.formState.errors.currentPassword && (
              <p className="text-xs text-red-500 mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1" htmlFor="new-pw">New password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                id="new-pw"
                type={showNewPw ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                className="w-full pl-9 pr-10 py-2 bg-input border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150"
                {...passwordForm.register('newPassword', { required: 'New password is required' })}
              />
              <button type="button" onClick={() => setShowNewPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {passwordForm.formState.errors.newPassword && (
              <p className="text-xs text-red-500 mt-1">{passwordForm.formState.errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1" htmlFor="confirm-pw">Confirm new password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                id="confirm-pw"
                type="password"
                placeholder="Repeat new password"
                className="w-full pl-9 pr-4 py-2 bg-input border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150"
                {...passwordForm.register('confirmPassword', { required: 'Please confirm your password' })}
              />
            </div>
            {passwordForm.formState.errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSavingPassword}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 active:scale-95 transition-all duration-150 disabled:opacity-60"
          >
            {isSavingPassword ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Security */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={15} className="text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Security & Notifications</h3>
        </div>
        <SettingsToggle
          label="Email notifications"
          description="Receive emails about account activity and updates"
          checked={settings.notifications}
          onChange={v => onUpdate('notifications', v)}
        />
        <div className="h-px bg-border" />
        <SettingsToggle
          label="Two-factor authentication"
          description="Add an extra layer of security to your account"
         
          onChange={() => toast.info('2FA setup coming soon')}
        />
      </div>

      {/* Danger zone */}
      <div className="bg-card border border-red-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-red-600 mb-4">Danger Zone</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-50/50 rounded-lg border border-red-100">
            <div>
              <p className="text-sm font-medium text-foreground">Sign out</p>
              <p className="text-xs text-muted-foreground">Sign out from this device</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 border border-red-200 rounded-md hover:bg-red-50 transition-colors duration-150"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-red-50/50 rounded-lg border border-red-100">
            <div>
              <p className="text-sm font-medium text-foreground">Delete account</p>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all notes</p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors duration-150"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 fade-in">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-sm mx-4 slide-up p-5">
            <h3 className="text-sm font-semibold text-foreground mb-2">Delete your account?</h3>
            <p className="text-xs text-muted-foreground mb-5">
              This will permanently delete your account, all notes, and folders. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 border border-border rounded-md text-sm text-muted-foreground hover:bg-muted transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); toast.error('Account deletion is disabled in demo mode'); }}
                className="flex-1 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors duration-150"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}