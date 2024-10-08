import request from 'supertest';
import { BookModel } from '../src/model/book-model';
import createServer from '../src/utils/server';
import { validation } from '../src/validation/validate';
import { generateCode } from '../src/utils/code-generator';
import { ResponseError } from '../src/error/response-error';

const app = createServer();

jest.mock('../src/model/book-model');
jest.mock('../src/utils/code-generator');
jest.mock('../src/validation/validate');

describe('GET /api/v1/books - Get All Books', () => {
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
    mockBookFind.mockRejectedValue(new ResponseError('Failed', 500, 'Database connection failed'));

    const response = await request(app).get('/api/v1/books');

    expect(response.status).toBe(500);
    expect(response.body.status).toBe('Failed');
    expect(response.body.errors).toBe('Database connection failed');
  });
});

describe('GET /api/v1/book - Get Book', () => {
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
    mockBookFind.mockRejectedValue(new ResponseError('Failed', 500, 'Database connection failed'));

    const response = await request(app).get('/api/v1/books');

    expect(response.status).toBe(500);
    expect(response.body.status).toBe('Failed');
    expect(response.body.errors).toBe('Database connection failed');
  });
});

describe('POST /api/v1/books - Add Book', () => {
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

  it('should return 201 status code and the correct data', async () => {
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

  it('should return 400 status code when request data is invalid', async () => {
    const mockRequestData = {
      title: '',
      author: '',
      stock: -3,
    };

    mockValidate.mockRejectedValue(new ResponseError('failed', 400, 'Invalid request data'));

    const response = await request(app).post('/api/v1/books').send(mockRequestData);

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('failed');
    expect(response.body.errors).toBe('Invalid request data');
    expect(mockValidate).toHaveBeenCalledWith(expect.anything(), mockRequestData);
  });

  it('should return 409 status code when book already exist', async () => {
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

  it('should return 500 status code when server error', async () => {
    const mockRequestData = {
      title: 'One Piece',
      author: 'Eichiro Oda',
      stock: 10,
    };

    mockValidate.mockRejectedValue(new Error('Validation failed'));

    const response = await request(app).post('/api/v1/books').send(mockRequestData);

    expect(response.status).toBe(500);
    expect(response.body.status).toBe('Failed');
    expect(response.body.errors).toBe('Validation failed');
    expect(mockValidate).toHaveBeenCalledWith(expect.anything(), mockRequestData);
  });
});

describe('DELETE /api/v1/books/{code} - Delete Book', () => {
  const mockBookFindOne = BookModel.findOne as jest.Mock;
  const mockBookDelete = BookModel.deleteOne as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return 200 status code and the correct data', async () => {
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

  it('should return 404 status code when book not found', async () => {
    const mockCode = 'B001';
    mockBookFindOne.mockResolvedValue(null);

    const response = await request(app).delete(`/api/v1/books/${mockCode}`);

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('Failed');
    expect(response.body.errors).toBe('Book not found');
    expect(mockBookFindOne).toHaveBeenCalledWith({ code: mockCode });
  });

  it('should return 500 status code on server error', async () => {
    mockBookFindOne.mockRejectedValue(new ResponseError('Failed', 500, 'Database connection failed'));

    const response = await request(app).delete('/api/v1/books/B001');

    expect(response.status).toBe(500);
    expect(response.body.status).toBe('Failed');
    expect(response.body.errors).toBe('Database connection failed');
  });
});

describe('PATCH /api/v1/books/{code} - Update Book', () => {
  const mockBookFindOne = BookModel.findOne as jest.Mock;
  const mockBookUpdateOne = BookModel.updateOne as jest.Mock;
  const mockValidate = validation.validate as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return 200 status code and the correct data', async () => {
    const mockCode = 'B001';
    const mockBook = { title: 'One Piece Live Actions' };
    const mockRequestData = { title: 'One Piece', author: 'Eichiro Oda', stock: 10 };

    mockBookFindOne.mockResolvedValue(mockCode);
    mockBookUpdateOne.mockResolvedValue(mockBook);
    mockValidate.mockResolvedValue(mockBook);

    const response = await request(app).patch(`/api/v1/books/${mockCode}`).send(mockRequestData);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Book updated successfully');
    expect(mockValidate).toHaveBeenCalledWith(expect.anything(), mockRequestData);
    expect(mockBookFindOne).toHaveBeenCalledWith({ code: mockCode });
    expect(mockBookUpdateOne).toHaveBeenCalledWith({ code: mockCode }, mockBook);
  });

  it('should return 400 status code when validation failed', async () => {
    const mockCode = 'B001';
    const mockRequestData = {
      title: '',
      author: '',
      stock: -3,
    };

    mockBookFindOne.mockResolvedValue(mockCode);
    mockValidate.mockRejectedValue(new ResponseError('failed', 400, 'Invalid request data'));

    const response = await request(app).patch(`/api/v1/books/${mockCode}`).send(mockRequestData);

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('failed');
    expect(response.body.errors).toBe('Invalid request data');
    expect(mockValidate).toHaveBeenCalledWith(expect.anything(), mockRequestData);
  });

  it('should retun 404 status code when book not found', async () => {
    const mockBook = { title: 'One Piece Live Actions' };
    const mockRequestData = { title: 'One Piece', author: 'Eichiro Oda', stock: 10 };
    mockBookFindOne.mockResolvedValue(null);
    mockValidate.mockResolvedValue(mockBook);
    mockBookUpdateOne.mockResolvedValue(mockBook);

    const response = await request(app)
      .patch('/api/v1/books/' + null)
      .send(mockRequestData);

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('Failed');
    expect(response.body.errors).toBe('Book not found');
  });

  it('should retrun 500 status code on server error', async () => {
    const mockCode = 'B001';
    const mockRequestData = { title: 'One Piece', author: 'Eichiro Oda', stock: 10 };
    mockBookFindOne.mockResolvedValue(mockCode);
    mockValidate.mockResolvedValue(mockRequestData);
    mockBookUpdateOne.mockRejectedValue(new ResponseError('Failed', 500, 'Failed to update book'));

    const response = await request(app).patch(`/api/v1/books/${mockCode}`).send(mockRequestData);

    expect(response.status).toBe(500);
    expect(response.body.status).toBe('Failed');
    expect(response.body.errors).toBe('Failed to update book');
  });
});
