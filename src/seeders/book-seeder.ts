import { BookModel } from '../model/book-model';
import logger from '../utils/logging';
import '../utils/connectDB';

const seedBooks = async () => {
  try {
    const books = [
      {
        code: 'B001',
        title: 'One Piece',
        author: 'Eichiro Oda',
        stock: 5,
      },
      {
        code: 'B002',
        title: 'Naruto Shippuden',
        author: 'Mamashi Khisimoto',
        stock: 8,
      },
      {
        code: 'B003',
        title: 'Dragon Ball',
        author: 'Akira Toriyama',
        stock: 6,
      },
      {
        code: 'B004',
        title: 'Tokyo Revengers',
        author: 'Ken Wakui',
        stock: 9,
      },
      {
        code: 'B005',
        title: 'Record Of Ragnarok',
        author: 'Shinya Umemura',
        stock: 5,
      },
    ];

    await BookModel.deleteMany({});
    await BookModel.insertMany(books);
    logger.info('Books seeding completed successfully!');
  } catch (error) {
    logger.error('Seeding books failed', error);
  }
};

seedBooks();
