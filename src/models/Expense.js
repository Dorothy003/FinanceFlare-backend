import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a title for this expense'],
    },
    amount: {
      type: Number,
      required: [true, 'Please enter the amount'],
    },
    category: {
      type: String,
      required: [true, 'Please enter a category'],
    },
    month: {
      type: String,
      required: [true, 'Please enter the month'],
    },
  },
  { timestamps: true }
);

export default mongoose.model('Expense', expenseSchema);
