const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());

mongoose.connect(
  "mongodb+srv://sahejbhatia748:<Saahe123>@cluster0.bafcj5b.mongodb.net/",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
