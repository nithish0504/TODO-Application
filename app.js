const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const addDays = require("date-fns/addDays");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertTodoDbObjectToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
    category: dbObject.category,
    dueDate: dbObject.due_date,
  };
};

const convertDistrictDbObjectToResponseObject = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

//

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

//

const hasCategoryAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

// Get Todos API

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", category, priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      if (
        (request.query.priority === "HIGH" ||
          request.query.priority === "MEDIUM" ||
          request.query.priority === "LOW") &&
        (request.query.status === "TO DO" ||
          request.query.status === "IN PROGRESS" ||
          request.query.status === "DONE")
      ) {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND priority = '${priority}';`;
        break;
      } else {
        if (
          request.query.priority !== "HIGH" &&
          request.query.priority !== "MEDIUM" &&
          request.query.priority !== "LOW"
        ) {
          response.status(400);
          response.send("Invalid Todo Priority");
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      }
    case hasCategoryAndStatusProperties(request.query):
      if (
        (request.query.category === "WORK" ||
          request.query.category === "HOME" ||
          request.query.category === "LEARNING") &&
        (request.query.status === "TO DO" ||
          request.query.status === "IN PROGRESS" ||
          request.query.status === "DONE")
      ) {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND category = '${category}';`;
        break;
      } else {
        if (
          request.query.category !== "HOME" &&
          request.query.category !== "WORK" &&
          request.query.category !== "LEARNING"
        ) {
          response.status(400);
          response.send("Invalid Todo Category");
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      }
    case hasCategoryAndPriorityProperties(request.query):
      if (
        (request.query.category === "WORK" ||
          request.query.category === "HOME" ||
          request.query.category === "LEARNING") &&
        (request.query.priority === "HIGH" ||
          request.query.priority === "MEDIUM" ||
          request.query.priority === "LOW")
      ) {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND priority = '${priority}'
        AND category = '${category}';`;
        break;
      } else {
        if (
          request.query.category !== "HOME" &&
          request.query.category !== "WORK" &&
          request.query.category !== "LEARNING"
        ) {
          response.status(400);
          response.send("Invalid Todo Category");
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      }
    case hasPriorityProperty(request.query):
      if (
        request.query.priority === "HIGH" ||
        request.query.priority === "MEDIUM" ||
        request.query.priority === "LOW"
      ) {
        getTodosQuery = `
      SELECT
        *
      FROM 
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND priority = '${priority}';`;
        break;
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
    case hasCategoryProperty(request.query):
      if (
        request.query.category === "WORK" ||
        request.query.category === "HOME" ||
        request.query.category === "LEARNING"
      ) {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND category = '${category}';`;
        break;
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    case hasStatusProperty(request.query):
      if (
        request.query.status === "TO DO" ||
        request.query.status === "IN PROGRESS" ||
        request.query.status === "DONE"
      ) {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}';`;
        break;
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }

    default:
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%';`;
  }

  data = await database.all(getTodosQuery);
  response.send(
    data.map((eachTodo) => convertTodoDbObjectToResponseObject(eachTodo))
  );
});

// Get Todo API

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`;
  const todo = await database.get(getTodoQuery);
  response.send(convertTodoDbObjectToResponseObject(todo));
});

// Get Agenda API

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;

  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      due_date = '${date}';`;
  const todo = await database.all(getTodoQuery);
  response.send(
    todo.map((eachTodo) => convertTodoDbObjectToResponseObject(eachTodo))
  );
});

// Post Todo API

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (
    request.body.category !== "HOME" &&
    request.body.category !== "WORK" &&
    request.body.category !== "LEARNING"
  ) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else if (
    request.body.priority !== "HIGH" &&
    request.body.priority !== "MEDIUM" &&
    request.body.priority !== "LOW"
  ) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (
    request.body.status !== "TO DO" &&
    request.body.status !== "IN PROGRESS" &&
    request.body.status !== "DONE"
  ) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else {
    const postTodoQuery = `
  INSERT INTO
    todo (id, todo, priority, status, category, due_date)
  VALUES
    (${id}, '${todo}', '${priority}', '${status}', '${category}', '${dueDate}');`;
    await database.run(postTodoQuery);
    response.send("Todo Successfully Added");
  }
});

// Put Todo API

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      if (
        request.body.status === "TO DO" ||
        request.body.status === "IN PROGRESS" ||
        request.body.status === "DONE"
      ) {
        updateColumn = "Status";
        break;
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }

    case requestBody.priority !== undefined:
      if (
        request.body.priority === "HIGH" ||
        request.body.priority === "MEDIUM" ||
        request.body.priority === "LOW"
      ) {
        updateColumn = "Priority";
        break;
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
    case requestBody.category !== undefined:
      if (
        request.body.category === "WORK" ||
        request.body.category === "HOME" ||
        request.body.category === "LEARNING"
      ) {
        updateColumn = "Category";
        break;
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    case requestBody.dueDate !== undefined:
      updateColumn = "Due Date";
      break;
  }
  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
  const previousTodo = await database.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.due_date,
  } = request.body;

  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category='${category}',
      due_date= '${dueDate}'

    WHERE
      id = ${todoId};`;

  await database.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

// Delete Todo API

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;

  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
