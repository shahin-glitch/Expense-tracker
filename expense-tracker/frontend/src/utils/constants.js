export const CATEGORIES = [
  { name: 'Food & Dining', icon: '🍔', color: '#FF6B6B' },
  { name: 'Shopping', icon: '🛍️', color: '#4ECDC4' },
  { name: 'Transportation', icon: '🚗', color: '#45B7D1' },
  { name: 'Entertainment', icon: '🎬', color: '#96CEB4' },
  { name: 'Bills & Utilities', icon: '💡', color: '#FFEAA7' },
  { name: 'Healthcare', icon: '🏥', color: '#DDA0DD' },
  { name: 'Education', icon: '📚', color: '#98D8C8' },
  { name: 'Travel', icon: '✈️', color: '#F7DC6F' },
  { name: 'Housing', icon: '🏠', color: '#A8D8EA' },
  { name: 'Personal Care', icon: '💄', color: '#FFC0CB' },
  { name: 'Sports & Fitness', icon: '💪', color: '#90EE90' },
  { name: 'Gifts', icon: '🎁', color: '#FFB347' },
  { name: 'Salary', icon: '💼', color: '#82E0AA' },
  { name: 'Freelance', icon: '💻', color: '#76D7C4' },
  { name: 'Investment', icon: '📈', color: '#52BE80' },
  { name: 'Other', icon: '📦', color: '#AEB6BF' },
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

export const getCategoryColor = (name) => {
  const cat = CATEGORIES.find(c => c.name === name);
  return cat ? cat.color : '#AEB6BF';
};

export const getCategoryIcon = (name) => {
  const cat = CATEGORIES.find(c => c.name === name);
  return cat ? cat.icon : '📦';
};

export const formatCurrency = (amount, currency = 'USD') => {
  const curr = CURRENCIES.find(c => c.code === currency);
  return `${curr?.symbol || '$'}${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
