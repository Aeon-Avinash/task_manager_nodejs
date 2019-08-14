const mongoose = require("mongoose");

const mongoDB_connectionURL = process.env.MONGODB_CONNECTION_URL;

mongoose.connect(mongoDB_connectionURL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
});
