import { UserModel } from '../model/user-model';
import logger from '../utils/logging';
import '../utils/connectDB';

const seedMembers = async () => {
  try {
    const members = [
      {
        code: 'U001',
        name: 'Abdul',
        email: 'abdultalif85@gmail.com',
        password: '$2b$10$AQtV9nzp.YR/XDvSgZ9lMuVqTwLx.JJNuMe1T80Tb0V.PLzIQw1xq',
        role: 'Admin',
        borrowedBooks: [],
        penaltyUntil: null,
      },
      {
        code: 'U002',
        name: 'Talif',
        email: 'abdultalif75@gmail.com',
        password: '$2b$10$AQtV9nzp.YR/XDvSgZ9lMuVqTwLx.JJNuMe1T80Tb0V.PLzIQw1xq',
        role: 'Member',
        borrowedBooks: [],
        penaltyUntil: null,
      },
    ];

    await UserModel.deleteMany({});
    await UserModel.insertMany(members);
    logger.info('Members seeding completed successfully!');
  } catch (error) {
    logger.error('Seeding members failed', error);
  }
};

seedMembers();
