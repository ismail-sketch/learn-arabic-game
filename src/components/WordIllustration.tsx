interface Props {
  wordId: string
  label: string
  className?: string
}

/**
 * Небольшие смысловые иллюстрации вместо эмодзи.
 * Живые существа рисуются только силуэтом, без лица и мимики.
 */
export function WordIllustration({ wordId, label, className = '' }: Props) {
  const common = { className: `word-illustration ${className}`, role: 'img', 'aria-label': label }

  if (['jeem', 'haa', 'daal'].includes(wordId)) {
    return <svg {...common} viewBox="0 0 160 100"><path className="illustration__silhouette" d="M35 73c2-18 13-29 29-30 8-17 36-18 47 0 12 1 18 12 17 30H35Zm16-29 3-19 14 12m47 7 12-18 3 23" /></svg>
  }
  if (wordId === 'khaa') {
    return <svg {...common} viewBox="0 0 160 100"><path className="illustration__silhouette" d="M30 73c5-22 18-31 38-28 5-13 27-17 38-5 17-2 27 10 25 33H30Zm31-34 5-17 12 14m38 1 12-15 2 22" /></svg>
  }
  if (wordId === 'seen') return <svg {...common} viewBox="0 0 160 100"><path className="illustration__silhouette" d="M18 62c17-19 31-18 45 0 16-20 31-20 47 0 14-18 29-17 33 0-12 19-28 25-47 17-17 9-35 5-49-5-13 9-22 6-29-12Z" /></svg>
  if (wordId === 'alif') return <svg {...common} viewBox="0 0 160 100"><path className="illustration__sun" d="M80 25a25 25 0 1 0 0 50 25 25 0 0 0 0-50ZM80 5v10m0 70V75M60 10l6 12m34-12-6 12M35 25l12 8m78-8-12 8M25 50h16m78 0h16M35 75l12-8m78 8-12-8M60 90l6-12m34 12-6-12" /></svg>
  if (wordId === 'sheen') return <svg {...common} viewBox="0 0 160 100"><path className="illustration__sun" d="M80 25a25 25 0 1 0 0 50 25 25 0 0 0 0-50Z"/><path className="illustration__ray" d="M80 8v12m0 60v12M38 50H20m120 0h-18M50 20l8 10m52-10-8 10M50 80l8-10m52 10-8-10"/></svg>
  if (wordId === 'waw') return <svg {...common} viewBox="0 0 160 100"><path className="illustration__leaf" d="M80 83C45 75 35 47 48 22c34 2 57 21 32 61Z"/><path className="illustration__stem" d="M80 83c4-26 13-42 32-57"/></svg>
  if (wordId === 'ghain') return <svg {...common} viewBox="0 0 160 100"><path className="illustration__cloud" d="M33 70c-5-20 13-31 28-27 6-22 42-24 51-2 18-5 31 13 20 29H33Z"/><path className="illustration__rain" d="m55 79-5 12m28-12-5 12m28-12-5 12"/></svg>
  if (wordId === 'meem') return <svg {...common} viewBox="0 0 160 100"><path className="illustration__water" d="M80 14C68 33 45 50 45 68a35 25 0 0 0 70 0c0-18-23-35-35-54Z"/></svg>
  if (wordId === 'qaaf') return <svg {...common} viewBox="0 0 160 100"><path className="illustration__book" d="M25 25c20-9 40-4 55 7v53c-15-11-35-14-55-5V25Zm110 0c-20-9-40-4-55 7v53c15-11 35-14 55-5V25Z"/><path className="illustration__line" d="M80 32v48"/></svg>
  if (wordId === 'kaaf') return <svg {...common} viewBox="0 0 160 100"><path className="illustration__book" d="M30 18h76c8 0 13 5 13 13v53H43c-8 0-13-5-13-13V18Z"/><path className="illustration__line" d="M48 36h48m-48 15h40m-40 15h30"/><path className="illustration__bookmark" d="M119 18h12v59l-6-6-6 6Z"/></svg>
  if (wordId === 'faa') return <svg {...common} viewBox="0 0 160 100"><path className="illustration__shape" d="M43 75V38h74v37m-58 0V55h42v20M31 38h98L117 22H43Z"/></svg>
  if (wordId === 'taa') return <svg {...common} viewBox="0 0 160 100"><path className="illustration__road" d="M55 92 72 8h16l17 84"/><path className="illustration__road-line" d="M80 17v18m0 14v18m0 14v10"/></svg>
  if (wordId === 'zay') return <svg {...common} viewBox="0 0 160 100"><path className="illustration__flower" d="M80 86V48m0 14c-18 0-27-11-20-20 10-2 18 5 20 20Zm0-8c18 0 27-11 20-20-10-2-18 5-20 20Zm0-22c-18-7-18-22-7-25 10 4 11 14 7 25Zm0-2c18-7 18-22 7-25-10 4-11 14-7 25Z"/><path className="illustration__stem" d="M68 86h25"/></svg>
  if (wordId === 'noon') return <svg {...common} viewBox="0 0 160 100"><path className="illustration__lamp" d="M57 30h46l-7 16v23H64V46l-7-16Zm-9 0h64M70 69h20v17H70Z"/><circle className="illustration__glow" cx="80" cy="54" r="9"/></svg>
  if (wordId === 'laam' || wordId === 'haa2') return <svg {...common} viewBox="0 0 160 100"><path className="illustration__moon" d="M105 18c-27 4-42 24-34 45 7 20 30 28 51 17-22 2-38-14-37-32 1-15 9-25 20-30Z"/></svg>
  return <svg {...common} viewBox="0 0 160 100"><path className="illustration__shape" d="M38 72h84M50 72V38h60v34M60 38V25h40v13m-25 34V52h10v20"/></svg>
}
