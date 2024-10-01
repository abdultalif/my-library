import { MemberModel } from '../model/member-model';
import logger from '../utils/logging';
import '../utils/connectDB';

const seedMembers = async () => {
  try {
    const members = [
      {
        code: 'M001',
        name: 'Abdul',
        email: 'abdul@gmail.com',
        password: '$2b$10$AQtV9nzp.YR/XDvSgZ9lMuVqTwLx.JJNuMe1T80Tb0V.PLzIQw1xq',
        borrowedBooks: [],
        penaltyUntil: null,
      },
      {
        code: 'M002',
        name: 'Talif',
        email: 'talif@gmail.com',
        password: '$2b$10$AQtV9nzp.YR/XDvSgZ9lMuVqTwLx.JJNuMe1T80Tb0V.PLzIQw1xq',
        borrowedBooks: [],
        penaltyUntil: null,
      },
    ];

    await MemberModel.deleteMany({});
    await MemberModel.insertMany(members);
    logger.info('Members seeding completed successfully!');
  } catch (error) {
    logger.error('Seeding members failed', error);
  }
};

seedMembers();
