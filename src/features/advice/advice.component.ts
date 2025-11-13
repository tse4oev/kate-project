import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdviceService } from '../../core/services/advice.service';

/**
 * @description
 * Компонент для получения советов и идей от AI-помощника.
 * Позволяет пользователю задавать вопросы или выбирать из готовых шаблонов.
 */
@Component({
  selector: 'app-advice',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './advice.component.html',
  // Сервис AdviceService предоставляется глобально (providedIn: 'root')
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdviceComponent {
  // Сигналы для управления состоянием компонента
  advice = signal<string>('');
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  userPrompt = signal<string>('');

  // Предустановленные запросы для быстрого старта
  presetPrompts = [
    'Не знаю, что сделать сегодня',
    'Мне немного грустно, что посмотреть?',
    'Посоветуй три идеи для творчества',
  ];

  constructor(private readonly adviceService: AdviceService) {}

  /**
   * @description
   * Основной метод для получения совета из локального сервиса.
   * Отправляет запрос в AdviceService и обрабатывает результат.
   * @param prompt - Текст запроса. Если не указан, используется значение из userPrompt.
   */
  getAdvice(prompt?: string): void {
    const finalPrompt = prompt || this.userPrompt();
    if (!finalPrompt.trim()) {
      this.error.set('Пожалуйста, введите ваш вопрос или выберите готовый вариант.');
      return;
    }

    // Сброс состояния перед новым запросом
    this.isLoading.set(true);
    this.error.set(null);
    this.advice.set('');
    
    // Плавная прокрутка к блоку с ответом
    setTimeout(() => {
      document.getElementById('advice-output')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    // Имитация "размышлений" для лучшего UX
    setTimeout(() => {
      try {
        const result = this.adviceService.getPredefinedResponse(finalPrompt);
        this.advice.set(result);
      } catch (err) {
        console.error('Ошибка при получении совета:', err);
        this.error.set('Произошла внутренняя ошибка. Пожалуйста, попробуйте еще раз.');
      } finally {
        this.isLoading.set(false);
      }
    }, 800);
  }
}
