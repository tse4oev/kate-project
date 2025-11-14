import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamesService } from '../../core/services/games.service';

interface Scenario {
  text: string;
  correct: Emotion;
}

type Emotion = 'радость' | 'грусть' | 'злость' | 'страх' | 'удивление' | 'спокойствие';

const SCENARIOS: Scenario[] = [
  { text: 'Ты нашла на улице кошелёк и решила отнести его в полицию.', correct: 'спокойствие' },
  { text: 'Твой любимый трек внезапно заиграл по радио.', correct: 'радость' },
  { text: 'Кто-то испортил твою аккуратно разложенную коллекцию открыток.', correct: 'злость' },
  { text: 'Фильм, который ты давно хотела посмотреть, оказался недоступен.', correct: 'грусть' },
  { text: 'Неожиданно пришла долгождан��ая посылка раньше срока.', correct: 'удивление' },
  { text: 'Ты одна дома и услышала в коридоре незнакомый шорох.', correct: 'страх' },
];

@Component({
  selector: 'app-emotion-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './emotion-game.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmotionGameComponent {
  private games = inject(GamesService);
  private readonly GAME_ID = 'emotion-guesser';

  difficulty = signal<'easy' | 'normal' | 'hard'>('normal');
  index = signal(0);
  score = signal(0);
  finished = signal(false);
  feedback = signal<'correct' | 'wrong' | null>(null);
  timeLeft = signal<number | null>(null);
  private timer: any = null;

  current = computed(() => SCENARIOS[this.index()]);
  best = signal(this.games.getBestScore(`${this.GAME_ID}:${this.difficulty()}`));

  emotions: Emotion[] = ['радость', 'грусть', 'злость', 'страх', 'удивление', 'спокойствие'];

  private startTimerForQuestion(): void {
    // Таймер только для hard/normal; для easy можно отключить
    const d = this.difficulty();
    const seconds = d === 'hard' ? 3 : d === 'normal' ? 6 : 0;
    this.clearTimer();
    if (seconds > 0) {
      this.timeLeft.set(seconds);
      this.timer = setInterval(() => {
        const v = (this.timeLeft() ?? 0) - 1;
        if (v <= 0) {
          this.timeLeft.set(0);
          this.clearTimer();
          this.nextQuestion(false); // пропуск без очка
        } else {
          this.timeLeft.set(v);
        }
      }, 1000);
    } else {
      this.timeLeft.set(null);
    }
  }

  private clearTimer(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  pickEmotion(e: Emotion): void {
    if (this.finished()) return;
    const correct = this.current().correct;
    this.clearTimer();
    if (e === correct) {
      this.score.set(this.score() + 1);
      this.feedback.set('correct');
    } else {
      this.feedback.set('wrong');
    }
    setTimeout(() => this.nextQuestion(), 600);
  }

  private nextQuestion(scored = true): void {
    const next = this.index() + 1;
    if (next >= SCENARIOS.length) {
      this.finished.set(true);
      const key = `${this.GAME_ID}:${this.difficulty()}`;
      this.games.setBestScore(key, this.score());
      this.best.set(this.games.getBestScore(key));
    } else {
      this.index.set(next);
      this.feedback.set(null);
      this.startTimerForQuestion();
    }
  }

  restart(): void {
    this.index.set(0);
    this.score.set(0);
    this.finished.set(false);
    this.feedback.set(null);
    this.best.set(this.games.getBestScore(`${this.GAME_ID}:${this.difficulty()}`));
    this.startTimerForQuestion();
  }

  setDifficulty(d: 'easy' | 'normal' | 'hard'): void {
    if (this.difficulty() === d) return;
    this.difficulty.set(d);
    this.restart();
  }
}
