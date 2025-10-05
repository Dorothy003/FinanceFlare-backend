import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a source name'],
    },
    amount: {
      type: Number,
      required: [true, 'Please enter the amount'],
    },
    month: {
      type: String,
      required: [true, 'Please enter the month'],
    },
  },
  { timestamps: true }
);

export default mongoose.model('Income', incomeSchema);
