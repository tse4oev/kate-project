import { ChangeDetectionStrategy, Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Note, NotesService } from '../../core/services/notes.service';

/**
 * @description
 * Компонент для управления заметками.
 * Позволяет создавать, просматривать, редактировать и удалять заметки.
 * Вся логика работы с данными инкапсулирована в NotesService.
 */
@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notes.component.html',
  providers: [NotesService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesComponent {
  // Сигналы для управления состоянием
  notes = signal<Note[]>([]);
  isModalOpen = signal(false);
  
  // Сигнал для текущей редактируемой заметки. null означает создание новой.
  currentNote = signal<Note | null>(null);
  
  // Сигналы для полей формы
  noteTitle = signal('');
  noteContent = signal('');
  
  // Сигнал для поискового запроса
  searchTerm = signal('');

  // Сигнал для статуса сохранения
  saveStatus = signal<'idle' | 'saving' | 'saved'>('idle');

  // Вычисляемый сигнал для фильтрации заметок на основе поискового запроса
  filteredNotes = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return this.notes();
    }
    return this.notes().filter(
      note =>
        note.title.toLowerCase().includes(term) ||
        note.content.toLowerCase().includes(term)
    );
  });

  constructor(private notesService: NotesService) {
    // Загрузка заметок при инициализации компонента
    this.loadNotes();
    
    // Эффект для синхронизации формы с текущей редактируемой заметкой
    effect(() => {
      const note = this.currentNote();
      if (note) {
        this.noteTitle.set(note.title);
        this.noteContent.set(note.content);
      } else {
        this.noteTitle.set('');
        this.noteContent.set('');
      }
    });
  }

  /**
   * @description
   * Загружает все заметки из сервиса.
   */
  loadNotes(): void {
    this.notes.set(this.notesService.getNotes());
  }

  /**
   * @description
   * Открывает модальное окно для создания новой заметки.
   */
  openCreateModal(): void {
    this.currentNote.set(null);
    this.isModalOpen.set(true);
  }

  /**
   * @description
   * Открывает модальное окно для редактирования существующей заметки.
   * @param note - Заметка для редактирования.
   */
  openEditModal(note: Note): void {
    this.currentNote.set({ ...note }); // Создаем копию, чтобы избежать прямой мутации
    this.isModalOpen.set(true);
  }

  /**
   * @description
   * Закрывает модальное окно и сбрасывает состояние формы.
   */
  closeModal(): void {
    this.isModalOpen.set(false);
    this.currentNote.set(null);
    this.saveStatus.set('idle'); // Сброс статуса
  }

  /**
   * @description
   * Сохраняет заметку (создает новую или обновляет существующую).
   */
  saveNote(): void {
    if (!this.noteTitle().trim() || !this.noteContent().trim() || this.saveStatus() === 'saving') {
      return; // Простая валидация и защита от двойного клика
    }
    
    this.saveStatus.set('saving');

    const noteData = {
        title: this.noteTitle(),
        content: this.noteContent(),
    };
    
    const existingNote = this.currentNote();
    if (existingNote) {
        // Обновление существующей
        this.notesService.updateNote({ ...noteData, id: existingNote.id });
    } else {
        // Создание новой
        this.notesService.createNote(noteData);
    }
    
    // Показать подтверждение и через секунду закрыть окно
    this.saveStatus.set('saved');
    setTimeout(() => {
      this.loadNotes();
      this.closeModal();
    }, 1000);
  }

  /**
   * @description
   * Удаляет заметку по ее ID.
   * @param noteId - ID заметки для удаления.
   */
  deleteNote(noteId: number): void {
    // Простое подтверждение удаления
    if (confirm('Вы уверены, что хотите удалить эту заметку?')) {
      this.notesService.deleteNote(noteId);
      this.loadNotes(); // Обновляем список
    }
  }

  /**
   * @description
   * Обработчик для обновления поискового запроса.
   */
  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }
}
