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
  private readonly bestScoresKey = 'katya-pocket-games-best-scores';

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

  /**
   * @description Получить лучший счёт для игры.
   */
  getBestScore(gameId: string): number {
    const map = this.dataService.getItem<Record<string, number>>(this.bestScoresKey) || {};
    return typeof map[gameId] === 'number' ? map[gameId] : 0;
  }

  /**
   * @description Установить лучший счёт, если он выше текущего.
   */
  setBestScore(gameId: string, score: number): void {
    if (typeof score !== 'number' || !isFinite(score)) return;
    const map = this.dataService.getItem<Record<string, number>>(this.bestScoresKey) || {};
    const current = typeof map[gameId] === 'number' ? map[gameId] : 0;
    if (score > current) {
      map[gameId] = score;
      this.dataService.saveItem(this.bestScoresKey, map);
    }
  }

  /**
   * @description Сбросить лучший счёт для указанной игры.
   */
  resetBestScore(gameId: string): void {
    const map = this.dataService.getItem<Record<string, number>>(this.bestScoresKey) || {};
    if (gameId in map) {
      delete map[gameId];
      this.dataService.saveItem(this.bestScoresKey, map);
    }
  }
}
