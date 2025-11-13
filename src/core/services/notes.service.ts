import { Injectable, inject } from '@angular/core';
import { DataService } from './data.service';

/**
 * @description
 * Интерфейс, описывающий структуру заметки.
 */
export interface Note {
  id: number;
  title: string;
  content: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * @description
 * Сервис для управления заметками (CRUD).
 * Хранит данные, используя CoreDataService (LocalStorage/IndexedDB).
 * При первом запуске инициализируется с набором демонстрационных заметок.
 * 
 * @todo
 * - Реализовать поддержку тегов (добавление, удаление, фильтрация).
 * - Добавить возможность архивирования заметок.
 * - Внедрить полнотекстовый поиск на стороне клиента.
 */
@Injectable()
export class NotesService {
  private readonly storageKey = 'katya-pocket-notes';
  private dataService = inject(DataService);

  constructor() {
    this.initDemoData();
  }

  /**
   * @description
   * Получает все заметки из хранилища.
   * @returns Массив заметок, отсортированный по дате обновления.
   */
  getNotes(): Note[] {
    const notes = this.dataService.getItem<Note[]>(this.storageKey) || [];
    // Сортируем заметки так, чтобы самые новые были сверху
    return notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  /**
   * @description
   * Создает новую заметку и сохраняет ее.
   * @param noteData - Данные для новой заметки (без id и дат).
   * @returns Созданная заметка.
   */
  createNote(noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'tags'>): Note {
    const notes = this.getNotes();
    const now = new Date().toISOString();
    const newNote: Note = {
      id: Date.now(), // Простой способ генерации уникального ID
      title: noteData.title,
      content: noteData.content,
      tags: [],
      createdAt: now,
      updatedAt: now,
    };
    notes.push(newNote);
    this.saveNotes(notes);
    return newNote;
  }

  /**
   * @description
   * Обновляет существующую заметку.
   * @param updatedNote - Заметка с обновленными данными.
   * @returns Обновленная заметка или null, если заметка не найдена.
   */
  updateNote(updatedNote: Pick<Note, 'id' | 'title' | 'content'>): Note | null {
    let notes = this.getNotes();
    const noteIndex = notes.findIndex(n => n.id === updatedNote.id);
    if (noteIndex > -1) {
      notes[noteIndex] = { 
        ...notes[noteIndex],
        ...updatedNote, 
        updatedAt: new Date().toISOString() 
      };
      this.saveNotes(notes);
      return notes[noteIndex];
    }
    return null;
  }

  /**
   * @description
   * Удаляет заметку по ее ID.
   * @param noteId - ID заметки для удаления.
   */
  deleteNote(noteId: number): void {
    let notes = this.getNotes();
    notes = notes.filter(n => n.id !== noteId);
    this.saveNotes(notes);
  }

  /**
   * @description
   * Сохраняет массив заметок в хранилище.
   * @param notes - Массив заметок для сохранения.
   */
  private saveNotes(notes: Note[]): void {
    this.dataService.saveItem(this.storageKey, notes);
  }

  /**
   * @description
   * Инициализирует демонстрационные данные, если в хранилище еще нет заметок.
   */
  private initDemoData(): void {
    const notes = this.dataService.getItem<Note[]>(this.storageKey);
    if (!notes) {
       const now = new Date();
       const yesterday = new Date(now.getTime() - 1000 * 60 * 60 * 24);
       const thirtyMinutesAgo = new Date(now.getTime() - 1000 * 60 * 30);

      const demoNotes: Note[] = [
        {
          id: 1,
          title: 'Идея для вечера ✨',
          content: 'Посмотреть старый черно-белый фильм с чашкой какао. Например, "Римские каникулы".',
          tags: ['фильмы', 'уют'],
          createdAt: yesterday.toISOString(),
          updatedAt: yesterday.toISOString(),
        },
        {
          id: 2,
          title: 'Цитата дня',
          content: '"Счастье можно найти даже в тёмные времена, если не забывать обращаться к свету." — Альбус Дамблдор',
          tags: ['цитаты', 'вдохновение'],
          createdAt: thirtyMinutesAgo.toISOString(),
          updatedAt: thirtyMinutesAgo.toISOString(),
        },
        {
          id: 3,
          title: 'Список покупок',
          content: '- Овсяное молоко\n- Бананы\n- Корица\n- Хорошее настроение :)',
          tags: ['покупки'],
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        },
      ];
      this.saveNotes(demoNotes);
    }
  }
}
