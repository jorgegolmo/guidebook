'use strict';

process.env.JWT_SECRET = 'test_secret_guidebook';

const jwt        = require('jsonwebtoken');
const { protect } = require('../middlewares/authMiddleware');

const makeReq = (authHeader) => ({
  headers: authHeader !== undefined ? { authorization: authHeader } : {},
});

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

const sign = (payload, opts = {}) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h', ...opts });

describe('authMiddleware › protect()', () => {
  let next;
  beforeEach(() => { next = jest.fn(); });

  test('no Authorization header → 401, next not called', () => {
    const res = makeRes();
    protect(makeReq(undefined), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('empty Authorization header → 401', () => {
    const res = makeRes();
    protect(makeReq(''), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('header without Bearer prefix → 401', () => {
    const res = makeRes();
    protect(makeReq('Token abc123'), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('"Bearer " with no token value → 401', () => {
    const res = makeRes();
    protect(makeReq('Bearer '), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('malformed token string → 401', () => {
    const res = makeRes();
    protect(makeReq('Bearer not.a.valid.token'), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('token signed with wrong secret → 401', () => {
    const badToken = jwt.sign({ userId: 'x', username: 'u' }, 'wrong_secret');
    const res = makeRes();
    protect(makeReq(`Bearer ${badToken}`), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('expired token → 401', () => {
    const expired = sign({ userId: 'x', username: 'u' }, { expiresIn: -10 });
    const res = makeRes();
    protect(makeReq(`Bearer ${expired}`), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('missing JWT_SECRET → 500', () => {
    const saved = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    const token = jwt.sign({ userId: 'x' }, 'any');
    const res   = makeRes();
    protect(makeReq(`Bearer ${token}`), res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(next).not.toHaveBeenCalled();
    process.env.JWT_SECRET = saved;
  });

  test('valid token → attaches req.user and calls next()', () => {
    const token = sign({ userId: 'uid_42', username: 'jorge' });
    const req   = makeReq(`Bearer ${token}`);
    const res   = makeRes();
    protect(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual({ userId: 'uid_42', username: 'jorge' });
    expect(res.status).not.toHaveBeenCalled();
  });

  test('valid token → req.user has only userId and username', () => {
    const token = sign({ userId: 'u1', username: 'raquel', role: 'admin' });
    const req   = makeReq(`Bearer ${token}`);
    const res   = makeRes();
    protect(req, res, next);
    expect(req.user).toEqual({ userId: 'u1', username: 'raquel' });
  });

  test('401 path returns a value so Express does not hang', () => {
    const res    = makeRes();
    const retVal = protect(makeReq(undefined), res, next);
    expect(retVal).toBe(res);
  });
});
