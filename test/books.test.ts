import request from 'supertest';
import { app } from '../src/index';
import { BookModel } from '../src/model/book-model';

jest.mock('../src/model/book-model');

describe('GET /api/v1/books', () => {
  const mockBookFind = BookModel.find as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return 200 status code and the correct books data', async () => {
    const mockBooks = [
      { _id: '66f7cd7a2deeff6ffddc184c', code: 'B001', title: 'One Piece', author: 'Eichiro Oda', stock: 10 },
      { _id: '66f7cd7a2ddudhu736732239', code: 'B002', title: 'Dragon Ball', author: 'Akira Toriyama', stock: 5 },
    ];

    mockBookFind.mockResolvedValue(mockBooks);

    const response = await request(app).get('/api/v1/books');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Books checked successfully');
    expect(response.body.data).toEqual(mockBooks);
  });

  it('should return 404 status code when no books found', async () => {
    mockBookFind.mockResolvedValue([]);

    const response = await request(app).get('/api/v1/books');

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('Failed');
    expect(response.body.errors).toBe('Books not found');
  });

  it('should return 500 status code on server error', async () => {
    mockBookFind.mockRejectedValue(new Error('Database connection failed'));

    const response = await request(app).get('/api/v1/books');

    expect(response.status).toBe(500);
    expect(response.body.status).toBe('failed');
    expect(response.body.errors).toBe('Database connection failed');
  });
});

describe('GET /api/v1/book', () => {
  const mockBookFind = BookModel.find as jest.Mock;
  const mockBookFindOne = BookModel.findOne as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return 200 status code and the correct books data', async () => {
    const mockBooks = {
      _id: '66f7cd7a2deeff6ffddc184c',
      code: 'B001',
      title: 'One Piece',
      author: 'Eichiro Oda',
      stock: 10,
    };

    mockBookFindOne.mockResolvedValue(mockBooks);

    const response = await request(app).get('/api/v1/books/B001');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Book checked successfully');
    expect(response.body.data).toEqual(mockBooks);
  });

  it('should return 404 status code when no books found', async () => {
    mockBookFindOne.mockResolvedValue(null);

    const response = await request(app).get('/api/v1/books/B009');

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('Failed');
    expect(response.body.errors).toBe('Book not found');
  });

  it('should return 500 status code on server error', async () => {
    mockBookFind.mockRejectedValue(new Error('Database connection failed'));

    const response = await request(app).get('/api/v1/books');

    expect(response.status).toBe(500);
    expect(response.body.status).toBe('failed');
    expect(response.body.errors).toBe('Database connection failed');
  });
});
