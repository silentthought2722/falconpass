import { FastifyInstance } from 'fastify';
import { build } from '../../app';
import supertest from 'supertest';

describe('Authentication API', () => {
  let app: FastifyInstance;
  let request: supertest.SuperTest<supertest.Test>;

  beforeAll(async () => {
    // Build the app for testing
    app = await build();
    await app.ready();
    request = supertest(app.server);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      // Generate test data
      const userData = {
        email: `test-${Date.now()}@example.com`,
        username: `testuser-${Date.now()}`,
        clientSalt: 'salt123',
        verifier: 'verifier123',
      };

      // Make request
      const response = await request
        .post('/api/user/register')
        .send(userData)
        .expect(201);

      // Assert response
      expect(response.body).toHaveProperty('userId');
      expect(response.body.userId).toBeTruthy();
    });

    it('should reject registration with missing fields', async () => {
      // Missing username and verifier
      const incompleteData = {
        email: 'incomplete@example.com',
        clientSalt: 'salt123',
      };

      // Make request
      const response = await request
        .post('/api/user/register')
        .send(incompleteData)
        .expect(400);

      // Assert response contains validation errors
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Login Challenge', () => {
    // First register a user to test with
    let testEmail: string;

    beforeAll(async () => {
      testEmail = `login-test-${Date.now()}@example.com`;
      await request
        .post('/api/user/register')
        .send({
          email: testEmail,
          username: `login-test-${Date.now()}`,
          clientSalt: 'salt123',
          verifier: 'verifier123',
        })
        .expect(201);
    });

    it('should generate a login challenge for an existing user', async () => {
      // Make request
      const response = await request
        .post('/api/user/login/challenge')
        .send({ email: testEmail })
        .expect(200);

      // Assert response
      expect(response.body).toHaveProperty('serverEphemeral');
      expect(response.body).toHaveProperty('salt');
    });

    it('should reject challenge request for non-existent user', async () => {
      // Make request
      await request
        .post('/api/user/login/challenge')
        .send({ email: 'nonexistent@example.com' })
        .expect(404);
    });
  });

  // Additional test cases for login verification, WebAuthn, etc. would follow
});