import { test, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import supertest from 'supertest';
import { app } from '../app.js';
import { Note } from '../models/note.js';
import { initialNotes, notesInDb, nonExistingId } from './test_helper.js';

beforeEach(async () => {
  await Note.deleteMany({});
  await Promise.all(
    initialNotes.map((n) => {
      const note = new Note(n);
      return note.save();
    })
  );
});

const api = supertest(app);

test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('all notes are returned', async () => {
  const response = await api.get('/api/notes');
  assert.strictEqual(response.body.length, initialNotes.length);
});

test('a specific note is within the returned notes', async () => {
  const response = await api.get('/api/notes');

  const contents = response.body.map((r) => r.content);

  assert(contents.includes('Browser can execute only JavaScript'));
});

test('a valid note can be added ', async () => {
  const newNote = {
    content: 'async/await simplifies making async calls',
    important: true,
  };

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const notesAtEnd = await notesInDb();
  assert.strictEqual(notesAtEnd.length, initialNotes.length + 1);
  const contents = notesAtEnd.map((n) => n.content);
  assert(contents.includes('async/await simplifies making async calls'));
});

test('note without content is not added', async () => {
  const newNote = {
    important: true,
  };

  await api.post('/api/notes').send(newNote).expect(400);

  const notesAtEnd = await notesInDb();

  assert.strictEqual(notesAtEnd.length, initialNotes.length);
});

test('a specific note can be viewed', async () => {
  const notesAtStart = await notesInDb();

  const noteToView = notesAtStart[0];

  const resultNote = await api
    .get(`/api/notes/${noteToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.deepStrictEqual(resultNote.body, noteToView);
});

test('fails with statuscode 404 if note does not exist', async () => {
  const validNonexistingId = await nonExistingId();

  await api.get(`/api/notes/${validNonexistingId}`).expect(404);
});

test('fails with statuscode 400 id is invalid', async () => {
  const invalidId = '5a3d5da59070081a82a3445';

  await api.get(`/api/notes/${invalidId}`).expect(400);
});

test('a note can be deleted', async () => {
  const notesAtStart = await notesInDb();
  const noteToDelete = notesAtStart[0];

  await api.delete(`/api/notes/${noteToDelete.id}`).expect(204);

  const notesAtEnd = await notesInDb();

  const contents = notesAtEnd.map((r) => r.content);
  assert(!contents.includes(noteToDelete.content));

  assert.strictEqual(notesAtEnd.length, initialNotes.length - 1);
});

after(async () => {
  await mongoose.connection.close();
});
