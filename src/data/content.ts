/**
 * Версионирование учебного контента.
 * Позже эти данные можно получать с собственного API, не меняя компоненты.
 */
export interface ContentVersion {
  schema: 1
  contentVersion: string
}

export const localContentVersion: ContentVersion = {
  schema: 1,
  contentVersion: 'local-1'
}

export interface LearningWord {
  id: string
  arabic: string
  meaningRu: string
  meaningAr?: string
  emoji?: string
  audioUrl?: string
  checkedByParent: boolean
}

/**
 * Начальный набор оставлен маленьким и проверяемым вручную. Священные тексты
 * сюда не попадают: это только нейтральная лексика для обучения фусха.
 */
export const starterWords: LearningWord[] = [
  { id: 'bayt', arabic: 'بَيْت', meaningRu: 'дом', emoji: '⌂', checkedByParent: true },
  { id: 'qalam', arabic: 'قَلَم', meaningRu: 'ручка', emoji: '✎', checkedByParent: true },
  { id: 'kitab', arabic: 'كِتَاب', meaningRu: 'книга', emoji: '▤', checkedByParent: true },
  { id: 'shajara', arabic: 'شَجَرَة', meaningRu: 'дерево', emoji: '❧', checkedByParent: true }
]
