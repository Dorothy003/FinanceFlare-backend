//logic for expense
import Expense from "../models/Expense.js";
import User from '../models/Users.js';

export const getExpenses = async (req, res) => {
  const expenses = await Expense.find({ user: req.user._id });
  res.json(expenses);
};

export const addExpense = async (req, res) => {
  const { name, amount, category, month } = req.body;

  const expense = new Expense({
    user: req.user._id,
    name,
    amount,
    category,
    month,
  });

  const saved = await expense.save();

  // Deduct from card balance
  const user = await User.findById(req.user._id);
  if (user.card) {
    user.card.balance = (user.card.balance || 0) - Number(amount);
    await user.save();
  }

  res.status(201).json(saved);
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const user = await User.findById(req.user._id);
    if (user.card) {
      user.card.balance = (user.card.balance || 0) + Number(expense.amount);
      await user.save();
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
