import request from 'supertest';
import { createTestApp, testProjectData, getAuthHeaders } from '../utils/testApp';
import { seedTestData, getTestDb } from '../setup';

describe('Projects API', () => {
  const app = createTestApp();
  let authToken: string;
  let userId: number;

  beforeEach(async () => {
    const { token, userId: id } = await seedTestData(getTestDb());
    authToken = token;
    userId = id;
  });

  describe('GET /api/projects', () => {
    it('should return all projects for authenticated user', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set(getAuthHeaders(authToken))
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toMatchObject({
        id: expect.any(Number),
        name: 'New Sofa',
        description: 'Replace old sofa with modern one',
        category: 'Furniture',
        location: 'living-room',
        status: 'planning',
      });
    });

    it('should filter projects by location', async () => {
      const response = await request(app)
        .get('/api/projects?location=living-room')
        .set(getAuthHeaders(authToken))
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      response.body.forEach((project: any) => {
        expect(project.location).toBe('living-room');
      });
    });

    it('should filter projects by status', async () => {
      const response = await request(app)
        .get('/api/projects?status=planning')
        .set(getAuthHeaders(authToken))
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      response.body.forEach((project: any) => {
        expect(project.status).toBe('planning');
      });
    });

    it('should return empty array for user with no projects', async () => {
      // Create a new user without projects
      const newUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          password: 'password123',
          email: 'new@example.com',
        });

      const response = await request(app)
        .get('/api/projects')
        .set(getAuthHeaders(newUserResponse.body.token))
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Access token required',
      });
    });
  });

  describe('POST /api/projects', () => {
    const newProjectData = {
      name: 'New Kitchen Cabinets',
      description: 'Replace old kitchen cabinets',
      category: 'Kitchen',
      location: 'living-room',
      status: 'planning',
      budget: 2000,
      estimated_days: 7,
      doer: 'pro',
    };

    it('should create new project for authenticated user', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set(getAuthHeaders(authToken))
        .send(newProjectData)
        .expect(201);

      expect(response.body).toMatchObject({
        message: 'Project created successfully',
        project: {
          id: expect.any(Number),
          ...newProjectData,
        },
      });
    });

    it('should create project with minimal required data', async () => {
      const minimalData = {
        name: 'Minimal Project',
      };

      const response = await request(app)
        .post('/api/projects')
        .set(getAuthHeaders(authToken))
        .send(minimalData)
        .expect(201);

      expect(response.body).toMatchObject({
        message: 'Project created successfully',
        project: {
          id: expect.any(Number),
          name: 'Minimal Project',
          status: 'planning', // Default value
        },
      });
    });

    it('should fail to create project with invalid data', async () => {
      const invalidData = {
        name: '', // Empty name
        status: 'invalid-status',
        budget: 'not-a-number',
      };

      const response = await request(app)
        .post('/api/projects')
        .set(getAuthHeaders(authToken))
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send(newProjectData)
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Access token required',
      });
    });
  });

  describe('GET /api/projects/:id', () => {
    let projectId: number;

    beforeEach(async () => {
      // Get the seeded project ID
      const projects = await request(app)
        .get('/api/projects')
        .set(getAuthHeaders(authToken));
      projectId = projects.body[0].id;
    });

    it('should return specific project for authenticated user', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .set(getAuthHeaders(authToken))
        .expect(200);

      expect(response.body).toMatchObject({
        id: projectId,
        name: 'New Sofa',
        description: 'Replace old sofa with modern one',
        category: 'Furniture',
        location: 'living-room',
        status: 'planning',
      });
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/api/projects/99999')
        .set(getAuthHeaders(authToken))
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Project not found',
      });
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Access token required',
      });
    });
  });

  describe('PUT /api/projects/:id', () => {
    let projectId: number;

    beforeEach(async () => {
      // Get the seeded project ID
      const projects = await request(app)
        .get('/api/projects')
        .set(getAuthHeaders(authToken));
      projectId = projects.body[0].id;
    });

    const updatedData = {
      name: 'Updated Project Name',
      description: 'Updated description',
      status: 'in_progress',
      budget: 1500,
    };

    it('should update existing project for authenticated user', async () => {
      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .set(getAuthHeaders(authToken))
        .send(updatedData)
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Project updated successfully',
        project: {
          id: projectId,
          ...updatedData,
        },
      });
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .put('/api/projects/99999')
        .set(getAuthHeaders(authToken))
        .send(updatedData)
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Project not found',
      });
    });

    it('should fail with invalid data', async () => {
      const invalidData = {
        name: '', // Empty name
        status: 'invalid-status',
        budget: 'not-a-number',
      };

      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .set(getAuthHeaders(authToken))
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .send(updatedData)
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Access token required',
      });
    });
  });

  describe('DELETE /api/projects/:id', () => {
    let projectId: number;

    beforeEach(async () => {
      // Get the seeded project ID
      const projects = await request(app)
        .get('/api/projects')
        .set(getAuthHeaders(authToken));
      projectId = projects.body[0].id;
    });

    it('should delete existing project for authenticated user', async () => {
      const response = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set(getAuthHeaders(authToken))
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Project deleted successfully',
      });

      // Verify project is deleted
      await request(app)
        .get(`/api/projects/${projectId}`)
        .set(getAuthHeaders(authToken))
        .expect(404);
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .delete('/api/projects/99999')
        .set(getAuthHeaders(authToken))
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Project not found',
      });
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .delete(`/api/projects/${projectId}`)
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Access token required',
      });
    });
  });

  describe('POST /api/projects/:id/notes', () => {
    let projectId: number;

    beforeEach(async () => {
      // Get the seeded project ID
      const projects = await request(app)
        .get('/api/projects')
        .set(getAuthHeaders(authToken));
      projectId = projects.body[0].id;
    });

    const noteData = {
      content: 'This is a test note for the project',
    };

    it('should add note to existing project', async () => {
      const response = await request(app)
        .post(`/api/projects/${projectId}/notes`)
        .set(getAuthHeaders(authToken))
        .send(noteData)
        .expect(201);

      expect(response.body).toMatchObject({
        message: 'Note added successfully',
        note: {
          id: expect.any(Number),
          project_id: projectId,
          content: noteData.content,
          created_at: expect.any(String),
        },
      });
    });

    it('should fail to add note with empty content', async () => {
      const response = await request(app)
        .post(`/api/projects/${projectId}/notes`)
        .set(getAuthHeaders(authToken))
        .send({ content: '' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .post('/api/projects/99999/notes')
        .set(getAuthHeaders(authToken))
        .send(noteData)
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Project not found',
      });
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post(`/api/projects/${projectId}/notes`)
        .send(noteData)
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Access token required',
      });
    });
  });

  describe('GET /api/projects/:id/notes', () => {
    let projectId: number;

    beforeEach(async () => {
      // Get the seeded project ID
      const projects = await request(app)
        .get('/api/projects')
        .set(getAuthHeaders(authToken));
      projectId = projects.body[0].id;

      // Add a test note
      await request(app)
        .post(`/api/projects/${projectId}/notes`)
        .set(getAuthHeaders(authToken))
        .send({ content: 'Test note content' });
    });

    it('should return all notes for existing project', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}/notes`)
        .set(getAuthHeaders(authToken))
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toMatchObject({
        id: expect.any(Number),
        project_id: projectId,
        content: 'Test note content',
        created_at: expect.any(String),
      });
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/api/projects/99999/notes')
        .set(getAuthHeaders(authToken))
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Project not found',
      });
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}/notes`)
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Access token required',
      });
    });
  });
});