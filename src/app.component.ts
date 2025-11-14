import { ChangeDetectionStrategy, Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwUpdate } from '@angular/service-worker';

import { AdviceComponent } from './features/advice/advice.component';
import { NotesComponent } from './features/notes/notes.component';
import { MusicComponent } from './features/music/music.component';
import { SettingsService } from './core/services/settings.service';
import { SettingsComponent } from './features/settings/settings.component';
import { GamesHubComponent } from './features/games/games-hub.component';
import { EmotionGameComponent } from './features/games/emotion-game.component';
import { AssociationsGameComponent } from './features/games/associations-game.component';
import { FloatingPlayerComponent } from './features/music/floating-player.component';

type ActiveView = 'advice' | 'notes' | 'games' | 'music' | 'settings' | 'games-emotion' | 'games-associations';

/**
 * @description
 * Корневой компонент приложения "Katya Pocket".
 * Отвечает за общую компоновку, навигацию и отображение активных разделов.
 * Также управляет PWA-логикой: проверка обновлений и статус сети.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, AdviceComponent, NotesComponent, MusicComponent, SettingsComponent, GamesHubComponent, EmotionGameComponent, AssociationsGameComponent, FloatingPlayerComponent],
})
export class AppComponent implements OnInit {
  private settingsService = inject(SettingsService);
  // FIX: Inject SwUpdate optionally as it might not be available in all environments (e.g., dev server).
  private swUpdate = inject(SwUpdate, { optional: true });

  // Сигнал для отслеживания текущего активного вида (страницы)
  activeView = signal<ActiveView>('advice');

  // Сигнал для отслеживания статуса сети
  isOffline = signal(!navigator.onLine);

  // Сигнал, обновляющийся каждый час для актуализации времени суток
  private timeTrigger = signal(new Date().getHours());

  // Приветствие, которое является вычисляемым значением.
  // Оно автоматически обновится, если изменится имя пользователя в настройках или наступит новый час.
  greeting = computed(() => {
    const hour = this.timeTrigger(); // Зависимость от времени
    const username = this.settingsService.settings().username; // Зависимость от имени

    if (hour < 6) {
      return `Доброй ночи, ${username} 🌙`;
    } else if (hour < 12) {
      return `Доброе утро, ${username} 🌸`;
    } else if (hour < 18) {
      return `Добрый день, ${username} ☀️`;
    } else {
      return `Добрый вечер, ${username} 🌆`;
    }
  });

  constructor() {
    // Обновляем триггер времени каждый час
    setInterval(() => {
      this.timeTrigger.set(new Date().getHours());
    }, 1000 * 60 * 60);

    // Подписываемся на события изменения статуса сети
    window.addEventListener('online', () => this.isOffline.set(false));
    window.addEventListener('offline', () => this.isOffline.set(true));
  }

  ngOnInit(): void {
    // Инициализация хеш-навигации
    this.applyHashRouting();
    window.addEventListener('hashchange', () => this.applyHashRouting());

    // Проверяем наличие обновлений сервис-воркера
    if (this.swUpdate && this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe(evt => {
        if (evt.type === 'VERSION_READY') {
          if (confirm('Доступна новая версия! Обновить приложение?')) {
            window.location.reload();
          }
        }
      });
    }
  }

  /**
   * @description
   * Устанавливает активный вид, который будет отображаться пользователю.
   * Также синхронизирует location.hash.
   */
  setView(view: ActiveView): void {
    this.activeView.set(view);
    const hash = this.hashFromView(view);
    if (location.hash !== hash) {
      location.hash = hash;
    }
  }

  private applyHashRouting(): void {
    const view = this.viewFromHash(location.hash);
    this.activeView.set(view);
  }

  private viewFromHash(hash: string): ActiveView {
    switch (hash) {
      case '#/notes': return 'notes';
      case '#/music': return 'music';
      case '#/games': return 'games';
      case '#/settings': return 'settings';
      case '#/games/emotion': return 'games-emotion';
      case '#/games/associations': return 'games-associations';
      case '#/advice':
      default:
        return 'advice';
    }
  }

  private hashFromView(view: ActiveView): string {
    switch (view) {
      case 'notes': return '#/notes';
      case 'music': return '#/music';
      case 'games': return '#/games';
      case 'settings': return '#/settings';
      case 'games-emotion': return '#/games/emotion';
      case 'games-associations': return '#/games/associations';
      case 'advice':
      default:
        return '#/advice';
    }
  }
}
