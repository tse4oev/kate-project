import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MusicService, Playlist } from '../../core/services/music.service';

/**
 * @description
 * Компонент для управления музыкальными плейлистами.
 * Отображает список плейлистов, позволяет добавлять новые и удалять существующие.
 * Встроенный плеер использует Spotify Embed.
 */
@Component({
  selector: 'app-music',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './music.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicComponent {
  private musicService = inject(MusicService);
  private sanitizer = inject(DomSanitizer);

  // Сигналы для состояния компонента
  playlists = this.musicService.playlists;
  
  // Сигнал для отслеживания выбранного плейлиста
  selectedPlaylist = signal<Playlist | null>(null);

  // Сигналы для формы добавления нового плейлиста
  newPlaylistName = signal('');
  newPlaylistUrl = signal('');

  // Вычисляемый сигнал, который возвращает безопасный URL для iframe
  safeSelectedPlaylistUrl = computed<SafeResourceUrl | null>(() => {
    const playlist = this.selectedPlaylist();
    if (playlist?.url) {
      // Преобразуем стандартную ссылку Spotify в ссылку для встраивания
      const embedUrl = playlist.url.replace('open.spotify.com/', 'open.spotify.com/embed/');
      return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    }
    return null;
  });

  constructor() {
    // При инициализации выбираем первый плейлист из списка (если он есть)
    const availablePlaylists = this.musicService.getPlaylists();
    if (availablePlaylists.length > 0) {
      this.selectedPlaylist.set(availablePlaylists[0]);
    }
  }

  /**
   * @description
   * Выбирает плейлист для воспроизведения.
   * @param playlist - Объект плейлиста.
   */
  selectPlaylist(playlist: Playlist): void {
    this.selectedPlaylist.set(playlist);
  }

  /**
   * @description
   * Добавляет новый плейлист в список.
   */
  addPlaylist(): void {
    const name = this.newPlaylistName().trim();
    const url = this.newPlaylistUrl().trim();

    if (name && url.startsWith('https://open.spotify.com/playlist/')) {
      this.musicService.addPlaylist(url, name);
      this.newPlaylistName.set('');
      this.newPlaylistUrl.set('');
      // Автоматически выбираем новый плейлист
      const playlists = this.playlists();
      this.selectPlaylist(playlists[playlists.length - 1]);
    } else {
      alert('Пожалуйста, введите корректное имя и ссылку на плейлист Spotify (должна начинаться с https://open.spotify.com/playlist/).');
    }
  }

  /**
   * @description
   * Удаляет плейлист из списка.
   * @param event - Событие клика, чтобы остановить его распространение.
   * @param playlistId - ID плейлиста для удаления.
   */
  deletePlaylist(event: MouseEvent, playlistId: number): void {
    event.stopPropagation(); // Предотвращаем выбор плейлиста при клике на кнопку удаления
    if (confirm('Вы уверены, что хотите удалить этот плейлист?')) {
      this.musicService.deletePlaylist(playlistId);
      // Если удалили текущий плейлист, выбираем первый из оставшихся
      if (this.selectedPlaylist()?.id === playlistId) {
        const availablePlaylists = this.musicService.getPlaylists();
        this.selectedPlaylist.set(availablePlaylists.length > 0 ? availablePlaylists[0] : null);
      }
    }
  }
}
