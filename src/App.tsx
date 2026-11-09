import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import {
  colorName,
  HARMONIES,
  makePalette,
  readableTextColor,
  resolveSeed,
  seededPalette,
  toHex,
} from './color'
import type { GenerationSettings, Harmony, Lightness, Palette, Saturation, Temperature } from './color'
import './App.css'

const STORAGE_KEY = 'palette-studio.saved-palettes'
const DEFAULT_SETTINGS: GenerationSettings = {
  harmony: 'Analogous',
  temperature: 'Balanced',
  saturation: 'Balanced',
  lightness: 'Balanced',
  contrast: 62,
}

const initialPalette = seededPalette(DEFAULT_SETTINGS, 'palette-studio-welcome')

type IconName = 'spark' | 'copy' | 'check' | 'lock' | 'unlock' | 'heart' | 'sliders' | 'close' | 'arrow' | 'trash' | 'download' | 'keyboard'

function isPalette(value: unknown): value is Palette {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<Palette>
  const validSettings = !!item.settings
    && HARMONIES.includes(item.settings.harmony)
    && ['Balanced', 'Warm', 'Cool', 'Neutral'].includes(item.settings.temperature)
    && ['Balanced', 'Muted', 'Vibrant'].includes(item.settings.saturation)
    && ['Balanced', 'Dark', 'Light'].includes(item.settings.lightness)
    && Number.isFinite(item.settings.contrast)
  return Array.isArray(item.colors) && item.colors.length === 6
    && item.colors.every((color) => !!color && typeof color.hex === 'string' && !!toHex(color.hex) && typeof color.name === 'string')
    && typeof item.harmony === 'string' && validSettings && typeof item.createdAt === 'number'
}

function readStoredPalettes() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return { palettes: [] as Palette[], error: '' }
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) throw new Error('Saved palette data is not a list.')
    const palettes = parsed.filter(isPalette)
    return {
      palettes,
      error: palettes.length === parsed.length ? '' : 'Some saved palette data was invalid and could not be loaded.',
    }
  } catch (error) {
    console.error('Could not load saved palettes.', error)
    return { palettes: [] as Palette[], error: 'Saved palettes could not be loaded from this browser.' }
  }
}

function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z" /></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    unlock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 7.5-2" /></>,
    heart: <path d="M20.8 8.8c0 5.4-8.8 10-8.8 10s-8.8-4.6-8.8-10A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />,
    sliders: <><path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3" /><path d="M2 14h4m4-6h4m4 8h4" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
    trash: <><path d="M3 6h18m-2 0-.9 14H5.9L5 6m4 0V4h6v2m-5 4v6m4-6v6" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5m-5 5V3" /></>,
    keyboard: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M8 13h.01M12 13h.01M16 13h.01M8 16h8" /></>,
  }
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function App() {
  const [palette, setPalette] = useState<Palette>(initialPalette)
  const [settings, setSettings] = useState<GenerationSettings>(DEFAULT_SETTINGS)
  const [locks, setLocks] = useState<boolean[]>(Array(6).fill(false))
  const [storedPalettes] = useState(readStoredPalettes)
  const [saved, setSaved] = useState<Palette[]>(storedPalettes.palettes)
  const [showSettings, setShowSettings] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [showSeed, setShowSeed] = useState(false)
  const [seedInput, setSeedInput] = useState('')
  const [seedPosition, setSeedPosition] = useState('1')
  const [seedError, setSeedError] = useState('')
  const [notice, setNotice] = useState(storedPalettes.error)
  const [focusedColor, setFocusedColor] = useState(0)
  const [copying, setCopying] = useState<number | null>(null)
  const seedRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 2600)
    return () => window.clearTimeout(timer)
  }, [notice])

  const generate = useCallback(() => {
    const preserved = palette.colors.map((color, index) => locks[index] ? color : undefined)
    setPalette(makePalette(settings, undefined, undefined, preserved))
    setNotice('New palette generated')
  }, [locks, palette, settings])

  const toggleLock = useCallback((index: number) => {
    setLocks((current) => current.map((isLocked, colorIndex) => colorIndex === index ? !isLocked : isLocked))
    setFocusedColor(index)
    setNotice(locks[index] ? `Color ${index + 1} unlocked` : `Color ${index + 1} locked`)
  }, [locks])

  const copyText = useCallback(async (value: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(value)
      if (index !== undefined) {
        setCopying(index)
        window.setTimeout(() => setCopying((current) => current === index ? null : current), 1400)
      }
      setNotice('Copied to clipboard')
    } catch (error) {
      console.error('Clipboard write failed.', error)
      setNotice('Clipboard access failed. Check your browser permissions.')
    }
  }, [])

  function savePalettes(next: Palette[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setSaved(next)
      return true
    } catch (error) {
      console.error('Could not save palettes.', error)
      setNotice('Could not save palette. Browser storage may be full or unavailable.')
      return false
    }
  }

  function saveCurrent() {
    const next = [{ ...palette, colors: palette.colors.map((color) => ({ ...color })), createdAt: Date.now() }, ...saved]
    if (savePalettes(next)) setNotice('Palette saved to your collection')
  }

  function loadSaved(item: Palette) {
    setPalette(item)
    setSettings(item.settings)
    setLocks(Array(6).fill(false))
    setShowSaved(false)
    setNotice('Palette loaded')
  }

  function deleteSaved(index: number) {
    if (savePalettes(saved.filter((_, itemIndex) => itemIndex !== index))) setNotice('Saved palette removed')
  }

  function exportCss(item: Palette = palette) {
    const css = item.colors.map((color, index) => `  --color-${index + 1}: ${color.hex};`).join('\n')
    void copyText(`:root {\n${css}\n}`)
  }

  function exportJson(item: Palette = palette) {
    try {
      const data = JSON.stringify({ colors: item.colors, harmony: item.harmony, seed: item.seed ?? null, settings: item.settings, createdAt: item.createdAt }, null, 2)
      downloadFile(data, 'application/json', 'palette.json')
      setNotice('JSON palette exported')
    } catch (error) {
      console.error('JSON export failed.', error)
      setNotice('Could not export JSON palette.')
    }
  }

  function exportPng(item: Palette = palette) {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1800
      canvas.height = 720
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas is unavailable.')
      const barWidth = canvas.width / 6
      item.colors.forEach((color, index) => {
        context.fillStyle = color.hex
        context.fillRect(index * barWidth, 0, barWidth, canvas.height)
        const ink = readableTextColor(color.hex)
        context.fillStyle = ink
        context.textAlign = 'center'
        context.font = '500 29px Arial, sans-serif'
        context.fillText(color.name, (index + 0.5) * barWidth, 570, barWidth - 28)
        context.font = '600 27px monospace'
        context.fillText(color.hex, (index + 0.5) * barWidth, 620, barWidth - 28)
      })
      canvas.toBlob((blob) => {
        if (!blob) {
          setNotice('Could not create PNG image.')
          return
        }
        downloadBlob(blob, 'palette.png')
        setNotice('PNG palette exported')
      }, 'image/png')
    } catch (error) {
      console.error('PNG export failed.', error)
      setNotice('Could not export PNG image.')
    }
  }

  function downloadFile(content: string, type: string, filename: string) {
    downloadBlob(new Blob([content], { type }), filename)
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  function generateFromSeed(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = seedInput.trim()
    if (!value) {
      setSeedError('Enter a HEX colour, CSS colour name, or any text or number.')
      return
    }
    const seedColor = resolveSeed(value)
    if (value.startsWith('#') && !seedColor) {
      setSeedError('That HEX value is invalid. Try a value like #3A6EA5.')
      return
    }
    const position = Number(seedPosition) - 1
    let next = seededPalette(settings, value, seedColor ?? undefined)
    if (seedColor && position !== 0) {
      const moved = [...next.colors]
      const [seedSlot] = moved.splice(0, 1)
      moved.splice(position, 0, seedSlot)
      next = { ...next, colors: moved }
    }
    setPalette(next)
    setLocks(Array.from({ length: 6 }, (_, index) => index === position && !!seedColor))
    setFocusedColor(position)
    setSeedError('')
    setShowSeed(false)
    setNotice(seedColor ? `${colorName(seedColor)} seed applied and locked` : 'Seeded palette generated')
  }

  function updateSetting<Key extends keyof GenerationSettings>(key: Key, value: GenerationSettings[Key]) {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing = target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '')
      if (event.key === 'Escape') {
        setShowSaved(false)
        setShowSettings(false)
        setShowSeed(false)
        return
      }
      if (typing || showSaved || event.altKey || event.ctrlKey || event.metaKey) return
      if (event.code === 'Space') {
        event.preventDefault()
        generate()
      } else if (/^[1-6]$/.test(event.key)) {
        toggleLock(Number(event.key) - 1)
      } else if (event.key.toLowerCase() === 'c') {
        void copyText(palette.colors[focusedColor].hex, focusedColor)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [copyText, focusedColor, generate, locks, palette, settings, showSaved, toggleLock])

  function ignoreInputKey(event: ReactKeyboardEvent) {
    if (event.key === ' ') event.stopPropagation()
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Palette Studio home">
          <span className="brand-mark"><i /><i /><i /></span>
          <span>palette<span className="brand-light">studio</span></span>
        </a>
        <div className="topbar-meta"><span className="live-dot" /> Your color playground <span className="meta-divider" /> <span className="harmony-label">{palette.harmony}</span></div>
        <div className="top-actions">
          <button type="button" className="button button-quiet saved-trigger" onClick={() => setShowSaved(true)}>
            <Icon name="heart" size={15} /> <span>Saved</span><span className="saved-count">{saved.length}</span>
          </button>
          <button type="button" className={`icon-button ${showSettings ? 'is-active' : ''}`} onClick={() => setShowSettings((value) => !value)} aria-label="Toggle generation settings" title="Generation settings">
            <Icon name="sliders" size={17} />
          </button>
        </div>
      </header>

      <section className="intro-row">
        <div>
          <p className="eyebrow">COLOR EXPLORATION, MADE SIMPLE</p>
          <h1>Find your next <span>color story.</span></h1>
        </div>
        <div className="intro-right">
          <span className="palette-count"><b>06</b> COLORS</span>
          <span className="intro-caption">A little harmony goes a long way.</span>
        </div>
      </section>

      <section className="palette-grid" aria-label="Generated six-color palette">
        {palette.colors.map((color, index) => (
          <article
            className={`color-tile ${locks[index] ? 'locked' : ''} ${focusedColor === index ? 'focused-tile' : ''}`}
            key={`${index}-${color.hex}`}
            style={{ backgroundColor: color.hex, color: readableTextColor(color.hex) }}
            onFocus={() => setFocusedColor(index)}
            onClick={() => setFocusedColor(index)}
            aria-label={`Color ${index + 1}: ${color.name}, ${color.hex}${locks[index] ? ', locked' : ''}`}
          >
            <div className="tile-top">
              <span className="tile-index">0{index + 1}</span>
              <button type="button" className="tile-icon" aria-label={`${locks[index] ? 'Unlock' : 'Lock'} ${color.name}`} aria-pressed={locks[index]} onClick={(event) => { event.stopPropagation(); toggleLock(index) }} title={`${locks[index] ? 'Unlock' : 'Lock'} color (${index + 1})`}>
                <Icon name={locks[index] ? 'lock' : 'unlock'} size={15} />
              </button>
            </div>
            <div className="tile-content">
              <span className="color-name">{color.name}</span>
              <button type="button" className="hex-copy" onClick={(event) => { event.stopPropagation(); setFocusedColor(index); void copyText(color.hex, index) }} aria-label={`Copy ${color.hex}`}>
                <span className="hex-code">{color.hex}</span>
                <span className="copy-indicator"><Icon name={copying === index ? 'check' : 'copy'} size={13} /></span>
              </button>
            </div>
            {locks[index] && <span className="lock-status"><Icon name="lock" size={10} /> LOCKED</span>}
          </article>
        ))}
      </section>

      <section className="control-panel" aria-label="Palette controls">
        <div className="control-left">
          <label className="control-label" htmlFor="harmony-select">HARMONY</label>
          <select id="harmony-select" value={settings.harmony} onChange={(event) => updateSetting('harmony', event.target.value as Harmony)}>
            {HARMONIES.map((harmony) => <option key={harmony}>{harmony}</option>)}
          </select>
          <span className="control-divider" />
          <button type="button" className="button button-seed" onClick={() => { setShowSeed((value) => !value); setSeedError(''); window.setTimeout(() => seedRef.current?.focus(), 0) }}>
            <span className="seed-plus">+</span> Seed color
          </button>
          <button type="button" className="button button-quiet settings-toggle" onClick={() => setShowSettings((value) => !value)}><Icon name="sliders" size={15} /> Tune</button>
        </div>
        <div className="control-right">
          <button type="button" className="button button-save" onClick={saveCurrent} title="Save this palette"><Icon name="heart" size={15} /> Save palette</button>
          <div className="export-group">
            <button type="button" className="button button-quiet export-button" onClick={() => { void copyText(palette.colors.map((color) => color.hex).join(' ')) }} title="Copy all six HEX values"><Icon name="copy" size={15} /> Copy all</button>
            <button type="button" className="button button-quiet export-button export-sub" onClick={() => exportCss()} title="Copy CSS variables">CSS</button>
            <button type="button" className="button button-quiet export-button export-sub" onClick={() => exportJson()} title="Download JSON">JSON</button>
            <button type="button" className="button button-quiet export-button export-sub" onClick={() => exportPng()} title="Download PNG">PNG</button>
          </div>
          <button type="button" className="button button-generate" onClick={generate}><Icon name="spark" size={16} /> Generate <kbd>SPACE</kbd></button>
        </div>
      </section>

      {showSeed && <form className="seed-panel" onSubmit={generateFromSeed}>
        <div className="seed-heading"><div><span className="eyebrow">START SOMEWHERE</span><h2>Seed your palette</h2></div><button type="button" className="icon-button" aria-label="Close seed panel" onClick={() => setShowSeed(false)}><Icon name="close" /></button></div>
        <div className="seed-fields">
          <label className="seed-input-wrap"><span>Color name, HEX, or text seed</span><input ref={seedRef} value={seedInput} onChange={(event) => { setSeedInput(event.target.value); setSeedError('') }} onKeyDown={ignoreInputKey} placeholder="Try #3A6EA5 or midnightblue" /></label>
          <label className="seed-position"><span>Seed position</span><select value={seedPosition} onChange={(event) => setSeedPosition(event.target.value)}>{Array.from({ length: 6 }, (_, i) => <option value={i + 1} key={i}>Color {i + 1}</option>)}</select></label>
          <button className="button button-generate seed-submit" type="submit"><Icon name="spark" size={15} /> Generate from seed</button>
        </div>
        {seedError && <p className="form-error" role="alert">{seedError}</p>}
        <p className="seed-hint">HEX and CSS color seeds stay in the palette and are locked automatically. Text and numeric seeds are repeatable.</p>
      </form>}

      {showSettings && <section className="settings-panel" aria-label="Advanced generation settings">
        <div className="settings-title"><div><span className="eyebrow">MAKE IT YOURS</span><h2>Generation settings</h2></div><button type="button" className="text-button" onClick={() => setSettings(DEFAULT_SETTINGS)}>Reset settings</button></div>
        <div className="settings-options">
          <SettingGroup label="Temperature" value={settings.temperature} options={['Balanced', 'Warm', 'Cool', 'Neutral']} onChange={(value) => updateSetting('temperature', value as Temperature)} />
          <SettingGroup label="Saturation" value={settings.saturation} options={['Balanced', 'Muted', 'Vibrant']} onChange={(value) => updateSetting('saturation', value as Saturation)} />
          <SettingGroup label="Lightness" value={settings.lightness} options={['Balanced', 'Dark', 'Light']} onChange={(value) => updateSetting('lightness', value as Lightness)} />
          <label className="contrast-control"><span>Contrast <b>{settings.contrast}%</b></span><input aria-label="Color contrast" type="range" min="0" max="100" value={settings.contrast} onChange={(event) => updateSetting('contrast', Number(event.target.value))} /></label>
        </div>
      </section>}

      <footer className="bottom-note">
        <span><Icon name="keyboard" size={14} /> <b>SPACE</b> generate <i /> <b>1–6</b> lock <i /> <b>C</b> copy focused</span>
        <span className="crafted-note">Made for the love of color <span>✳</span></span>
      </footer>

      {showSaved && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowSaved(false) }}>
        <section className="saved-modal" role="dialog" aria-modal="true" aria-labelledby="saved-title">
          <div className="modal-heading"><div><span className="eyebrow">YOUR COLLECTION</span><h2 id="saved-title">Saved palettes <span className="modal-count">{saved.length}</span></h2></div><button className="icon-button" type="button" aria-label="Close saved palettes" onClick={() => setShowSaved(false)}><Icon name="close" /></button></div>
          {saved.length === 0 ? <div className="empty-saved"><span className="empty-heart"><Icon name="heart" size={21} /></span><h3>No saved palettes yet</h3><p>When a palette feels right, save it here for later.</p><button className="button button-generate" onClick={() => setShowSaved(false)}>Explore colors <Icon name="arrow" size={14} /></button></div> :
            <div className="saved-list">{saved.map((item, index) => <article className="saved-item" key={`${item.createdAt}-${index}`}>
              <button type="button" className="saved-swatches" aria-label={`Load ${item.harmony} palette`} onClick={() => loadSaved(item)}>{item.colors.map((color, colorIndex) => <span key={colorIndex} style={{ backgroundColor: color.hex }} />)}</button>
              <div className="saved-details"><strong>{item.harmony}</strong><span>{item.colors.map((color) => color.hex).join(' · ')}</span><small>{new Date(item.createdAt).toLocaleDateString()}</small></div>
              <button type="button" className="icon-button" aria-label="Copy saved palette HEX values" title="Copy HEX values" onClick={() => { void copyText(item.colors.map((color) => color.hex).join(' ')) }}><Icon name="copy" size={15} /></button>
              <button type="button" className="icon-button" aria-label="Export saved palette JSON" title="Export JSON" onClick={() => exportJson(item)}><Icon name="download" size={15} /></button>
              <button type="button" className="icon-button danger-button" aria-label="Delete saved palette" title="Delete palette" onClick={() => deleteSaved(index)}><Icon name="trash" size={15} /></button>
            </article>)}</div>}
          {saved.length > 0 && <p className="modal-footnote">Stored only in this browser · Select a swatch to load a palette</p>}
        </section>
      </div>}

      {notice && <div className="toast" role="status"><Icon name="check" size={15} /> {notice}</div>}
    </main>
  )
}

function SettingGroup({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <fieldset className="setting-group"><legend>{label}</legend><div className="segmented-control">{options.map((option) => <button key={option} type="button" className={value === option ? 'selected' : ''} aria-pressed={value === option} onClick={() => onChange(option)}>{option}</button>)}</div></fieldset>
}

export default App
