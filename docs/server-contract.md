# Контракт будущего собственного сервера

Приложение сейчас работает автономно и сохраняет данные локально. Важно, что
экраны не обращаются к `localStorage` напрямую: они используют состояние
приложения, а состояние — `AppRepository` из `src/data/storage.ts`.

Позже локальную реализацию можно заменить на клиент собственного API.

## Рекомендуемые endpoints

```text
POST /api/v1/auth/session
GET  /api/v1/content?locale=ru&version=...
GET  /api/v1/profiles
POST /api/v1/profiles
PATCH /api/v1/profiles/:profileId
GET  /api/v1/profiles/:profileId/progress
PUT  /api/v1/profiles/:profileId/progress
GET  /api/v1/words?scope=published
POST /api/v1/words                 # личное слово или черновик
PATCH /api/v1/words/:wordId        # только родитель/редактор
POST /api/v1/content/publish       # только администратор
```

## Правила данных

- `published` — контент, доступный всем пользователям.
- `private` — слова и настройки конкретной семьи.
- `draft` — материал до проверки фусха.
- Для арабского текста всегда хранить Unicode и направление `rtl` на уровне
  интерфейса, а не удалять огласовки при сохранении.
- Аудио хранить как файл на собственном сервере, а в базе — версионированный
  URL и язык (`ar`/`ru`). Музыка не поддерживается контрактом.
- Для синхронизации прогресса серверу пригодятся `updatedAt` и `revision`.

## Замена хранилища

Когда API появится, создаётся `HttpRepository`, реализующий `AppRepository`.
Единственное место настройки — `src/data/storage.ts`. Игровые экраны менять
не нужно.
