import React, { useState, useEffect } from 'react';
import { X, Info, PlayCircle, ExternalLink } from 'lucide-react';

// --- ADMOB CONFIGURATION ---
export const ADMOB_IDS = {
  APP_ID: 'ca-app-pub-3816692995303217~6603457430',
  BANNER_ID: 'ca-app-pub-3816692995303217/1778490257',
  INTERSTITIAL_ID: 'ca-app-pub-3816692995303217/2924050962',
  REWARDED_ID: 'ca-app-pub-3816692995303217/5685945671',
};

// --- BANNER AD COMPONENT ---
export const BannerAd: React.FC = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="w-full h-[50px] bg-gray-100 border-t border-gray-300 flex items-center justify-between px-4 relative overflow-hidden">
      <div className="flex flex-col justify-center h-full w-full">
        <span className="text-[10px] font-bold text-gray-400 bg-gray-200 px-1 rounded w-max">Ad</span>
        <div className="flex items-center gap-2 mt-0.5">
            <img src="https://www.gstatic.com/ads/admob/icon_2x.png" alt="AdMob" className="w-4 h-4 opacity-50"/>
            <span className="text-xs text-gray-500 truncate font-mono">ID: ...{ADMOB_IDS.BANNER_ID.slice(-4)}</span>
        </div>
      </div>
      <button onClick={() => setVisible(false)} className="text-gray-400">
        <X size={14} />
      </button>
    </div>
  );
};

// --- FULL SCREEN AD OVERLAY (Interstitial / Rewarded) ---
interface FullScreenAdProps {
  type: 'INTERSTITIAL' | 'REWARDED';
  isOpen: boolean;
  onClose: (completed: boolean) => void;
}

export const FullScreenAd: React.FC<FullScreenAdProps> = ({ type, isOpen, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(5);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCanClose(false);
      setTimeLeft(type === 'REWARDED' ? 10 : 3); // Rewarded ads are longer
      
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanClose(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  const adId = type === 'INTERSTITIAL' ? ADMOB_IDS.INTERSTITIAL_ID : ADMOB_IDS.REWARDED_ID;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-fade-in">
      {/* Ad Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20">
         <div className="bg-black/50 px-3 py-1 rounded-full text-white text-xs font-mono backdrop-blur-sm">
            {canClose ? 'Reward Granted' : `Reward in ${timeLeft}s`}
         </div>
         {canClose && (
             <button 
                onClick={() => onClose(true)}
                className="bg-white/20 p-2 rounded-full text-white hover:bg-white/40 transition-colors backdrop-blur-md"
             >
                 <X size={24} />
             </button>
         )}
      </div>

      {/* Ad Content Simulation */}
      <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-white rounded-2xl mb-6 flex items-center justify-center shadow-2xl shadow-blue-900/20">
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Ad Brand" className="w-12 opacity-80"/>
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">Google AdMob</h2>
          <p className="text-gray-400 text-sm mb-8 max-w-xs">
              This is a simulated {type.toLowerCase()} ad. 
              <br/>
              <span className="font-mono text-xs text-gray-600 mt-2 block">Unit ID: {adId}</span>
          </p>
          
          <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold text-sm flex items-center gap-2 animate-pulse">
              Install Now <ExternalLink size={16}/>
          </button>
          
          <div className="absolute bottom-8 flex items-center gap-2 text-[10px] text-gray-500">
              <Info size={12}/> 
              <span>Ad by Google</span>
          </div>
      </div>
      
      {/* Progress Bar */}
      {!canClose && (
          <div className="absolute bottom-0 left-0 h-1 bg-blue-600 transition-all duration-1000 ease-linear" style={{ width: `${((type === 'REWARDED' ? 10 : 3) - timeLeft) / (type === 'REWARDED' ? 10 : 3) * 100}%` }}></div>
      )}
    </div>
  );
};