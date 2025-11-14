import { Injectable, inject, signal, effect } from '@angular/core';
import { DataService } from './data.service';

export type AppTheme = 'dark' | 'light' | 'contrast';

export interface AppSettings {
  theme: AppTheme;
  username: string;
  preferredMood: 'calm' | 'energetic' | 'focused' | null;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  username: 'Катя',
  preferredMood: null,
};

/**
 * @description
 * Сервис для управления настройками приложения.
 * Сохраняет и загружает настройки пользователя из локального хранилища.
 * 
 * @todo
 * - Реализовать полноценное применение темы (theme) ко всему приложению.
 * - Использовать username в приветствии (уже сделано в AppComponent).
 * - Использовать preferredMood для персонализации советов.
 */
@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private dataService = inject(DataService);
  private readonly storageKey = 'katya-pocket-settings';

  settings = signal<AppSettings>(DEFAULT_SETTINGS);

  constructor() {
    const savedSettings = this.dataService.getItem<AppSettings>(this.storageKey);
    if (savedSettings) {
      this.settings.set({ ...DEFAULT_SETTINGS, ...savedSettings });
    }

    // Автосохранение при изменении настроек
    effect(() => {
      const currentSettings = this.settings();
      this.dataService.saveItem(this.storageKey, currentSettings);

      // Применение темы через CSS-классы на :root
      const root = document.documentElement;
      root.classList.remove('theme-light', 'theme-dark', 'theme-contrast');
      const themeClassMap: Record<AppTheme, string> = {
        light: 'theme-light',
        dark: 'theme-dark',
        contrast: 'theme-contrast',
      };
      root.classList.add(themeClassMap[currentSettings.theme]);
    });
  }

  updateSettings(newSettings: Partial<AppSettings>): void {
    this.settings.update(current => ({...current, ...newSettings}));
  }

  getUsername(): string {
    return this.settings().username;
  }
}
