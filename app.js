const express = require('express')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const path = require('path')
const app = express()
const dbPath = path.join(__dirname, 'todoApplication.db')
app.use(express.json())
let database = null
const initializeDbAndServer = async () => {
  try {
    database = await open({filename: dbPath, driver: sqlite3.Database})
    app.listen(3000, () => {
      console.log('Server Is running on http://localhost:3000')
    })
  } catch (error) {
    console.log(`Data base Error is ${error}`)
    process.exit(1)
  }
}
initializeDbAndServer()

const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}

//api 1

app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q = '', priority, status} = request.query
  console.log(request.query)
  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`
      break
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`
      break
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`
      break
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`
  }

  data = await database.all(getTodosQuery)
  response.send(data)
})

//api 2 Returns a specific todo based on the todo ID

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodoQuery = `
  select * from todo where id=${todoId}
  `
  const getTodoQueryResponse = await database.get(getTodoQuery)
  response.send(getTodoQueryResponse)
})

//api 3 Create a todo in the todo table

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const addTodoQuery = `
  insert into todo(id,todo,priority,status) values(${id},'${todo}','${priority}','${status}')
  `
  const addTodoQueryResponse = await database.run(addTodoQuery)
  response.send('Todo Successfully Added')
})

//api 4

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const {status, priority, todo} = request.body

  if (status !== undefined) {
    const updateTodoQuery = `
      UPDATE todo SET status = '${status}' WHERE id = ${todoId};
    `
    await database.run(updateTodoQuery)
    return response.send('Status Updated')
  }

  if (priority !== undefined) {
    const updateTodoQuery = `
      UPDATE todo SET priority = '${priority}' WHERE id = ${todoId};
    `
    await database.run(updateTodoQuery)
    return response.send('Priority Updated')
  }

  if (todo !== undefined) {
    const updateTodoQuery = `
      UPDATE todo SET todo = '${todo}' WHERE id = ${todoId};
    `
    await database.run(updateTodoQuery)
    return response.send('Todo Updated')
  }
})

//api 5 Deletes a todo from the todo table based on the todo ID

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteTodoQuery = `delete from todo where id=${todoId};`
  const deleteTodoQueryResponse = await database.run(deleteTodoQuery)
  response.send('Todo Deleted')
})

module.exports = app
