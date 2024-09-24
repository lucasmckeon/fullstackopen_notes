import express from 'express';
import 'express-async-errors';
import { notesRouter } from './controllers/notes.js';
import { usersRouter } from './controllers/users.js';
import {
  requestLogger,
  unknownEndpoint,
  errorHandler,
} from './utils/middleware.js';
import cors from 'cors';
import mongoose from 'mongoose';
import { MONGODB_URI } from './utils/config.js';
import { error } from './utils/logger.js';
mongoose.set('strictQuery', false);
const url = MONGODB_URI;
if (url === undefined) {
  throw new Error('MONGODB URL MUST BE DEFINED');
}
console.log('connecting to', url);
mongoose
  .connect(url)
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((e) => {
    error('error connecting to MongoDB:', e.message);
    //Application is unusable with url error, so force crash until graceful handling implemented
    throw e;
  });

const app = express();
app.use(express.json());
app.use(express.static('dist'));
app.use(requestLogger);
app.use(cors());

app.use('/api/notes', notesRouter);
app.use('/api/users', usersRouter);
app.use(unknownEndpoint);
app.use(errorHandler);
export { app };
