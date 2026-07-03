const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toArabicNumeral(n: number): string {
  return n.toString().split('').map(d => {
    const idx = parseInt(d);
    return isNaN(idx) ? d : ARABIC_DIGITS[idx];
  }).join('');
}

export function formatNum(n: number, system: 'western' | 'arabic'): string {
  if (system === 'arabic') return toArabicNumeral(n);
  return n.toString();
}

export function formatEquation(a: number, b: number, result: number, system: 'western' | 'arabic'): string {
  return `${formatNum(a, system)} × ${formatNum(b, system)} = ${formatNum(result, system)}`;
}

export function formatText(text: string, system: 'western' | 'arabic'): string {
  if (system === 'western') return text;
  return text.replace(/[0-9]/g, d => ARABIC_DIGITS[parseInt(d)]);
}

// ═══════════════════════════════════════════════════════════
// ARABIC NUMBER WORDS (complete up to 144 for 12×12)
// ═══════════════════════════════════════════════════════════

const AR_NUMS: Record<number, string> = {
  0: 'صفر', 1: 'واحد', 2: 'اثنان', 3: 'ثلاثة', 4: 'أربعة', 5: 'خمسة',
  6: 'ستة', 7: 'سبعة', 8: 'ثمانية', 9: 'تسعة', 10: 'عشرة',
  11: 'أحد عشر', 12: 'اثنا عشر', 13: 'ثلاثة عشر', 14: 'أربعة عشر',
  15: 'خمسة عشر', 16: 'ستة عشر', 17: 'سبعة عشر', 18: 'ثمانية عشر',
  19: 'تسعة عشر', 20: 'عشرون', 21: 'واحد وعشرون', 22: 'اثنان وعشرون',
  23: 'ثلاثة وعشرون', 24: 'أربعة وعشرون', 25: 'خمسة وعشرون',
  26: 'ستة وعشرون', 27: 'سبعة وعشرون', 28: 'ثمانية وعشرون',
  29: 'تسعة وعشرون', 30: 'ثلاثون', 31: 'واحد وثلاثون', 32: 'اثنان وثلاثون',
  33: 'ثلاثة وثلاثون', 34: 'أربعة وثلاثون', 35: 'خمسة وثلاثون',
  36: 'ستة وثلاثون', 37: 'سبعة وثلاثون', 38: 'ثمانية وثلاثون',
  39: 'تسعة وثلاثون', 40: 'أربعون', 41: 'واحد وأربعون', 42: 'اثنان وأربعون',
  43: 'ثلاثة وأربعون', 44: 'أربعة وأربعون', 45: 'خمسة وأربعون',
  46: 'ستة وأربعون', 47: 'سبعة وأربعون', 48: 'ثمانية وأربعون',
  49: 'تسعة وأربعون', 50: 'خمسون', 51: 'واحد وخمسون', 52: 'اثنان وخمسون',
  53: 'ثلاثة وخمسون', 54: 'أربعة وخمسون', 55: 'خمسة وخمسون',
  56: 'ستة وخمسون', 57: 'سبعة وخمسون', 58: 'ثمانية وخمسون',
  59: 'تسعة وخمسون', 60: 'ستون', 61: 'واحد وستون', 62: 'اثنان وستون',
  63: 'ثلاثة وستون', 64: 'أربعة وستون', 65: 'خمسة وستون',
  66: 'ستة وستون', 67: 'سبعة وستون', 68: 'ثمانية وستون',
  69: 'تسعة وستون', 70: 'سبعون', 71: 'واحد وسبعون', 72: 'اثنان وسبعون',
  73: 'ثلاثة وسبعون', 74: 'أربعة وسبعون', 75: 'خمسة وسبعون',
  76: 'ستة وسبعون', 77: 'سبعة وسبعون', 78: 'ثمانية وسبعون',
  79: 'تسعة وسبعون', 80: 'ثمانون', 81: 'واحد وثمانون', 82: 'اثنان وثمانون',
  83: 'ثلاثة وثمانون', 84: 'أربعة وثمانون', 85: 'خمسة وثمانون',
  86: 'ستة وثمانون', 87: 'سبعة وثمانون', 88: 'ثمانية وثمانون',
  89: 'تسعة وثمانون', 90: 'تسعون', 91: 'واحد وتسعون', 92: 'اثنان وتسعون',
  93: 'ثلاثة وتسعون', 94: 'أربعة وتسعون', 95: 'خمسة وتسعون',
  96: 'ستة وتسعون', 97: 'سبعة وتسعون', 98: 'ثمانية وتسعون',
  99: 'تسعة وتسعون', 100: 'مئة', 101: 'مئة وواحد', 102: 'مئة واثنان',
  103: 'مئة وثلاثة', 104: 'مئة وأربعة', 105: 'مئة وخمسة',
  106: 'مئة وستة', 107: 'مئة وسبعة', 108: 'مئة وثمانية',
  109: 'مئة وتسعة', 110: 'مئة وعشرة', 111: 'مئة وأحد عشر',
  112: 'مئة واثنا عشر', 113: 'مئة وثلاثة عشر', 114: 'مئة وأربعة عشر', 115: 'مئة وخمسة عشر',
  116: 'مئة وستة عشر', 117: 'مئة وسبعة عشر', 118: 'مئة وثمانية عشر', 119: 'مئة وتسعة عشر',
  120: 'مئة وعشرون', 121: 'مئة وواحد وعشرون', 122: 'مئة واثنان وعشرون', 123: 'مئة وثلاثة وعشرون',
  124: 'مئة وأربعة وعشرون', 125: 'مئة وخمسة وعشرون', 126: 'مئة وستة وعشرون', 127: 'مئة وسبعة وعشرون',
  128: 'مئة وثمانية وعشرون', 129: 'مئة وتسعة وعشرون', 130: 'مئة وثلاثون',
  131: 'مئة وواحد وثلاثون', 132: 'مئة واثنان وثلاثون', 133: 'مئة وثلاثة وثلاثون',
  134: 'مئة وأربعة وثلاثون', 135: 'مئة وخمسة وثلاثون', 136: 'مئة وستة وثلاثون',
  137: 'مئة وسبعة وثلاثون', 138: 'مئة وثمانية وثلاثون', 139: 'مئة وتسعة وثلاثون',
  140: 'مئة وأربعون', 141: 'مئة وواحد وأربعون', 142: 'مئة واثنان وأربعون',
  143: 'مئة وثلاثة وأربعون', 144: 'مئة وأربعة وأربعون',
};

const EN_NUMS: Record<number, string> = {
  0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
  6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten',
  11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen',
  15: 'fifteen', 16: 'sixteen', 17: 'seventeen', 18: 'eighteen',
  19: 'nineteen', 20: 'twenty', 21: 'twenty-one', 22: 'twenty-two',
  23: 'twenty-three', 24: 'twenty-four', 25: 'twenty-five',
  26: 'twenty-six', 27: 'twenty-seven', 28: 'twenty-eight',
  29: 'twenty-nine', 30: 'thirty', 31: 'thirty-one', 32: 'thirty-two',
  33: 'thirty-three', 34: 'thirty-four', 35: 'thirty-five',
  36: 'thirty-six', 37: 'thirty-seven', 38: 'thirty-eight',
  39: 'thirty-nine', 40: 'forty', 41: 'forty-one', 42: 'forty-two',
  43: 'forty-three', 44: 'forty-four', 45: 'forty-five',
  46: 'forty-six', 47: 'forty-seven', 48: 'forty-eight',
  49: 'forty-nine', 50: 'fifty', 51: 'fifty-one', 52: 'fifty-two',
  53: 'fifty-three', 54: 'fifty-four', 55: 'fifty-five',
  56: 'fifty-six', 57: 'fifty-seven', 58: 'fifty-eight',
  59: 'fifty-nine', 60: 'sixty', 61: 'sixty-one', 62: 'sixty-two',
  63: 'sixty-three', 64: 'sixty-four', 65: 'sixty-five',
  66: 'sixty-six', 67: 'sixty-seven', 68: 'sixty-eight',
  69: 'sixty-nine', 70: 'seventy', 71: 'seventy-one', 72: 'seventy-two',
  73: 'seventy-three', 74: 'seventy-four', 75: 'seventy-five',
  76: 'seventy-six', 77: 'seventy-seven', 78: 'seventy-eight',
  79: 'seventy-nine', 80: 'eighty', 81: 'eighty-one', 82: 'eighty-two',
  83: 'eighty-three', 84: 'eighty-four', 85: 'eighty-five',
  86: 'eighty-six', 87: 'eighty-seven', 88: 'eighty-eight',
  89: 'eighty-nine', 90: 'ninety', 91: 'ninety-one', 92: 'ninety-two',
  93: 'ninety-three', 94: 'ninety-four', 95: 'ninety-five',
  96: 'ninety-six', 97: 'ninety-seven', 98: 'ninety-eight',
  99: 'ninety-nine', 100: 'one hundred', 101: 'one hundred one', 102: 'one hundred two',
  103: 'one hundred three', 104: 'one hundred four', 105: 'one hundred five',
  106: 'one hundred six', 107: 'one hundred seven', 108: 'one hundred eight',
  109: 'one hundred nine', 110: 'one hundred ten', 111: 'one hundred eleven',
  112: 'one hundred twelve', 113: 'one hundred thirteen', 114: 'one hundred fourteen',
  115: 'one hundred fifteen', 116: 'one hundred sixteen', 117: 'one hundred seventeen',
  118: 'one hundred eighteen', 119: 'one hundred nineteen', 120: 'one hundred twenty',
  121: 'one hundred twenty-one', 122: 'one hundred twenty-two', 123: 'one hundred twenty-three',
  124: 'one hundred twenty-four', 125: 'one hundred twenty-five', 126: 'one hundred twenty-six',
  127: 'one hundred twenty-seven', 128: 'one hundred twenty-eight', 129: 'one hundred twenty-nine',
  130: 'one hundred thirty', 131: 'one hundred thirty-one', 132: 'one hundred thirty-two',
  133: 'one hundred thirty-three', 134: 'one hundred thirty-four', 135: 'one hundred thirty-five',
  136: 'one hundred thirty-six', 137: 'one hundred thirty-seven', 138: 'one hundred thirty-eight',
  139: 'one hundred thirty-nine', 140: 'one hundred forty', 141: 'one hundred forty-one',
  142: 'one hundred forty-two', 143: 'one hundred forty-three', 144: 'one hundred forty-four',
};

// ═══════════════════════════════════════════════════════════
// VOICE TYPES AND SPEED
// ═══════════════════════════════════════════════════════════

export type VoiceType = 'boy' | 'girl' | 'mixed';
export type ChantSpeed = 'slow' | 'normal' | 'fast';

const SPEED_RATE: Record<ChantSpeed, number> = { slow: 0.55, normal: 0.75, fast: 1.05 };

// ═══════════════════════════════════════════════════════════
// VOICE CACHING - resolve Arabic voices once available
// ═══════════════════════════════════════════════════════════

let cachedArabicVoices: SpeechSynthesisVoice[] = [];
let voicesLoaded = false;

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  if (voicesLoaded && cachedArabicVoices.length > 0) return cachedArabicVoices;

  const all = speechSynthesis.getVoices();
  cachedArabicVoices = all.filter(v => v.lang.startsWith('ar'));
  if (cachedArabicVoices.length > 0) voicesLoaded = true;
  return cachedArabicVoices;
}

// Pre-load on module init and on voiceschanged event
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  speechSynthesis.onvoiceschanged = () => {
    cachedArabicVoices = speechSynthesis.getVoices().filter(v => v.lang.startsWith('ar'));
    voicesLoaded = true;
  };
}

// Android/Capacitor WebView: speechSynthesis may need a user interaction to unlock.
// This silent warm-up utterance primes the engine on first interaction.
let speechWarmedUp = false;
export function warmUpSpeech(): void {
  if (speechWarmedUp) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  speechWarmedUp = true;
  const u = new SpeechSynthesisUtterance('');
  u.volume = 0;
  u.rate = 1;
  speechSynthesis.speak(u);
}

// Wait for voices to load (returns quickly if already loaded)
function waitForVoices(timeout = 1000): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const v = loadVoices();
    if (v.length > 0) { resolve(v); return; }
    const timer = setTimeout(() => resolve(loadVoices()), timeout);
    if ('speechSynthesis' in window) {
      speechSynthesis.onvoiceschanged = () => {
        clearTimeout(timer);
        cachedArabicVoices = speechSynthesis.getVoices().filter(v => v.lang.startsWith('ar'));
        voicesLoaded = true;
        resolve(cachedArabicVoices);
      };
    }
  });
}

// ═══════════════════════════════════════════════════════════
// CORE SPEECH FUNCTIONS
// ═══════════════════════════════════════════════════════════

function pickArabicVoice(highPitch: boolean): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  if (voices.length === 0) return null;

  // Try to find voices that sound more child-like:
  // Female voices tend to be higher pitched, male lower.
  // We also try Arabic-specific locales (ar-SA, ar-EG, ar-AE)
  const preferredLocales = ['ar-SA', 'ar-EG', 'ar-AE', 'ar'];

  // First try preferred locale with matching pitch preference
  for (const lc of preferredLocales) {
    const match = voices.find(v => v.lang === lc || v.lang.startsWith(lc));
    if (match) return match;
  }

  // Fallback: first available Arabic voice
  return voices[0];
}

export function speakArabic(text: string, voiceType: VoiceType = 'boy', rate: number = 0.8): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();

  const useHighPitch = voiceType === 'girl' || (voiceType === 'mixed' && !mixedBoyNext);
  if (voiceType === 'mixed') mixedBoyNext = !mixedBoyNext;

  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ar-SA';
  u.rate = rate;

  const voice = pickArabicVoice(useHighPitch);
  if (voice) u.voice = voice;

  // Child-like pitch: boys ~1.0, girls ~1.5 (default is 1.0)
  u.pitch = useHighPitch ? 1.5 : 1.0;
  // Volume always full
  u.volume = 1.0;

  speechSynthesis.speak(u);
}

export function speakEnglish(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 0.9;
  speechSynthesis.speak(u);
}

// Track alternating for mixed mode
let mixedBoyNext = true;

// ═══════════════════════════════════════════════════════════
// EQUATION SPEAKING
// ═══════════════════════════════════════════════════════════

export function speakEquationArabic(a: number, b: number, result: number, voiceType: VoiceType = 'boy'): void {
  warmUpSpeech();
  const text = `${AR_NUMS[a] || a} في ${AR_NUMS[b] || b} يساوي ${AR_NUMS[result] || result}`;
  speakArabic(text, voiceType, 0.8);
}

export function speakEquationEnglish(a: number, b: number, result: number): void {
  warmUpSpeech();
  const text = `${EN_NUMS[a] || a} times ${EN_NUMS[b] || b} equals ${EN_NUMS[result] || result}`;
  speakEnglish(text);
}

// ═══════════════════════════════════════════════════════════
// FULL TABLE SPEAKING (one utterance per equation for child voice)
// ═══════════════════════════════════════════════════════════

export async function speakFullTableArabic(num: number, voiceType: VoiceType = 'boy'): Promise<void> {
  warmUpSpeech();
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  // Wait for voices to be loaded before starting
  await waitForVoices();
  speechSynthesis.cancel();

  for (let i = 1; i <= 12; i++) {
    const r = num * i;
    const text = `${AR_NUMS[num] || num} في ${AR_NUMS[i] || i} يساوي ${AR_NUMS[r] || r}`;

    const useHighPitch = voiceType === 'girl' || (voiceType === 'mixed' && i % 2 === 0);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ar-SA';
    u.rate = 0.75;
    const voice = pickArabicVoice(useHighPitch);
    if (voice) u.voice = voice;
    u.pitch = useHighPitch ? 1.5 : 1.0;
    u.volume = 1.0;

    // Queue each one - speechSynthesis will play them sequentially
    speechSynthesis.speak(u);
  }
}

export async function speakFullTableEnglish(num: number): Promise<void> {
  warmUpSpeech();
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();

  for (let i = 1; i <= 12; i++) {
    const r = num * i;
    const text = `${EN_NUMS[num] || num} times ${EN_NUMS[i] || i} equals ${EN_NUMS[r] || r}`;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.9;
    speechSynthesis.speak(u);
  }
}

// ═══════════════════════════════════════════════════════════
// CHANT MODE (نشيد الحفظ) - Arabic-only, rhythmic
// ═══════════════════════════════════════════════════════════

export type ChantState = 'idle' | 'playing' | 'paused';

let chantQueueTimer: ReturnType<typeof setTimeout> | null = null;
let chantCurrentIdx = 0;
let chantIsRepeating = false;
let chantOnIndexChange: ((idx: number) => void) | null = null;
let chantOnDone: (() => void) | null = null;
let chantNum = 0;
let chantVoice: VoiceType = 'boy';
let chantSpeedSetting: ChantSpeed = 'normal';

export async function startChant(
  num: number,
  voiceType: VoiceType,
  speed: ChantSpeed,
  onIndexChange: (idx: number) => void,
  onDone: () => void,
): Promise<ChantState> {
  warmUpSpeech();
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return 'idle';

  await waitForVoices();
  stopChant();

  chantNum = num;
  chantVoice = voiceType;
  chantSpeedSetting = speed;
  chantCurrentIdx = 0;
  chantOnIndexChange = onIndexChange;
  chantOnDone = onDone;
  chantIsRepeating = false;

  speakNextChantEquation();
  return 'playing';
}

function speakNextChantEquation(): void {
  if (chantCurrentIdx >= 12) {
    if (chantIsRepeating) {
      chantCurrentIdx = 0;
    } else {
     chantOnDone?.();
      return;
    }
  }

  const i = chantCurrentIdx + 1;
  const r = chantNum * i;
  const text = `${AR_NUMS[chantNum] || chantNum} في ${AR_NUMS[i] || i} يساوي ${AR_NUMS[r] || r}`;

  const useHighPitch = chantVoice === 'girl' || (chantVoice === 'mixed' && chantCurrentIdx % 2 === 1);
  const rate = SPEED_RATE[chantSpeedSetting];

  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ar-SA';
  u.rate = rate;
  const voice = pickArabicVoice(useHighPitch);
  if (voice) u.voice = voice;
  u.pitch = useHighPitch ? 1.5 : 1.0;
  u.volume = 1.0;

  u.onend = () => {
    // Rhythmic pause between equations
    const pauseMs = chantSpeedSetting === 'slow' ? 700 : chantSpeedSetting === 'normal' ? 400 : 200;
    chantQueueTimer = setTimeout(() => {
      chantCurrentIdx++;
      chantOnIndexChange?.(chantCurrentIdx);
      speakNextChantEquation();
    }, pauseMs);
  };

  u.onerror = () => {
    // Skip to next on error
    chantCurrentIdx++;
    chantOnIndexChange?.(chantCurrentIdx);
    speakNextChantEquation();
  };

  chantOnIndexChange?.(chantCurrentIdx);
  speechSynthesis.speak(u);
}

let chantWasPausedMidGap = false;

export function pauseChant(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    speechSynthesis.pause();
  }
  if (chantQueueTimer) {
    clearTimeout(chantQueueTimer);
    chantQueueTimer = null;
    chantWasPausedMidGap = true;
  }
}

export function resumeChant(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    speechSynthesis.resume();
  }
  if (chantWasPausedMidGap) {
    chantWasPausedMidGap = false;
    const pauseMs = chantSpeedSetting === 'slow' ? 700 : chantSpeedSetting === 'normal' ? 400 : 200;
    chantQueueTimer = setTimeout(() => {
      chantCurrentIdx++;
      chantOnIndexChange?.(chantCurrentIdx);
      speakNextChantEquation();
    }, pauseMs);
  }
}

export function stopChant(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
  if (chantQueueTimer) { clearTimeout(chantQueueTimer); chantQueueTimer = null; }
  chantOnIndexChange = null;
  chantOnDone = null;
}

export function setChantRepeat(repeat: boolean): void {
  chantIsRepeating = repeat;
}
