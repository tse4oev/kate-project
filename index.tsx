 // Обязательно для JIT-компиляции в среде Applet

import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';

import { AppComponent } from './src/app.component';

// Загрузка корневого компонента приложения
bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(), // Включение режима без Zone.js для лучшей производительности
    provideHttpClient(withInterceptorsFromDi()), // Подключение HTTP-клиента
    // Регистрация сервис-воркера для PWA.
    // 'registerWhenStable:30000' означает, что регистрация начнется,
    // когда приложение станет стабильным, или через 30 секунд.
    provideServiceWorker('ngsw-worker.js', {
        enabled: true, // Включаем сервис-воркер всегда
        registrationStrategy: 'registerWhenStable:30000'
    })
  ],
}).catch((err) => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.