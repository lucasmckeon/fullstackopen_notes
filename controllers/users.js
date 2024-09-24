import express from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/user.js';
const usersRouter = express.Router();
usersRouter.post('/', async (request, response) => {
  const { username, password } = request.body;
  //Setting unique in schema didn't work, so need to manually enforce uniqueness
  // const existingUser = await User.find({ username });
  // if (existingUser) {
  //   response.status(400).send({ error: 'expected `username` to be unique' });
  //   return;
  // }
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const user = new User({ ...request.body, passwordHash });
  const savedUser = await user.save();
  response.status(201).json(savedUser);
});

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('notes', {
    content: 1,
    important: 1,
  });
  response.json(users);
});

usersRouter.get('/:id', async (request, response) => {
  const id = request.params.id;
  const user = await User.findById(id);
  if (user) {
    response.json(user);
  } else {
    response.status(404).end();
  }
});

export { usersRouter };
