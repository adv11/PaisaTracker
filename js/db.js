/**
 * PaisaTracker — Database Layer (localStorage wrapper)
 */

const DB = (() => {
    // ── Raw storage ─────────────────────────────────────────
    const get = (key) => {
        try {
            const v = localStorage.getItem(key);
            return v ? JSON.parse(v) : null;
        } catch { return null; }
    };

    const set = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    };

    const del = (key) => {
        try { localStorage.removeItem(key); } catch { }
    };

    // ── Users ────────────────────────────────────────────────
    const getAllUsers = () => get('pt_users') || [];

    const getUser = (id) => get('pt_user_' + id);

    const saveUser = (user) => {
        const users = getAllUsers();
        const idx = users.findIndex((u) => u.id === user.id);
        if (idx >= 0) users[idx] = user;
        else users.push(user);
        const okUsers = set('pt_users', users);
        const okUser = set('pt_user_' + user.id, user);
        return okUsers && okUser;
    };

    // ── Data ─────────────────────────────────────────────────
    const getData = (userId) => get('pt_data_' + userId);

    const saveData = (userId, data) => set('pt_data_' + userId, data);

    const ensureData = (userId) => {
        if (!getData(userId)) {
            if (!saveData(userId, getDefaultData())) return null;
        }
        return getData(userId);
    };

    // ── Session ──────────────────────────────────────────────
    const getSession = () => get('pt_session');

    const saveSession = (userId) =>
        set('pt_session', { userId, ts: Date.now() });

    const clearSession = () => del('pt_session');

    // ── Default Data ─────────────────────────────────────────
    const getDefaultData = () => ({
        transactions: [],
        accounts: [
            { id: 'a1', name: 'Cash', type: 'cash', balance: 0, color: '#10b981', icon: '💵' },
            { id: 'a2', name: 'SBI Bank', type: 'bank', balance: 0, color: '#6366f1', icon: '🏦' },
            { id: 'a3', name: 'PhonePe', type: 'upi', balance: 0, color: '#3b82f6', icon: '📱' },
            { id: 'a4', name: 'HDFC Credit', type: 'credit', balance: 0, color: '#ec4899', icon: '💳' },
            { id: 'a5', name: 'Paytm', type: 'wallet', balance: 0, color: '#f59e0b', icon: '👛' },
        ],
        categories: [
            // Income
            { id: 'c1', name: '💰 Salary', type: 'income', color: '#10b981', sub: ['Monthly', 'Bonus', 'Incentive'] },
            { id: 'c2', name: '💼 Business', type: 'income', color: '#6366f1', sub: ['Sales', 'Service'] },
            { id: 'c3', name: '💻 Freelance', type: 'income', color: '#3b82f6', sub: ['Project', 'Consulting'] },
            { id: 'c4', name: '📈 Returns', type: 'income', color: '#f59e0b', sub: ['Dividend', 'Interest'] },
            { id: 'c5', name: '🎁 Other', type: 'income', color: '#ec4899', sub: ['Gift', 'Cashback'] },
            // Expense
            { id: 'c6', name: '🍔 Food', type: 'expense', color: '#ef4444', sub: ['Restaurant', 'Groceries', 'Delivery', 'Snacks'] },
            { id: 'c7', name: '🚗 Travel', type: 'expense', color: '#f97316', sub: ['Petrol', 'Cab', 'Flights', 'Metro'] },
            { id: 'c8', name: '🏠 Rent', type: 'expense', color: '#8b5cf6', sub: ['House Rent', 'Office'] },
            { id: 'c9', name: '💡 Bills', type: 'expense', color: '#14b8a6', sub: ['Electricity', 'Internet', 'Mobile', 'Gas'] },
            { id: 'c10', name: '🛍️ Shopping', type: 'expense', color: '#ec4899', sub: ['Clothes', 'Electronics', 'Books'] },
            { id: 'c11', name: '🏥 Medical', type: 'expense', color: '#84cc16', sub: ['Medicine', 'Doctor', 'Hospital'] },
            { id: 'c12', name: '🎮 Entertainment', type: 'expense', color: '#06b6d4', sub: ['OTT', 'Games', 'Movies'] },
            { id: 'c13', name: '🏡 Ghar Bheja', type: 'expense', color: '#3b82f6', sub: ['Family', 'Groceries'] },
            { id: 'c14', name: '💸 EMI', type: 'expense', color: '#f59e0b', sub: ['Home Loan', 'Car Loan', 'Personal'] },
            { id: 'c15', name: '🎉 Misc', type: 'expense', color: '#6366f1', sub: ['Gifts', 'Other'] },
            // Investment
            { id: 'c16', name: '🏦 FD', type: 'investment', color: '#10b981', sub: ['SBI FD', 'HDFC FD'] },
            { id: 'c17', name: '📊 Mutual Fund', type: 'investment', color: '#6366f1', sub: ['SIP', 'Lumpsum'] },
            { id: 'c18', name: '📉 Stocks', type: 'investment', color: '#f59e0b', sub: ['NSE', 'BSE'] },
            { id: 'c19', name: '🪙 Crypto', type: 'investment', color: '#ec4899', sub: ['Bitcoin', 'Ethereum'] },
            { id: 'c20', name: '💛 Gold', type: 'investment', color: '#f97316', sub: ['Physical', 'Digital Gold'] },
            // Udhaar
            { id: 'c21', name: '✋ Udhaar Diya', type: 'udhaar', color: '#ef4444', sub: [] },
            { id: 'c22', name: '🤝 Udhaar Liya', type: 'udhaar', color: '#10b981', sub: [] },
        ],
        budgets: [],
        goals: [],
        reminders: [],
    });

    return {
        get, set, del,
        getAllUsers, getUser, saveUser,
        getData, saveData, ensureData,
        getSession, saveSession, clearSession,
        getDefaultData,
    };
})();

window.DB = DB;
