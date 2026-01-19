import React, { useState, useEffect } from 'react';
import Layout from '@/components/Common/Layout';
import { adminAPI } from '@/services/api';
import { useRouter } from 'next/router';
import { useTranslation } from '@/hooks/useTranslation';

interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_active: boolean;
    violated_rules?: string[];
    flagged_by_admin?: boolean;
    suspension_type?: 'none' | 'temporary' | 'permanent';
    suspension_end?: string;
    challenge_type?: string;
}

const AdminPanel: React.FC = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [error, setError] = useState<string>('');

    // Mock Data Generator (Synchronized with Leaderboard)
    const generateMockUsers = (count: number): User[] => {
        const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
        const types = ['Standard 10k', 'Pro 50k', 'Elite 100k', 'Masters 250k'];
        const rules = ['Max Daily Drawdown', 'Total Drawdown', 'Inactivity', 'Prohibited Strategy'];

        return Array.from({ length: count }, (_, i) => {
            const hasViolated = Math.random() > 0.8;
            return {
                id: 100 + i,
                email: `${firstNames[Math.floor(Math.random() * firstNames.length)].toLowerCase()}.${lastNames[Math.floor(Math.random() * lastNames.length)].toLowerCase()}${i}@tradesense.com`,
                first_name: firstNames[Math.floor(Math.random() * firstNames.length)],
                last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
                role: 'user',
                is_active: true,
                challenge_type: types[i % 4],
                violated_rules: hasViolated ? [rules[Math.floor(Math.random() * rules.length)]] : [],
                flagged_by_admin: hasViolated && Math.random() > 0.5,
                suspension_type: 'none'
            };
        });
    };

    useEffect(() => {
        checkAccess();
    }, []);

    const checkAccess = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/login');
                return;
            }

            const meRes = await adminAPI.getMe();
            const me = meRes.data.user;
            setCurrentUser(me);

            // Fetch real users + add 50 mock users
            const res = await adminAPI.getUsers();
            const realUsers = res.data.users.map((u: any) => ({
                ...u,
                violated_rules: [],
                suspension_type: 'none'
            }));

            const mockUsers = generateMockUsers(50);
            setUsers([...realUsers, ...mockUsers]);

            setLoading(false);
        } catch (err: any) {
            if (err.response?.status === 403 || err.response?.status === 401) {
                router.push('/404');
            } else {
                setError(t('error') || 'Failed to load admin panel');
                setLoading(false);
            }
        }
    };

    const handleFlagUser = (userId: number) => {
        setUsers(users.map(u => u.id === userId ? { ...u, flagged_by_admin: true } : u));
    };

    const handleSuspend = (userId: number, type: 'temporary' | 'permanent') => {
        setUsers(users.map(u => u.id === userId ? {
            ...u,
            is_active: false,
            suspension_type: type,
            suspension_end: type === 'temporary' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined
        } : u));
    };

    const handleUnsuspend = (userId: number) => {
        setUsers(users.map(u => u.id === userId ? { ...u, is_active: true, suspension_type: 'none' } : u));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
        );
    }

    const isSuperAdmin = currentUser?.role === 'superadmin';
    const isAdmin = currentUser?.role === 'admin' || isSuperAdmin;

    return (
        <>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 transition-colors duration-300">
                <div className="container mx-auto px-4">
                    <div className="mb-10 flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">{t('admin_title')}</h1>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">Monitoring {users.length} active traders and rule compliance.</p>
                        </div>
                        <div className="flex space-x-2">
                            {isSuperAdmin && (
                                <span className="px-4 py-2 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-500/20">
                                    SuperAdmin View
                                </span>
                            )}
                            <span className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
                                Admin Dashboard
                            </span>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-900/20 border border-red-900 text-red-400 px-4 py-3 rounded-2xl mb-8 font-bold text-sm">
                            {error}
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-700">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('admin_email')}</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Challenge & Rules</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('admin_actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {users.map(user => {
                                        const isSystemAdmin = user.role === 'admin' || user.role === 'superadmin';
                                        if (isSystemAdmin) return null; // Hide admins from list as requested

                                        return (
                                            <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-750/30 transition-all ${user.flagged_by_admin ? 'bg-orange-50/30 dark:bg-orange-900/10' : ''}`}>
                                                <td className="px-8 py-6">
                                                    <div className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{user.email}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-bold">{user.first_name} {user.last_name}</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase mb-2">Tier: {user.challenge_type || 'Discovery'}</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {user.violated_rules && user.violated_rules.length > 0 ? (
                                                            user.violated_rules.map((rule, idx) => (
                                                                <span key={idx} className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[9px] font-black uppercase tracking-tighter rounded border border-red-200 dark:border-red-800 flex items-center">
                                                                    <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" /></svg>
                                                                    {rule}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center">
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                                Compliance Good
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col space-y-1">
                                                        <span className={`px-3 py-1 text-[9px] w-fit rounded-full font-black uppercase tracking-widest border transition-all ${user.is_active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                                            {user.is_active ? 'Active' : 'Suspended'}
                                                        </span>
                                                        {user.flagged_by_admin && !user.suspension_type?.includes('permanent') && (
                                                            <span className="text-[9px] text-orange-600 dark:text-orange-400 font-black uppercase tracking-tighter bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-800">
                                                                Flagged for Review
                                                            </span>
                                                        )}
                                                        {user.suspension_type === 'temporary' && (
                                                            <span className="text-[8px] text-gray-500 font-bold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                                                End: {new Date(user.suspension_end!).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center space-x-3">
                                                        {/* Admin: Flagging */}
                                                        {isAdmin && !user.flagged_by_admin && user.violated_rules && user.violated_rules.length > 0 && (
                                                            <button
                                                                onClick={() => handleFlagUser(user.id)}
                                                                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-orange-500/20"
                                                            >
                                                                Flag for SuperAdmin
                                                            </button>
                                                        )}

                                                        {/* SuperAdmin: Decision */}
                                                        {isSuperAdmin && user.flagged_by_admin && user.is_active && (
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => handleSuspend(user.id, 'temporary')}
                                                                    className="px-3 py-2 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all"
                                                                >
                                                                    Temp Suspend
                                                                </button>
                                                                <button
                                                                    onClick={() => handleSuspend(user.id, 'permanent')}
                                                                    className="px-3 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
                                                                >
                                                                    BAN Permanently
                                                                </button>
                                                            </div>
                                                        )}

                                                        {!user.is_active && isSuperAdmin && (
                                                            <button
                                                                onClick={() => handleUnsuspend(user.id)}
                                                                className="px-4 py-2 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-green-700 transition-all"
                                                            >
                                                                Unsuspend Account
                                                            </button>
                                                        )}

                                                        {/* Default Action */}
                                                        {!user.flagged_by_admin && (
                                                            <span className="text-[10px] text-gray-400 font-bold italic">No pending actions</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminPanel;
