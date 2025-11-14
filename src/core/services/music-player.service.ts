import { Injectable, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Глобальный сервис плавающего плеера. Позволяет воспроизводить музыку
 * вне зависимости от активного раздела приложения.
 */
@Injectable({ providedIn: 'root' })
export class MusicPlayerService {
  private sanitizer = inject(DomSanitizer);

  // Текущий безопасный URL встраиваемого плеера (Spotify embed и т.п.)
  safeUrl = signal<SafeResourceUrl | null>(null);

  // Видимость и состояние плеера
  isVisible = signal(false);
  isMinimized = signal(true);

  /** Воспроизвести по обычной ссылке на плейлист Spotify */
  playFromOpenUrl(openUrl: string): void {
    const embedUrl = openUrl.replace('open.spotify.com/', 'open.spotify.com/embed/');
    this.play(embedUrl);
  }

  /** Воспроизвести по готовому embed URL */
  play(embedUrl: string): void {
    this.safeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl));
    this.isVisible.set(true);
    this.isMinimized.set(true);
  }

  /** Спрятать плеер (воспроизведение у iframe продолжится до выгрузки, но UI скрыт) */
  hide(): void {
    this.isVisible.set(false);
  }

  /** Полностью остановить и выгрузить плеер */
  stop(): void {
    this.safeUrl.set(null);
    this.isVisible.set(false);
  }

  toggleMinimize(): void {
    this.isMinimized.set(!this.isMinimized());
  }
}
