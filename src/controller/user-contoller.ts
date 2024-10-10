import { NextFunction, Request, Response } from 'express';
import { UserModel } from '../model/user-model';
import { BookModel } from '../model/book-model';
import { ResponseError } from '../error/response-error';
import { validation } from '../validation/validate';
import { schemaValidation } from '../validation/validation';

export const borrowBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validateData = await validation.validate(schemaValidation, req.body);

    const { userCode, bookCodes } = validateData;

    const user = await UserModel.findOne({ code: userCode });

    if (!user) throw new ResponseError('Failed', 404, 'Member not found');

    if (user.penaltyUntil && user.penaltyUntil > new Date()) {
      throw new ResponseError('Failed', 403, 'Member is penalized');
    }

    if (user.borrowedBooks.length + bookCodes.length > 2) {
      throw new ResponseError('Failed', 403, 'User cannot borrow more than 2 books in total');
    }

    const borrowedBooks = [];

    for (const bookCode of bookCodes) {
      const book = await BookModel.findOne({ code: bookCode });
      if (!book) throw new ResponseError('Failed', 404, `Book with code ${bookCode} not found`);
      if (book.stock < 1) throw new ResponseError('Failed', 400, `Book with code ${bookCode} is out of stock`);

      user.borrowedBooks.push({ bookCode: book.code, borrowedAt: new Date() });
      book.stock -= 1;
      borrowedBooks.push(bookCode);

      await book.save();
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: `Books borrowed successfully: ${borrowedBooks.join(', ')}`,
    });
  } catch (error) {
    next(error);
  }
};

export const returnBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validateData = await validation.validate(schemaValidation, req.body);

    const { userCode, bookCodes } = validateData;

    const user = await UserModel.findOne({ code: userCode });

    if (!user) throw new ResponseError('Failed', 404, 'User not found');

    const booksToReturn = [];
    const returnedBooks = [];

    for (const bookCode of bookCodes) {
      const book = await BookModel.findOne({ code: bookCode });
      if (!book) {
        throw new ResponseError('Failed', 404, `Book with code ${bookCode} not found`);
      }

      const borrowedBook = user.borrowedBooks.find((borrow) => borrow.bookCode === bookCode);
      if (!borrowedBook) {
        throw new ResponseError('Failed', 400, `Book with code ${bookCode} was not borrowed by this user`);
      }

      booksToReturn.push({ book, borrowedBook });
    }

    for (const { book, borrowedBook } of booksToReturn) {
      const borrowDate = new Date(borrowedBook.borrowedAt);
      const currentDate = new Date();
      const diffTime = Math.abs(currentDate.getTime() - borrowDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 7) {
        const triDays = 3 * 24 * 60 * 60 * 1000;
        user.penaltyUntil = new Date(currentDate.getTime() + triDays);
      }

      user.borrowedBooks = user.borrowedBooks.filter((borrow) => borrow.bookCode !== book.code);
      book.stock += 1;

      await book.save();
      returnedBooks.push(book.code);
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: `Books returned successfully: ${returnedBooks.join(', ')}`,
    });
  } catch (error) {
    next(error);
  }
};

export const checkMembers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await UserModel.find().populate('borrowedBooks');

    if (users.length === 0) throw new ResponseError('Failed', 404, 'Users not found');

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Users checked successfully',
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
