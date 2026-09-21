import { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import SettingsLayout from '../components/settings/SettingsLayout';
import AppearanceSettings from '../components/settings/AppearanceSettings';
import ProfileSettings from '../components/settings/ProfileSettings';
import AccountSettings from '../components/settings/AccountSettings';
import PrivacySettings from '../components/settings/PrivacySettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import WorkspaceSettings from '../components/settings/WorkspaceSettings';

const sections = {
  appearance: AppearanceSettings,
  profile: ProfileSettings,
  account: AccountSettings,
  privacy: PrivacySettings,
  notifications: NotificationSettings,
  workspace: WorkspaceSettings,
};

const SettingsPage = () => {
  const { section } = useParams();
  useEffect(() => { document.title = 'Zyntra — Settings'; }, []);
  if (!section) return <Navigate to="/settings/appearance" replace />;
  const Component = sections[section];
  if (!Component) return <Navigate to="/settings/appearance" replace />;
  return <SettingsLayout><Component /></SettingsLayout>;
};
export default SettingsPage;
