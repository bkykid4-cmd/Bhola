
import React, { useState } from 'react';
import { useApp } from '../context';
import { Task, Currency } from '../types';
import { 
  LayoutDashboard, 
  ListPlus, 
  CreditCard, 
  Users, 
  PlusCircle, 
  Power, 
  Check, 
  X, 
  Search
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { 
    tasks, 
    allUsers, 
    allWithdrawals, 
    addNewTask, 
    toggleTaskStatus, 
    handleWithdrawalRequest, 
    blockUser, 
  } = useApp();

  const [adminTab, setAdminTab] = useState<'DASH' | 'TASKS' | 'WITHDRAW' | 'USERS'>('DASH');

  const pendingWithdrawals = allWithdrawals.filter(tx => tx.status === 'pending');
  const totalPendingAmount = pendingWithdrawals.reduce((sum, tx) => sum + tx.amount, 0);

  const TasksTab = () => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newTask, setNewTask] = useState({
      title: '', logo: '', rewardCoins: '', rewardType: 'RUPEES' as Currency, description: '', link: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (newTask.title && newTask.rewardCoins) {
        await addNewTask({
          title: newTask.title,
          logo: newTask.logo || 'https://via.placeholder.com/100',
          rewardCoins: Number(newTask.rewardCoins),
          rewardType: newTask.rewardType,
          description: newTask.description,
          link: newTask.link,
          status: 'active'
        });
        setShowAddForm(false);
        setNewTask({ title: '', logo: '', rewardCoins: '', rewardType: 'RUPEES', description: '', link: '' });
      }
    };

    return (
      <div className="space-y-4">
        {!showAddForm ? (
          <button 
            onClick={() => setShowAddForm(true)}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-md flex items-center justify-center gap-2"
          >
            <PlusCircle size={20}/> Add New Task
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
             <h3 className="font-bold text-gray-800">Create New Task</h3>
             <input placeholder="Title" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full p-2 border rounded-lg text-sm" required />
             <input placeholder="Logo URL" value={newTask.logo} onChange={e => setNewTask({...newTask, logo: e.target.value})} className="w-full p-2 border rounded-lg text-sm" />
             <div className="flex gap-2">
                <input type="number" placeholder="Reward" value={newTask.rewardCoins} onChange={e => setNewTask({...newTask, rewardCoins: e.target.value})} className="w-full p-2 border rounded-lg text-sm" required />
                <select value={newTask.rewardType} onChange={e => setNewTask({...newTask, rewardType: e.target.value as Currency})} className="p-2 border rounded-lg text-sm bg-gray-50">
                    <option value="RUPEES">₹ Rupees</option>
                    <option value="COINS">🪙 Coins</option>
                </select>
             </div>
             <input placeholder="Desc" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} className="w-full p-2 border rounded-lg text-sm" />
             <input placeholder="Link" value={newTask.link} onChange={e => setNewTask({...newTask, link: e.target.value})} className="w-full p-2 border rounded-lg text-sm" required />
             <div className="flex gap-2 pt-2">
                 <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-2 text-gray-500 font-bold text-sm">Cancel</button>
                 <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-sm">Save</button>
             </div>
          </form>
        )}

        <div className="space-y-3">
           {tasks.map(task => (
             <div key={task.taskId} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                <img src={task.logo} alt="" className="w-10 h-10 rounded-lg bg-gray-100 object-cover" />
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">{task.title}</h4>
                    <p className="text-xs text-gray-500">{task.rewardType === 'RUPEES' ? '₹' : ''}{task.rewardCoins} {task.rewardType === 'COINS' ? 'Coins' : ''}</p>
                </div>
                <button 
                    onClick={() => toggleTaskStatus(task.taskId, task.status)}
                    className={`p-2 rounded-lg ${task.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}
                >
                    <Power size={18} />
                </button>
             </div>
           ))}
        </div>
      </div>
    );
  };

  const WithdrawalsTab = () => (
      <div className="space-y-4">
        {pendingWithdrawals.length === 0 ? (
            <div className="text-center py-10 text-gray-400 bg-white rounded-xl">No pending withdrawals.</div>
        ) : (
            pendingWithdrawals.map(tx => (
               <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                   <div className="flex justify-between items-start mb-2">
                       <div>
                           <h4 className="font-bold text-gray-900 text-sm">{tx.userName}</h4>
                           <p className="text-xs text-gray-500">{tx.userMobile}</p>
                       </div>
                       <span className="font-bold text-lg text-indigo-600">₹{tx.amount}</span>
                   </div>
                   <div className="bg-orange-50 p-2 rounded text-xs font-mono text-orange-900 mb-4 break-all border border-orange-100">
                       {tx.upiId}
                   </div>
                   <div className="flex gap-3">
                       <button onClick={() => handleWithdrawalRequest(tx.id!, 'REJECT')} className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg font-bold text-xs">Reject</button>
                       <button onClick={() => handleWithdrawalRequest(tx.id!, 'APPROVE')} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-xs">Approve</button>
                   </div>
               </div>
            ))
        )}
      </div>
  );

  const UsersTab = () => {
      const [searchTerm, setSearchTerm] = useState('');
      const filteredUsers = allUsers.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

      return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5"/>
                <input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 p-2 rounded-lg border border-gray-200 text-sm" />
            </div>
            {filteredUsers.map((u, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div>
                        <h4 className="font-bold text-sm">{u.name} {u.isBlocked && <span className="text-red-500">(BLOCKED)</span>}</h4>
                        <p className="text-xs text-gray-500">{u.mobile}</p>
                    </div>
                    <button onClick={() => blockUser(u.uid, u.isBlocked || false)} className={`p-2 rounded-lg ${u.isBlocked ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                        <Power size={16} />
                    </button>
                </div>
            ))}
        </div>
      );
  };

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white"><Users size={20} /></div> Admin Panel
      </h1>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['DASH', 'TASKS', 'WITHDRAW', 'USERS'].map(t => (
            <button key={t} onClick={() => setAdminTab(t as any)} className={`px-4 py-2 rounded-full text-xs font-bold ${adminTab === t ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border'}`}>{t}</button>
        ))}
      </div>
      {adminTab === 'DASH' && (
          <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border"><p className="text-xs text-gray-500">Pending</p><h3 className="text-xl font-bold text-orange-500">₹{totalPendingAmount}</h3></div>
              <div className="bg-white p-4 rounded-xl shadow-sm border"><p className="text-xs text-gray-500">Users</p><h3 className="text-xl font-bold text-indigo-600">{allUsers.length}</h3></div>
          </div>
      )}
      {adminTab === 'TASKS' && <TasksTab />}
      {adminTab === 'WITHDRAW' && <WithdrawalsTab />}
      {adminTab === 'USERS' && <UsersTab />}
    </div>
  );
};
