// Mock API - Frontend only, no backend needed
// All data stored in localStorage

// Mock user database
const MOCK_USERS = [
  { id: '1', name: 'Demo User', email: 'demo@example.com', password: 'demo123', currency: 'USD', monthlyBudget: 5000 },
  { id: '2', name: 'Test User', email: 'test@example.com', password: 'test123', currency: 'USD', monthlyBudget: 3000 },
];

// Initialize with some demo transactions
const DEMO_TRANSACTIONS = {
  '1': [
    { _id: '1', title: 'Grocery Shopping', category: 'Food', type: 'expense', amount: 125.50, date: new Date(Date.now() - 2*24*60*60*1000).toISOString(), note: 'Weekly groceries', userId: '1', createdAt: new Date().toISOString() },
    { _id: '2', title: 'Salary', category: 'Income', type: 'income', amount: 3000, date: new Date(Date.now() - 5*24*60*60*1000).toISOString(), note: 'Monthly salary', userId: '1', createdAt: new Date().toISOString() },
    { _id: '3', title: 'Gas', category: 'Transportation', type: 'expense', amount: 45.00, date: new Date(Date.now() - 3*24*60*60*1000).toISOString(), note: 'Fuel', userId: '1', createdAt: new Date().toISOString() },
    { _id: '4', title: 'Netflix', category: 'Entertainment', type: 'expense', amount: 15.99, date: new Date(Date.now() - 7*24*60*60*1000).toISOString(), note: 'Monthly subscription', userId: '1', createdAt: new Date().toISOString() },
    { _id: '5', title: 'Freelance Project', category: 'Income', type: 'income', amount: 500, date: new Date(Date.now() - 10*24*60*60*1000).toISOString(), note: 'Web design project', userId: '1', createdAt: new Date().toISOString() },
  ]
};

// Simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Utility to get all expenses for user
const getAllExpenses = (userId) => {
  const data = JSON.parse(localStorage.getItem('mockExpenses') || '{}');
  // Initialize with demo data if first time
  if (!data[userId]) {
    data[userId] = DEMO_TRANSACTIONS[userId] || [];
  }
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
    
    // Apply filters
    if (params?.type) {
      expenses = expenses.filter(e => e.type === params.type);
    }
    
    if (params?.category) {
      expenses = expenses.filter(e => e.category === params.category);
    }
    
    if (params?.search) {
      const search = params.search.toLowerCase();
      expenses = expenses.filter(e => 
        e.title.toLowerCase().includes(search) || 
        (e.note && e.note.toLowerCase().includes(search))
      );
    }
    
    // Apply sorting
    if (params?.sortBy === 'date') {
      expenses = expenses.sort((a, b) => {
        const order = params?.order === 'asc' ? 1 : -1;
        return order * (new Date(b.date) - new Date(a.date));
      });
    } else {
      // Default sort by date descending
      expenses = expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    // Pagination
    const limit = params?.limit || 15;
    const page = params?.page || 1;
    const total = expenses.length;
    const pages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedExpenses = expenses.slice(start, start + limit);
    
    return { 
      data: { 
        success: true, 
        expenses: paginatedExpenses,
        pagination: {
          total,
          page,
          limit,
          pages
        }
      } 
    };
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
      title: data.title || '',
      amount: parseFloat(data.amount) || 0,
      type: data.type || 'expense',
      category: data.category || 'Food & Dining',
      date: data.date || new Date().toISOString().split('T')[0],
      note: data.note || '',
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
    
    expenses[index] = {
      ...expenses[index],
      title: data.title || expenses[index].title,
      amount: parseFloat(data.amount) || expenses[index].amount,
      type: data.type || expenses[index].type,
      category: data.category || expenses[index].category,
      date: data.date || expenses[index].date,
      note: data.note || expenses[index].note
    };
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
      const dateStr = e.date;
      const [eYear, eMonth] = dateStr.split('-').slice(0, 2).map(Number);
      return eMonth === month && eYear === year;
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
      const dateStr = e.date;
      const [eYear, eMonth] = dateStr.split('-').slice(0, 2).map(Number);
      const existing = monthlyTrend.find(m => m._id.year === eYear && m._id.month === eMonth && m._id.type === e.type);
      if (existing) {
        existing.total += e.amount;
      } else {
        monthlyTrend.push({
          _id: { year: eYear, month: eMonth, type: e.type },
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
