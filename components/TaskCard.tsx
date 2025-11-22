
import React, { useRef, useState } from 'react';
import { Task } from '../types';
import { ExternalLink, CheckCircle, Lock, Clock, IndianRupee, CircleDollarSign, Upload } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  isProcessing: boolean;
  onAction: (task: Task) => void;
  onUpload: (task: Task, file: File) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isProcessing, onAction, onUpload }) => {
  const isInactive = task.status === 'inactive';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUpload, setShowUpload] = useState(false);

  const handleMainClick = () => {
      // First action: Go to link / show ad
      onAction(task);
      // After action, we assume user comes back. We enable upload button.
      // In a real app, we might set this after a timeout or when the window regains focus.
      setTimeout(() => setShowUpload(true), 5000); // Show upload option after 5 seconds
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          onUpload(task, e.target.files[0]);
      }
  };
  
  // Status Logic
  const getStatusBadge = () => {
    if (task.completed) {
      return (
        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <CheckCircle size={12} /> Completed
        </span>
      );
    }
    if (isInactive) {
      return (
        <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <Lock size={12} /> Inactive
        </span>
      );
    }
    return (
      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
        <Clock size={12} /> Active
      </span>
    );
  };

  return (
    <div className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative transition-all ${isInactive ? 'opacity-75 grayscale bg-gray-50' : 'hover:shadow-md'}`}>
      
      <div className="flex items-start gap-4">
        {/* App Logo */}
        <div className="relative">
            <img 
                src={task.logo} 
                alt={task.title} 
                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/60?text=APP')}
                className="w-14 h-14 rounded-xl bg-gray-100 object-cover shadow-sm" 
            />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-gray-900 truncate">{task.title}</h3>
              <div className="mt-1">{getStatusBadge()}</div>
            </div>
            {/* Reward Badge */}
            <div className={`px-2 py-1 rounded-lg border font-bold text-sm flex items-center gap-1 ${
                task.rewardType === 'RUPEES' 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-yellow-50 border-yellow-200 text-yellow-700'
            }`}>
               {task.rewardType === 'RUPEES' ? <IndianRupee size={14} /> : <CircleDollarSign size={14} />}
               {task.rewardCoins}
            </div>
          </div>
          
          {/* Description */}
          <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2">
            {task.description}
          </p>
        </div>
      </div>

      {/* Action Button / Footer */}
      <div className="mt-4 pt-3 border-t border-gray-50 flex flex-col gap-2">
        {/* Step 1: Go to Task */}
        {!task.completed && !isInactive && (
            <button
            disabled={isProcessing}
            onClick={handleMainClick}
            className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all bg-indigo-600 text-white shadow-lg shadow-indigo-200 active:scale-95 hover:bg-indigo-700`}
            >
            {isProcessing ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
                <>Step 1: Install / Open <ExternalLink size={16} /></>
            )}
            </button>
        )}

        {/* Step 2: Upload Screenshot (Visible after click or if already clicked) */}
        {!task.completed && !isInactive && showUpload && (
            <>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 border-2 border-dashed border-green-500 text-green-600 hover:bg-green-50 transition-colors animate-pulse"
                >
                    <Upload size={16}/> Step 2: Upload Screenshot Proof
                </button>
            </>
        )}

        {/* Completed State */}
        {task.completed && (
             <div className="w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 bg-green-50 text-green-600 cursor-default">
                 Task Submitted / Completed <CheckCircle size={16} />
             </div>
        )}
      </div>
    </div>
  );
};
