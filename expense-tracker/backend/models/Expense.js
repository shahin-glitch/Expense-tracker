const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be positive']
  },
  type: {
    type: String,
    enum: ['expense', 'income'],
    required: true,
    default: 'expense'
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Food & Dining', 'Shopping', 'Transportation', 'Entertainment',
      'Bills & Utilities', 'Healthcare', 'Education', 'Travel',
      'Housing', 'Personal Care', 'Sports & Fitness', 'Gifts',
      'Salary', 'Freelance', 'Investment', 'Other'
    ]
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  note: {
    type: String,
    trim: true,
    maxlength: [500, 'Note cannot exceed 500 characters']
  },
  tags: [{
    type: String,
    trim: true
  }]
}, { timestamps: true });

expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
