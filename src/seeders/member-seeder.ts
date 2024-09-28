import { Member } from '../model/member-model';
import logger from '../utils/logging';
import '../utils/connectDB';

const seedMembers = async () => {
  try {
    const members = [
      {
        code: 'M001',
        name: 'Abdul',
        borrowedBooks: [],
        penaltyUntil: null,
      },
      {
        code: 'M002',
        name: 'Talif',
        borrowedBooks: [],
        penaltyUntil: null,
      },
      {
        code: 'M003',
        name: 'Parinduri',
        borrowedBooks: [],
        penaltyUntil: null,
      },
    ];

    await Member.deleteMany({});
    await Member.insertMany(members);
    logger.info('Members seeding completed successfully!');
  } catch (error) {
    logger.error('Seeding members failed', error);
  }
};

seedMembers();
