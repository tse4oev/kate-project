import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamesService } from '../../core/services/games.service';

interface Round {
  prompt: string;
  options: string[];
  correct: Set<string>;
}

const ROUNDS: Round[] = [
  {
    prompt: 'море',
    options: ['волна', 'соль', 'пальма', 'снег', 'корабль', 'пустыня'],
    correct: new Set(['волна', 'соль', 'корабль']),
  },
  {
    prompt: 'музыка',
    options: ['ритм', 'тишина', 'нота', 'кисть', 'концерт', 'печенье'],
    correct: new Set(['ритм', 'нота', 'концерт']),
  },
  {
    prompt: 'школа',
    options: ['урок', 'парта', 'мяч', 'тетрадь', 'луна', 'звонок'],
    correct: new Set(['урок', 'парта', 'тетрадь', 'звонок']),
  },
];

@Component({
  selector: 'app-associations-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './associations-game.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssociationsGameComponent {
  private games = inject(GamesService);
  private readonly GAME_ID = 'associations';

  difficulty = signal<'easy' | 'normal' | 'hard'>('normal');
  roundIndex = signal(0);
  score = signal(0);
  finished = signal(false);
  timeLeft = signal(30); // секунд на всю игру
  best = signal(this.games.getBestScore(`${this.GAME_ID}:${this.difficulty()}`));

  selected = signal<Set<string>>(new Set());

  current = computed(() => ROUNDS[this.roundIndex()]);

  private timerId: any = null;

  constructor() {
    this.startTimer();
  }

  private startTimer(): void {
    this.stopTimer();
    this.timeLeft.set(30);
    this.timerId = setInterval(() => {
      const next = this.timeLeft() - 1;
      if (next <= 0) {
        this.timeLeft.set(0);
        this.finish();
        return;
      }
      this.timeLeft.set(next);
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  toggleOption(opt: string): void {
    if (this.finished()) return;
    const set = new Set(this.selected());
    if (set.has(opt)) set.delete(opt); else set.add(opt);
    this.selected.set(set);
  }

  submitRound(): void {
    if (this.finished()) return;
    // Подсчитать очки: базово +1 за каждый правильный. На сложном уровне -1 за каждый неверный выбор.
    const sel = this.selected();
    const correct = this.current().correct;
    let delta = 0;
    for (const c of correct) if (sel.has(c)) delta += 1;
    if (this.difficulty() === 'hard') {
      for (const s of sel) if (!correct.has(s)) delta -= 1;
    }
    this.score.set(this.score() + Math.max(0, delta));

    const next = this.roundIndex() + 1;
    if (next >= ROUNDS.length) {
      this.finish();
    } else {
      this.roundIndex.set(next);
      this.selected.set(new Set());
    }
  }

  private finish(): void {
    this.finished.set(true);
    this.stopTimer();
    const key = `${this.GAME_ID}:${this.difficulty()}`;
    this.games.setBestScore(key, this.score());
    this.best.set(this.games.getBestScore(key));
  }

  restart(): void {
    this.roundIndex.set(0);
    this.score.set(0);
    this.finished.set(false);
    this.selected.set(new Set());
    this.best.set(this.games.getBestScore(`${this.GAME_ID}:${this.difficulty()}`));
    this.startTimer();
  }

  setDifficulty(d: 'easy' | 'normal' | 'hard'): void {
    if (this.difficulty() === d) return;
    this.difficulty.set(d);
    this.timeLeft.set(d === 'easy' ? 45 : d === 'hard' ? 20 : 30);
    this.restart();
  }
}
