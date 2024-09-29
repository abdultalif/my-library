# Tech Stack

NodeJS, ExpressJS, TypeScript Mongoose, Swagger, Jest, Super Test, Nodemon

# Features

- Menampilkan data buku
- Menampilkan data member
- Member meminjam buku
- Member mengembalikan buku

## API Documentation/Swagger

- [API-Docs/Swagger](https://library-managements.vercel.app/api-docs)


# Backend Environment Variables

Untuk menjalankan projek ini, kamu perlu menambahkkan environment variables berikut ke dalam file .env di backend

`MONGODB`

# Menjalankan Projek di Lokal

## Menjalankan backend

Clone projek github

```bash
  git clone https://github.com/abdultalif/technical-test-backend.git
```

Buka direktori project

```bash
  cd .\technical-test-backend\
```

Install dependencies backend

```bash
  yarn install
```
Seed database

```bash
  yarn seed:books && yarn seed:members
```

Jalankan server

```bash
  yarn dev
```

# Menjalankan Unit Testing

Clone projek github

```bash
    git clone https://github.com/abdultalif/technical-test-backend.git
```

Buka direktori project

```bash
  cd .\technical-test-backend\
```
Jalankan unit test

```bash
  yarn test
```
