//logic for income
import Income from '../models/Income.js';
import User from '../models/Users.js';

export const getIncomes = async (req, res) => {
  const incomes = await Income.find({ user: req.user._id });
  res.json(incomes);
};

export const addIncome = async (req, res) => {
  const { name, amount, month } = req.body;

  const income = new Income({
    user: req.user._id,
    name,
    amount,
    month,
  });

  const saved = await income.save();
  const user = await User.findById(req.user._id);
  if (user.card) {
    user.card.balance = (user.card.balance || 0) + Number(amount);
    await user.save();
  }

  res.status(201).json(saved);
};

export const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    const user = await User.findById(req.user._id);
    if (user.card) {
      user.card.balance = (user.card.balance || 0) - Number(income.amount);
      await user.save();
    }

    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
