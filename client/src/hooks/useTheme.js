import { useEffect } from 'react';
import useThemeStore from '../store/useThemeStore';

/**
 * Hook that applies the current theme settings to the DOM
 * and re-applies whenever any theme setting changes.
 */
export default function useTheme() {
  const theme = useThemeStore((s) => s.theme);
  const morphism = useThemeStore((s) => s.morphism);
  const accentColor = useThemeStore((s) => s.accentColor);
  const chatDensity = useThemeStore((s) => s.chatDensity);
  const iconSize = useThemeStore((s) => s.iconSize);
  const messageBubbles = useThemeStore((s) => s.messageBubbles);
  const wallpaper = useThemeStore((s) => s.wallpaper);
  const cornerRadius = useThemeStore((s) => s.cornerRadius);
  const reduceMotion = useThemeStore((s) => s.reduceMotion);
  const highContrast = useThemeStore((s) => s.highContrast);
  const applyTheme = useThemeStore((s) => s.applyTheme);

  useEffect(() => {
    applyTheme();
  }, [
    theme,
    morphism,
    accentColor,
    chatDensity,
    iconSize,
    messageBubbles,
    wallpaper,
    cornerRadius,
    reduceMotion,
    highContrast,
    applyTheme,
  ]);

  return {
    theme,
    morphism,
    accentColor,
    chatDensity,
    iconSize,
    messageBubbles,
    wallpaper,
    cornerRadius,
    reduceMotion,
    highContrast,
  };
}
