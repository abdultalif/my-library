import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  token: { type: String, default: null },
  borrowedBooks: [{ type: String }],
  penaltyEndDate: { type: Date, default: null },
});

export const MemberModel = mongoose.model('Member', memberSchema);
