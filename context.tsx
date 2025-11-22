
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, Task, WithdrawRequest, Page, Currency, AdminSettings, Notification, AdminLog, CompletedTask 
} from './types';
import firebase from 'firebase/compat/app';
import { auth, db, storage } from './services/firebase';

interface WithdrawDetails {
  name: string;
  upiId?: string;
  accountNo?: string;
  ifsc?: string;
}

interface AppContextType {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  activePage: Page;
  
  tasks: Task[];
  withdrawals: WithdrawRequest[]; // Current user's withdrawals
  
  // Admin Data
  allUsers: User[];
  allWithdrawals: WithdrawRequest[];
  allCompletedTasks: CompletedTask[];
  adminSettings: AdminSettings;
  
  notifications: Notification[];
  
  login: (mobile: string, name: string, referralCode?: string) => Promise<void>;
  logout: () => void;
  setPage: (page: Page) => void;
  
  completeTask: (task: Task, screenshotFile: File) => Promise<void>;
  addBalance: (amount: number, currency: Currency, description: string) => Promise<void>;
  convertCoins: () => Promise<boolean>;
  withdraw: (amount: number, method: 'UPI' | 'BANK', details: WithdrawDetails) => Promise<{ success: boolean; message: string }>;
  
  // Admin Functions
  addNewTask: (task: Omit<Task, 'taskId' | 'postedDate'>) => Promise<void>;
  toggleTaskStatus: (taskId: string, currentStatus: string) => Promise<void>;
  handleWithdrawalRequest: (reqId: string, action: 'APPROVE' | 'REJECT') => Promise<void>;
  blockUser: (uid: string, currentStatus: boolean) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const ADMIN_PHONE = '8294956307';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState<Page>(Page.HOME);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  
  // Admin State
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allWithdrawals, setAllWithdrawals] = useState<WithdrawRequest[]>([]);
  const [allCompletedTasks, setAllCompletedTasks] = useState<CompletedTask[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    minWithdraw: 200,
    referralBonusRupees: 5,
    referralBonusCoins: 200,
    platformFeePercent: 5
  });

  // 1. Auth Listener & User Data Sync
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        // Real-time listener for User Document
        const userRef = db.collection('users').doc(currentUser.uid);
        const unsubUser = userRef.onSnapshot((docSnap) => {
          if (docSnap.exists) {
            const userData = docSnap.data() as User;
            setUser({ ...userData, uid: currentUser.uid });
            
            // If user is blocked, force logout
            if (userData.isBlocked) {
                alert("Your account has been blocked.");
                auth.signOut();
            }
          } else {
            // Doc might not exist yet if login just happened, handled in login()
          }
          setLoading(false);
        });

        // Real-time listener for Tasks
        const qTasks = db.collection('tasks').orderBy('postedDate', 'desc');
        const unsubTasks = qTasks.onSnapshot((snapshot) => {
          const tasksData = snapshot.docs.map(d => ({ ...d.data(), taskId: d.id } as Task));
          setTasks(tasksData);
        });

        // Real-time listener for User's Withdrawals
        const qWithdraw = db.collection('withdraw_requests')
            .where('uid', '==', currentUser.uid)
            .orderBy('requestDate', 'desc');
        const unsubWithdraw = qWithdraw.onSnapshot((snapshot) => {
            const wData = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as WithdrawRequest));
            setWithdrawals(wData);
        });

        // Real-time listener for Completed Tasks (to show checked status)
        const qCompleted = db.collection('completed_tasks').where('uid', '==', currentUser.uid);
        const unsubCompleted = qCompleted.onSnapshot((snapshot) => {
            const ids = snapshot.docs.map(d => d.data().taskId);
            setCompletedTaskIds(ids);
        });

        return () => {
            unsubUser();
            unsubTasks();
            unsubWithdraw();
            unsubCompleted();
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Admin Data Sync (Only if user is admin)
  useEffect(() => {
    if (user?.isAdmin) {
        const unsubAllUsers = db.collection('users').onSnapshot((snap) => {
            setAllUsers(snap.docs.map(d => ({...d.data(), uid: d.id} as User)));
        });

        const unsubAllWithdraws = db.collection('withdraw_requests').orderBy('requestDate', 'desc').onSnapshot((snap) => {
            setAllWithdrawals(snap.docs.map(d => ({...d.data(), id: d.id} as WithdrawRequest)));
        });

        // Listen to pending proofs
        const unsubProofs = db.collection('completed_tasks').onSnapshot((snap) => {
             setAllCompletedTasks(snap.docs.map(d => ({...d.data(), id: d.id} as CompletedTask)));
        });

        return () => {
            unsubAllUsers();
            unsubAllWithdraws();
            unsubProofs();
        }
    }
  }, [user?.isAdmin]);


  // --- ACTIONS ---

  const login = async (mobile: string, name: string, referralCode?: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const userRef = db.collection('users').doc(currentUser.uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
        // Create new user
        const isAdmin = mobile === ADMIN_PHONE;
        const newReferralCode = name.substring(0,3).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();

        const newUser: User = {
            uid: currentUser.uid,
            name,
            mobile,
            walletBalance: 10 + (referralCode ? adminSettings.referralBonusRupees : 0), // Signup bonus
            coins: 500 + (referralCode ? adminSettings.referralBonusCoins : 0),
            totalTaskCompleted: 0,
            isAdmin,
            joinedDate: Date.now(),
            referralCode: newReferralCode,
            referralCount: 0,
            referralIncome: 0,
            referredBy: referralCode || '',
            isBlocked: false,
            deviceId: 'WEB-' + Date.now()
        };

        await userRef.set(newUser);
        
        // Handle Referral Logic
        if (referralCode) {
             const usersRef = db.collection('users');
             const q = usersRef.where("referralCode", "==", referralCode);
        }
    }
  };

  const logout = () => {
    auth.signOut();
    setActivePage(Page.HOME);
  };

  const setPage = (page: Page) => setActivePage(page);

  const addBalance = async (amount: number, currency: Currency, description: string) => {
    if (!user) return;
    const userRef = db.collection('users').doc(user.uid);
    
    if (currency === 'RUPEES') {
        await userRef.update({ walletBalance: firebase.firestore.FieldValue.increment(amount) });
    } else {
        await userRef.update({ coins: firebase.firestore.FieldValue.increment(amount) });
    }
  };

  const completeTask = async (task: Task, screenshotFile: File) => {
    if (!user) return;

    // 1. Upload Screenshot
    const storageRef = storage.ref(`proofs/${user.uid}/${task.taskId}_${Date.now()}`);
    await storageRef.put(screenshotFile);
    const downloadURL = await storageRef.getDownloadURL();

    // 2. Create Completed Task Entry
    await db.collection('completed_tasks').add({
        uid: user.uid,
        taskId: task.taskId,
        screenshotURL: downloadURL,
        status: 'pending',
        timestamp: Date.now()
    });
  };

  const convertCoins = async (): Promise<boolean> => {
    if (!user || user.coins < 100) return false;
    
    const convertibleCoins = Math.floor(user.coins / 100) * 100;
    if (convertibleCoins === 0) return false;
    const rupees = convertibleCoins / 100;

    const userRef = db.collection('users').doc(user.uid);
    await userRef.update({
        coins: firebase.firestore.FieldValue.increment(-convertibleCoins),
        walletBalance: firebase.firestore.FieldValue.increment(rupees)
    });
    return true;
  };

  const withdraw = async (amount: number, method: 'UPI' | 'BANK', details: WithdrawDetails): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: 'Login required' };
    if (amount < adminSettings.minWithdraw) return { success: false, message: `Min withdraw: ₹${adminSettings.minWithdraw}` };
    if (user.walletBalance < amount) return { success: false, message: 'Insufficient balance' };

    // Deduct balance immediately
    const userRef = db.collection('users').doc(user.uid);
    await userRef.update({ walletBalance: firebase.firestore.FieldValue.increment(-amount) });

    // Create Request
    const detailsStr = method === 'UPI' ? details.upiId : `${details.accountNo}|${details.ifsc}`;
    
    await db.collection('withdraw_requests').add({
        uid: user.uid,
        userName: user.name,
        userMobile: user.mobile,
        amount,
        upiId: detailsStr || '', 
        requestDate: Date.now(),
        status: 'pending',
        method
    });

    return { success: true, message: 'Request Submitted' };
  };

  // --- ADMIN FUNCTIONS ---

  const addNewTask = async (task: Omit<Task, 'taskId' | 'postedDate'>) => {
    await db.collection('tasks').add({
        ...task,
        postedDate: Date.now()
    });
    
    await logAdminAction('ADD_TASK', `Added task: ${task.title}`);
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await db.collection('tasks').doc(taskId).update({ status: newStatus });
  };

  const handleWithdrawalRequest = async (reqId: string, action: 'APPROVE' | 'REJECT') => {
    const status = action === 'APPROVE' ? 'approved' : 'rejected';
    const reqRef = db.collection('withdraw_requests').doc(reqId);
    
    await reqRef.update({ status });

    // If Rejected, refund money
    if (action === 'REJECT') {
        const reqSnap = await reqRef.get();
        if (reqSnap.exists) {
            const data = reqSnap.data() as WithdrawRequest;
            const userRef = db.collection('users').doc(data.uid);
            await userRef.update({ walletBalance: firebase.firestore.FieldValue.increment(data.amount) });
        }
    }
    
    await logAdminAction(action, `Withdrawal ${reqId} ${status}`);
  };

  const blockUser = async (uid: string, currentStatus: boolean) => {
      await db.collection('users').doc(uid).update({ isBlocked: !currentStatus });
  };
  
  const logAdminAction = async (action: string, details: string) => {
      if (user) {
          await db.collection('admin_logs').add({
              adminId: user.uid,
              action,
              details,
              time: Date.now()
          });
      }
  }

  // Helper to merge Task with completed status for UI
  const uiTasks = tasks.map(t => ({
      ...t,
      completed: completedTaskIds.includes(t.taskId)
  }));

  return (
    <AppContext.Provider value={{ 
      user, 
      isLoggedIn: !!user, 
      loading,
      activePage, 
      
      tasks: uiTasks, 
      withdrawals, 
      
      allUsers,
      allWithdrawals,
      allCompletedTasks,
      adminSettings,
      notifications,

      login, 
      logout, 
      setPage, 
      
      completeTask, 
      addBalance,
      convertCoins,
      withdraw,
      
      addNewTask,
      toggleTaskStatus,
      handleWithdrawalRequest,
      blockUser
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
