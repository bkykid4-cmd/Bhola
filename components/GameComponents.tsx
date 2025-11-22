import React, { useState, useEffect, useRef } from 'react';
import { generateTriviaQuestion } from '../services/geminiService';
import { TriviaQuestion } from '../types';
import { Brain, Loader2, Trophy, CircleDollarSign } from 'lucide-react';

// --- Spin Wheel Component ---
interface SpinWheelProps {
  onWin: (amount: number) => void;
  onAdRequest: () => Promise<boolean>;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({ onWin, onAdRequest }) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  // Increased rewards for Coins (e.g., 100 coins = 1 rupee)
  const rewards = [100, 0, 500, 50, 200, 0, 1000, 20];
  const segmentAngle = 360 / rewards.length;

  const handleSpin = async () => {
    if (spinning) return;

    // 1. Request Ad Watch
    const watched = await onAdRequest();
    if (!watched) return;

    // 2. Spin Logic
    setSpinning(true);
    
    const randomSegment = Math.floor(Math.random() * rewards.length);
    const extraSpins = 360 * (5 + Math.floor(Math.random() * 5));
    const targetRotation = extraSpins + (randomSegment * segmentAngle);
    
    setRotation(rotation + targetRotation);

    setTimeout(() => {
      setSpinning(false);
      onWin(rewards[rewards.length - 1 - randomSegment]); 
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-red-600"></div>
        
        {/* Wheel */}
        <div 
          className="w-full h-full rounded-full border-4 border-indigo-900 overflow-hidden shadow-xl relative transition-transform duration-[3000ms] ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
           {rewards.map((reward, i) => (
             <div
               key={i}
               className="absolute w-full h-full top-0 left-0"
               style={{ 
                 transform: `rotate(${i * segmentAngle}deg)`,
                 backgroundColor: i % 2 === 0 ? '#4F46E5' : '#E0E7FF' 
               }}
             >
                <div 
                  className="absolute left-1/2 top-4 -translate-x-1/2 font-bold flex flex-col items-center"
                  style={{ color: i % 2 === 0 ? 'white' : '#4F46E5' }}
                >
                  {reward > 0 ? (
                    <>
                        <span className="text-xs">🪙</span>
                        <span>{reward}</span>
                    </>
                  ) : '☹️'}
                </div>
                {/* Divider Line */}
                <div className="absolute left-1/2 top-0 bottom-1/2 w-0.5 bg-white/20 origin-bottom -translate-x-1/2"></div>
             </div>
           ))}
        </div>
      </div>
      <button
        onClick={handleSpin}
        disabled={spinning}
        className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg disabled:opacity-50 active:scale-95 transition-transform"
      >
        {spinning ? 'Spinning...' : 'SPIN FOR COINS'}
      </button>
    </div>
  );
};

// --- Scratch Card Component ---
interface ScratchCardProps {
  onReveal: (amount: number) => void;
  onAdRequest: () => Promise<boolean>;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({ onReveal, onAdRequest }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [reward] = useState(Math.floor(Math.random() * 200) + 50);

  const unlockCard = async () => {
      const watched = await onAdRequest();
      if (watched) {
          setIsLocked(false);
      }
  }

  useEffect(() => {
    if (isLocked) return; // Don't init canvas if locked

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#9CA3AF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#374151';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Scratch for Coins', canvas.width / 2, canvas.height / 2);

    let isDrawing = false;

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      let clientX, clientY;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const scratch = (x: number, y: number) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
    };

    const startDrawing = () => { isDrawing = true; };
    const stopDrawing = () => { isDrawing = false; };
    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      scratch(pos.x, pos.y);
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('touchstart', startDrawing);
    window.addEventListener('mouseup', stopDrawing);
    window.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('touchmove', draw);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      window.removeEventListener('mouseup', stopDrawing);
      window.removeEventListener('touchend', stopDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('touchmove', draw);
    };
  }, [isLocked]);

  const finishReveal = () => {
    if (!isRevealed && !isLocked) {
      setIsRevealed(true);
      onReveal(reward);
    }
  };

  return (
    <div className="relative w-64 h-40 rounded-xl overflow-hidden shadow-lg mx-auto" onMouseUp={finishReveal} onTouchEnd={finishReveal}>
      {/* Background (Reward) */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-yellow-500 flex flex-col items-center justify-center">
        <span className="text-gray-800 font-bold text-lg">You Won!</span>
        <div className="flex items-center gap-1">
            <CircleDollarSign className="text-indigo-900 w-6 h-6" />
            <span className="text-4xl font-extrabold text-indigo-900">{reward}</span>
        </div>
        <span className="text-xs font-bold text-indigo-800 uppercase mt-1">Coins</span>
      </div>
      
      {/* Foreground (Scratch Layer) */}
      {!isLocked && (
        <canvas
            ref={canvasRef}
            width={256}
            height={160}
            className={`absolute inset-0 touch-none cursor-crosshair transition-opacity duration-700 ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        />
      )}

      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-gray-800 flex flex-col items-center justify-center text-white z-10">
             <p className="font-bold mb-2">Locked Scratch Card</p>
             <button onClick={unlockCard} className="bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                 Watch Ad to Unlock
             </button>
        </div>
      )}
    </div>
  );
};

// --- AI Quiz Component ---
interface AIQuizProps {
  onComplete: (amount: number) => void;
  onAdRequest: () => Promise<boolean>;
}

export const AIQuiz: React.FC<AIQuizProps> = ({ onComplete, onAdRequest }) => {
  const [loading, setLoading] = useState(false);
  const [questionData, setQuestionData] = useState<TriviaQuestion | null>(null);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const loadQuestion = async () => {
    setLoading(true);
    setAnswered(false);
    setSelectedOption(null);
    const data = await generateTriviaQuestion();
    // Override reward for coins display
    const coinData = { ...data, reward: 150 }; 
    setQuestionData(coinData);
    setLoading(false);
  };

  useEffect(() => {
    loadQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = async (index: number) => {
    if (answered || !questionData) return;

    // Ask for Ad before revealing answer/reward if correct? 
    // Or ask for Ad before Next question?
    // Requirement: "On completing task -> Show Interstitial". For quiz, maybe just logic check.
    
    setSelectedOption(index);
    setAnswered(true);
    
    if (index === questionData.correctIndex) {
       // Show ad before giving reward? 
       // Let's keep it snappy, show Ad on 'Next Question' or just give reward.
       // User requirement says "Watch & Earn Page". 
       // Let's play reward ad here.
       const watched = await onAdRequest();
       if(watched) {
         setTimeout(() => {
            onComplete(questionData.reward);
         }, 500);
       }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm min-h-[200px]">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-600">Asking AI for a challenge...</p>
      </div>
    );
  }

  if (!questionData) return <div className="text-center p-4">Failed to load quiz.</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-indigo-600 p-4 flex items-center justify-between">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Brain className="w-5 h-5" /> AI Smart Quiz
        </h3>
        <span className="bg-yellow-400 text-indigo-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
          Win {questionData.reward} <CircleDollarSign size={12}/>
        </span>
      </div>
      <div className="p-6">
        <p className="text-lg font-medium text-gray-800 mb-6">{questionData.question}</p>
        <div className="space-y-3">
          {questionData.options.map((opt, idx) => {
            let btnClass = "w-full text-left p-3 rounded-lg border-2 transition-all font-medium ";
            if (answered) {
              if (idx === questionData.correctIndex) {
                btnClass += "border-green-500 bg-green-50 text-green-700";
              } else if (idx === selectedOption) {
                btnClass += "border-red-500 bg-red-50 text-red-700";
              } else {
                btnClass += "border-gray-100 text-gray-400";
              }
            } else {
              btnClass += "border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 text-gray-700";
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={answered}
                className={btnClass}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {answered && selectedOption === questionData.correctIndex && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg flex items-center justify-center gap-2 font-bold animate-bounce">
            <Trophy className="w-5 h-5" /> Correct! Ad watching...
          </div>
        )}
        {answered && selectedOption !== questionData.correctIndex && (
            <div className="mt-4 text-center">
                 <button onClick={loadQuestion} className="text-indigo-600 font-medium text-sm hover:underline">Try another question</button>
            </div>
        )}
      </div>
    </div>
  );
};