'use strict';

process.env.JWT_SECRET = 'test_secret_guidebook';

jest.mock('../models/Guideline');
const Guideline = require('../models/Guideline');
const request   = require('supertest');
const app       = require('../app');

const fakeGuidelines = [
  { _id: 'g1', title: 'Know Your Course Policies',     description: 'Always check...' },
  { _id: 'g2', title: 'Supplement, Don\'t Substitute', description: 'AI is a tool...' },
  { _id: 'g3', title: 'Verify Everything',             description: 'AI can hallucinate...' },
];

describe('GET /api/guidelines', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 with array of guidelines', async () => {
    Guideline.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue(fakeGuidelines)
    });
    const res = await request(app).get('/api/guidelines');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });

  test('each guideline has title and description', async () => {
    Guideline.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue(fakeGuidelines)
    });
    const res = await request(app).get('/api/guidelines');
    res.body.forEach(g => {
      expect(g).toHaveProperty('title');
      expect(g).toHaveProperty('description');
    });
  });

  test('200 with empty array when no guidelines exist', async () => {
    Guideline.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([])
    });
    const res = await request(app).get('/api/guidelines');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('guidelines fetched without any filter (public route)', async () => {
    Guideline.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([])
    });
    await request(app).get('/api/guidelines');
    expect(Guideline.find).toHaveBeenCalledWith({});
  });

  test('guidelines sorted by createdAt descending', async () => {
    const sortMock = jest.fn().mockResolvedValue([]);
    Guideline.find = jest.fn().mockReturnValue({ sort: sortMock });
    await request(app).get('/api/guidelines');
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
  });

  test('500 on unexpected DB error', async () => {
    Guideline.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockRejectedValue(new Error('DB crash'))
    });
    const res = await request(app).get('/api/guidelines');
    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/server error/i);
  });

  test('endpoint is publicly accessible without token', async () => {
    Guideline.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue(fakeGuidelines)
    });
    const res = await request(app).get('/api/guidelines');
    expect(res.status).toBe(200);
  });
});
