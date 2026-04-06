'use strict';

process.env.JWT_SECRET = 'test_secret_guidebook';

const jwt = require('jsonwebtoken');

jest.mock('../models/User');
const User    = require('../models/User');
const request = require('supertest');
const app     = require('../app');

const fakeUser = (overrides = {}) => ({
  _id:             'fake_id_123',
  username:        'jorge',
  comparePassword: jest.fn().mockResolvedValue(true),
  ...overrides,
});

describe('POST /api/auth/register', () => {
  beforeEach(() => jest.clearAllMocks());

  test('400 when username is missing', async () => {
    const res = await request(app).post('/api/auth/register').send({ password: 'secret99' });
    expect(res.status).toBe(400);
  });

  test('400 when password is missing', async () => {
    const res = await request(app).post('/api/auth/register').send({ username: 'jorge' });
    expect(res.status).toBe(400);
  });

  test('400 when body is empty', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
  });

  test('400 when username is already taken', async () => {
    User.findOne.mockResolvedValue(fakeUser());
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'jorge', password: 'password99' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/taken|already/i);
  });

  test('201 with token on successful registration', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue(fakeUser());
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'newuser', password: 'password99' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe('jorge');
  });

  test('registration token is a valid JWT', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue(fakeUser());
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'newuser', password: 'password99' });
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decoded.userId).toBe('fake_id_123');
    expect(decoded.username).toBe('jorge');
  });

  test('400 on Mongoose ValidationError', async () => {
    User.findOne.mockResolvedValue(null);
    const validationError = Object.assign(new Error('Validation failed'), {
      name:   'ValidationError',
      errors: { password: { message: 'Oops! Your password is too short.' } },
    });
    User.create.mockRejectedValue(validationError);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'newuser', password: 'ab' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/short/i);
  });

  test('500 on unexpected server error', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockRejectedValue(new Error('DB crashed'));
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'newuser', password: 'password99' });
    expect(res.status).toBe(500);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(() => jest.clearAllMocks());

  test('400 when username is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: 'pass' });
    expect(res.status).toBe(400);
  });

  test('400 when password is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'jorge' });
    expect(res.status).toBe(400);
  });

  test('400 when body is empty', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });

  test('401 when user does not exist', async () => {
    User.findOne.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'ghost', password: 'anything' });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid username or password.');
  });

  test('401 when password does not match', async () => {
    User.findOne.mockResolvedValue(
      fakeUser({ comparePassword: jest.fn().mockResolvedValue(false) })
    );
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'jorge', password: 'wrongpass' });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid username or password.');
  });

  test('username enumeration: missing user and wrong password return same message', async () => {
    User.findOne.mockResolvedValue(null);
    const r1 = await request(app)
      .post('/api/auth/login').send({ username: 'ghost', password: 'p' });
    User.findOne.mockResolvedValue(
      fakeUser({ comparePassword: jest.fn().mockResolvedValue(false) })
    );
    const r2 = await request(app)
      .post('/api/auth/login').send({ username: 'jorge', password: 'wrong' });
    expect(r1.body.message).toBe(r2.body.message);
  });

  test('200 with token on successful login', async () => {
    User.findOne.mockResolvedValue(fakeUser());
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'jorge', password: 'password99' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('login token carries correct userId and username', async () => {
    User.findOne.mockResolvedValue(fakeUser());
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'jorge', password: 'password99' });
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decoded.userId).toBe('fake_id_123');
    expect(decoded.username).toBe('jorge');
  });

  test('500 on unexpected DB error', async () => {
    User.findOne.mockRejectedValue(new Error('Connection lost'));
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'jorge', password: 'password99' });
    expect(res.status).toBe(500);
  });
});
