import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

/**
 * Preferences that actually change what the app does.
 *
 * Everything here is read somewhere real — badges, discoverability in search,
 * what a profile shows — rather than being a switch that only moves itself.
 */
const DEFAULTS = {
  // Notifications: drive the tab bar badges.
  pushEnabled: true,
  requestBadges: true,
  messageBadges: true,

  // Privacy: affect what other people can see and whether you turn up in search.
  discoverable: true,
  showCity: true,
  showConnections: true,

  // Content
  showEventBackdrops: true,
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULTS);

  const setSetting = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => setSettings(DEFAULTS), []);

  const value = useMemo(
    () => ({ settings, setSetting, resetSettings }),
    [settings, setSetting, resetSettings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
