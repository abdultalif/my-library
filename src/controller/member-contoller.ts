import { NextFunction, Request, Response } from 'express';
import { Member } from '../model/member-model';
import { Book } from '../model/book-model';
import { ResponseError } from '../error/response-error';
import { validation } from '../validation/validate';
import { schemaValidation } from '../validation/validation';

export const borrowBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validateData = await validation.validate(schemaValidation, req.body);

    const { memberCode, bookCodes } = validateData;

    const member = await Member.findOne({ code: memberCode });

    if (!member) throw new ResponseError('Failed', 404, 'Member not found');

    if (member.penaltyUntil && member.penaltyUntil > new Date()) {
      throw new ResponseError('Failed', 403, 'Member is penalized');
    }

    if (member.borrowedBooks.length + bookCodes.length > 2) {
      throw new ResponseError('Failed', 403, 'Member cannot borrow more than 2 books in total');
    }

    const borrowedBooks = [];

    for (const bookCode of bookCodes) {
      const book = await Book.findOne({ code: bookCode });
      if (!book) throw new ResponseError('Failed', 404, `Book with code ${bookCode} not found`);
      if (book.stock < 1) throw new ResponseError('Failed', 400, `Book with code ${bookCode} is out of stock`);

      member.borrowedBooks.push({ bookCode: book.code, borrowedAt: new Date() });
      book.stock -= 1;
      borrowedBooks.push(bookCode);

      await book.save();
    }

    await member.save();

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

    const { memberCode, bookCodes } = validateData;

    const member = await Member.findOne({ code: memberCode });

    if (!member) throw new ResponseError('Failed', 404, 'Member not found');

    const booksToReturn = [];
    const returnedBooks = [];

    for (const bookCode of bookCodes) {
      const book = await Book.findOne({ code: bookCode });
      if (!book) {
        throw new ResponseError('Failed', 404, `Book with code ${bookCode} not found`);
      }

      const borrowedBook = member.borrowedBooks.find((borrow) => borrow.bookCode === bookCode);
      if (!borrowedBook) {
        throw new ResponseError('Failed', 400, `Book with code ${bookCode} was not borrowed by this member`);
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
        member.penaltyUntil = new Date(currentDate.getTime() + triDays);
      }

      member.borrowedBooks = member.borrowedBooks.filter((borrow) => borrow.bookCode !== book.code);
      book.stock += 1;

      await book.save();
      returnedBooks.push(book.code);
    }

    await member.save();

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
    const members = await Member.find().populate('borrowedBooks');

    if (members.length === 0) throw new ResponseError('Failed', 404, 'Members not found');

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Members checked successfully',
      data: members,
    });
  } catch (error) {
    next(error);
  }
};
