import { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { getRandomWords } from '../utils/words';

type Word = {
  text: string;
  typed: string;
  status: 'untyped' | 'correct' | 'incorrect';
};

export function TypingTest() {
  const [words, setWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  
  const [duration, setDuration] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30);

  const containerRef = useRef<HTMLDivElement>(null);

  const initTest = useCallback((newDuration?: number) => {
    const d = newDuration || duration;
    // Generate lots of words so they don't run out during the timer
    const newWords = getRandomWords(150).map(w => ({ text: w, typed: '', status: 'untyped' as const }));
    setWords(newWords);
    setCurrentWordIndex(0);
    setStartTime(null);
    setEndTime(null);
    setWpm(0);
    setAccuracy(100);
    setTimeLeft(d);
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, [duration]);

  useEffect(() => {
    initTest();
  }, [initTest]);

  // Timer logic
  useEffect(() => {
    let interval: any = null;
    if (startTime && !endTime && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, endTime, timeLeft]);

  // Handle test completion when time runs out
  useEffect(() => {
    if (timeLeft === 0 && startTime && !endTime) {
      setEndTime(Date.now());
      calculateStats(words, duration);
    }
  }, [timeLeft, startTime, endTime, words, duration]);

  const endTest = () => {
    setEndTime(Date.now());
    calculateStats(words, duration); // Use total duration for final WPM
  };

  const calculateStats = (currentWords: Word[], timeElapsedSec: number) => {
    let correctChars = 0;
    let totalTypedChars = 0;
    
    currentWords.forEach(w => {
      for (let i = 0; i < w.typed.length; i++) {
        totalTypedChars++;
        if (w.text[i] === w.typed[i]) {
          correctChars++;
        }
      }
      if (w.typed.length > 0) {
        totalTypedChars++;
        if (w.status === 'correct') {
          correctChars++;
        }
      }
    });

    const currentWpm = timeElapsedSec > 0 ? Math.round((correctChars / 5) / (timeElapsedSec / 60)) : 0;
    const currentAcc = totalTypedChars > 0 ? Math.round((correctChars / totalTypedChars) * 100) : 100;
    
    setWpm(currentWpm);
    setAccuracy(currentAcc);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (endTime) return; 

    if (!startTime) {
      setStartTime(Date.now());
    }

    const { key } = e;
    const currentWord = words[currentWordIndex];

    if (key === 'Backspace') {
      if (currentWord.typed.length > 0) {
        const newWords = [...words];
        newWords[currentWordIndex].typed = currentWord.typed.slice(0, -1);
        newWords[currentWordIndex].status = 'untyped';
        setWords(newWords);
      } else if (currentWordIndex > 0) {
        const prevWord = words[currentWordIndex - 1];
        if (prevWord.status !== 'correct') {
          setCurrentWordIndex(currentWordIndex - 1);
        }
      }
    } else if (key === ' ' || key === 'Enter') {
      e.preventDefault();
      if (currentWord.typed.length > 0) {
        const newWords = [...words];
        newWords[currentWordIndex].status = currentWord.typed === currentWord.text ? 'correct' : 'incorrect';
        setWords(newWords);

        if (currentWordIndex + 1 === words.length) {
          endTest();
        } else {
          setCurrentWordIndex(currentWordIndex + 1);
        }
      }
    } else if (key.length === 1) { 
      e.preventDefault();
      const newWords = [...words];
      newWords[currentWordIndex].typed += key;
      setWords(newWords);
    }
    
    if (startTime && !endTime) {
       calculateStats(words, duration - timeLeft);
    }
  };

  const changeDuration = (d: number) => {
    setDuration(d);
    initTest(d);
  };

  return (
    <div 
      className="typing-test-container glass-card"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      ref={containerRef}
      style={{ outline: 'none', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}
    >
      <div className="test-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
        
        {/* Timer UI */}
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)' }}>
          {timeLeft}s
        </div>

        {/* Duration Selector */}
        {!startTime && (
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '12px' }}>
            {[15, 30, 60].map(d => (
              <button 
                key={d} 
                onClick={() => changeDuration(d)}
                style={{
                  background: duration === d ? 'var(--accent)' : 'transparent',
                  color: duration === d ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        <button 
          onClick={() => initTest()}
          className="icon-button"
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px' }}
        >
          <RefreshCw size={24} />
        </button>
      </div>

      <div className="words-display" style={{ fontSize: '1.8rem', lineHeight: '1.6', color: '#475569', fontWeight: 500, flex: 1, overflow: 'hidden' }}>
        {words.map((word, wIdx) => {
          const isCurrent = wIdx === currentWordIndex;
          return (
            <span 
              key={wIdx} 
              className={`word ${isCurrent ? 'current' : ''}`}
              style={{ 
                marginRight: '12px',
                display: 'inline-block',
                textDecoration: word.status === 'incorrect' ? 'underline' : 'none',
                textDecorationColor: '#ef4444'
              }}
            >
              {word.text.split('').map((char, cIdx) => {
                let charColor = 'inherit';
                if (wIdx < currentWordIndex) {
                   charColor = word.status === 'correct' ? '#f8fafc' : '#ef4444';
                } else if (isCurrent) {
                   if (cIdx < word.typed.length) {
                     charColor = word.typed[cIdx] === char ? '#f8fafc' : '#ef4444';
                   }
                }
                
                const showCaret = isCurrent && cIdx === word.typed.length;

                return (
                  <span key={cIdx} style={{ color: charColor, position: 'relative' }}>
                    {showCaret && <span className="caret"></span>}
                    {char}
                  </span>
                )
              })}
              {isCurrent && word.typed.length > word.text.length && (
                <span style={{ color: '#ef4444' }}>
                  {word.typed.slice(word.text.length)}
                </span>
              )}
              {isCurrent && word.typed.length >= word.text.length && (
                 <span style={{ position: 'relative' }}><span className="caret"></span></span>
              )}
            </span>
          )
        })}
      </div>
      
      {endTime && (
        <div className="test-overlay" style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.8)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          borderRadius: '16px', backdropFilter: 'blur(4px)', zIndex: 10
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Test Complete</h2>
          <div style={{ fontSize: '4rem', color: 'var(--accent)', fontWeight: 'bold' }}>{wpm} WPM</div>
          <div style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>{accuracy}% Accuracy</div>
          <button onClick={() => initTest()} style={{ padding: '12px 24px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 600 }}>
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}
