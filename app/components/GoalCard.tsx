import { Target, Lock } from 'lucide-react';
import type { Goal } from '../stores/goals.store';

interface GoalCardProps {
    goal: Goal;
    onAdd: (id: string) => void;
}

export function GoalCard({ goal, onAdd }: GoalCardProps) {
    const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
    const isCompleted = goal.status === 'completed';
    const currSymbol = goal.target_currency === 'USD' ? '$' : 'C$';

    return (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 mb-4">
            <div className="flex items-center mb-4">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 flex items-center justify-center mr-3 flex-shrink-0">
                    {isCompleted
                        ? <Lock size={20} className="text-emerald-400" />
                        : <Target size={20} className="text-indigo-400" />
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-base truncate">{goal.title}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">
                        Meta: {currSymbol}{Number(goal.target_amount).toLocaleString()}
                    </p>
                </div>
                {isCompleted && (
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full ml-2">
                        ✓ Completada
                    </span>
                )}
            </div>

            {/* Progress */}
            <div className="mb-2">
                <div className="flex justify-between mb-1.5">
                    <span className="text-indigo-300 text-sm font-bold">
                        {currSymbol}{Number(goal.current_amount).toLocaleString()}
                    </span>
                    <span className="text-zinc-500 text-xs">{progress.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {!isCompleted && (
                <button
                    onClick={() => onAdd(goal.id)}
                    className="mt-3 w-full bg-indigo-600/15 border border-indigo-500/30 py-3 rounded-2xl text-indigo-400 font-semibold text-sm hover:bg-indigo-600/25 transition-colors"
                >
                    + Aportar
                </button>
            )}
        </div>
    );
}
