'use strict';

const mockFetch = (body, status = 200) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok:   status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  });
};

const authService      = require('../src/services/authService').default;
const logService       = require('../src/services/logService').default;
const guidelineService = require('../src/services/guidelineService').default;

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('register()', () => {
    test('calls register endpoint with POST', async () => {
      mockFetch({ token: 'tok', user: { username: 'jorge' } }, 201);
      await authService.register('jorge', 'pass123');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('register'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    test('stores user in localStorage when token returned', async () => {
      mockFetch({ token: 'mytoken', user: { username: 'jorge' } }, 201);
      await authService.register('jorge', 'pass123');
      const stored = JSON.parse(localStorage.getItem('user'));
      expect(stored.token).toBe('mytoken');
    });

    test('does not store in localStorage when no token in response', async () => {
      mockFetch({ message: 'ok' }, 201);
      await authService.register('jorge', 'pass123');
      expect(localStorage.getItem('user')).toBeNull();
    });

    test('throws when server responds with error', async () => {
      mockFetch({ message: 'Username is already taken.' }, 400);
      await expect(authService.register('jorge', 'pass123'))
        .rejects.toThrow('Username is already taken.');
    });

    test('throws generic message when no error message in response', async () => {
      mockFetch({}, 500);
      await expect(authService.register('jorge', 'pass123'))
        .rejects.toThrow('Registration failed');
    });

    test('returns response data on success', async () => {
      const data = { token: 'tok', user: { username: 'jorge' } };
      mockFetch(data, 201);
      const result = await authService.register('jorge', 'pass123');
      expect(result).toEqual(data);
    });
  });

  describe('login()', () => {
    test('calls login endpoint with POST', async () => {
      mockFetch({ token: 'tok', user: { username: 'jorge' } });
      await authService.login('jorge', 'pass123');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('login'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    test('saves token to localStorage on success', async () => {
      mockFetch({ token: 'logintoken', user: { username: 'jorge' } });
      await authService.login('jorge', 'pass123');
      const stored = JSON.parse(localStorage.getItem('user'));
      expect(stored.token).toBe('logintoken');
    });

    test('throws when credentials are invalid', async () => {
      mockFetch({ message: 'Invalid username or password.' }, 401);
      await expect(authService.login('ghost', 'bad'))
        .rejects.toThrow('Invalid username or password.');
    });

    test('throws generic message when no error message in response', async () => {
      mockFetch({}, 401);
      await expect(authService.login('jorge', 'bad'))
        .rejects.toThrow('Login failed');
    });

    test('does not store data when login fails', async () => {
      mockFetch({ message: 'Invalid username or password.' }, 401);
      try { await authService.login('ghost', 'bad'); } catch {}
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('logout()', () => {
    test('removes user from localStorage', () => {
      localStorage.setItem('user', JSON.stringify({ token: 'tok' }));
      authService.logout();
      expect(localStorage.getItem('user')).toBeNull();
    });

    test('does not throw when localStorage is already empty', () => {
      expect(() => authService.logout()).not.toThrow();
    });
  });

  describe('getCurrentUser()', () => {
    test('returns parsed user object when stored', () => {
      const user = { token: 'tok', user: { username: 'jorge' } };
      localStorage.setItem('user', JSON.stringify(user));
      expect(authService.getCurrentUser()).toEqual(user);
    });

    test('returns null when nothing is stored', () => {
      expect(authService.getCurrentUser()).toBeNull();
    });
  });
});

describe('logService', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    localStorage.setItem('user', JSON.stringify({ token: 'usertoken123' }));
  });

  describe('getAuthHeader via createSession', () => {
    test('includes Authorization header when user is stored', async () => {
      mockFetch({ _id: 's1', title: 'T', aiModel: 'gpt', entries: [] }, 201);
      await logService.createSession('gpt', 'T');
      const headers = global.fetch.mock.calls[0][1].headers;
      expect(headers['Authorization']).toBe('Bearer usertoken123');
    });

    test('omits Authorization header when no user in localStorage', async () => {
      localStorage.clear();
      mockFetch({ _id: 's1', title: 'T', aiModel: 'gpt', entries: [] }, 201);
      await logService.createSession('gpt', 'T');
      const headers = global.fetch.mock.calls[0][1].headers;
      expect(headers['Authorization']).toBeUndefined();
    });
  });

  describe('createSession()', () => {
    test('sends POST to /api/logs/', async () => {
      mockFetch({ _id: 's1', title: 'T', aiModel: 'gemini', entries: [] }, 201);
      await logService.createSession('gemini', 'T');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/logs/'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    test('returns session data on success', async () => {
      const session = { _id: 's1', title: 'Debug', aiModel: 'gemini', entries: [] };
      mockFetch(session, 201);
      const result = await logService.createSession('gemini', 'Debug');
      expect(result).toEqual(session);
    });

    test('throws on server error', async () => {
      mockFetch({ message: 'Please provide a title for the session.' }, 400);
      await expect(logService.createSession('gpt', '')).rejects.toThrow('Please provide a title');
    });

    test('throws generic message when error body is empty', async () => {
      mockFetch({}, 500);
      await expect(logService.createSession('gpt', 'T'))
        .rejects.toThrow('Failed to create session');
    });
  });

  describe('addEntry()', () => {
    test('sends POST to the correct session entries URL', async () => {
      mockFetch({ _id: 'e1', prompt: 'hello' }, 201);
      await logService.addEntry('session_abc', 'hello', 'world');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('session_abc/entries'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    test('returns the new entry on success', async () => {
      const entry = { _id: 'e1', prompt: 'hello', response: 'world' };
      mockFetch(entry, 201);
      const result = await logService.addEntry('session_abc', 'hello', 'world');
      expect(result).toEqual(entry);
    });

    test('works without a response argument', async () => {
      mockFetch({ _id: 'e2', prompt: 'hello' }, 201);
      const result = await logService.addEntry('session_abc', 'hello');
      expect(result).toHaveProperty('prompt', 'hello');
    });

    test('throws when server returns error', async () => {
      mockFetch({ message: 'Session not found.' }, 404);
      await expect(logService.addEntry('bad_id', 'hello'))
        .rejects.toThrow('Session not found.');
    });
  });

  describe('getSessions()', () => {
    test('sends GET to /api/logs/', async () => {
      mockFetch([]);
      await logService.getSessions();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/logs/'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    test('returns array of sessions', async () => {
      mockFetch([{ _id: 's1' }, { _id: 's2' }]);
      const result = await logService.getSessions();
      expect(result).toHaveLength(2);
    });

    test('throws on 401', async () => {
      mockFetch({ message: 'Not authorized, no token provided.' }, 401);
      await expect(logService.getSessions()).rejects.toThrow('Not authorized');
    });
  });

  describe('getSession()', () => {
    test('sends GET to the correct session URL', async () => {
      mockFetch({ _id: 'sess_xyz', title: 'Debug' });
      await logService.getSession('sess_xyz');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('sess_xyz'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    test('returns the session object on success', async () => {
      const session = { _id: 'sess_xyz', title: 'Debug', entries: [] };
      mockFetch(session);
      const result = await logService.getSession('sess_xyz');
      expect(result).toEqual(session);
    });

    test('throws when session is not found', async () => {
      mockFetch({ message: 'Session not found.' }, 404);
      await expect(logService.getSession('bad_id')).rejects.toThrow('Session not found.');
    });
  });
});

describe('guidelineService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getGuidelines()', () => {
    test('sends GET to /api/guidelines/', async () => {
      mockFetch([]);
      await guidelineService.getGuidelines();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('guidelines'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    test('returns array of guidelines on success', async () => {
      const guidelines = [
        { _id: 'g1', title: 'Know Your Policies', description: 'Check syllabus.' },
        { _id: 'g2', title: 'Supplement', description: 'Use AI wisely.' },
      ];
      mockFetch(guidelines);
      const result = await guidelineService.getGuidelines();
      expect(result).toHaveLength(2);
    });

    test('returns empty array when no guidelines exist', async () => {
      mockFetch([]);
      const result = await guidelineService.getGuidelines();
      expect(result).toEqual([]);
    });

    test('throws on server error', async () => {
      mockFetch({ message: 'Server error while fetching guidelines.' }, 500);
      await expect(guidelineService.getGuidelines()).rejects.toThrow('Server error');
    });

    test('throws generic message when error body is empty', async () => {
      mockFetch({}, 500);
      await expect(guidelineService.getGuidelines())
        .rejects.toThrow('Failed to fetch guidelines');
    });

    test('sends Content-Type application/json header', async () => {
      mockFetch([]);
      await guidelineService.getGuidelines();
      const headers = global.fetch.mock.calls[0][1].headers;
      expect(headers['Content-Type']).toBe('application/json');
    });
  });
});
