// Mock API - Frontend only, no backend needed
// All data stored in localStorage

// Mock user database
const MOCK_USERS = [
  { id: '1', name: 'Demo User', email: 'demo@example.com', password: 'demo123', currency: 'USD', monthlyBudget: 5000 },
  { id: '2', name: 'Test User', email: 'test@example.com', password: 'test123', currency: 'USD', monthlyBudget: 3000 },
];

// Simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Utility to get all expenses for user
const getAllExpenses = (userId) => {
  const data = JSON.parse(localStorage.getItem('mockExpenses') || '{}');
  return data[userId] || [];
};

// Utility to save expenses
const saveExpenses = (userId, expenses) => {
  const data = JSON.parse(localStorage.getItem('mockExpenses') || '{}');
  data[userId] = expenses;
  localStorage.setItem('mockExpenses', JSON.stringify(data));
};

// Utility to get all budgets for user
const getAllBudgets = (userId) => {
  const data = JSON.parse(localStorage.getItem('mockBudgets') || '{}');
  return data[userId] || [];
};

// Utility to save budgets
const saveBudgets = (userId, budgets) => {
  const data = JSON.parse(localStorage.getItem('mockBudgets') || '{}');
  data[userId] = budgets;
  localStorage.setItem('mockBudgets', JSON.stringify(data));
};

export const authAPI = {
  register: async (data) => {
    await delay(600);
    const { name, email, password } = data;
    
    // Check if user exists
    const existing = MOCK_USERS.find(u => u.email === email);
    if (existing) {
      throw { response: { status: 400, data: { message: 'Email already registered' } } };
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      currency: 'USD',
      monthlyBudget: 5000
    };
    MOCK_USERS.push(newUser);
    
    // Generate mock token
    const token = 'mock-token-' + Date.now();
    const user = { id: newUser.id, name: newUser.name, email: newUser.email, currency: newUser.currency, monthlyBudget: newUser.monthlyBudget };
    
    return {
      data: { success: true, token, user }
    };
  },

  login: async (data) => {
    await delay(600);
    const { email, password } = data;
    
    // Find user
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!user) {
      throw { response: { status: 401, data: { message: 'Invalid email or password' } } };
    }
    
    // Generate mock token
    const token = 'mock-token-' + Date.now();
    const userData = { id: user.id, name: user.name, email: user.email, currency: user.currency, monthlyBudget: user.monthlyBudget };
    
    return {
      data: { success: true, token, user: userData }
    };
  },

  getMe: async () => {
    await delay(300);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
      throw { response: { status: 401, data: { message: 'Not authenticated' } } };
    }
    return { data: { success: true, user } };
  },

  updateProfile: async (data) => {
    await delay(500);
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (!currentUser) {
      throw { response: { status: 401, data: { message: 'Not authenticated' } } };
    }
    
    const updatedUser = { ...currentUser, ...data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return { data: { success: true, user: updatedUser } };
  }
};

export const expenseAPI = {
  getAll: async (params) => {
    await delay(400);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
      throw { response: { status: 401 } };
    }
    
    let expenses = getAllExpenses(user.id);
    
    // Apply sorting
    if (params?.sortBy === 'date') {
      expenses = expenses.sort((a, b) => {
        const order = params?.order === 'asc' ? 1 : -1;
        return order * (new Date(b.date) - new Date(a.date));
      });
    }
    
    // Apply limit
    if (params?.limit) {
      expenses = expenses.slice(0, params.limit);
    }
    
    return { data: { success: true, expenses } };
  },

  create: async (data) => {
    await delay(400);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
      throw { response: { status: 401 } };
    }
    
    const expenses = getAllExpenses(user.id);
    const newExpense = {
      _id: Date.now().toString(),
      ...data,
      userId: user.id,
      createdAt: new Date().toISOString()
    };
    expenses.push(newExpense);
    saveExpenses(user.id, expenses);
    
    return { data: { success: true, expense: newExpense } };
  },

  update: async (id, data) => {
    await delay(400);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
      throw { response: { status: 401 } };
    }
    
    const expenses = getAllExpenses(user.id);
    const index = expenses.findIndex(e => e._id === id);
    if (index === -1) {
      throw { response: { status: 404, data: { message: 'Expense not found' } } };
    }
    
    expenses[index] = { ...expenses[index], ...data };
    saveExpenses(user.id, expenses);
    
    return { data: { success: true, expense: expenses[index] } };
  },

  delete: async (id) => {
    await delay(400);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
      throw { response: { status: 401 } };
    }
    
    let expenses = getAllExpenses(user.id);
    expenses = expenses.filter(e => e._id !== id);
    saveExpenses(user.id, expenses);
    
    return { data: { success: true } };
  },

  getStats: async (params) => {
    await delay(500);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
      throw { response: { status: 401 } };
    }
    
    const expenses = getAllExpenses(user.id);
    const { month, year } = params;
    
    // Filter by month and year
    const filtered = expenses.filter(e => {
      const date = new Date(e.date);
      return date.getMonth() + 1 === month && date.getFullYear() === year;
    });
    
    // Calculate stats
    const totalExpenses = filtered.reduce((sum, e) => sum + (e.type === 'expense' ? e.amount : 0), 0);
    const totalIncome = filtered.reduce((sum, e) => sum + (e.type === 'income' ? e.amount : 0), 0);
    
    // Category breakdown
    const byCategory = {};
    filtered.forEach(e => {
      if (e.type === 'expense') {
        byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
      }
    });
    
    // Monthly trend
    const monthlyTrend = [];
    expenses.forEach(e => {
      const date = new Date(e.date);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const existing = monthlyTrend.find(m => m._id.year === date.getFullYear() && m._id.month === date.getMonth() + 1 && m._id.type === e.type);
      if (existing) {
        existing.total += e.amount;
      } else {
        monthlyTrend.push({
          _id: { year: date.getFullYear(), month: date.getMonth() + 1, type: e.type },
          total: e.amount
        });
      }
    });
    
    return {
      data: {
        success: true,
        summary: { totalExpenses, totalIncome },
        byCategory,
        monthlyTrend
      }
    };
  }
};

export const budgetAPI = {
  getAll: async (params) => {
    await delay(400);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
      throw { response: { status: 401 } };
    }
    
    const budgets = getAllBudgets(user.id);
    return { data: { success: true, budgets } };
  },

  create: async (data) => {
    await delay(400);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
      throw { response: { status: 401 } };
    }
    
    const budgets = getAllBudgets(user.id);
    const newBudget = {
      _id: Date.now().toString(),
      ...data,
      userId: user.id,
      createdAt: new Date().toISOString()
    };
    budgets.push(newBudget);
    saveBudgets(user.id, budgets);
    
    return { data: { success: true, budget: newBudget } };
  },

  delete: async (id) => {
    await delay(400);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
      throw { response: { status: 401 } };
    }
    
    let budgets = getAllBudgets(user.id);
    budgets = budgets.filter(b => b._id !== id);
    saveBudgets(user.id, budgets);
    
    return { data: { success: true } };
  }
};

export default {
  authAPI,
  expenseAPI,
  budgetAPI
};
