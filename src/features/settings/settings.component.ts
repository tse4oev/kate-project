import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, AppTheme } from '../../core/services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  private settingsService = inject(SettingsService);

  username = signal(this.settingsService.settings().username);
  theme = signal<AppTheme>(this.settingsService.settings().theme);

  save() {
    const name = this.username().trim();
    if (!name) return;
    this.settingsService.updateSettings({ username: name, theme: this.theme() });
    alert('Настройки сохранены');
  }
}
