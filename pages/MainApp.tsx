
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context';
import { Page, Task } from '../types';
import { SpinWheel, ScratchCard, AIQuiz } from '../components/GameComponents';
import { TaskCard } from '../components/TaskCard';
import { AdminPanel } from './AdminPanel'; 
import { BannerAd, FullScreenAd } from '../components/AdComponents';
import { 
  CheckCircle, 
  History, 
  LogOut, 
  Share2, 
  Gift, 
  PlayCircle, 
  TrendingUp,
  UserCircle,
  ListFilter,
  CircleDollarSign,
  IndianRupee,
  ArrowRightLeft,
  AlertCircle,
  Landmark,
  Smartphone,
  ChevronRight,
  Info,
  Copy,
  Users,
  Gamepad2,
  Video,
  XCircle,
  Key,
  Fingerprint,
  Loader2
} from 'lucide-react';

// --- TYPES FOR AD CALLBACKS ---
type AdRequestFn = (type: 'INTERSTITIAL' | 'REWARDED') => Promise<boolean>;

// --- REAL-TIME STATUS POPUP ---
const StatusPopup: React.FC<{ status: 'SUCCESS' | 'REJECTED', onClose: () => void }> = ({ status, onClose }) => {
    return (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center relative">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${status === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {status === 'SUCCESS' ? <CheckCircle size={40} /> : <XCircle size={40} />}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {status === 'SUCCESS' ? 'Withdraw Approved!' : 'Withdraw Rejected'}
                </h2>
                <p className="text-gray-600 mb-6 text-sm">
                    {status === 'SUCCESS' 
                        ? 'Your withdrawal request has been approved by the admin.' 
                        : 'Your withdrawal was rejected. Coins have been refunded.'}
                </p>
                <button 
                    onClick={onClose}
                    className={`w-full py-3 rounded-xl font-bold text-white transition-colors ${status === 'SUCCESS' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                    OK
                </button>
            </div>
        </div>
    );
};

interface ViewProps {
    requestAd: AdRequestFn;
}

const HomeView: React.FC<ViewProps> = ({ requestAd }) => {
  const { tasks, user, completeTask, addBalance, setPage } = useApp();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [taskTab, setTaskTab] = useState<'AVAILABLE' | 'HISTORY'>('AVAILABLE');
  
  // Handle Task Click (Link Open)
  const handleTaskAction = async (task: Task) => {
    if (task.status === 'inactive') return;
    setProcessingId(task.taskId);
    
    // 1. Show Interstitial Ad
    await requestAd('INTERSTITIAL');
    
    // 2. Open Link
    if (task.link) {
        window.open(task.link, '_blank');
    }
    
    setProcessingId(null);
  };

  // Handle Screenshot Upload
  const handleTaskUpload = async (task: Task, file: File) => {
      setProcessingId(task.taskId);
      try {
          await completeTask(task, file);
          await requestAd('INTERSTITIAL'); // Show Ad after upload
          alert("Screenshot uploaded successfully! Status: Pending Approval.");
      } catch (e) {
          console.error(e);
          alert("Upload failed. Please try again.");
      }
      setProcessingId(null);
  };

  const claimDaily = async () => {
     await addBalance(100, 'COINS', "Daily Login Bonus");
     alert("100 Coins added!");
  }

  const displayedTasks = tasks.filter(t => {
    if (taskTab === 'AVAILABLE') return !t.completed;
    if (taskTab === 'HISTORY') return t.completed;
    return true;
  });

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hello, {user?.name} 👋</h1>
          <p className="text-gray-500 text-sm">Let's make some money today!</p>
        </div>
        <div className="flex flex-col items-end gap-2">
             <div className="bg-indigo-50 px-3 py-1 rounded-full flex items-center gap-1.5 text-indigo-800 font-bold border border-indigo-100 shadow-sm text-xs">
                <CircleDollarSign size={14} className="text-yellow-600" />
                {user?.coins} Coins
            </div>
            <div className="bg-green-50 px-3 py-1 rounded-full flex items-center gap-1.5 text-green-800 font-bold border border-green-100 shadow-sm text-xs">
                <IndianRupee size={14} className="text-green-600" />
                ₹{user?.walletBalance.toFixed(2)}
            </div>
        </div>
      </div>

      {/* Daily Reward Banner */}
      <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-xl p-4 text-white mb-4 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-lg">Daily Bonus</h2>
            <p className="text-white/90 text-sm">Login everyday to earn</p>
          </div>
          <button 
            onClick={claimDaily}
            className="bg-white text-orange-500 px-4 py-2 rounded-lg font-bold text-sm shadow-sm active:scale-95 transition-transform flex items-center gap-1"
          >
             <CircleDollarSign size={14}/> 100 Coins
          </button>
        </div>
        <div className="absolute -right-4 -bottom-8 text-white/20">
          <Gift size={100} />
        </div>
      </div>

      {/* Spin & Win Button */}
      <button 
        onClick={() => setPage(Page.EARN)}
        className="w-full bg-white border border-indigo-100 p-4 rounded-xl shadow-sm mb-8 flex items-center justify-between relative overflow-hidden group active:scale-95 transition-all hover:shadow-md"
      >
         <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Gamepad2 size={24} />
            </div>
            <div className="text-left">
                <h3 className="font-bold text-gray-900 text-lg">Spin & Win</h3>
                <p className="text-xs text-gray-500">Try your luck & earn coins</p>
            </div>
         </div>
         <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center gap-1">
             Play <ChevronRight size={14} />
         </div>
      </button>

      {/* Task Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
          <ListFilter size={20} className="text-indigo-600"/> 
          Tasks
        </h2>
        <div className="flex bg-gray-200 p-1 rounded-lg">
            <button 
                onClick={() => setTaskTab('AVAILABLE')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${taskTab === 'AVAILABLE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
            >
                Active
            </button>
            <button 
                onClick={() => setTaskTab('HISTORY')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${taskTab === 'HISTORY' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
            >
                Done
            </button>
        </div>
      </div>

      <div className="space-y-4">
        {displayedTasks.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-400 text-sm">
                    {taskTab === 'AVAILABLE' ? 'No new tasks available.' : 'No completed tasks yet.'}
                </p>
            </div>
        ) : (
            displayedTasks.map((task) => (
            <TaskCard 
                key={task.taskId}
                task={task}
                isProcessing={processingId === task.taskId}
                onAction={handleTaskAction}
                onUpload={handleTaskUpload}
            />
            ))
        )}
      </div>
      
      <div className="mt-6">
        <BannerAd />
      </div>
    </div>
  );
};

const EarnView: React.FC<ViewProps> = ({ requestAd }) => {
  const { addBalance } = useApp();
  const [activeTab, setActiveTab] = useState<'SPIN' | 'SCRATCH' | 'QUIZ'>('SPIN');
  const [adLoading, setAdLoading] = useState(false);

  const handleWin = async (amount: number) => {
    await addBalance(amount, 'COINS', `Won from ${activeTab}`);
    alert(`Congratulations! You won ${amount} Coins`);
  };

  const handleGameAdRequest = async (): Promise<boolean> => {
      return await requestAd('REWARDED');
  };

  const watchAd = async () => {
    setAdLoading(true);
    const success = await requestAd('REWARDED');
    setAdLoading(false);
    
    if (success) {
        await addBalance(10, 'COINS', "Watch Video Bonus");
        alert("Ad watched! 10 Coins added.");
    }
  };

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Play & Earn</h1>
      
      {/* Watch & Earn */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Video className="text-red-500" size={20} /> Watch & Earn
        </h2>
        <div className="bg-gray-900 rounded-xl p-4 text-white flex items-center justify-between shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-yellow-500 rounded-full blur-xl opacity-20"></div>
            <div className="flex items-center gap-3 relative z-10">
                <div className="bg-white/10 p-2 rounded-full">
                    <PlayCircle className="text-yellow-400" size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-sm">Watch Video Ad</h3>
                    <p className="text-xs text-gray-300">Get 10 Coins instantly</p>
                </div>
            </div>
            <button 
                onClick={watchAd}
                disabled={adLoading}
                className="relative z-10 bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg text-xs font-bold transition-colors active:scale-95"
            >
                {adLoading ? 'Loading...' : 'Watch Now'}
            </button>
        </div>
      </div>

      {/* Games */}
      <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Gamepad2 className="text-indigo-500" size={20} /> Games
      </h2>

      <div className="flex bg-gray-200 p-1 rounded-xl mb-8">
        {(['SPIN', 'SCRATCH', 'QUIZ'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="min-h-[300px] flex flex-col items-center justify-center mb-8">
        {activeTab === 'SPIN' && <SpinWheel onWin={handleWin} onAdRequest={handleGameAdRequest} />}
        {activeTab === 'SCRATCH' && <ScratchCard onReveal={handleWin} onAdRequest={handleGameAdRequest} />}
        {activeTab === 'QUIZ' && <AIQuiz onComplete={handleWin} onAdRequest={handleGameAdRequest} />}
      </div>
      
      <div className="mt-6">
          <BannerAd />
      </div>
    </div>
  );
};

const WalletView: React.FC<ViewProps> = () => {
  const { user, withdrawals, withdraw, convertCoins, adminSettings } = useApp();
  const [method, setMethod] = useState<'UPI' | 'BANK'>('UPI');
  const [amount, setAmount] = useState<string>('');
  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [processing, setProcessing] = useState(false);

  const withdrawalAmount = parseFloat(amount) || 0;
  const fee = withdrawalAmount * (adminSettings.platformFeePercent / 100);
  const payable = withdrawalAmount - fee;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawalAmount) return;
    
    setProcessing(true);
    const details = method === 'UPI' ? { name, upiId } : { name, accountNo, ifsc };
    
    const result = await withdraw(withdrawalAmount, method, details);
    setProcessing(false);
    
    if (result.success) {
        setAmount('');
        alert("Withdrawal request submitted!");
    } else {
        alert(result.message);
    }
  };

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wallet</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
         {/* Coin Balance */}
         <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
             <p className="text-indigo-200 text-xs font-bold uppercase mb-1">Coin Balance</p>
             <h2 className="text-3xl font-bold flex items-center gap-1">
                 {user?.coins} <span className="text-sm opacity-70 font-normal">pts</span>
             </h2>
             <button 
                onClick={() => convertCoins().then(s => s && alert("Coins Converted!"))}
                disabled={!user || user.coins < 100}
                className="mt-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
             >
                 <ArrowRightLeft size={14} /> Convert
             </button>
             <p className="text-[10px] text-center mt-2 opacity-60">100 Coins = ₹1.00</p>
         </div>

         {/* Rupee Balance */}
         <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
             <p className="text-gray-400 text-xs font-bold uppercase mb-1">Withdrawable</p>
             <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-1">
                 ₹{user?.walletBalance.toFixed(2)}
             </h2>
             <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                 <AlertCircle size={12} />
                 <span>Min Withdraw: ₹{adminSettings.minWithdraw}</span>
             </div>
         </div>
      </div>

      {/* Withdraw Form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Landmark size={20} className="text-indigo-600"/> Withdraw Money
          </h2>
          
          <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
              <button 
                onClick={() => setMethod('UPI')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${method === 'UPI' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
              >
                  UPI
              </button>
              <button 
                onClick={() => setMethod('BANK')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${method === 'BANK' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
              >
                  Bank
              </button>
          </div>

          <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Amount (₹)</label>
                  <input 
                    type="number" 
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-lg"
                    value={amount} onChange={e => setAmount(e.target.value)} required
                  />
              </div>

              {method === 'UPI' ? (
                <>
                    <input placeholder="Full Name" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm" value={name} onChange={e => setName(e.target.value)} required />
                    <input placeholder="UPI ID" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm" value={upiId} onChange={e => setUpiId(e.target.value)} required />
                </>
              ) : (
                 <>
                    <input placeholder="Account Holder" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm" value={name} onChange={e => setName(e.target.value)} required />
                    <input placeholder="Account No" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm" value={accountNo} onChange={e => setAccountNo(e.target.value)} required />
                    <input placeholder="IFSC" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm" value={ifsc} onChange={e => setIfsc(e.target.value)} required />
                 </>
              )}
              
              <button type="submit" disabled={processing} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg disabled:opacity-70">
                 {processing ? 'Processing...' : 'Submit Request'}
              </button>
          </form>
      </div>

      {/* History */}
      <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <History size={20} className="text-gray-500"/> History
      </h2>
      <div className="space-y-3">
          {withdrawals.length === 0 ? (
              <div className="text-center py-8 text-gray-400 bg-white rounded-xl border border-dashed">No history</div>
          ) : (
              withdrawals.map(tx => (
                  <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                      <div>
                          <h4 className="font-bold text-sm text-gray-800">{tx.method} Withdraw</h4>
                          <p className="text-xs text-gray-400">{new Date(tx.requestDate).toLocaleDateString()}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              tx.status === 'approved' ? 'bg-green-100 text-green-700' : 
                              tx.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                              'bg-orange-100 text-orange-700'
                          }`}>
                              {tx.status.toUpperCase()}
                          </span>
                      </div>
                      <div className="font-bold text-red-600">-₹{tx.amount}</div>
                  </div>
              ))
          )}
      </div>
      <div className="mt-6"><BannerAd /></div>
    </div>
  );
};

const ProfileView: React.FC = () => {
  const { user, logout } = useApp();
  
  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
          <UserCircle size={40} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
          <p className="text-sm text-gray-500">{user?.mobile}</p>
          {user?.isAdmin && <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded mt-1 inline-block">ADMIN</span>}
        </div>
        <button onClick={logout} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100">
          <LogOut size={20} />
        </button>
      </div>

      {/* App Signing Keys */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3 mb-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><Fingerprint size={20} /> App Signing</h3>
          <p className="text-[10px] text-gray-500">Package: com.student.pocketmoney</p>
          <div className="bg-gray-50 p-2 rounded-lg text-[10px] font-mono break-all text-gray-600">
              SHA-1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:CD:90
          </div>
          <div className="bg-gray-50 p-2 rounded-lg text-[10px] font-mono break-all text-gray-600">
              SHA-256: FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C
          </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg mb-8">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Share2 size={20}/> Refer & Earn</h3>
          <div className="bg-white text-gray-900 p-4 rounded-xl flex items-center justify-between gap-3">
              <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">My Code</p>
                  <p className="font-mono font-bold text-lg">{user?.referralCode}</p>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(user?.referralCode || ''); alert("Copied!"); }} className="bg-indigo-600 text-white p-2 rounded-lg">
                  <Copy size={20} />
              </button>
          </div>
      </div>
    </div>
  );
};

export const MainApp: React.FC = () => {
  const { activePage, withdrawals, loading } = useApp();
  const [lastStatus, setLastStatus] = useState<string>('pending');
  const [popupStatus, setPopupStatus] = useState<'SUCCESS' | 'REJECTED' | null>(null);
  const [interstitialOpen, setInterstitialOpen] = useState(false);
  const [rewardedOpen, setRewardedOpen] = useState(false);
  
  const adResolver = useRef<((value: boolean) => void) | null>(null);
  
  const requestAd: AdRequestFn = (type) => {
      return new Promise((resolve) => {
          adResolver.current = resolve;
          if (type === 'INTERSTITIAL') setInterstitialOpen(true);
          else setRewardedOpen(true);
      });
  };

  const handleAdClose = (completed: boolean) => {
      setInterstitialOpen(false);
      setRewardedOpen(false);
      if (adResolver.current) {
          adResolver.current(completed);
          adResolver.current = null;
      }
  };

  // Real-time Popup Listener for Withdrawals
  useEffect(() => {
      if (withdrawals.length > 0) {
          const latest = withdrawals[0];
          // Check if status changed from what we last saw (simplified logic)
          // In production, track ID + Status change more robustly
          if (latest.status !== lastStatus && latest.status !== 'pending') {
             if (latest.status === 'approved') setPopupStatus('SUCCESS');
             if (latest.status === 'rejected') setPopupStatus('REJECTED');
          }
          setLastStatus(latest.status);
      }
  }, [withdrawals, lastStatus]);

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-safe">
      {popupStatus && <StatusPopup status={popupStatus} onClose={() => setPopupStatus(null)} />}
      <FullScreenAd type="INTERSTITIAL" isOpen={interstitialOpen} onClose={handleAdClose} />
      <FullScreenAd type="REWARDED" isOpen={rewardedOpen} onClose={handleAdClose} />

      {activePage === Page.HOME && <HomeView requestAd={requestAd} />}
      {activePage === Page.EARN && <EarnView requestAd={requestAd} />}
      {activePage === Page.WALLET && <WalletView requestAd={requestAd} />}
      {activePage === Page.PROFILE && <ProfileView />}
      {activePage === Page.ADMIN && <AdminPanel />}
    </div>
  );
};
