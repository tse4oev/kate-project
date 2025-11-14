# Implementation Plan

## Overview
Подготовить Angular PWA проект "Katya Pocket" к публикации на GitHub Pages. Исправить TypeScript ошибки, добавить недостающие ресурсы PWA, обновить конфигурацию для корректной сборки с base-href, протестировать сборку и обновить документацию. Проект должен работать автономно без внешних зависимостей.

## Types
Изменения типов не требуются. Существующие интерфейсы Playlist и сервисы корректны.

## Files
- **src/features/music/music.component.html**: Заменить musicService.getPlaylists() на playlists() для доступа к публичному сигналу.
- **angular.json**: Изменить browser с "index.tsx" на "index.html", добавить baseHref для GitHub Pages.
- **tsconfig.json**: Удалить jsx настройки, так как не используются.
- **build/index.css**: Скопировать index.css в папку build.
- **build/favicon.ico**: Скопировать favicon.ico в папку build.
- **build/manifest.webmanifest**: Скопировать manifest.webmanifest в папку build.
- **README.md**: Обновить инструкции по деплою, исправить пути и команды.
- **TODO.md**: Отметить выполненные задачи, добавить новую о подготовке к GitHub Pages.

## Functions
Изменения функций не требуются. Ошибка в шаблоне решается заменой доступа.

## Classes
Изменения классов не требуются.

## Dependencies
Зависимости не меняются. Проект использует Angular 20+, TailwindCSS, без новых пакетов.

## Testing
- Собрать проект с production конфигом и base-href.
- Проверить локальный запуск с npm run preview.
- Убедиться, что все ресурсы скопированы в build/.
- Проверить отсутствие ошибок в консоли браузера.

## Implementation Order
1. Исправить ошибку в MusicComponent (замена в шаблоне).
2. Обновить angular.json для index.html и baseHref.
3. Обновить tsconfig.json (убрать jsx).
4. Скопировать недостающие ресурсы в build/.
5. Собрать проект с base-href.
6. Обновить README.md и TODO.md.
7. Протестировать локально.
