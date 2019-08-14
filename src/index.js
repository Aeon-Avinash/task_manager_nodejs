const express = require("express");
require("./db/mongoose");
const userRoutes = require("./routers/users");
const taskRoutes = require("./routers/tasks");

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);

app.listen(PORT, () => {
  console.log(`Server is listening now on Port ${PORT}...`);
});
