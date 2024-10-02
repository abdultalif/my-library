import request from 'supertest';
import { BookModel } from '../src/model/book-model';
import createServer from '../src/utils/server';
import { validation } from '../src/validation/validate';
import { generateCode } from '../src/utils/code-generator';

const app = createServer();

jest.mock('../src/model/book-model');
jest.mock('../src/utils/code-generator');
jest.mock('../src/validation/validate');

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

describe('POST /api/v1/books', () => {
  const mockBookCreate = BookModel.create as jest.Mock;
  const mockBookFindOne = BookModel.findOne as jest.Mock;
  const mockGenerateCode = generateCode as jest.Mock;
  const mockValidate = validation.validate as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return 201 status code', async () => {
    const mockRequestData = {
      title: 'One Piece',
      author: 'Eichiro Oda',
      stock: 10,
    };

    const mockBook = { title: 'One Piece', author: 'Eichiro Oda', stock: 10 };

    mockValidate.mockResolvedValue(mockRequestData);
    mockBookFindOne.mockResolvedValue(null);
    mockGenerateCode.mockResolvedValue('B001');
    mockBookCreate.mockResolvedValue(mockBook);

    const response = await request(app).post('/api/v1/books').send(mockRequestData);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Book added successfully');
    expect(mockValidate).toHaveBeenCalledWith(expect.anything(), mockRequestData);
    expect(mockBookFindOne).toHaveBeenCalledWith({ title: 'One Piece' });
    expect(mockGenerateCode).toHaveBeenCalledWith(BookModel, 'B');
    expect(mockBookCreate).toHaveBeenCalledWith({ code: 'B001', ...mockRequestData });
  });

  it('should return 409 status code', async () => {
    const mockRequestData = {
      title: 'One Piece',
      author: 'Eichiro Oda',
      stock: 10,
    };

    mockValidate.mockResolvedValue(mockRequestData);
    mockBookFindOne.mockResolvedValue({ title: 'One Piece' });

    const response = await request(app).post('/api/v1/books').send(mockRequestData);

    expect(response.status).toBe(409);
    expect(response.body.status).toBe('Failed');
    expect(response.body.errors).toBe('Book already exist');
    expect(mockBookFindOne).toHaveBeenCalledWith({ title: 'One Piece' });
  });

  it('should return 500 status code', async () => {
    const mockRequestData = {
      title: 'One Piece',
      author: 'Eichiro Oda',
      stock: 10,
    };

    mockValidate.mockRejectedValue(new Error('Validation failed'));

    const response = await request(app).post('/api/v1/books').send(mockRequestData);

    expect(response.status).toBe(500);
    expect(response.body.status).toBe('failed');
    expect(response.body.errors).toBe('Validation failed');
    expect(mockValidate).toHaveBeenCalledWith(expect.anything(), mockRequestData);
  });
});

describe('DELETE /api/v1/books/{code}', () => {
  const mockBookFindOne = BookModel.findOne as jest.Mock;
  const mockBookDelete = BookModel.deleteOne as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return 200 status code', async () => {
    const mockCode = 'B001';
    mockBookFindOne.mockResolvedValue({ code: mockCode });
    mockBookDelete.mockResolvedValue({ deletedCount: 1 });

    const response = await request(app).delete(`/api/v1/books/${mockCode}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Book deleted successfully');
    expect(mockBookFindOne).toHaveBeenCalledWith({ code: mockCode });
    expect(mockBookDelete).toHaveBeenCalledWith({ code: mockCode });
  });

  it('should return 404 status code', async () => {
    const mockCode = 'B001';
    mockBookFindOne.mockResolvedValue(null);

    const response = await request(app).delete(`/api/v1/books/${mockCode}`);

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('Failed');
    expect(response.body.errors).toBe('Book not found');
    expect(mockBookFindOne).toHaveBeenCalledWith({ code: mockCode });
  });

  it('should return 500 status code', async () => {
    mockBookFindOne.mockRejectedValue(new Error('Database connection failed'));

    const response = await request(app).delete('/api/v1/books/B001');

    expect(response.status).toBe(500);
    expect(response.body.status).toBe('failed');
    expect(response.body.errors).toBe('Database connection failed');
  });
});

// describe('PATCH /api/v1/books/{code}', () => {
//   const mockBookFindOne = BookModel.findOne as jest.Mock;
//   const mockBookUpdateOne = BookModel.updateOne as jest.Mock;
//   const mockValidate = validation.validate as jest.Mock;

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   afterEach(() => {
//     jest.restoreAllMocks();
//   });

//   it('should return 200 status code', async () => {
//     const mockCode = "B001";

//     mockBookFindOne.mockResolvedValue(mockCode);
//     mockBookUpdateOne
//   });
// });
