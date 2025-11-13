import { Injectable, inject } from '@angular/core';
import { DataService } from './data.service';

/**
 * @description
 * Интерфейс для хранения прогресса игры.
 * Может быть расширен для каждой конкретной игры.
 */
export interface GameProgress {
  score: number;
  level: number;
  stats?: Record<string, any>;
}

/**
 * @description
 * Сервис для управления прогрессом и статистикой игр.
 * Сохраняет данные локально через CoreDataService.
 * 
 * @todo
 * - Добавить систему достижений (achievements).
 * - Реализовать хранение истории игр.
 * - Создать общую таблицу рекордов для всех игр.
 */
@Injectable({
  providedIn: 'root',
})
export class GamesService {
  private dataService = inject(DataService);
  private readonly storagePrefix = 'katya-pocket-game-';

  constructor() {}

  /**
   * @description
   * Сохраняет прогресс для конкретной игры.
   * @param gameId - Уникальный идентификатор игры (например, 'emotion-guesser').
   * @param data - Объект с прогрессом игры.
   */
  saveGameProgress(gameId: string, data: GameProgress): void {
    const key = `${this.storagePrefix}${gameId}`;
    this.dataService.saveItem(key, data);
  }

  /**
   * @description
   * Загружает прогресс для конкретной игры.
   * @param gameId - Уникальный идентификатор игры.
   * @returns Объект с прогрессом или null, если прогресс не найден.
   */
  getGameProgress(gameId: string): GameProgress | null {
    const key = `${this.storagePrefix}${gameId}`;
    return this.dataService.getItem<GameProgress>(key);
  }

  /**
   * @description
   * Сбрасывает прогресс для конкретной игры.
   * @param gameId - Уникальный идентификатор игры.
   */
  resetGameProgress(gameId: string): void {
    const key = `${this.storagePrefix}${gameId}`;
    this.dataService.deleteItem(key);
  }
}
