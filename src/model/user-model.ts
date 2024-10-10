import { Schema, model } from 'mongoose';
import { IBorrowedBook, IUser } from '../types/members';

const BorrowedBookSchema = new Schema<IBorrowedBook>({
  bookCode: { type: String, required: true },
  borrowedAt: { type: Date, default: Date.now },
});

const UserSchema = new Schema<IUser>(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Member' },
    isActive: { type: Boolean, default: false },
    tokenResetPassword: { type: String, default: null },
    borrowedBooks: [BorrowedBookSchema],
    penaltyUntil: { type: Date, default: null },
  },
  { timestamps: true },
);

export const UserModel = model<IUser>('User', UserSchema);
