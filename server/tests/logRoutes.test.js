'use strict';

process.env.JWT_SECRET = 'test_secret_guidebook';

const jwt      = require('jsonwebtoken');
const mongoose = require('mongoose');

jest.mock('../models/UsageLog');
const UsageLog = require('../models/UsageLog');
const request  = require('supertest');
const app      = require('../app');

const AUTH_USER_ID = new mongoose.Types.ObjectId().toString();
const validToken   = jwt.sign(
  { userId: AUTH_USER_ID, username: 'jorge' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
const authHeader = `Bearer ${validToken}`;

const fakeSession = (overrides = {}) => ({
  _id:     new mongoose.Types.ObjectId().toString(),
  user:    AUTH_USER_ID,
  title:   'Code Debugging',
  aiModel: 'gemini',
  entries: [],
  save:    jest.fn().mockResolvedValue(true),
  ...overrides,
});

describe('POST /api/logs', () => {
  beforeEach(() => jest.clearAllMocks());

  test('401 when no token is provided', async () => {
    const res = await request(app).post('/api/logs').send({ title: 'Test', aiModel: 'gpt' });
    expect(res.status).toBe(401);
  });

  test('400 when title is missing', async () => {
    const res = await request(app)
      .post('/api/logs')
      .set('Authorization', authHeader)
      .send({ aiModel: 'gpt' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/title/i);
  });

  test('201 with session object on success', async () => {
    UsageLog.create.mockResolvedValue(fakeSession());
    const res = await request(app)
      .post('/api/logs')
      .set('Authorization', authHeader)
      .send({ title: 'Code Debugging', aiModel: 'gemini' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Code Debugging');
  });

  test('aiModel defaults to Unspecified when not provided', async () => {
    UsageLog.create.mockResolvedValue(fakeSession({ aiModel: 'Unspecified' }));
    await request(app)
      .post('/api/logs')
      .set('Authorization', authHeader)
      .send({ title: 'Session without model' });
    expect(UsageLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ aiModel: 'Unspecified' })
    );
  });

  test('session is created with the authenticated user id', async () => {
    UsageLog.create.mockResolvedValue(fakeSession());
    await request(app)
      .post('/api/logs')
      .set('Authorization', authHeader)
      .send({ title: 'My Session', aiModel: 'claude' });
    expect(UsageLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ user: AUTH_USER_ID })
    );
  });

  test('500 on unexpected DB error', async () => {
    UsageLog.create.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .post('/api/logs')
      .set('Authorization', authHeader)
      .send({ title: 'My Session', aiModel: 'gpt' });
    expect(res.status).toBe(500);
  });
});

describe('POST /api/logs/:id/entries', () => {
  const validId = new mongoose.Types.ObjectId().toString();
  beforeEach(() => jest.clearAllMocks());

  test('401 when no token is provided', async () => {
    const res = await request(app)
      .post(`/api/logs/${validId}/entries`)
      .send({ prompt: 'hello' });
    expect(res.status).toBe(401);
  });

  test('400 for an invalid session id', async () => {
    const res = await request(app)
      .post('/api/logs/not-an-id/entries')
      .set('Authorization', authHeader)
      .send({ prompt: 'hello' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid session id/i);
  });

  test('400 when prompt is missing', async () => {
    const res = await request(app)
      .post(`/api/logs/${validId}/entries`)
      .set('Authorization', authHeader)
      .send({ response: 'some response' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/prompt/i);
  });

  test('400 when prompt exceeds 5000 characters', async () => {
    const res = await request(app)
      .post(`/api/logs/${validId}/entries`)
      .set('Authorization', authHeader)
      .send({ prompt: 'a'.repeat(5001) });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/too long/i);
  });

  test('400 when response exceeds 20000 characters', async () => {
    UsageLog.findOne.mockResolvedValue(fakeSession());
    const res = await request(app)
      .post(`/api/logs/${validId}/entries`)
      .set('Authorization', authHeader)
      .send({ prompt: 'ok', response: 'b'.repeat(20001) });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/too long/i);
  });

  test('404 when session does not exist', async () => {
    UsageLog.findOne.mockResolvedValue(null);
    const res = await request(app)
      .post(`/api/logs/${validId}/entries`)
      .set('Authorization', authHeader)
      .send({ prompt: 'hello' });
    expect(res.status).toBe(404);
  });

  test('201 with new entry on success', async () => {
    const entry   = { _id: 'e1', prompt: 'hello', response: 'world', createdAt: new Date() };
    const session = fakeSession({ entries: [entry] });
    UsageLog.findOne.mockResolvedValue(session);
    const res = await request(app)
      .post(`/api/logs/${validId}/entries`)
      .set('Authorization', authHeader)
      .send({ prompt: 'hello', response: 'world' });
    expect(res.status).toBe(201);
    expect(session.save).toHaveBeenCalled();
  });

  test('entry added without response (response is optional)', async () => {
    const entry   = { _id: 'e2', prompt: 'no response', createdAt: new Date() };
    const session = fakeSession({ entries: [entry] });
    UsageLog.findOne.mockResolvedValue(session);
    const res = await request(app)
      .post(`/api/logs/${validId}/entries`)
      .set('Authorization', authHeader)
      .send({ prompt: 'no response' });
    expect(res.status).toBe(201);
  });

  test('500 on unexpected DB error', async () => {
    UsageLog.findOne.mockRejectedValue(new Error('DB crash'));
    const res = await request(app)
      .post(`/api/logs/${validId}/entries`)
      .set('Authorization', authHeader)
      .send({ prompt: 'hello' });
    expect(res.status).toBe(500);
  });
});

describe('GET /api/logs', () => {
  beforeEach(() => jest.clearAllMocks());

  test('401 when no token is provided', async () => {
    const res = await request(app).get('/api/logs');
    expect(res.status).toBe(401);
  });

  test('200 with array of sessions', async () => {
    UsageLog.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([fakeSession(), fakeSession()])
    });
    const res = await request(app).get('/api/logs').set('Authorization', authHeader);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('200 with empty array when no sessions exist', async () => {
    UsageLog.find = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    const res = await request(app).get('/api/logs').set('Authorization', authHeader);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('sessions queried by authenticated user id', async () => {
    UsageLog.find = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    await request(app).get('/api/logs').set('Authorization', authHeader);
    expect(UsageLog.find).toHaveBeenCalledWith({ user: AUTH_USER_ID });
  });

  test('500 on unexpected DB error', async () => {
    UsageLog.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockRejectedValue(new Error('DB crash'))
    });
    const res = await request(app).get('/api/logs').set('Authorization', authHeader);
    expect(res.status).toBe(500);
  });
});

describe('GET /api/logs/:id', () => {
  const validId = new mongoose.Types.ObjectId().toString();
  beforeEach(() => jest.clearAllMocks());

  test('401 when no token is provided', async () => {
    const res = await request(app).get(`/api/logs/${validId}`);
    expect(res.status).toBe(401);
  });

  test('400 for an invalid session id', async () => {
    const res = await request(app)
      .get('/api/logs/bad-id')
      .set('Authorization', authHeader);
    expect(res.status).toBe(400);
  });

  test('404 when session does not exist', async () => {
    UsageLog.findOne.mockResolvedValue(null);
    const res = await request(app)
      .get(`/api/logs/${validId}`)
      .set('Authorization', authHeader);
    expect(res.status).toBe(404);
  });

  test('200 with session data on success', async () => {
    UsageLog.findOne.mockResolvedValue(fakeSession({ _id: validId }));
    const res = await request(app)
      .get(`/api/logs/${validId}`)
      .set('Authorization', authHeader);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Code Debugging');
  });

  test('query includes user id for ownership check', async () => {
    UsageLog.findOne.mockResolvedValue(null);
    await request(app).get(`/api/logs/${validId}`).set('Authorization', authHeader);
    expect(UsageLog.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ user: AUTH_USER_ID })
    );
  });

  test('500 on unexpected DB error', async () => {
    UsageLog.findOne.mockRejectedValue(new Error('DB crash'));
    const res = await request(app)
      .get(`/api/logs/${validId}`)
      .set('Authorization', authHeader);
    expect(res.status).toBe(500);
  });
});
