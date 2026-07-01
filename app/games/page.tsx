'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudent } from '@/lib/student-context';
import { useSettings } from '@/lib/settings-context';
import { formatNum } from '@/lib/numerals';
import { RefreshCw, Star, Timer } from 'lucide-react';

// ========== MEMORY CARDS GAME ==========
function MemoryGame({ onBack }: { onBack: () => void }) {
  const { addStars } = useStudent();
  const { numberSystem } = useSettings();
  const facts = [2,3,4,5,6,8].map(n => ({ id: `q-${n}`, content: `${n} × 4`, value: n * 4, type: 'question' }));
  const answers = [2,3,4,5,6,8].map(n => ({ id: `a-${n}`, content: `${n * 4}`, value: n * 4, type: 'answer' }));
  const [cards] = useState(() => [...facts, ...answers].sort(() => Math.random() - 0.5));
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);

  const flip = (id: string) => {
    if (flipped.length >= 2 || flipped.includes(id) || matched.includes(id)) return;
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped.map(fid => cards.find(c => c.id === fid)!);
      if (a.value === b.value && a.type !== b.type) {
        const newMatched = [...matched, a.id, b.id];
        setMatched(newMatched);
        setFlipped([]);
        if (newMatched.length === cards.length) { setDone(true); addStars(5); }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-bold text-gray-500">الحركات: {formatNum(moves, numberSystem)}</span>
        <span className="text-sm font-bold text-green-600">{formatNum(matched.length / 2, numberSystem)} / {formatNum(facts.length, numberSystem)} مطابقة</span>
      </div>
      {done ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-2xl font-black text-sky-700 mb-2">أحسنت!</h3>
          <p className="text-gray-600 mb-4">أنهيت اللعبة في {formatNum(moves, numberSystem)} حركة</p>
          <button onClick={onBack} className="bg-sky-500 text-white font-bold py-3 px-8 rounded-xl">العودة</button>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {cards.map(card => {
            const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
            const isMatched = matched.includes(card.id);
            return (
              <motion.button key={card.id} onClick={() => flip(card.id)} whileTap={{ scale: 0.95 }}
                className={`h-16 sm:h-20 rounded-xl font-black text-lg transition-all border-2 ${
                  isMatched ? 'bg-green-100 border-green-400 text-green-700' :
                  isFlipped ? `${card.type === 'question' ? 'bg-sky-100 border-sky-400 text-sky-700' : 'bg-pink-100 border-pink-400 text-pink-700'}` :
                  'bg-blue-500 border-blue-600 text-white hover:bg-blue-400'
                }`}>
                {isFlipped ? card.content : '?'}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ========== BALLOON POP GAME ==========
function BalloonGame({ onBack }: { onBack: () => void }) {
  const { addStars } = useStudent();
  const { numberSystem } = useSettings();
  const [question, setQuestion] = useState(() => { const a = Math.floor(Math.random()*9)+2; const b = Math.floor(Math.random()*9)+2; return { a, b, result: a*b }; });
  const [balloons, setBalloons] = useState(() => {
    const a = Math.floor(Math.random()*9)+2; const b = Math.floor(Math.random()*9)+2; const r = a*b;
    const wrongsSet = new Set<number>(); while(wrongsSet.size < 5) { const v = r + Math.floor(Math.random()*10)-4; if(v>0&&v!==r) wrongsSet.add(v); }
    return Array.from(wrongsSet).concat([r]).sort(() => Math.random()-0.5).map((v, i) => ({ id: i, value: v, x: 10 + (i*15), y: Math.random()*40+20, popped: false, isCorrect: v === r }));
  });
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const pop = (id: number) => {
    const balloon = balloons.find(b => b.id === id);
    if (!balloon || balloon.popped) return;
    setBalloons(bs => bs.map(b => b.id === id ? { ...b, popped: true } : b));
    if (balloon.isCorrect) {
      setScore(s => s + 1);
      addStars(1);
      setFeedback('✅ ممتاز!');
      setTimeout(() => {
        const a = Math.floor(Math.random()*9)+2; const b = Math.floor(Math.random()*9)+2;
        const newQ = { a, b, result: a*b };
        setQuestion(newQ);
        const wrongs = new Set<number>(); while(wrongs.size < 5) { const v = newQ.result + Math.floor(Math.random()*10)-4; if(v>0&&v!==newQ.result) wrongs.add(v); }
        setBalloons(Array.from(wrongs).concat([newQ.result]).sort(() => Math.random()-0.5).map((v, i) => ({ id: i, value: v, x: 10 + (i*15), y: Math.random()*40+20, popped: false, isCorrect: v === newQ.result })));
        setFeedback(null);
      }, 800);
    } else {
      setFeedback('❌ حاول مرة أخرى!');
      setTimeout(() => setFeedback(null), 600);
    }
  };

  const COLORS = ['bg-red-400', 'bg-pink-400', 'bg-sky-400', 'bg-green-400', 'bg-yellow-400', 'bg-orange-400'];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-xl font-black text-sky-700">{formatNum(question.a, numberSystem)} × {formatNum(question.b, numberSystem)} = ?</span>
        <span className="flex items-center gap-1 text-yellow-600 font-bold"><Star className="w-4 h-4 fill-yellow-400" />{formatNum(score, numberSystem)}</span>
      </div>
      <div className="relative bg-gradient-to-b from-sky-200 to-sky-100 rounded-2xl overflow-hidden" style={{ height: '280px' }}>
        {balloons.map((b, i) => (
          <motion.button key={b.id}
            initial={{ y: 280 }} animate={b.popped ? { y: -100, scale: 0, opacity: 0 } : { y: [280, b.y * 2, b.y * 2.5, b.y * 2], x: [0, 5, -5, 0] }}
            transition={b.popped ? { duration: 0.3 } : { duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
            onClick={() => pop(b.id)}
            className="absolute flex items-center justify-center"
            style={{ left: `${b.x}%`, transform: 'translateX(-50%)' }}>
            <div className={`w-16 h-16 ${COLORS[i % COLORS.length]} rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg hover:scale-110 transition-transform border-2 border-white/50`}>
              {formatNum(b.value, numberSystem)}
            </div>
          </motion.button>
        ))}
        <div className="absolute top-2 left-0 right-0 text-center">
          <span className="text-sky-700 font-bold text-lg">انقر على البالون الصحيح!</span>
        </div>
      </div>
      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
            className={`mt-3 text-center py-2 rounded-xl font-black text-xl ${feedback.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ========== SPEED CHALLENGE ==========
function SpeedChallenge({ onBack }: { onBack: () => void }) {
  const { addStars } = useStudent();
  const { numberSystem } = useSettings();
  const [timeLeft, setTimeLeft] = useState(60);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [q, setQ] = useState(() => { const a = Math.floor(Math.random()*9)+2; const b = Math.floor(Math.random()*9)+2; return { a, b, result: a*b }; });
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!started || done) return;
    const t = setInterval(() => setTimeLeft(s => { if (s <= 1) { clearInterval(t); setDone(true); return 0; } return s - 1; }), 1000);
    return () => clearInterval(t);
  }, [started, done]);

  useEffect(() => { if (started) inputRef.current?.focus(); }, [started]);

  const answer = () => {
    if (!input) return;
    const correct = parseInt(input) === q.result;
    setFeedback(correct);
    if (correct) { setScore(s => s + 1); addStars(1); }
    setInput('');
    setTimeout(() => {
      const a = Math.floor(Math.random()*9)+2; const b = Math.floor(Math.random()*9)+2;
      setQ({ a, b, result: a*b });
      setFeedback(null);
      inputRef.current?.focus();
    }, 300);
  };

  return (
    <div>
      {!started ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">⚡</div>
          <h3 className="text-2xl font-black text-sky-700 mb-2">تحدي السرعة</h3>
          <p className="text-gray-600 mb-6">أجب على أكبر عدد ممكن من الأسئلة في 60 ثانية!</p>
          <button onClick={() => setStarted(true)} className="bg-gradient-to-r from-orange-400 to-red-500 text-white font-black py-4 px-10 rounded-2xl text-xl shadow-md hover:opacity-90">
            ابدأ! 🚀
          </button>
        </div>
      ) : done ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">{score >= 20 ? '🏆' : score >= 10 ? '⭐' : '💪'}</div>
          <h3 className="text-2xl font-black text-sky-700 mb-2">انتهى الوقت!</h3>
          <div className="text-5xl font-black text-sky-600 my-4">{formatNum(score, numberSystem)} إجابة</div>
          <p className="text-gray-500 mb-6">{score >= 20 ? 'رائع! أنت سريع جداً!' : score >= 10 ? 'جيد جداً! استمر في التدريب!' : 'تدرب أكثر لتصبح أسرع!'}</p>
          <button onClick={onBack} className="bg-sky-500 text-white font-bold py-3 px-8 rounded-xl">العودة</button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className={`text-3xl font-black ${timeLeft <= 10 ? 'text-red-500' : 'text-sky-600'}`}>{formatNum(timeLeft, numberSystem)}s</div>
            <div className="flex items-center gap-2 text-yellow-600 font-black text-xl"><Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />{formatNum(score, numberSystem)}</div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 mb-6 overflow-hidden">
            <motion.div className={`h-full rounded-full ${timeLeft <= 10 ? 'bg-red-400' : 'bg-sky-400'}`} style={{ width: `${(timeLeft / 60) * 100}%` }} />
          </div>
          <div className="text-center text-5xl font-black text-sky-700 bg-sky-50 border-2 border-sky-200 rounded-2xl py-6 mb-6">
            {formatNum(q.a, numberSystem)} × {formatNum(q.b, numberSystem)} = ?
          </div>
          <div className={`flex gap-3 border-2 rounded-xl overflow-hidden ${feedback === true ? 'border-green-400' : feedback === false ? 'border-red-300' : 'border-sky-300'}`}>
            <input ref={inputRef} type="number" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && answer()}
              className="flex-1 text-center text-3xl font-black py-4 focus:outline-none bg-white" inputMode="numeric" placeholder="؟" />
            <button onClick={answer} className="bg-sky-500 text-white font-black px-8 hover:bg-sky-600">✓</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== WHEEL OF MULTIPLICATION ==========
function WheelGame({ onBack }: { onBack: () => void }) {
  const { addStars } = useStudent();
  const { numberSystem } = useSettings();
  const [tableNum, setTableNum] = useState(5);
  const [spinning, setSpinning] = useState(false);
  const [current, setCurrent] = useState<number | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [rotation, setRotation] = useState(0);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setFeedback(null);
    setAnswer('');
    const b = Math.floor(Math.random() * 12) + 1;
    const extra = Math.floor(Math.random() * 4) * 360;
    setRotation(r => r + extra + b * 30);
    setTimeout(() => { setCurrent(b); setSpinning(false); }, 1200);
  };

  const check = () => {
    if (!current || !answer) return;
    const correct = parseInt(answer) === tableNum * current;
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) { addStars(1); setScore(s => s + 1); }
  };

  const segments = Array.from({ length: 12 }, (_, i) => i + 1);
  const colors = ['#38bdf8','#4ade80','#facc15','#f472b6','#fb923c','#a78bfa','#34d399','#f87171','#60a5fa','#fbbf24','#2dd4bf','#e879f9'];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <select value={tableNum} onChange={e => setTableNum(parseInt(e.target.value))} className="border-2 border-sky-200 rounded-xl px-3 py-2 font-bold text-sky-700 focus:outline-none focus:border-sky-400">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(n => <option key={n} value={n}>جدول {formatNum(n, numberSystem)}</option>)}
        </select>
        <span className="flex items-center gap-1 text-yellow-600 font-bold"><Star className="w-4 h-4 fill-yellow-400" />{formatNum(score, numberSystem)}</span>
      </div>

      <div className="flex justify-center mb-6">
        <div className="relative" style={{ width: 220, height: 220 }}>
          {/* Wheel */}
          <motion.div animate={{ rotate: rotation }} transition={{ duration: 1.2, ease: 'easeOut' }} className="w-full h-full relative">
            <svg viewBox="0 0 220 220" className="w-full h-full">
              {segments.map((seg, i) => {
                const angle = (2 * Math.PI) / 12;
                const startAngle = i * angle - Math.PI / 2;
                const endAngle = (i + 1) * angle - Math.PI / 2;
                const x1 = 110 + 100 * Math.cos(startAngle);
                const y1 = 110 + 100 * Math.sin(startAngle);
                const x2 = 110 + 100 * Math.cos(endAngle);
                const y2 = 110 + 100 * Math.sin(endAngle);
                const mx = 110 + 65 * Math.cos((startAngle + endAngle) / 2);
                const my = 110 + 65 * Math.sin((startAngle + endAngle) / 2);
                return (
                  <g key={seg}>
                    <path d={`M 110 110 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`} fill={colors[i]} stroke="white" strokeWidth="2" />
                    <text x={mx} y={my} textAnchor="middle" dominantBaseline="middle" fill="white" fontWeight="bold" fontSize="14">{formatNum(seg, numberSystem)}</text>
                  </g>
                );
              })}
              <circle cx="110" cy="110" r="18" fill="white" stroke="#e5e7eb" strokeWidth="2" />
              <text x="110" y="110" textAnchor="middle" dominantBaseline="middle" fill="#0369a1" fontWeight="bold" fontSize="16">{formatNum(tableNum, numberSystem)}</text>
            </svg>
          </motion.div>
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[20px] border-l-transparent border-r-transparent border-b-red-500" />
        </div>
      </div>

      {current && !spinning && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
          <div className="text-3xl font-black text-sky-700 mb-3">{formatNum(tableNum, numberSystem)} × {formatNum(current, numberSystem)} = ?</div>
          <div className="flex gap-3">
            <input type="number" value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()}
              placeholder="الإجابة..." inputMode="numeric"
              className={`flex-1 text-center text-2xl font-black border-2 rounded-xl py-3 focus:outline-none ${
                feedback === 'correct' ? 'border-green-400 bg-green-50' : feedback === 'wrong' ? 'border-red-300 bg-red-50' : 'border-sky-300 focus:border-sky-500'
              }`} />
            <button onClick={check} className="bg-sky-500 text-white font-black py-3 px-5 rounded-xl hover:bg-sky-600">✓</button>
          </div>
          {feedback && (
            <div className={`mt-2 font-black text-lg ${feedback === 'correct' ? 'text-green-600' : 'text-red-500'}`}>
              {feedback === 'correct' ? '✅ صحيح!' : `❌ الإجابة: ${formatNum(tableNum * current, numberSystem)}`}
            </div>
          )}
        </motion.div>
      )}

      <button onClick={spin} disabled={spinning} className="w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white font-black py-4 rounded-2xl text-xl shadow-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
        {spinning ? '🌀 جاري الدوران...' : '🎡 أدر العجلة!'}
      </button>
    </div>
  );
}

// ========== MAIN PAGE ==========
const GAMES = [
  { id: 'wheel', name: 'عجلة الضرب', icon: '🎡', desc: 'أدر العجلة وأجب على السؤال!', color: 'from-sky-400 to-blue-500' },
  { id: 'memory', name: 'بطاقات الذاكرة', icon: '🃏', desc: 'طابق السؤال بالإجابة!', color: 'from-green-400 to-emerald-500' },
  { id: 'balloon', name: 'فقاعات البالون', icon: '🎈', desc: 'افقع البالون الصحيح!', color: 'from-pink-400 to-rose-500' },
  { id: 'speed', name: 'تحدي السرعة', icon: '⚡', desc: 'أكبر عدد في 60 ثانية!', color: 'from-orange-400 to-red-500' },
];

export default function GamesPage() {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  if (activeGame) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
        <div className="max-w-xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setActiveGame(null)} className="text-sky-600 font-bold bg-white border border-sky-200 rounded-xl px-3 py-2 hover:bg-sky-50">
              ← العودة
            </button>
            <h2 className="font-black text-sky-700 text-xl">{GAMES.find(g => g.id === activeGame)?.name}</h2>
          </div>
          {activeGame === 'wheel' && <WheelGame onBack={() => setActiveGame(null)} />}
          {activeGame === 'memory' && <MemoryGame onBack={() => setActiveGame(null)} />}
          {activeGame === 'balloon' && <BalloonGame onBack={() => setActiveGame(null)} />}
          {activeGame === 'speed' && <SpeedChallenge onBack={() => setActiveGame(null)} />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">🎮</motion.div>
          <h1 className="text-4xl font-black text-sky-700 mb-2">ألعاب الضرب</h1>
          <p className="text-gray-500 text-lg">العب وتعلم جداول الضرب بطريقة ممتعة!</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {GAMES.map((game, i) => (
            <motion.button key={game.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              onClick={() => setActiveGame(game.id)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className={`bg-gradient-to-br ${game.color} text-white rounded-2xl p-8 text-right shadow-md hover:shadow-xl transition-all`}>
              <div className="text-5xl mb-3">{game.icon}</div>
              <h3 className="text-2xl font-black mb-2">{game.name}</h3>
              <p className="text-white/80">{game.desc}</p>
              <div className="mt-4 bg-white/20 rounded-full py-1 px-3 inline-block text-sm font-bold">
                العب الآن ←
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
