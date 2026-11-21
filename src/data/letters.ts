/**
 * Данные букв.
 *
 * `body` — осевая линия «тела» буквы в системе viewBox 0 0 320 320.
 * Путь начинается СПРАВА (так как арабский пишется справа налево):
 * ребёнок ведёт палец справа налево. По этому пути рисуется «дорожка»
 * для обводки и считается оценка.
 *
 * `dots` — точки над/под телом. `family` — «семейство» похожих по форме
 * букв: их показываем вместе как отвлекатели (учим различать по точкам).
 */

export interface Dot {
  cx: number
  cy: number
  r: number
}

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
  /** Осевая линия тела буквы (справа налево) */
  body: string
  dots: Dot[]
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

/**
 * «Лодочка» для ب ت ث: пологая чаша, левый конец выше (финаль),
 * правый короче. Старт трассировки — справа.
 */
const BODY_BOAT =
  'M 226 150 L 226 204 C 226 228 198 240 160 240 C 122 240 94 228 94 204 L 94 136'

/** «Волна» для ج ح خ: открытая сверху чаша. */
const BODY_WAVE =
  'M 236 122 C 236 216 196 246 152 246 C 106 246 66 208 66 148 C 66 112 94 100 128 102 C 158 104 176 120 176 144'

/** «Уголок» для د ذ: короткий диагональный штрих. */
const BODY_DAAL = 'M 214 92 C 182 116 152 148 122 186'

/** «Хвостик» для ر ز: штрих вниз с загибом влево. */
const BODY_RAA =
  'M 158 100 C 188 138 200 182 188 226 C 184 242 170 250 154 240'

export const letters: Letter[] = [
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
    body: BODY_BOAT,
    dots: [{ cx: 160, cy: 278, r: 13 }],
    order: 1,
    family: 'boat',
    word: 'بَاب',
    wordRu: 'дверь',
    wordEmoji: '🚪',
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
    body: BODY_BOAT,
    dots: [
      { cx: 140, cy: 108, r: 12 },
      { cx: 180, cy: 108, r: 12 }
    ],
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
    body: BODY_BOAT,
    dots: [
      { cx: 160, cy: 92, r: 11 },
      { cx: 136, cy: 118, r: 11 },
      { cx: 184, cy: 118, r: 11 }
    ],
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
    body: BODY_WAVE,
    dots: [{ cx: 152, cy: 278, r: 13 }],
    order: 4,
    family: 'wave',
    word: 'جَمَل',
    wordRu: 'верблюд',
    wordEmoji: '🐪',
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
    body: BODY_WAVE,
    dots: [],
    order: 5,
    family: 'wave',
    word: 'حُصَان',
    wordRu: 'лошадь',
    wordEmoji: '🐴',
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
    body: BODY_WAVE,
    dots: [{ cx: 152, cy: 82, r: 12 }],
    order: 6,
    family: 'wave',
    word: 'خُبْز',
    wordRu: 'хлеб',
    wordEmoji: '🍞',
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
    body: BODY_DAAL,
    dots: [],
    order: 7,
    family: 'daal',
    word: 'دُبّ',
    wordRu: 'медведь',
    wordEmoji: '🐻',
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
    body: BODY_DAAL,
    dots: [{ cx: 150, cy: 58, r: 12 }],
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
    body: BODY_RAA,
    dots: [],
    order: 9,
    family: 'raa',
    word: 'رُمَّان',
    wordRu: 'гранат',
    wordEmoji: '🍎',
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
    body: BODY_RAA,
    dots: [{ cx: 168, cy: 64, r: 12 }],
    order: 10,
    family: 'raa',
    word: 'زَهْرَة',
    wordRu: 'цветок',
    wordEmoji: '🌸',
    ttsWord: 'زهرة'
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