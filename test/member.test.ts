import request from 'supertest';
import { MemberModel } from '../src/model/member-model';
import { BookModel } from '../src/model/book-model';
import createServer from '../src/utils/server';
import { ResponseError } from '../src/error/response-error';

const app = createServer();
jest.mock('../src/model/book-model');
jest.mock('../src/model/member-model');

describe('GET /api/v1/members', () => {
  const mockMemberFind = MemberModel.find as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return 200 status code', async () => {
    const mockMembers = [
      { _id: '66f7cd6d34c9319518366d84', code: 'M002', name: 'Talif', penaltyUntil: null, __v: 0 },
      { _id: '66f7cd6d34c9319518366d85', code: 'M003', name: 'Parinduri', penaltyUntil: null, __v: 0 },
      { _id: '66f7cd6d34c9319518366d83', code: 'M001', name: 'Abdul', penaltyUntil: null, __v: 0 },
    ];

    const mockPopulate = jest.fn().mockResolvedValue(mockMembers);
    mockMemberFind.mockReturnValue({ populate: mockPopulate });

    const response = await request(app).get('/api/v1/members');

    expect(response.body.status).toBe('success');
    expect(response.body.statusCode).toBe(200);
    expect(response.body.message).toBe('Members checked successfully');
    expect(response.body.data).toEqual(mockMembers);
  });

  it('should return 404 status code', async () => {
    const mockPopulate = jest.fn().mockResolvedValue([]);
    mockMemberFind.mockReturnValue({ populate: mockPopulate });

    const response = await request(app).get('/api/v1/members');

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('Failed');
    expect(response.body.errors).toBe('Members not found');
  });

  it('should return 500 status code', async () => {
    const mockPopulate = jest.fn().mockRejectedValue(new ResponseError('Failed', 500, 'Database connection failed'));
    mockMemberFind.mockReturnValue({ populate: mockPopulate });

    const response = await request(app).get('/api/v1/members');

    expect(response.status).toBe(500);
    expect(response.body.status).toBe('Failed');
    expect(response.body.errors).toBe('Database connection failed');
  });
});

describe('POST /api/v1/borrow', () => {
  const mockMemberFindOne = MemberModel.findOne as jest.Mock;
  const mockBookFindOne = BookModel.findOne as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return 404 if member is not found', async () => {
    mockMemberFindOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/borrow')
      .send({ memberCode: 'M001', bookCodes: ['B001'] });

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('Failed');
    expect(res.body.errors).toBe('Member not found');
  });

  it('should return 403 if member is penalized', async () => {
    const member = {
      _id: '66f7cd6d34c9319518366d84',
      code: 'M001',
      name: 'Talif',
      borrowedBooks: [],
      penaltyUntil: new Date(Date.now() + 1000 * 60 * 60 * 24),
    };
    mockMemberFindOne.mockResolvedValue(member);

    const res = await request(app)
      .post('/api/v1/borrow')
      .send({ memberCode: 'M001', bookCodes: ['B001'] });

    expect(res.status).toBe(403);
    expect(res.body.status).toBe('Failed');
    expect(res.body.errors).toBe('Member is penalized');
  });

  it('should return 403 if member has borrowed more than 2 books', async () => {
    const member = {
      _id: '66f7cd6d34c9319518366d84',
      code: 'M001',
      name: 'Talif',
      borrowedBooks: [{ bookCode: 'B003', borrowedAt: new Date() }],
      penaltyUntil: null,
    };
    mockMemberFindOne.mockResolvedValue(member);

    const res = await request(app)
      .post('/api/v1/borrow')
      .send({ memberCode: 'M001', bookCodes: ['B001', 'B002', 'B004'] });

    expect(res.status).toBe(403);
    expect(res.body.status).toBe('Failed');
    expect(res.body.errors).toBe('Member cannot borrow more than 2 books in total');
  });

  it('should return 404 if a book is not found', async () => {
    const member = {
      _id: '66f7cd6d34c9319518366d84',
      code: 'M001',
      name: 'Talif',
      borrowedBooks: [],
      penaltyUntil: null,
    };
    mockMemberFindOne.mockResolvedValue(member);

    mockBookFindOne.mockResolvedValueOnce(null);

    const res = await request(app)
      .post('/api/v1/borrow')
      .send({ memberCode: 'M001', bookCodes: ['B001'] });

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('Failed');
    expect(res.body.errors).toBe('Book with code B001 not found');
  });

  it('should return 400 if a book is out of stock', async () => {
    const member = {
      _id: '66f7cd6d34c9319518366d84',
      code: 'M001',
      name: 'Talif',
      borrowedBooks: [],
      penaltyUntil: null,
    };
    mockMemberFindOne.mockResolvedValue(member);

    const bookOutOfStock = {
      _id: '66f7cd7a2deeff6ffddc184a',
      code: 'B001',
      title: 'One Piece',
      author: 'Eichiro Oda',
      stock: 0,
      save: jest.fn(),
    };
    mockBookFindOne.mockResolvedValueOnce(bookOutOfStock);

    const res = await request(app)
      .post('/api/v1/borrow')
      .send({ memberCode: 'M001', bookCodes: ['B001'] });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('Failed');
    expect(res.body.errors).toBe('Book with code B001 is out of stock');
  });

  it('should return 200 status code', async () => {
    const member = {
      _id: '66f7cd6d34c9319518366d84',
      code: 'M001',
      name: 'Talif',
      borrowedBooks: [],
      penaltyUntil: null,
      __v: 0,
      save: jest.fn(),
    };
    mockMemberFindOne.mockResolvedValue(member);

    const book1 = {
      _id: '66f7cd7a2deeff6ffddc184c',
      code: 'B001',
      title: 'Dragon Ball',
      author: 'Akira Toriyama',
      stock: 6,
      __v: 0,
      save: jest.fn(),
    };
    const book2 = {
      _id: '66f7cd7a2deeff6ffddc184a',
      code: 'B002',
      title: 'One Piece',
      author: 'Eichiro Oda',
      stock: 4,
      __v: 0,
      save: jest.fn(),
    };

    mockBookFindOne.mockResolvedValueOnce(book1).mockResolvedValueOnce(book2);

    const res = await request(app)
      .post('/api/v1/borrow')
      .send({ memberCode: 'M001', bookCodes: ['B001', 'B002'] });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.message).toBe('Books borrowed successfully: B001, B002');
  });
});

describe('POST /api/v1/return', () => {
  const mockMemberFindOne = MemberModel.findOne as jest.Mock;
  const mockBookFindOne = BookModel.findOne as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return 404 if member is not found', async () => {
    mockMemberFindOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/return')
      .send({ memberCode: 'M001', bookCodes: ['B001'] });

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('Failed');
    expect(res.body.errors).toBe('Member not found');
  });

  it('should return 404 if a book is not found', async () => {
    const member = {
      _id: '66f7cd6d34c9319518366d84',
      code: 'M001',
      name: 'Talif',
      borrowedBooks: [{ bookCode: 'B001', borrowedAt: new Date() }],
    };
    mockMemberFindOne.mockResolvedValue(member);
    mockBookFindOne.mockResolvedValue(null); // Book not found

    const res = await request(app)
      .post('/api/v1/return')
      .send({ memberCode: 'M001', bookCodes: ['B001'] });

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('Failed');
    expect(res.body.errors).toBe('Book with code B001 not found');
  });

  it('should return 400 if book was not borrowed by member', async () => {
    const member = {
      _id: '66f7cd6d34c9319518366d84',
      code: 'M001',
      name: 'Talif',
      borrowedBooks: [],
    };
    mockMemberFindOne.mockResolvedValue(member);

    const book = {
      _id: '66f7cd7a2deeff6ffddc184a',
      code: 'B001',
      title: 'One Piece',
      author: 'Eichiro Oda',
      stock: 5,
      save: jest.fn(),
    };
    mockBookFindOne.mockResolvedValue(book);

    const res = await request(app)
      .post('/api/v1/return')
      .send({ memberCode: 'M001', bookCodes: ['B001'] });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('Failed');
    expect(res.body.errors).toBe('Book with code B001 was not borrowed by this member');
  });

  it('should impose a penalty if book is returned after 7 days', async () => {
    const borrowedAt = new Date();
    borrowedAt.setDate(borrowedAt.getDate() - 10);

    const member = {
      _id: '66f7cd6d34c9319518366d84',
      code: 'M001',
      name: 'Talif',
      borrowedBooks: [{ bookCode: 'B001', borrowedAt }],
      penaltyUntil: null,
      save: jest.fn(),
    };
    mockMemberFindOne.mockResolvedValue(member);

    const book = {
      _id: '66f7cd7a2deeff6ffddc184a',
      code: 'B001',
      title: 'One Piece',
      author: 'Eichiro Oda',
      stock: 5,
      save: jest.fn(),
    };
    mockBookFindOne.mockResolvedValue(book);

    const res = await request(app)
      .post('/api/v1/return')
      .send({ memberCode: 'M001', bookCodes: ['B001'] });

    expect(res.status).toBe(200);
    expect(member.penaltyUntil).toBeInstanceOf(Date);
    expect(res.body.status).toBe('success');
    expect(res.body.message).toBe('Books returned successfully: B001');
  });

  it('should return 200 and successfully return books without penalty', async () => {
    const borrowedAt = new Date();
    borrowedAt.setDate(borrowedAt.getDate() - 5);

    const member = {
      _id: '66f7cd6d34c9319518366d84',
      code: 'M001',
      name: 'Talif',
      borrowedBooks: [{ bookCode: 'B001', borrowedAt }],
      penaltyUntil: null,
      save: jest.fn(),
    };
    mockMemberFindOne.mockResolvedValue(member);

    const book = {
      _id: '66f7cd7a2deeff6ffddc184a',
      code: 'B001',
      title: 'One Piece',
      author: 'Eichiro Oda',
      stock: 5,
      save: jest.fn(),
    };
    mockBookFindOne.mockResolvedValue(book);

    const res = await request(app)
      .post('/api/v1/return')
      .send({ memberCode: 'M001', bookCodes: ['B001'] });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.message).toBe('Books returned successfully: B001');
    expect(book.stock).toBe(6);
    expect(member.borrowedBooks.length).toBe(0);
  });
});
