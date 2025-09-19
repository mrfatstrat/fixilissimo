import request from 'supertest';
import { createTestApp, testUserData } from '../utils/testApp';
import { seedTestData, getTestDb } from '../setup';

describe('Authentication API', () => {
  const app = createTestApp();

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'newuser',
        password: 'password123',
        email: 'newuser@example.com',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        message: 'User created successfully',
        user: {
          username: userData.username,
          email: userData.email,
        },
        token: expect.any(String),
      });

      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should fail to register user with duplicate username', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(testUserData);

      // Attempt duplicate registration
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUserData)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Username already exists',
      });
    });

    it('should fail to register user with invalid data', async () => {
      const invalidData = {
        username: '', // Empty username
        password: '123', // Too short password
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Seed user for login tests
      await seedTestData(getTestDb());
    });

    it('should login user with correct credentials', async () => {
      const loginData = {
        username: testUserData.username,
        password: testUserData.password,
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Login successful',
        user: {
          username: testUserData.username,
        },
        token: expect.any(String),
      });

      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should fail login with incorrect password', async () => {
      const loginData = {
        username: testUserData.username,
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Invalid username or password',
      });
    });

    it('should fail login with non-existent username', async () => {
      const loginData = {
        username: 'nonexistent',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Invalid username or password',
      });
    });

    it('should fail login with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken: string;
    let userId: number;

    beforeEach(async () => {
      const { token, userId: id } = await seedTestData(getTestDb());
      authToken = token;
      userId = id;
    });

    it('should return user info for authenticated request', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        user: {
          id: userId,
          username: testUserData.username,
          email: testUserData.email,
        },
      });

      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should fail without authentication token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Access token required',
      });
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body).toMatchObject({
        error: 'Invalid or expired token',
      });
    });
  });

  describe('POST /api/auth/logout', () => {
    let authToken: string;

    beforeEach(async () => {
      const { token } = await seedTestData(getTestDb());
      authToken = token;
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Logged out successfully',
      });
    });

    it('should handle logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Logged out successfully',
      });
    });
  });
});