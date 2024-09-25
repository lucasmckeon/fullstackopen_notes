import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/user.js';
import express from 'express';
const { sign } = jwt;
const loginRouter = express.Router();

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body;
  const user = await User.findOne({ username });
  if (!user) {
    response.status(401).json({ errorMessage: 'No user with that username' });
    return;
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordCorrect) {
    response.status(401).json({ errorMessage: 'Incorrect password' });
    return;
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  };
  const token = sign(userForToken, process.env.SECRET, { expiresIn: 60 * 60 });
  response
    .status(200)
    .send({ token, username: user.username, name: user.name });
});

export { loginRouter };
