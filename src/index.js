const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username }  = request.headers;

  const user = users.some(user => user.username === username);

  if(!user) return response.status(404).json({
    error: 'User not found'
  });

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  
  const { name, username } = request.body;

  const hasUserExists = users.some(user => user.username === username);

  console.log(hasUserExists)

  if(hasUserExists) return response.status(400).json({
    error: 'User already exists'
  })

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: new Array()
  };

  users.push(user);

  // delete user.id;

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const { todos } = users.find(user => user.username === username);

  return response.send(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;

  const user = users.find(user => user.username === username);

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todos = users.find(user => user.username === username).todos;

  const todo = todos.find(todo => todo.id === id);

  if(!todo) return response.status(404).json({
    error: 'Todo not found'
  });

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(200).json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const todos = users.find(user => user.username === username).todos;

  const todo = todos.find(todo => todo.id === id);

  if(!todo) return response.status(404).json({
    error: 'Todo not found'
  });

  todo.done = !todo.done;

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const todos = users.find(user => user.username === username).todos;

  const todo = todos.find(todo => todo.id === id);
  
  if(!todo) return response.status(404).json({
    error: 'Todo not found'
  });

  todos.splice(todos.indexOf(todo), 1);

  return response.sendStatus(204);
});

module.exports = app;