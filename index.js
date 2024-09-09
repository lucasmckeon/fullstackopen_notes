const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

// const corsOptions = {
//   origin: 'http://localhost:5173',
//   optionsSuccessStatus: 200
// }

const app = express()
app.use(express.json())
app.use(morgan('tiny'))
//app.use(cors(corsOptions))
app.use(express.static('dist'))
let notes = [
  {
    id: "1",
    content: "HTML is easy",
    important: true
  },
  {
    id: "2",
    content: "Browser can execute only JavaScript",
    important: false
  },
  {
    id: "3",
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true
  }
]

app.get('/',(request,response)=> {
  response.send('<h1>Hello Worldss!</h1>')
})

app.get('/api/notes', (request, response) => {
  response.setHeader('Access-Control-Allow-Origin','http://localhost:5173')
  response.json(notes)
})

app.get('/api/notes/:id',(request,response)=>{
  const id = request.params.id
  const note = notes.find(note => note.id === id)
  if(note === undefined){
    //return response.status(404).send('<h1 style="color:red">Not Found</h1>')
    response.statusMessage="Resource not found"
    response.status(404).end()
    return
  }
  response.json(note)
})

app.delete('/api/notes/:id',(request,response)=>{
  const id = request.params.id
  if( !notes.find(note=>note.id ===id) ){
    response.sendStatus(404)
  }
  notes = notes.filter(note => notes.id !== id)
  response.sendStatus(204)
})

const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => Number(n.id)))
    : 0
  return String(maxId + 1)
}

app.post('/api/notes', (request, response) => {
  const body = request.body
  if (!body.content) {
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }
  const note = {
    content: body.content,
    important: body.important || false,
    id: generateId(),
  }
  notes = notes.concat(note)
  response.json(note)
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})