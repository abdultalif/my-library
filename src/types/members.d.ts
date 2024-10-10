import { Document } from 'mongoose';

export interface IBorrowedBook {
  bookCode: string;
  borrowedAt: Date;
}

export interface IUser extends Document {
  code: string;
  name: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  tokenResetPassword: string | null;
  borrowedBooks: IBorrowedBook[];
  penaltyUntil: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}
