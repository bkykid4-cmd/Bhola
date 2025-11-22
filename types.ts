
export interface User {
  uid: string;
  name: string;
  mobile: string;
  walletBalance: number; // Corresponds to 'balance' in previous code (Rupees)
  coins: number;
  totalTaskCompleted: number;
  isAdmin: boolean;
  joinedDate: number; // Timestamp
  
  // Optional fields for app logic
  referralCode: string;
  referredBy?: string;
  referralIncome: number;
  referralCount: number;
  isBlocked?: boolean;
  deviceId?: string;
}

export type TaskStatus = 'active' | 'inactive';
export type Currency = 'COINS' | 'RUPEES';

export interface Task {
  taskId: string; // changed from id
  title: string; // changed from name
  description: string;
  rewardCoins: number; // changed from reward
  rewardType: Currency; // Kept for UI logic
  logo: string;
  link: string;
  postedDate: number;
  status: TaskStatus;
  
  // UI helper
  completed?: boolean; 
}

export interface CompletedTask {
  id?: string; // Doc ID
  uid: string;
  taskId: string;
  screenshotURL: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
}

export interface WithdrawRequest {
  id?: string; // Doc ID
  uid: string;
  userName: string; // Helper for admin UI
  userMobile: string; // Helper for admin UI
  amount: number;
  upiId: string; // Can store Bank Details string here too
  requestDate: number;
  status: 'pending' | 'approved' | 'rejected';
  method: 'UPI' | 'BANK';
}

export interface AdminLog {
  adminId: string;
  action: string;
  time: number;
  details?: string;
}

export interface AdminSettings {
  minWithdraw: number;
  referralBonusRupees: number;
  referralBonusCoins: number;
  platformFeePercent: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface TriviaQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  reward: number;
}

export enum Page {
  HOME = 'HOME',
  EARN = 'EARN',
  WALLET = 'WALLET',
  PROFILE = 'PROFILE',
  ADMIN = 'ADMIN',
}