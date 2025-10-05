
import Income from '../models/Income.js';
import Expense from '../models/Expense.js';
import User from '../models/Users.js';

export const getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const incomes = await Income.find({ user: req.user.id });
    const expenses = await Expense.find({ user: req.user.id });

    const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalBalance = user.card?.balance || 0;
    const totalContribution = (user.goals || []).reduce((sum, g) => sum + (g.saved || 0), 0);
    
    const transactions = [
      ...incomes.map((i) => ({
        name: i.name,
        amount: `+${i.amount}`,
        date: i.month,
        type: 'Income',
        createdAt: i.createdAt,
      })),
      ...expenses.map((e) => ({
        name: e.name,
        amount: `-${e.amount}`,
        date: e.month,
        type: 'Expense',
        createdAt: e.createdAt,
      })),
    ];

    // Sort transactions by createdAt descending
    transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      card: {
        cardHolder: user.card?.cardHolder || "",
        cardNumber: user.card?.cardNumber || "",
        cvv: user.card?.cvv || "",
        expiryDate: user.card?.expiryDate || "",
        cardType: user.card?.cardType || "Credit",
        balance: user.card?.balance || 0,
      },
      totalIncome,
      totalExpense,
      totalBalance,
      transactions,
      totalContribution,
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};

export const getCard = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ card: user.card || {} });
  } catch (err) {
    console.error("Error fetching card:", err);
    res.status(500).json({ message: "Failed to fetch card" });
  }
};

export const updateCard = async (req, res) => {
  try {
   
    const userId = req.user.id;
    const cardData = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "card.cardHolder": cardData.cardHolder,
          "card.cardNumber": cardData.cardNumber,
          "card.cvv": cardData.cvv,
          "card.expiryDate": cardData.expiryDate,
          "card.cardType": cardData.cardType,
          "card.balance": cardData.balance,
        },
      },
      { new: true }
    );


    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json({ card: updatedUser.card });

  } catch (error) {
    console.error("Update card error:", error);
    res.status(500).json({ message: 'Failed to update card' });
  }
};

export const addTransaction = async (req, res) => {
  try {
    const { name, amount, type } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newTxn = {
      name,
      amount,
      type,
      date: new Date().toLocaleDateString(),
    };
    console.log("User before push:", user.transactions);
    // Push into user's transactions array
    user.transactions.push(newTxn);
    console.log("User after push:", user.transactions);
    await user.save();

    res.status(201).json({ message: 'Transaction added', transaction: newTxn });
  } catch (error) {
    console.error("Add Transaction Error:", error);
    res.status(500).json({ message: 'Failed to add transaction', error });
  }
};
export const getAllTransactions = async (req, res) => {
  try {
    const userId = req.user._id;

    const income = await Income.find({ user: userId }).select('name amount month createdAt').lean();
    const expenses = await Expense.find({ user: userId }).select('name amount month createdAt').lean();

    const transactions = [
      ...income.map((i) => ({
        name: i.name,
        amount: `+${i.amount}`,
        date: i.month,
        type: 'Income',
        createdAt: i.createdAt,
      })),
      ...expenses.map((e) => ({
        name: e.name,
        amount: `-${e.amount}`,
        date: e.month,
        type: 'Expense',
        createdAt: e.createdAt,
      })),
    ];

    // Sort by createdAt (latest first)
    transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

export const getChartData = async (req, res) => {
  try {
    const userId = req.user._id;

    const incomeData = await Income.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: "$month",
          totalIncome: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } }
    ]);

    const expenseData = await Expense.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: "$month",
          totalExpense: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ income: incomeData, expense: expenseData });
  } catch (error) {
    console.error(" Error fetching chart data:", error);
    res.status(500).json({ error: "Server Error" });
  }
};
