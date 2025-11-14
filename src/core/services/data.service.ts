import { Injectable } from '@angular/core';

/**
 * @description
 * Универсальный сервис для работы с локальным хранилищем (LocalStorage).
 * Предоставляет простой API для CRUD-операций и служит абстракцией,
 * которую можно в будущем расширить для поддержки IndexedDB с fallback'ом.
 * 
 * @todo
 * - Реализовать поддержку IndexedDB для хранения больших объемов данных.
 * - Добавить логику fallback: если IndexedDB недоступен, использовать LocalStorage.
 * - Внедрить обработку ошибок (например, QuotaExceededError).
 */
@Injectable({
  providedIn: 'root',
})
export class DataService {
  private readonly SCHEMA_VERSION = 1;

  constructor() {
    console.log('CoreDataService initialized. Using LocalStorage.');
  }

  /**
   * @description
   * Сохраняет значение в LocalStorage по ключу.
   * Данные автоматически сериализуются в JSON.
   * @param key - Ключ для сохранения.
   * @param value - Данные для сохранения.
   */
  saveItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Ошибка при сохранении данных по ключу "${key}":`, error);
    }
  }

  /**
   * @description
   * Получает значение из LocalStorage по ключу.
   * Данные автоматически десериализуются из JSON.
   * @param key - Ключ для получения данных.
   * @returns Данные или null, если ключ не найден.
   */
  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch (error) {
      console.error(`Ошибка при получении данных по ключу "${key}":`, error);
      return null;
    }
  }

  /**
   * @description
   * Удаляет элемент из LocalStorage по ключу.
   * @param key - Ключ для удаления.
   */
  deleteItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Ошибка при удалении данных по ключу "${key}":`, error);
    }
  }

  /**
   * @description
   * Очищает всё хранилище. Использовать с осторожностью.
   */
  clearAll(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Ошибка при полной очистке LocalStorage:', error);
    }
  }

  /**
   * Экспорт всех данных приложения в JSON-строку.
   * Включает версию схемы для будущих миграций.
   */
  exportAll(): string {
    const snapshot = {
      schemaVersion: this.SCHEMA_VERSION,
      data: { ...localStorage },
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(snapshot, null, 2);
  }

  /**
   * Импорт данных из JSON-строки с базовой валидацией.
   * Выполняется бэкап текущего состояния на случай ошибки.
   */
  importAll(json: string): { ok: boolean; error?: string } {
    try {
      const parsed = JSON.parse(json);
      if (!parsed || typeof parsed !== 'object') {
        return { ok: false, error: 'Неверный формат файла' };
      }
      const { schemaVersion, data } = parsed;
      if (typeof schemaVersion !== 'number' || !data || typeof data !== 'object') {
        return { ok: false, error: 'Отсутствуют обязательные поля snapshot' };
      }
      // Бэкап текущего localStorage
      const backupKey = `katya-pocket-backup-${Date.now()}`;
      try { localStorage.setItem(backupKey, this.exportAll()); } catch {}

      // Очистка и восстановление
      localStorage.clear();
      for (const [k, v] of Object.entries<string>(data)) {
        localStorage.setItem(k, v);
      }
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || 'Ошибка разбора JSON' };
    }
  }
}
