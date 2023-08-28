const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const isMatch = require("date-fns/isMatch");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
const intializeDbAndserver = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running At http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
intializeDbAndserver();
const hasPriorityAndStatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const hasPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const hasStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const hasCategoryAndStatus = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};
const hasCategoryAndPriority = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};
const hasSearch = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};
const hasCategory = (requestQuery) => {
  return requestQuery.category !== undefined;
};
const outputResults = (dbObj) => {
  return {
    id: dbObj.id,
    todo: dbObj.todo,
    category: dbObj.category,
    priority: dbObj.priority,
    status: dbObj.status,
    dueDate: dbObj.due_date,
  };
};
app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status, category } = request.query;
  let dbResponse = null;
  let getselectedQuery = "";
  switch (true) {
    case hasPriorityAndStatus(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getselectedQuery = `SELECT * FROM todo WHERE status = '${status}' AND priority = '${priority}';`;
          dbResponse = await db.all(getselectedQuery);
          response.send(dbResponse.map((each) => outputResults(each)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasCategoryAndStatus(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getselectedQuery = `SELECT * FROM todo WHERE category = '${category}' AND status = '${status}';`;
          dbResponse = await db.all(getselectedQuery);
          response.send(dbResponse.map((each) => outputResults(each)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasCategoryAndPriority(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          getselectedQuery = `SELECT * FROM todo WHERE category = '${category}' AND priority = '${priority}';`;
          dbResponse = await db.all(getselectedQuery);
          response.send(dbResponse.map((each) => outputResults(each)));
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasPriority(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        getselectedQuery = `SELECT * FROM todo WHERE priority = '${priority}';`;
        dbResponse = await db.all(getselectedQuery);
        response.send(dbResponse.map((each) => outputResults(each)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasStatus(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        getselectedQuery = `SELECT * FROM todo WHERE status = '${status}';`;
        dbResponse = await db.all(getselectedQuery);
        response.send(dbResponse.map((each) => outputResults(each)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case hasSearch(request.query):
      getselectedQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
      dbResponse = await db.all(getselectedQuery);
      response.send(dbResponse.map((each) => outputResults(each)));
      break;
    case hasCategory(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        getselectedQuery = `SELECT * FROM todo WHERE category = '${category}';`;
        dbResponse = await db.all(getselectedQuery);
        response.send(dbResponse.map((each) => outputResults(each)));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    default:
      getselectedQuery = `SELECT * FROM todo;`;
      dbResponse = await db.all(getselectedQuery);
      response.send(dbResponse.map((each) => outputResults(each)));
  }
});
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getATodo = `SELECT * FROM todo WHERE id=${todoId};`;
  const dbResponse = await db.get(getATodo);
  response.send(outputResults(dbResponse));
});
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  console.log(isMatch(date, "yyyy-MM-dd"));
  if (isMatch(date, "yyyy-MM-dd")) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    console.log(newDate);
    const selectedQuery = `SELECT * FROM todo WHERE due_date= '${newDate}';`;
    const dbResponse = await db.all(selectedQuery);
    response.send(dbResponse.map((each) => outputResults(each)));
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const newDueDate = format(new Date(dueDate), "yyyy-MM-dd");
          const createAItem = `
            INSERT INTO
                todo(id,todo,priority,status,category,due_date)
            VALUES
                (${id},'${todo}','${priority}',${status}','${category}','${newDueDate}');`;
          const dbResponse = await db.run(createAItem);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updatedColumn;
  const requestBody = request.body;
  console.log(requestBody);
  const selectedQuery = `SELECT * FROM todo WHERE id=${todoId};`;
  const previousTodo = await db.run(selectedQuery);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.dueDate,
  } = request.body;
  let updatedQuery;
  switch (true) {
    case requestBody.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        updatedQuery = `UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}', due_date='${dueDate}' WHERE id=${todoId};`;
        await db.run(updatedQuery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case requestBody.priority !== undefined:
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        updatedQuery = `UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}', due_date='${dueDate}' WHERE id=${todoId};`;
        await db.run(updatedQuery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case requestBody.todo !== undefined:
      updatedQuery = `UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}', due_date='${dueDate}' WHERE id=${todoId};`;
      await db.run(updatedQuery);
      response.send("Todo Updated");
      break;
    case requestBody.category !== undefined:
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        updatedQuery = `UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}', due_date='${dueDate}' WHERE id=${todoId};`;
        await db.run(updatedQuery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case requestBody.dueDate !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newDueDate = format(new Date(dueDate), "yyyy-MM-dd");
        updatedQuery = `UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}', due_date='${dueDate}' WHERE id=${todoId};`;
        await db.run(updatedQuery);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
});
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteATodo = `DELETE FROM todo WHERE id=${todoId};`;
  await db.run(deleteATodo);
  response.send("Todo Deleted");
});
module.exports = app;
