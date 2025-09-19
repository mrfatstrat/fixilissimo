import request from 'supertest';
import { createTestApp, testLocationData, getAuthHeaders } from '../utils/testApp';
import { seedTestData, getTestDb } from '../setup';

describe('Locations API', () => {
  const app = createTestApp();
  let authToken: string;
  let userId: number;

  beforeEach(async () => {
    const { token, userId: id } = await seedTestData(getTestDb());
    authToken = token;
    userId = id;
  });

  describe('GET /api/locations', () => {
    it('should return all locations for authenticated user', async () => {
      const response = await request(app)
        .get('/api/locations')
        .set(getAuthHeaders(authToken))
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toMatchObject({
        id: 'living-room',
        name: 'Living Room',
        icon: '🛋️',
        color: '#3B82F6',
      });
    });

    it('should return empty array for user with no locations', async () => {
      // Create a new user without locations
      const newUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          password: 'password123',
          email: 'new@example.com',
        });

      const response = await request(app)
        .get('/api/locations')
        .set(getAuthHeaders(newUserResponse.body.token))
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/locations')
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Access token required',
      });
    });
  });

  describe('POST /api/locations', () => {
    const newLocationData = {
      id: 'kitchen',
      name: 'Kitchen',
      icon: '🍳',
      color: '#10B981',
    };

    it('should create new location for authenticated user', async () => {
      const response = await request(app)
        .post('/api/locations')
        .set(getAuthHeaders(authToken))
        .send(newLocationData)
        .expect(201);

      expect(response.body).toMatchObject({
        message: 'Location created successfully',
        location: newLocationData,
      });
    });

    it('should fail to create location with duplicate id for same user', async () => {
      // First creation
      await request(app)
        .post('/api/locations')
        .set(getAuthHeaders(authToken))
        .send(newLocationData);

      // Attempt duplicate creation
      const response = await request(app)
        .post('/api/locations')
        .set(getAuthHeaders(authToken))
        .send(newLocationData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to create location with invalid data', async () => {
      const invalidData = {
        id: '', // Empty id
        name: '',
        icon: '',
        color: 'invalid-color',
      };

      const response = await request(app)
        .post('/api/locations')
        .set(getAuthHeaders(authToken))
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/locations')
        .send(newLocationData)
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Access token required',
      });
    });
  });

  describe('GET /api/locations/:id', () => {
    it('should return specific location for authenticated user', async () => {
      const response = await request(app)
        .get('/api/locations/living-room')
        .set(getAuthHeaders(authToken))
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'living-room',
        name: 'Living Room',
        icon: '🛋️',
        color: '#3B82F6',
      });
    });

    it('should return 404 for non-existent location', async () => {
      const response = await request(app)
        .get('/api/locations/non-existent')
        .set(getAuthHeaders(authToken))
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Location not found',
      });
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/locations/living-room')
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Access token required',
      });
    });
  });

  describe('PUT /api/locations/:id', () => {
    const updatedData = {
      name: 'Updated Living Room',
      icon: '🏠',
      color: '#EF4444',
    };

    it('should update existing location for authenticated user', async () => {
      const response = await request(app)
        .put('/api/locations/living-room')
        .set(getAuthHeaders(authToken))
        .send(updatedData)
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Location updated successfully',
        location: {
          id: 'living-room',
          ...updatedData,
        },
      });
    });

    it('should return 404 for non-existent location', async () => {
      const response = await request(app)
        .put('/api/locations/non-existent')
        .set(getAuthHeaders(authToken))
        .send(updatedData)
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Location not found',
      });
    });

    it('should fail with invalid data', async () => {
      const invalidData = {
        name: '', // Empty name
        icon: '',
        color: 'invalid',
      };

      const response = await request(app)
        .put('/api/locations/living-room')
        .set(getAuthHeaders(authToken))
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put('/api/locations/living-room')
        .send(updatedData)
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Access token required',
      });
    });
  });

  describe('DELETE /api/locations/:id', () => {
    it('should delete existing location for authenticated user', async () => {
      // Create a new location without projects for this test
      const newLocationData = {
        id: 'test-location',
        name: 'Test Location',
        icon: '🧪',
        color: '#FF0000',
      };

      await request(app)
        .post('/api/locations')
        .set(getAuthHeaders(authToken))
        .send(newLocationData)
        .expect(201);

      const response = await request(app)
        .delete('/api/locations/test-location')
        .set(getAuthHeaders(authToken))
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Location deleted successfully',
      });

      // Verify location is deleted
      await request(app)
        .get('/api/locations/test-location')
        .set(getAuthHeaders(authToken))
        .expect(404);
    });

    it('should return 404 for non-existent location', async () => {
      const response = await request(app)
        .delete('/api/locations/non-existent')
        .set(getAuthHeaders(authToken))
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Location not found',
      });
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .delete('/api/locations/living-room')
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Access token required',
      });
    });
  });

  describe('GET /api/locations/stats', () => {
    it('should return location statistics for authenticated user', async () => {
      const response = await request(app)
        .get('/api/locations/stats')
        .set(getAuthHeaders(authToken))
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toMatchObject({
        id: 'living-room',
        name: 'Living Room',
        project_count: expect.any(Number),
      });
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/locations/stats')
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Access token required',
      });
    });
  });

  describe('GET /api/locations/:id/stats', () => {
    it('should return specific location statistics', async () => {
      const response = await request(app)
        .get('/api/locations/living-room/stats')
        .set(getAuthHeaders(authToken))
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'living-room',
        name: 'Living Room',
        project_count: expect.any(Number),
        status_counts: expect.any(Object),
      });
    });

    it('should return 404 for non-existent location', async () => {
      const response = await request(app)
        .get('/api/locations/non-existent/stats')
        .set(getAuthHeaders(authToken))
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Location not found',
      });
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/locations/living-room/stats')
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Access token required',
      });
    });
  });
});