export type Harmony =
  | 'Complementary'
  | 'Analogous'
  | 'Triadic'
  | 'Split Complementary'
  | 'Tetradic'
  | 'Monochromatic'
  | 'Random Harmony'

export type Temperature = 'Balanced' | 'Warm' | 'Cool' | 'Neutral'
export type Saturation = 'Balanced' | 'Muted' | 'Vibrant'
export type Lightness = 'Balanced' | 'Dark' | 'Light'

export interface GenerationSettings {
  harmony: Harmony
  temperature: Temperature
  saturation: Saturation
  lightness: Lightness
  contrast: number
}

export interface PaletteColor {
  hex: string
  name: string
}

export interface Palette {
  colors: PaletteColor[]
  harmony: Harmony
  settings: GenerationSettings
  seed?: string
  createdAt: number
}

const cssColors: Record<string, string> = {
  aliceblue: '#F0F8FF', antiquewhite: '#FAEBD7', aqua: '#00FFFF', aquamarine: '#7FFFD4',
  azure: '#F0FFFF', beige: '#F5F5DC', bisque: '#FFE4C4', black: '#000000',
  blanchedalmond: '#FFEBCD', blue: '#0000FF', blueviolet: '#8A2BE2', brown: '#A52A2A',
  burlywood: '#DEB887', cadetblue: '#5F9EA0', chartreuse: '#7FFF00', chocolate: '#D2691E',
  coral: '#FF7F50', cornflowerblue: '#6495ED', cornsilk: '#FFF8DC', crimson: '#DC143C',
  cyan: '#00FFFF', darkblue: '#00008B', darkcyan: '#008B8B', darkgoldenrod: '#B8860B',
  darkgray: '#A9A9A9', darkgreen: '#006400', darkgrey: '#A9A9A9', darkkhaki: '#BDB76B',
  darkmagenta: '#8B008B', darkolivegreen: '#556B2F', darkorange: '#FF8C00', darkorchid: '#9932CC',
  darkred: '#8B0000', darksalmon: '#E9967A', darkseagreen: '#8FBC8F', darkslateblue: '#483D8B',
  darkslategray: '#2F4F4F', darkslategrey: '#2F4F4F', darkturquoise: '#00CED1', darkviolet: '#9400D3',
  deeppink: '#FF1493', deepskyblue: '#00BFFF', dimgray: '#696969', dimgrey: '#696969',
  dodgerblue: '#1E90FF', firebrick: '#B22222', floralwhite: '#FFFAF0', forestgreen: '#228B22',
  fuchsia: '#FF00FF', gainsboro: '#DCDCDC', ghostwhite: '#F8F8FF', gold: '#FFD700',
  goldenrod: '#DAA520', gray: '#808080', green: '#008000', greenyellow: '#ADFF2F',
  grey: '#808080', honeydew: '#F0FFF0', hotpink: '#FF69B4', indianred: '#CD5C5C',
  indigo: '#4B0082', ivory: '#FFFFF0', khaki: '#F0E68C', lavender: '#E6E6FA',
  lavenderblush: '#FFF0F5', lawngreen: '#7CFC00', lemonchiffon: '#FFFACD', lightblue: '#ADD8E6',
  lightcoral: '#F08080', lightcyan: '#E0FFFF', lightgoldenrodyellow: '#FAFAD2', lightgray: '#D3D3D3',
  lightgreen: '#90EE90', lightgrey: '#D3D3D3', lightpink: '#FFB6C1', lightsalmon: '#FFA07A',
  lightseagreen: '#20B2AA', lightskyblue: '#87CEFA', lightslategray: '#778899', lightslategrey: '#778899',
  lightsteelblue: '#B0C4DE', lightyellow: '#FFFFE0', lime: '#00FF00', limegreen: '#32CD32',
  linen: '#FAF0E6', magenta: '#FF00FF', maroon: '#800000', mediumaquamarine: '#66CDAA',
  mediumblue: '#0000CD', mediumorchid: '#BA55D3', mediumpurple: '#9370DB', mediumseagreen: '#3CB371',
  mediumslateblue: '#7B68EE', mediumspringgreen: '#00FA9A', mediumturquoise: '#48D1CC',
  mediumvioletred: '#C71585', midnightblue: '#191970', mintcream: '#F5FFFA', mistyrose: '#FFE4E1',
  moccasin: '#FFE4B5', navajowhite: '#FFDEAD', navy: '#000080', oldlace: '#FDF5E6',
  olive: '#808000', olivedrab: '#6B8E23', orange: '#FFA500', orangered: '#FF4500',
  orchid: '#DA70D6', palegoldenrod: '#EEE8AA', palegreen: '#98FB98', paleturquoise: '#AFEEEE',
  palevioletred: '#DB7093', papayawhip: '#FFEFD5', peachpuff: '#FFDAB9', peru: '#CD853F',
  pink: '#FFC0CB', plum: '#DDA0DD', powderblue: '#B0E0E6', purple: '#800080',
  rebeccapurple: '#663399', red: '#FF0000', rosybrown: '#BC8F8F', royalblue: '#4169E1',
  saddlebrown: '#8B4513', salmon: '#FA8072', sandybrown: '#F4A460', seagreen: '#2E8B57',
  seashell: '#FFF5EE', sienna: '#A0522D', silver: '#C0C0C0', skyblue: '#87CEEB',
  slateblue: '#6A5ACD', slategray: '#708090', slategrey: '#708090', snow: '#FFFAFA',
  springgreen: '#00FF7F', steelblue: '#4682B4', tan: '#D2B48C', teal: '#008080',
  thistle: '#D8BFD8', tomato: '#FF6347', turquoise: '#40E0D0', violet: '#EE82EE',
  wheat: '#F5DEB3', white: '#FFFFFF', whitesmoke: '#F5F5F5', yellow: '#FFFF00',
  yellowgreen: '#9ACD32',
}

export const HARMONIES: Harmony[] = [
  'Complementary', 'Analogous', 'Triadic', 'Split Complementary',
  'Tetradic', 'Monochromatic', 'Random Harmony',
]

export const toHex = (value: string): string | null => {
  const raw = value.trim().replace(/^#/, '')
  if (/^[\da-f]{3}$/i.test(raw)) {
    return `#${[...raw].map((digit) => digit + digit).join('').toUpperCase()}`
  }
  if (/^[\da-f]{6}$/i.test(raw)) return `#${raw.toUpperCase()}`
  return null
}

export const resolveSeed = (value: string): string | null => {
  const hex = toHex(value)
  if (hex) return hex
  const key = value.trim().toLowerCase().replace(/[\s_-]+/g, '')
  const extended: Record<string, string> = {
    burgundy: '#800020',
    sagegreen: '#9CAF88',
    terracotta: '#E2725B',
  }
  return cssColors[key] ?? extended[key] ?? null
}

const rgbFromHex = (hex: string) => {
  const value = hex.slice(1)
  return [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16) / 255)
}

const hueToRgb = (p: number, q: number, t: number) => {
  let hue = t
  if (hue < 0) hue += 1
  if (hue > 1) hue -= 1
  if (hue < 1 / 6) return p + (q - p) * 6 * hue
  if (hue < 1 / 2) return q
  if (hue < 2 / 3) return p + (q - p) * (2 / 3 - hue) * 6
  return p
}

const hslToHex = (hue: number, saturation: number, lightness: number) => {
  const h = ((hue % 360) + 360) % 360 / 360
  const s = Math.min(1, Math.max(0, saturation))
  const l = Math.min(0.92, Math.max(0.08, lightness))
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const rgb = s === 0 ? [l, l, l] : [hueToRgb(p, q, h + 1 / 3), hueToRgb(p, q, h), hueToRgb(p, q, h - 1 / 3)]
  return `#${rgb.map((channel) => Math.round(channel * 255).toString(16).padStart(2, '0')).join('').toUpperCase()}`
}

const hslFromHex = (hex: string) => {
  const [r, g, b] = rgbFromHex(hex)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  let hue = 0
  const lightness = (max + min) / 2
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1))
  if (delta !== 0) {
    if (max === r) hue = ((g - b) / delta) % 6
    else if (max === g) hue = (b - r) / delta + 2
    else hue = (r - g) / delta + 4
    hue *= 60
  }
  return { hue: (hue + 360) % 360, saturation, lightness }
}

const linearize = (value: number) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4

const labFromHex = (hex: string) => {
  const [r, g, b] = rgbFromHex(hex).map(linearize)
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883
  const f = (value: number) => value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116
  const fx = f(x)
  const fy = f(y)
  const fz = f(z)
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

const deltaE2000 = ([l1, a1, b1]: number[], [l2, a2, b2]: number[]) => {
  const toRadians = (degrees: number) => degrees * Math.PI / 180
  const toDegrees = (radians: number) => (radians * 180 / Math.PI + 360) % 360
  const c1 = Math.hypot(a1, b1)
  const c2 = Math.hypot(a2, b2)
  const meanC = (c1 + c2) / 2
  const meanC7 = meanC ** 7
  const g = 0.5 * (1 - Math.sqrt(meanC7 / (meanC7 + 25 ** 7)))
  const adjustedA1 = (1 + g) * a1
  const adjustedA2 = (1 + g) * a2
  const adjustedC1 = Math.hypot(adjustedA1, b1)
  const adjustedC2 = Math.hypot(adjustedA2, b2)
  const hue1 = adjustedC1 === 0 ? 0 : toDegrees(Math.atan2(b1, adjustedA1))
  const hue2 = adjustedC2 === 0 ? 0 : toDegrees(Math.atan2(b2, adjustedA2))
  const deltaL = l2 - l1
  const deltaC = adjustedC2 - adjustedC1
  const rawDeltaHue = hue2 - hue1
  const deltaHue = adjustedC1 * adjustedC2 === 0
    ? 0
    : Math.abs(rawDeltaHue) <= 180
      ? rawDeltaHue
      : rawDeltaHue > 180 ? rawDeltaHue - 360 : rawDeltaHue + 360
  const deltaH = 2 * Math.sqrt(adjustedC1 * adjustedC2) * Math.sin(toRadians(deltaHue / 2))
  const meanL = (l1 + l2) / 2
  const meanAdjustedC = (adjustedC1 + adjustedC2) / 2
  let meanHue = hue1 + hue2
  if (adjustedC1 * adjustedC2 === 0) meanHue = hue1 + hue2
  else if (Math.abs(rawDeltaHue) <= 180) meanHue = (hue1 + hue2) / 2
  else if (hue1 + hue2 < 360) meanHue = (hue1 + hue2 + 360) / 2
  else meanHue = (hue1 + hue2 - 360) / 2
  const hueTerm = 1
    - 0.17 * Math.cos(toRadians(meanHue - 30))
    + 0.24 * Math.cos(toRadians(2 * meanHue))
    + 0.32 * Math.cos(toRadians(3 * meanHue + 6))
    - 0.2 * Math.cos(toRadians(4 * meanHue - 63))
  const deltaTheta = 30 * Math.exp(-(((meanHue - 275) / 25) ** 2))
  const meanAdjustedC7 = meanAdjustedC ** 7
  const rotationC = 2 * Math.sqrt(meanAdjustedC7 / (meanAdjustedC7 + 25 ** 7))
  const lightnessScale = 1 + 0.015 * (meanL - 50) ** 2 / Math.sqrt(20 + (meanL - 50) ** 2)
  const chromaScale = 1 + 0.045 * meanAdjustedC
  const hueScale = 1 + 0.015 * meanAdjustedC * hueTerm
  const rotationTerm = -Math.sin(toRadians(2 * deltaTheta)) * rotationC
  const scaledL = deltaL / lightnessScale
  const scaledC = deltaC / chromaScale
  const scaledH = deltaH / hueScale
  return Math.sqrt(scaledL ** 2 + scaledC ** 2 + scaledH ** 2 + rotationTerm * scaledC * scaledH)
}

const namedLabs = Object.entries(cssColors).map(([name, hex]) => ({ name, lab: labFromHex(hex) }))

export const colorName = (hex: string) => {
  const lab = labFromHex(hex)
  let nearest = namedLabs[0]
  let nearestDistance = Number.POSITIVE_INFINITY
  for (const candidate of namedLabs) {
    const distance = deltaE2000(candidate.lab, lab)
    if (distance < nearestDistance) {
      nearest = candidate
      nearestDistance = distance
    }
  }
  const readableNames: Record<string, string> = {
    aliceblue: 'Alice Blue', antiquewhite: 'Antique White', blanchedalmond: 'Blanched Almond',
    blueviolet: 'Blue Violet', cadetblue: 'Cadet Blue', cornflowerblue: 'Cornflower Blue',
    darkblue: 'Dark Blue', darkcyan: 'Dark Cyan', darkgoldenrod: 'Dark Goldenrod', darkgray: 'Dark Gray',
    darkgreen: 'Dark Green', darkgrey: 'Dark Grey', darkkhaki: 'Dark Khaki', darkmagenta: 'Dark Magenta',
    darkolivegreen: 'Dark Olive Green', darkorange: 'Dark Orange', darkorchid: 'Dark Orchid',
    darkred: 'Dark Red', darksalmon: 'Dark Salmon', darkseagreen: 'Dark Sea Green',
    darkslateblue: 'Dark Slate Blue', darkslategray: 'Dark Slate Gray', darkslategrey: 'Dark Slate Grey',
    darkturquoise: 'Dark Turquoise', darkviolet: 'Dark Violet', deeppink: 'Deep Pink',
    deepskyblue: 'Deep Sky Blue', dimgray: 'Dim Gray', dimgrey: 'Dim Grey', dodgerblue: 'Dodger Blue',
    firebrick: 'Fire Brick', floralwhite: 'Floral White', forestgreen: 'Forest Green',
    ghostwhite: 'Ghost White', greenyellow: 'Green Yellow', honeydew: 'Honeydew', hotpink: 'Hot Pink',
    indianred: 'Indian Red', lavenderblush: 'Lavender Blush', lawngreen: 'Lawn Green',
    lemonchiffon: 'Lemon Chiffon', lightblue: 'Light Blue', lightcoral: 'Light Coral',
    lightcyan: 'Light Cyan', lightgoldenrodyellow: 'Light Goldenrod Yellow', lightgray: 'Light Gray',
    lightgreen: 'Light Green', lightgrey: 'Light Grey', lightpink: 'Light Pink',
    lightsalmon: 'Light Salmon', lightseagreen: 'Light Sea Green', lightskyblue: 'Light Sky Blue',
    lightslategray: 'Light Slate Gray', lightslategrey: 'Light Slate Grey',
    lightsteelblue: 'Light Steel Blue', lightyellow: 'Light Yellow', limegreen: 'Lime Green',
    mediumaquamarine: 'Medium Aquamarine', mediumblue: 'Medium Blue', mediumorchid: 'Medium Orchid',
    mediumpurple: 'Medium Purple', mediumseagreen: 'Medium Sea Green',
    mediumslateblue: 'Medium Slate Blue', mediumspringgreen: 'Medium Spring Green',
    mediumturquoise: 'Medium Turquoise', mediumvioletred: 'Medium Violet Red',
    midnightblue: 'Midnight Blue', mintcream: 'Mint Cream', mistyrose: 'Misty Rose',
    navajowhite: 'Navajo White', oldlace: 'Old Lace', olivedrab: 'Olive Drab',
    orangered: 'Orange Red', palegoldenrod: 'Pale Goldenrod', palegreen: 'Pale Green',
    paleturquoise: 'Pale Turquoise', palevioletred: 'Pale Violet Red', papayawhip: 'Papaya Whip',
    peachpuff: 'Peach Puff', rebeccapurple: 'Rebecca Purple', rosybrown: 'Rosy Brown',
    royalblue: 'Royal Blue', saddlebrown: 'Saddle Brown', sandybrown: 'Sandy Brown',
    seagreen: 'Sea Green', seashell: 'Sea Shell', skyblue: 'Sky Blue', slateblue: 'Slate Blue',
    slategray: 'Slate Gray', slategrey: 'Slate Grey', springgreen: 'Spring Green',
    steelblue: 'Steel Blue', yellowgreen: 'Yellow Green',
  }
  return readableNames[nearest.name] ?? nearest.name.replace(/\b\w/g, (letter) => letter.toUpperCase())
}

const hashSeed = (value: string) => {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const randomFromSeed = (seed: string) => {
  let state = hashSeed(seed) || 1
  return () => {
    state += 0x6D2B79F5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

const harmonyHues = (hue: number, harmony: Harmony) => {
  switch (harmony) {
    case 'Complementary': return [hue, hue + 180, hue + 15, hue + 195, hue - 15, hue + 165]
    case 'Analogous': return [hue - 30, hue - 18, hue - 6, hue + 6, hue + 18, hue + 30]
    case 'Triadic': return [hue, hue + 120, hue + 240, hue + 12, hue + 132, hue + 252]
    case 'Split Complementary': return [hue, hue + 150, hue + 210, hue - 12, hue + 138, hue + 198]
    case 'Tetradic': return [hue, hue + 90, hue + 180, hue + 270, hue + 18, hue + 108]
    case 'Monochromatic': return Array(6).fill(hue)
    case 'Random Harmony': return harmonyHues(hue, HARMONIES[Math.floor(Math.random() * 6)])
  }
}

const adjustHueForTemperature = (hue: number, temperature: Temperature) => {
  if (temperature === 'Warm') return hue + (hue > 180 ? -22 : 12)
  if (temperature === 'Cool') return hue + (hue > 180 ? 18 : -16)
  if (temperature === 'Neutral') return hue + (hue > 180 ? -8 : 8)
  return hue
}

export const makePalette = (
  settings: GenerationSettings,
  seedColor?: string,
  seedValue?: string,
  locked: (PaletteColor | undefined)[] = [],
  seededRandom?: () => number,
): Palette => {
  const random = seededRandom ?? Math.random
  const harmony = settings.harmony === 'Random Harmony'
    ? HARMONIES[Math.floor(random() * 6)]
    : settings.harmony
  const base = seedColor ? hslFromHex(seedColor) : {
    hue: Math.floor(random() * 360),
    saturation: 0.58 + random() * 0.24,
    lightness: 0.42 + random() * 0.16,
  }
  const hues = harmonyHues(base.hue, harmony)
  const saturationBase = settings.saturation === 'Muted' ? 0.43 : settings.saturation === 'Vibrant' ? 0.9 : 0.68
  const lightnessBase = settings.lightness === 'Dark' ? 0.32 : settings.lightness === 'Light' ? 0.72 : 0.52
  const colors = hues.map((hue, index) => {
    const role = index % 3
    const lightnessOffsets = [-0.15, 0.08, 0.19]
    const saturationOffsets = [0.05, -0.07, 0]
    const contrast = Math.max(0, Math.min(100, settings.contrast)) / 100
    const lightness = lightnessBase + lightnessOffsets[role] * contrast + (random() - 0.5) * 0.09
    const saturation = saturationBase + saturationOffsets[role] * 1.2 + (random() - 0.5) * 0.14
    const adjustedHue = adjustHueForTemperature(hue, settings.temperature)
    const colorHex = seedColor && seedValue && index === 0 ? seedColor : hslToHex(adjustedHue, saturation, lightness)
    return { hex: colorHex, name: colorName(colorHex) }
  })
  if (seedColor && seedValue) colors.splice(0, 1, { hex: seedColor, name: colorName(seedColor) })
  const finalColors = colors.map((color, index) => locked[index] ?? color)
  return { colors: finalColors, harmony, settings: { ...settings }, seed: seedValue, createdAt: Date.now() }
}

export const seededPalette = (settings: GenerationSettings, seed: string, seedColor?: string, locked: PaletteColor[] = []) => {
  const random = randomFromSeed(`${seed}|${settings.harmony}|${settings.temperature}|${settings.saturation}|${settings.lightness}|${settings.contrast}`)
  return makePalette(settings, seedColor, seed, locked, random)
}

export const readableTextColor = (hex: string) => {
  const [r, g, b] = rgbFromHex(hex).map((channel) => {
    const value = channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    return value
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.179 ? '#171717' : '#FFFFFF'
}
