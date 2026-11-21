# Первый серверный этап

В проект добавлен независимый API-слой для будущего Vercel deployment.

## Что есть сейчас

- `supabase/schema.sql` — таблица учебных слов и bucket для изображений/аудио;
- `api/health.ts` — проверка доступности API;
- `api/words.ts` — чтение только опубликованных слов;
- `vercel.json` — настройки сборки Vercel.

Frontend пока продолжает работать автономно, чтобы приложение не ломалось без
настроенного Supabase.

## Настройка Supabase

1. Создайте проект Supabase.
2. Откройте **SQL Editor** и выполните `supabase/schema.sql`.
3. В Vercel добавьте переменные окружения:

```text
SUPABASE_URL=https://ваш-проект.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ваш-секретный-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` нельзя добавлять в frontend, GitHub Actions или
репозиторий. Он должен находиться только в Vercel Environment Variables.

## Проверка

После deployment:

```text
https://ваш-домен.vercel.app/api/health
https://ваш-домен.vercel.app/api/words
```

Пока таблица пустая, `/api/words` вернёт `[]`. Следующим этапом добавим
защищённую родительскую панель и загрузку изображений в `learning-media`.

## Перенос на собственный сервер

React-код будет обращаться к API-контракту, а не к Supabase напрямую. Позже
можно реализовать те же endpoints на вашем Node.js-сервере и заменить только
серверный адаптер.
