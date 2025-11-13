import { Injectable } from '@angular/core';

export type AdviceCategory = 'creativity' | 'calm' | 'activity' | 'learning';
export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

export interface Advice {
  id: number;
  text: string;
  category: AdviceCategory;
  timeOfDay?: TimeOfDay[];
}

/**
 * @description
 * Сервис для получения советов из локального, заранее заготовленного списка.
 * Предоставляет "офлайн AI", который подбирает советы на основе контекста.
 * 
 * @todo
 * - Расширить базу советов.
 * - Добавить фильтрацию по настроению (mood).
 * - Реализовать систему "совет дня", чтобы не повторяться.
 */
@Injectable({
  providedIn: 'root'
})
export class AdviceService {

  private advices: Advice[] = [
    { id: 1, text: 'Попробуй нарисовать свой завтрак. Неважно, как получится, главное — уделить внимание цветам и формам.', category: 'creativity', timeOfDay: ['morning'] },
    { id: 2, text: 'Включи музыку без слов и просто посмотри в окно 5 минут. Позволь мыслям течь свободно.', category: 'calm', timeOfDay: ['day', 'evening'] },
    { id: 3, text: 'Сделай небольшую 10-минутную прогулку. Постарайся заметить 3 вещи, которые раньше не замечал(а).', category: 'activity', timeOfDay: ['morning', 'day'] },
    { id: 4, text: 'Прочитай одну статью на Википедии о чем-то совершенно случайном. Новые знания вдохновляют!', category: 'learning', timeOfDay: ['day', 'evening'] },
    { id: 5, text: 'Завари свой любимый чай, укутайся в плед и перечитай несколько страниц любимой книги.', category: 'calm', timeOfDay: ['evening', 'night'] },
    { id: 6, text: 'Напиши три вещи, за которые ты благодарен(на) сегодня. Это простое упражнение меняет взгляд на мир.', category: 'calm', timeOfDay: ['evening', 'night'] },
    { id: 7, text: 'Попробуй приготовить что-то простое, но новое. Например, какао с щепоткой корицы и перца.', category: 'creativity', timeOfDay: ['evening'] },
    { id: 8, text: 'Послушай один эпизод интересного подкаста. Можно совместить с домашними делами.', category: 'learning', timeOfDay: ['day'] },
    { id: 9, text: 'Сделай легкую растяжку. Твое тело скажет тебе спасибо.', category: 'activity', timeOfDay: ['morning', 'evening'] },
    { id: 10, text: 'Разбери одну полку в шкафу или ящик стола. Маленький порядок снаружи создает порядок внутри.', category: 'activity', timeOfDay: ['day'] },
  ];

  constructor() {}

  /**
   * @description
   * Возвращает случайный совет, опционально фильтруя по времени суток.
   * @returns Объект совета.
   */
  getRandomAdvice(): Advice {
    const currentTimeOfDay = this.getCurrentTimeOfDay();
    
    // Пытаемся найти совет, подходящий по времени суток
    const filteredAdvices = this.advices.filter(advice => 
      !advice.timeOfDay || advice.timeOfDay.includes(currentTimeOfDay)
    );

    const advicesToChooseFrom = filteredAdvices.length > 0 ? filteredAdvices : this.advices;
    
    const randomIndex = Math.floor(Math.random() * advicesToChooseFrom.length);
    return advicesToChooseFrom[randomIndex];
  }

  /**
   * @description
   * Генерирует ответ, похожий на AI, на основе предустановленных запросов.
   * @param prompt - Запрос пользователя.
   * @returns Отформатированная строка с советом/идеями.
   */
  getPredefinedResponse(prompt: string): string {
    if (prompt.includes('грустно')) {
      return `Мне жаль, что тебе грустно. Иногда помогает просто укутаться в плед и посмотреть что-то доброе. Вот несколько идей:
      <ul><li><strong>"Унесённые призраками"</strong> — для волшебной атмосферы.</li><li><strong>"Паддингтон 2"</strong> — самый уютный фильм на свете.</li><li>Короткие мультики Pixar — они всегда поднимают настроение!</li></ul>`;
    } 
    if (prompt.includes('творчества')) {
      return `Конечно! Вот три идеи, чтобы разбудить вдохновение:
      <ul><li><strong>Нарисуй свой сон.</strong> Неважно, как получится, главное — процесс.</li><li><strong>Напиши короткое письмо.</strong> Себе в будущем или любимому персонажу.</li><li><strong>Сделай коллаж</strong> из старых журналов или просто красивых бумажек.</li></ul>`;
    }
    
    // "Не знаю, что сделать сегодня" или любой другой запрос
    const advice1 = this.getRandomAdvice();
    let advice2 = this.getRandomAdvice();
    while(advice2.id === advice1.id) {
        advice2 = this.getRandomAdvice();
    }
    let advice3 = this.getRandomAdvice();
    while(advice3.id === advice1.id || advice3.id === advice2.id) {
        advice3 = this.getRandomAdvice();
    }
    
    return `Хм, прекрасный вопрос! Сегодня можно попробовать что-то новое. Например:
    <ul>
    <li>${advice1.text}</li>
    <li>${advice2.text}</li>
    <li>${advice3.text}</li>
    </ul>`;
  }

  /**
   * @description
   * Определяет текущее время суток.
   * @returns 'morning', 'day', 'evening', или 'night'.
   */
  private getCurrentTimeOfDay(): TimeOfDay {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'day';
    if (hour >= 18 && hour < 23) return 'evening';
    return 'night';
  }
}
