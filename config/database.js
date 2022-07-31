require("dotenv").config();
const mongoose = require("mongoose");


// const { MONGO_URI } = process.env;
const url = process.env.MONGOOSE_URI;
exports.connect = () => {

  mongoose
    .connect(url)
    .then(() => {
      console.log("Successfully connected to database");
    })
    .catch((error) => {
      console.log("database connection failed. exiting now...");
      console.error(error);
      process.exit(1);
    });
};