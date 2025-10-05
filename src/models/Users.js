import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please provide a phone number'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
  card: {
    cardHolder: String,
    cardNumber: String,
    expiryDate: String,
    cvv: String,
    cardType: String,
    balance: { type: Number, default: 0 },
  },
  transactions: [
    {
      name: String,
      amount: String,
      type: String,
      date: String,
    },
  ],
  goals: [
  {
    name: { type: String, required: true },
    target: { type: Number, required: true },
    saved: { type: Number, default: 0 },
  }
],

});



userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
