/**
 * Данные букв.
 *
 * Здесь хранится только текстовое описание буквы (символ, имена, точки,
 * слово-пример). Геометрия для упражнения «Обведи букву» лежит отдельно,
 * в `letterShapes.ts`: это точные контуры букв, построенные из шрифта.
 *
 * `family` — «семейство» похожих по форме букв: их показываем вместе как
 * отвлекатели (учим различать по точкам).
 */

export interface Letter {
  id: string
  /** Сам символ */
  char: string
  /** Арабское имя буквы */
  nameAr: string
  /** Русское имя буквы */
  nameRu: string
  /** Звук с огласовкой фатха, по-русски */
  soundRu: string
  /** Текст для озвучки (арабский) */
  ttsName: string
  ttsSound: string
  dotCount: number
  dotSide: 'above' | 'below'
  /** Порядок в саду */
  order: number
  /** Семейство похожих букв */
  family: string
  /** Слово-пример (для старшей дорожки и «Слов») */
  word: string
  wordRu: string
  wordEmoji: string
  ttsWord: string
}

export const letters: Letter[] = [
  {
    id: 'alif', char: 'ا', nameAr: 'أَلِف', nameRu: 'алиф', soundRu: 'а', ttsName: 'ألف', ttsSound: 'أَ',
    dotCount: 0, dotSide: 'above', order: 0, family: 'alif',
    word: 'أَسَد', wordRu: 'лев', wordEmoji: '🏜️', ttsWord: 'أسد'
  },
  {
    id: 'ba',
    char: 'ب',
    nameAr: 'بَاء',
    nameRu: 'ба',
    soundRu: 'ба',
    ttsName: 'باء',
    ttsSound: 'بَ',
    dotCount: 1,
    dotSide: 'below',
    order: 1,
    family: 'boat',
    word: 'بَاب',
    wordRu: 'дверь',
    wordEmoji: '🏠',
    ttsWord: 'باب'
  },
  {
    id: 'ta',
    char: 'ت',
    nameAr: 'تَاء',
    nameRu: 'та',
    soundRu: 'та',
    ttsName: 'تاء',
    ttsSound: 'تَ',
    dotCount: 2,
    dotSide: 'above',
    order: 2,
    family: 'boat',
    word: 'تَاج',
    wordRu: 'корона',
    wordEmoji: '👑',
    ttsWord: 'تاج'
  },
  {
    id: 'tha',
    char: 'ث',
    nameAr: 'ثَاء',
    nameRu: 'са',
    soundRu: 'са',
    ttsName: 'ثاء',
    ttsSound: 'ثَ',
    dotCount: 3,
    dotSide: 'above',
    order: 3,
    family: 'boat',
    word: 'ثَلْج',
    wordRu: 'снег',
    wordEmoji: '❄️',
    ttsWord: 'ثلج'
  },
  {
    id: 'jeem',
    char: 'ج',
    nameAr: 'جِيم',
    nameRu: 'джим',
    soundRu: 'джа',
    ttsName: 'جيم',
    ttsSound: 'جَ',
    dotCount: 1,
    dotSide: 'below',
    order: 4,
    family: 'wave',
    word: 'جَمَل',
    wordRu: 'верблюд',
    wordEmoji: '🌾',
    ttsWord: 'جمل'
  },
  {
    id: 'haa',
    char: 'ح',
    nameAr: 'حَاء',
    nameRu: 'ха',
    soundRu: 'ха',
    ttsName: 'حاء',
    ttsSound: 'حَ',
    dotCount: 0,
    dotSide: 'below',
    order: 5,
    family: 'wave',
    word: 'حُصَان',
    wordRu: 'лошадь',
    wordEmoji: '🌾',
    ttsWord: 'حصان'
  },
  {
    id: 'khaa',
    char: 'خ',
    nameAr: 'خَاء',
    nameRu: 'кха',
    soundRu: 'кха',
    ttsName: 'خاء',
    ttsSound: 'خَ',
    dotCount: 1,
    dotSide: 'above',
    order: 6,
    family: 'wave',
    word: 'خُبْز',
    wordRu: 'хлеб',
    wordEmoji: '▰',
    ttsWord: 'خبز'
  },
  {
    id: 'daal',
    char: 'د',
    nameAr: 'دَال',
    nameRu: 'даль',
    soundRu: 'да',
    ttsName: 'دال',
    ttsSound: 'دَ',
    dotCount: 0,
    dotSide: 'below',
    order: 7,
    family: 'daal',
    word: 'دُبّ',
    wordRu: 'медведь',
    wordEmoji: '▰',
    ttsWord: 'دب'
  },
  {
    id: 'dhaal',
    char: 'ذ',
    nameAr: 'ذَال',
    nameRu: 'заль',
    soundRu: 'за',
    ttsName: 'ذال',
    ttsSound: 'ذَ',
    dotCount: 1,
    dotSide: 'above',
    order: 8,
    family: 'daal',
    word: 'ذُرَة',
    wordRu: 'кукуруза',
    wordEmoji: '🌽',
    ttsWord: 'ذرة'
  },
  {
    id: 'raa',
    char: 'ر',
    nameAr: 'رَاء',
    nameRu: 'ра',
    soundRu: 'ра',
    ttsName: 'راء',
    ttsSound: 'رَ',
    dotCount: 0,
    dotSide: 'below',
    order: 9,
    family: 'raa',
    word: 'رُمَّان',
    wordRu: 'гранат',
    wordEmoji: '🔴',
    ttsWord: 'رمان'
  },
  {
    id: 'zay',
    char: 'ز',
    nameAr: 'زَاي',
    nameRu: 'зай',
    soundRu: 'за',
    ttsName: 'زاي',
    ttsSound: 'زَ',
    dotCount: 1,
    dotSide: 'above',
    order: 10,
    family: 'raa',
    word: 'زَهْرَة',
    wordRu: 'цветок',
    wordEmoji: '✿',
    ttsWord: 'زهرة'
  },
  {
    id: 'seen', char: 'س', nameAr: 'سِين', nameRu: 'син', soundRu: 'са', ttsName: 'سين', ttsSound: 'سَ',
    dotCount: 0, dotSide: 'above', order: 11, family: 'seen',
    word: 'سَمَك', wordRu: 'рыба', wordEmoji: '🌊', ttsWord: 'سمك'
  },
  {
    id: 'sheen', char: 'ش', nameAr: 'شِين', nameRu: 'шин', soundRu: 'ша', ttsName: 'شين', ttsSound: 'شَ',
    dotCount: 3, dotSide: 'above', order: 12, family: 'seen',
    word: 'شَمْس', wordRu: 'солнце', wordEmoji: '☀️', ttsWord: 'شمس'
  },
  {
    id: 'saad', char: 'ص', nameAr: 'صَاد', nameRu: 'сад', soundRu: 'са', ttsName: 'صاد', ttsSound: 'صَ',
    dotCount: 0, dotSide: 'above', order: 13, family: 'saad',
    word: 'صَبْر', wordRu: 'терпение', wordEmoji: '🌿', ttsWord: 'صبر'
  },
  {
    id: 'daad', char: 'ض', nameAr: 'ضَاد', nameRu: 'дад', soundRu: 'да', ttsName: 'ضاد', ttsSound: 'ضَ',
    dotCount: 1, dotSide: 'above', order: 14, family: 'saad',
    word: 'ضَوْء', wordRu: 'свет', wordEmoji: '💡', ttsWord: 'ضوء'
  },
  {
    id: 'taa', char: 'ط', nameAr: 'طَاء', nameRu: 'та', soundRu: 'та', ttsName: 'طاء', ttsSound: 'طَ',
    dotCount: 0, dotSide: 'above', order: 15, family: 'taa',
    word: 'طَرِيق', wordRu: 'дорога', wordEmoji: '🛤️', ttsWord: 'طريق'
  },
  {
    id: 'thaa', char: 'ظ', nameAr: 'ظَاء', nameRu: 'за', soundRu: 'за', ttsName: 'ظاء', ttsSound: 'ظَ',
    dotCount: 1, dotSide: 'above', order: 16, family: 'taa',
    word: 'ظِلّ', wordRu: 'тень', wordEmoji: '⛱️', ttsWord: 'ظل'
  },
  {
    id: 'ain', char: 'ع', nameAr: 'عَيْن', nameRu: 'айн', soundRu: 'а', ttsName: 'عين', ttsSound: 'عَ',
    dotCount: 0, dotSide: 'above', order: 17, family: 'ain',
    word: 'عِلْم', wordRu: 'знание', wordEmoji: '📚', ttsWord: 'علم'
  },
  {
    id: 'ghain', char: 'غ', nameAr: 'غَيْن', nameRu: 'гайн', soundRu: 'га', ttsName: 'غين', ttsSound: 'غَ',
    dotCount: 1, dotSide: 'above', order: 18, family: 'ain',
    word: 'غَيْم', wordRu: 'облако', wordEmoji: '☁️', ttsWord: 'غيم'
  },
  {
    id: 'faa', char: 'ف', nameAr: 'فَاء', nameRu: 'фа', soundRu: 'фа', ttsName: 'فاء', ttsSound: 'فَ',
    dotCount: 1, dotSide: 'above', order: 19, family: 'faa',
    word: 'فَم', wordRu: 'рот', wordEmoji: '🔷', ttsWord: 'فم'
  },
  {
    id: 'qaaf', char: 'ق', nameAr: 'قَاف', nameRu: 'каф', soundRu: 'ка', ttsName: 'قاف', ttsSound: 'قَ',
    dotCount: 2, dotSide: 'above', order: 20, family: 'faa',
    word: 'قَلَم', wordRu: 'ручка', wordEmoji: '🖊️', ttsWord: 'قلم'
  },
  {
    id: 'kaaf', char: 'ك', nameAr: 'كَاف', nameRu: 'каф', soundRu: 'ка', ttsName: 'كاف', ttsSound: 'كَ',
    dotCount: 0, dotSide: 'above', order: 21, family: 'kaaf',
    word: 'كِتَاب', wordRu: 'книга', wordEmoji: '📖', ttsWord: 'كتاب'
  },
  {
    id: 'laam', char: 'ل', nameAr: 'لَام', nameRu: 'лям', soundRu: 'ля', ttsName: 'لام', ttsSound: 'لَ',
    dotCount: 0, dotSide: 'above', order: 22, family: 'laam',
    word: 'لَيْل', wordRu: 'ночь', wordEmoji: '☾', ttsWord: 'ليل'
  },
  {
    id: 'meem', char: 'م', nameAr: 'مِيم', nameRu: 'мим', soundRu: 'ма', ttsName: 'ميم', ttsSound: 'مَ',
    dotCount: 0, dotSide: 'above', order: 23, family: 'meem',
    word: 'مَاء', wordRu: 'вода', wordEmoji: '💧', ttsWord: 'ماء'
  },
  {
    id: 'noon', char: 'ن', nameAr: 'نُون', nameRu: 'нун', soundRu: 'на', ttsName: 'نون', ttsSound: 'نَ',
    dotCount: 1, dotSide: 'above', order: 24, family: 'noon',
    word: 'نُور', wordRu: 'свет', wordEmoji: '🔆', ttsWord: 'نور'
  },
  {
    id: 'haa2', char: 'ه', nameAr: 'هَاء', nameRu: 'ха', soundRu: 'ха', ttsName: 'هاء', ttsSound: 'هَ',
    dotCount: 0, dotSide: 'above', order: 25, family: 'haa2',
    word: 'هِلَال', wordRu: 'полумесяц', wordEmoji: '☾', ttsWord: 'هلال'
  },
  {
    id: 'waw', char: 'و', nameAr: 'وَاو', nameRu: 'вау', soundRu: 'ва', ttsName: 'واو', ttsSound: 'وَ',
    dotCount: 0, dotSide: 'above', order: 26, family: 'waw',
    word: 'وَرَق', wordRu: 'лист', wordEmoji: '🍃', ttsWord: 'ورق'
  },
  {
    id: 'yaa', char: 'ي', nameAr: 'يَاء', nameRu: 'йа', soundRu: 'йа', ttsName: 'ياء', ttsSound: 'يَ',
    dotCount: 2, dotSide: 'below', order: 27, family: 'yaa',
    word: 'يَد', wordRu: 'рука', wordEmoji: '✋', ttsWord: 'يد'
  }
]

export const lettersById: Record<string, Letter> = Object.fromEntries(
  letters.map((l) => [l.id, l])
)

export function getLetter(id: string | undefined): Letter | undefined {
  return id ? lettersById[id] : undefined
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Буквы одного семейства (без самой буквы), затем — остальные. */
export function getDistractors(letter: Letter, count: number): Letter[] {
  const same = letters.filter((l) => l.family === letter.family && l.id !== letter.id)
  const others = letters.filter((l) => l.family !== letter.family && l.id !== letter.id)
  return shuffle([...shuffle(same), ...shuffle(others)]).slice(0, count)
}
