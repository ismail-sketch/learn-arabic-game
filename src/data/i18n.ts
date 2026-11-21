import type { UiLang } from '../types'

export interface Strings {
  appName: string
  subtitle: string
  whoPlays: string
  addChild: string
  childName: string
  age: string
  save: string
  cancel: string
  delete: string
  settings: string
  parents: string
  holdToEnter: string
  keepHolding: string
  back: string
  myGarden: string
  starsLabel: string
  learnedCount: string
  tapBedToLearn: string
  listenAndTap: string
  traceLetter: string
  listenTitle: string
  findLetter: string
  traceTitle: string
  wellDone: string
  tryAgain: string
  greatJob: string
  next: string
  done: string
  playSound: string
  playAgain: string
  startTracing: string
  clear: string
  chooseTrack: string
  sprout: string
  flower: string
  tree: string
  sproutDesc: string
  flowerDesc: string
  treeDesc: string
  sproutAge: string
  flowerAge: string
  treeAge: string
  audioOn: string
  audioOff: string
  sunFace: string
  sunFaceHint: string
  interfaceLang: string
  noProfilesYet: string
  confirmDelete: string
  languageName: string
  resetProgress: string
  resetConfirm: string
  learnDots: string
  dotCountLabel: string
  readWordTitle: string
  listenWord: string
  whatIsIt: string
  greatWord: string
  listenInstruction: string
  noDots: string
  review: string
  reviewDue: string
  reviewTitle: string
  reviewListen: string
  reviewDone: string
  reviewEmpty: string
  reviewNone: string
  reviewAgain: string
  words: string
  wordsTitle: string
  myWords: string
  addWord: string
  wordField: string
  meaningField: string
  emojiField: string
  emptyWords: string
  wordListen: string
  wordMatch: string
  listenAgain: string
  remove: string
  wordSaved: string
  refreshApp: string
  refreshAppHint: string
}

export const strings: Record<UiLang, Strings> = {
  ru: {
    appName: 'Сад букв',
    subtitle: 'Учим арабские буквы играя',
    whoPlays: 'Кто играет?',
    addChild: 'Добавить ребёнка',
    childName: 'Имя',
    age: 'Возраст',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    settings: 'Настройки',
    parents: 'Для родителей',
    holdToEnter: 'Нажмите и удерживайте',
    keepHolding: 'Держите…',
    back: 'Назад',
    myGarden: 'Мой сад',
    starsLabel: 'Звёзды',
    learnedCount: 'Букв выучено',
    tapBedToLearn: 'Нажми на грядку, чтобы учить букву',
    listenAndTap: 'Нажми и послушай',
    traceLetter: 'Обведи букву',
    listenTitle: 'Послушай букву',
    findLetter: 'Найди букву',
    traceTitle: 'Обведи букву',
    wellDone: 'Молодец!',
    tryAgain: 'Попробуй ещё раз',
    greatJob: 'Отлично! Ты вырастил цветок!',
    next: 'Дальше',
    done: 'Готово',
    playSound: 'Послушать',
    playAgain: 'Ещё раз',
    startTracing: 'Проведи пальцем по линии справа налево',
    clear: 'Заново',
    chooseTrack: 'Выбери, как будет играть',
    sprout: 'Росточек',
    flower: 'Цветочек',
    tree: 'Деревце',
    sproutDesc: '3–4 года · слушаем и трогаем',
    flowerDesc: '5–6 лет · обводим и узнаём',
    treeDesc: '7–9 лет · читаем и пишем',
    sproutAge: '3–4 года',
    flowerAge: '5–6 лет',
    treeAge: '7–9 лет',
    audioOn: 'Звук включён',
    audioOff: 'Звук выключен',
    sunFace: 'У Солнышка лицо',
    sunFaceHint: 'По умолчанию без лица. Можно включить простую улыбку.',
    interfaceLang: 'Язык интерфейса',
    noProfilesYet: 'Пока никого нет — добавь первого ребёнка',
    confirmDelete: 'Удалить этого ребёнка?',
    languageName: 'Русский',
    resetProgress: 'Сбросить прогресс',
    resetConfirm: 'Сбросить весь прогресс этого ребёнка?',
    learnDots: 'Смотри на точки:',
    dotCountLabel: 'точек',
    readWordTitle: 'Прочитай слово',
    listenWord: 'Нажми и послушай слово',
    whatIsIt: 'Что значит это слово?',
    greatWord: 'Правильно!',
    listenInstruction: 'Нажми на букву и послушай',
    noDots: 'без точек',
    review: 'Повторить',
    reviewDue: 'Пора повторить',
    reviewTitle: 'Повторение',
    reviewListen: 'Найди букву, которую я назову',
    reviewDone: 'Молодец! Повторили буквы',
    reviewEmpty: 'Сначала выучи буквы — потом их можно будет повторить',
    reviewNone: 'Всё повторено! Повторить ещё раз?',
    reviewAgain: 'Повторить выученные',
    words: 'Слова',
    wordsTitle: 'Слова',
    myWords: 'Мои слова',
    addWord: 'Добавить слово',
    wordField: 'Слово (арабский)',
    meaningField: 'Значение (русский)',
    emojiField: 'Картинка',
    emptyWords: 'Своих слов пока нет — добавьте ниже',
    wordListen: 'Нажми и послушай слово',
    wordMatch: 'Что значит это слово?',
    listenAgain: 'Послушать ещё раз',
    remove: 'Удалить',
    wordSaved: 'Слово добавлено',
    refreshApp: 'Обновить приложение',
    refreshAppHint: 'Очистить кэш и загрузить свежую версию'
  },
  ar: {
    appName: 'حديقة الحروف',
    subtitle: 'نتعلّم الحروف العربية باللعب',
    whoPlays: 'من يلعب؟',
    addChild: 'إضافة طفل',
    childName: 'الاسم',
    age: 'العمر',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    settings: 'الإعدادات',
    parents: 'للوالدين',
    holdToEnter: 'اضغط واستمر بالضغط',
    keepHolding: 'استمر…',
    back: 'رجوع',
    myGarden: 'حديقتي',
    starsLabel: 'النجوم',
    learnedCount: 'الحروف المتعلَّمة',
    tapBedToLearn: 'اضغط على الحوض لتتعلّم الحرف',
    listenAndTap: 'اضغط واستمع',
    traceLetter: 'تتبّع الحرف',
    listenTitle: 'استمع إلى الحرف',
    findLetter: 'جِد الحرف',
    traceTitle: 'تتبّع الحرف',
    wellDone: 'أحسنتَ!',
    tryAgain: 'حاول مرّة أخرى',
    greatJob: 'رائع! لقد أنبتتَ زهرة!',
    next: 'التالي',
    done: 'تمّ',
    playSound: 'استمع',
    playAgain: 'مرّة أخرى',
    startTracing: 'تتبّع الحرف بإصبعك من اليمين إلى اليسار',
    clear: 'من جديد',
    chooseTrack: 'اختر طريقة اللعب',
    sprout: 'برعم',
    flower: 'زهرة',
    tree: 'شجرة',
    sproutDesc: '٣–٤ سنوات · نستمع ونلمس',
    flowerDesc: '٥–٦ سنوات · نتتبّع ونتعرّف',
    treeDesc: '٧–٩ سنوات · نقرأ ونكتب',
    sproutAge: '٣–٤ سنوات',
    flowerAge: '٥–٦ سنوات',
    treeAge: '٧–٩ سنوات',
    audioOn: 'الصوت مفعّل',
    audioOff: 'الصوت مغلق',
    sunFace: 'الشمس بوجه',
    sunFaceHint: 'بدون وجه افتراضيًا. يمكن تفعيل ابتسامة بسيطة.',
    interfaceLang: 'لغة الواجهة',
    noProfilesYet: 'لا أحد بعد — أضف أول طفل',
    confirmDelete: 'حذف هذا الطفل؟',
    languageName: 'العربية',
    resetProgress: 'إعادة ضبط التقدّم',
    resetConfirm: 'إعادة ضبط كل تقدّم هذا الطفل؟',
    learnDots: 'انظر إلى النقاط:',
    dotCountLabel: 'نقاط',
    readWordTitle: 'اقرأ الكلمة',
    listenWord: 'اضغط واستمع إلى الكلمة',
    whatIsIt: 'ما معنى هذه الكلمة؟',
    greatWord: 'أحسنت!',
    listenInstruction: 'اضغط على الحرف واستمع',
    noDots: 'بدون نقاط',
    review: 'مراجعة',
    reviewDue: 'حان وقت المراجعة',
    reviewTitle: 'المراجعة',
    reviewListen: 'جِد الحرف الذي أقول',
    reviewDone: 'أحسنت! راجعنا الحروف',
    reviewEmpty: 'تعلّم الحروف أولًا ثم راجعها',
    reviewNone: 'راجعنا كل شيء! نراجع مرة أخرى؟',
    reviewAgain: 'مراجعة الحروف المتعلَّمة',
    words: 'الكلمات',
    wordsTitle: 'الكلمات',
    myWords: 'كلماتي',
    addWord: 'إضافة كلمة',
    wordField: 'الكلمة (بالعربية)',
    meaningField: 'المعنى (بالروسية)',
    emojiField: 'الصورة',
    emptyWords: 'لا توجد كلمات خاصة بعد',
    wordListen: 'اضغط واستمع إلى الكلمة',
    wordMatch: 'ما معنى هذه الكلمة؟',
    listenAgain: 'استمع مرة أخرى',
    remove: 'حذف',
    wordSaved: 'تمت إضافة الكلمة',
    refreshApp: 'تحديث التطبيق',
    refreshAppHint: 'مسح ذاكرة التخزين وتحميل أحدث إصدار'
  }
}
