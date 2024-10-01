import { Schema, model } from 'mongoose';
import { IBorrowedBook, IMember } from '../types/members';

const BorrowedBookSchema = new Schema<IBorrowedBook>({
  bookCode: { type: String, required: true },
  borrowedAt: { type: Date, default: Date.now },
});

const MemberSchema = new Schema<IMember>({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },
  tokenResetPassword: { type: String, default: null },
  borrowedBooks: [BorrowedBookSchema],
  penaltyUntil: { type: Date, default: null },
});

export const MemberModel = model<IMember>('Member', MemberSchema);
