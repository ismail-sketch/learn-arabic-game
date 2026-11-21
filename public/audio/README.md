# Своя озвучка

Положите сюда свои записи в формате `.mp3`. Код сам ищет файл по имени — менять
`src/lib/audio.ts` не нужно.

## Имена файлов

### Приветствие

```text
greeting-ru.mp3
greeting-ar.mp3
```

Приветствие имени ребёнка остаётся системным голосом, потому что имя вводится
пользователем. Позже можно добавить отдельную запись для каждого имени.

### Буквы

Для каждой буквы доступны имя, звук и слово:

```text
letter-ba-name.mp3
letter-ba-sound.mp3
letter-ba-word.mp3
letter-ta-name.mp3
letter-ta-sound.mp3
letter-ta-word.mp3
```

ID всех букв находятся в `src/data/letters.ts` (`ba`, `ta`, `tha`, и так далее).

### Инструкции

```text
instruction-listen-ru.mp3
instruction-listen-ar.mp3
instruction-find-ru.mp3
instruction-find-ar.mp3
instruction-trace-ru.mp3
instruction-trace-ar.mp3
instruction-word-ru.mp3
instruction-word-ar.mp3
instruction-match-ru.mp3
instruction-match-ar.mp3
instruction-review-ru.mp3
instruction-review-ar.mp3
```

### Похвала и подсказки

```text
praise-correct-ru.mp3
praise-correct-ar.mp3
praise-again-ru.mp3
praise-again-ar.mp3
```

Если файл отсутствует, приложение временно использует браузерную озвучку.
Когда вы добавите свой файл с правильным произношением, он будет использоваться
автоматически.

Музыкальные файлы не добавляются и не поддерживаются.
