const express = require("express");
require("dotenv").config();
const dbConnect = require("./config/dbconnect");
const initRoutes = require("./routes");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express(); //tạo app
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["POST", "PUT", "GET", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
const port = process.env.PORT || 8888; //8888 du phong //port chay server
app.use(express.json()); //doc data tu client gui len theo kieu json
app.use(express.urlencoded({ extended: true })); //giup doc dc data gui theo kieu urlencode
dbConnect();
initRoutes(app);

app.listen(port, () => {
  console.log("server running on the port " + port);
});
