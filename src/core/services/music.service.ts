import { Injectable, inject, signal, effect } from '@angular/core';
import { DataService } from './data.service';

export interface Playlist {
  id: number;
  url: string;
  name: string;
}

/**
 * @description
 * Сервис для управления музыкальными плейлистами.
 * Позволяет сохранять ссылки на плейлисты (например, Spotify) локально.
 * Предоставляет mock-плейлист, если пользовательских ссылок нет.
 * 
 * @todo
 * - Добавить возможность парсить название плейлиста из URL.
 * - Интегрировать с API (когда потребуется) для получения метаданных.
 * - Добавить категории или теги для плейлистов.
 */
@Injectable({
  providedIn: 'root',
})
export class MusicService {
  private dataService = inject(DataService);
  private readonly storageKey = 'katya-pocket-music-playlists';

  playlists = signal<Playlist[]>([]);

  private mockPlaylist: Playlist[] = [
    { id: 1, url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWXe9gFZP0gtP', name: 'Lofi Beats' },
    { id: 2, url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO', name: 'Peaceful Piano' },
  ];

  constructor() {
    const savedPlaylists = this.dataService.getItem<Playlist[]>(this.storageKey);
    this.playlists.set(savedPlaylists || []);
    
    // Автосохранение при изменении списка плейлистов
    effect(() => {
        this.dataService.saveItem(this.storageKey, this.playlists());
    });
  }

  getPlaylists(): Playlist[] {
    const userPlaylists = this.playlists();
    return userPlaylists.length > 0 ? userPlaylists : this.mockPlaylist;
  }
  
  addPlaylist(url: string, name: string): void {
    const newPlaylist: Playlist = {
        id: Date.now(),
        url,
        name,
    };
    this.playlists.update(current => [...current, newPlaylist]);
  }

  deletePlaylist(playlistId: number): void {
    this.playlists.update(current => current.filter(p => p.id !== playlistId));
  }
}
