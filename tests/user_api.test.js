import { test, describe, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import { app } from '../app.js';
import mongoose from 'mongoose';
import { User } from '../models/user.js';
import bcrypt from 'bcrypt';
import { usersInDb } from './test_helper.js';
const api = supertest(app);

describe.only('when there is intially one user in db', () => {
  beforeEach(async () => {
    await User.find({}).deleteMany();
    const passwordHash = await bcrypt.hash('sekret', 10);
    const user = new User({ username: 'root', passwordHash });
    // User.ensureIndexes();
    await user.save();
  });

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });

  test.only('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await usersInDb();
    assert(result.body.error.includes('expected `username` to be unique'));

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  test('POST request works', async () => {
    const user = {
      username: 'Test',
      user: 'User',
      password: 'Passwords123',
    };
    const savedUser = await api.post('/api/users').send(user).expect(201);

    assert(!savedUser.password && savedUser.passwordHash !== 'Pass');
  });
});

after(() => {
  mongoose.connection.close();
});
