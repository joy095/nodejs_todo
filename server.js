require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const todoRoutes = express.Router();
const PORT = 4000;
let Todo = require("./todo.model");

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
const connection = mongoose.connection;
connection.once("open", function () {
  console.log("MongoDB database connection established successfully");
});

todoRoutes.route("/").get(async (req, res) => {
  const todo = await Todo.find();
  res.send(todo);
});

todoRoutes.route("/:id").get(async (req, res) => {
  try {
    const todos = await Todo.findOne({ _id: req.params.id });
    res.send(todos);
  } catch {
    res.status(404);
    res.send({ error: "Todo doesn't exist!" });
  }
});

todoRoutes.route("/update/:id").patch(async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id });

    if (req.body.todo_description) {
      todo.todo_description = req.body.todo_description;
    }

    if (req.body.todo_responsible) {
      todo.todo_responsible = req.body.todo_responsible;
    }

    if (req.body.todo_priority) {
      todo.todo_priority = req.body.todo_priority;
    }

    if (req.body.todo_completed) {
      todo.todo_completed = req.body.todo_completed;
    }

    await todo.save();
    res.send(todo);
  } catch {
    res.status(404);
    res.send({ error: "Todo doesn't exist!" });
  }
});

todoRoutes.route("/:id").delete(async (req, res) => {
  try {
    await Todo.deleteOne({ _id: req.params.id });
    res.status(204).send();
  } catch {
    res.status(404);
    res.send({ error: "Todo doesn't exist!" });
  }
});

todoRoutes.route("/add").post((req, res) => {
  let todo = new Todo(req.body);
  todo
    .save()
    .then((todo) => {
      res.status(200).json({ todo: "todo added successfully" });
    })
    .catch((err) => {
      res.status(400).send("adding new todo failed");
    });
});
app.use("/todos", todoRoutes);
app.listen(PORT, function () {
  console.log("Server is running on Port: " + PORT);
});
