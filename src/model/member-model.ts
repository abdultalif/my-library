import { Schema, model } from 'mongoose';
import { IBorrowedBook, IMember } from '../types/members';

const BorrowedBookSchema = new Schema<IBorrowedBook>({
  bookCode: { type: String, required: true },
  borrowedAt: { type: Date, default: Date.now },
});

const MemberSchema = new Schema<IMember>({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  borrowedBooks: [BorrowedBookSchema],
  penaltyUntil: { type: Date, default: null },
});

export const Member = model<IMember>('Member', MemberSchema);
