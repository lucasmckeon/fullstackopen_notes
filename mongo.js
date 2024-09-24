// import mongoose from 'mongoose';

// const url = process.env.MONGODB_URI;
// mongoose.set('strictQuery', false);
// mongoose.connect(url);

// const noteSchema = new mongoose.Schema({
//   content: String,
//   important: Boolean,
// });
// noteSchema.set('toJSON', {
//   transform: (document, returnedObject) => {
//     returnedObject.id = returnedObject._id.toString();
//     delete returnedObject._id;
//     delete returnedObject.__v;
//   },
// });

// const Note = mongoose.model('Note', noteSchema);

// const note = new Note({
//   content: 'HTML is easy',
//   important: true,
// });

// // note.save().then(result => {
// //   console.log('note saved!')
// //   mongoose.connection.close()
// // })

// Note.find({}).then((result) => {
//   result.forEach((note) => {
//     console.log(note);
//   });
//   mongoose.connection.close();
// });
