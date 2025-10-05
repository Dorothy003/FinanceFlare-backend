//logic for adding goals
import User from '../models/Users.js';
import mongoose from "mongoose";

export const getGoals = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return res.json(user.goals || []);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch goals", error });
  }
};

export const addGoal = async (req, res) => {
  try {
    const { name, target } = req.body;
    const user = await User.findById(req.user._id);

    if (!name || !target || isNaN(target)) {
      return res.status(400).json({ message: "Valid goal name and numeric target required." });
    }

    if (user.goals.length >= 1) {
      return res.status(400).json({ message: "Only one goal allowed at a time." });
    }

    const newGoal = {
      _id: new mongoose.Types.ObjectId(), 
      name,
      target: Number(target),
      saved: 0,
    };

    user.goals.push(newGoal);
    await user.save();

    return res.status(201).json(newGoal);
  } catch (error) {
    return res.status(500).json({ message: "Failed to add goal", error });
  }
};
export const updateGoal = async (req, res) => {
  try {
    const { amount } = req.body;
    const goalId = req.params.goalId;

    const user = await User.findById(req.user._id);
    const goal = user.goals.id(goalId);

    if (!goal) return res.status(404).json({ message: "Goal not found" });

    const contribution = Number(amount);
    if (isNaN(contribution) || contribution <= 0) {
      return res.status(400).json({ message: "Invalid contribution amount" });
    }

    if (goal.saved + contribution > goal.target) {
      return res.status(400).json({ message: "Contribution exceeds goal target" });
    }

    if (user.card.balance < contribution) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    goal.saved += contribution;
    user.card.balance -= contribution;

    user.markModified("goals");
    user.markModified("card");

    await user.save();

    return res.json({ goal, balance: user.card.balance });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update goal", error });
  }
};

// DELETE
export const deleteGoal = async (req, res) => {
  try {
    const goalId = req.params.goalId;
    const user = await User.findById(req.user._id);

    if (!user || !user.goals) {
      return res.status(404).json({ message: "User or goals not found" });
    }

    const goalIndex = user.goals.findIndex(goal => goal._id.toString() === goalId);
    if (goalIndex === -1) {
      return res.status(404).json({ message: "Goal not found" });
    }

    user.goals.splice(goalIndex, 1);
    user.markModified("goals");
    await user.save();

    return res.json({ message: "Goal deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete goal", error });
  }
};
