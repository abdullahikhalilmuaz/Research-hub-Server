const express = require("express");
const getRoute = express.Router();

getRoute.get("/api", (req, res) => {
  res
    .status(200)
    .json({
      message: "Hello and welcome. server successfully started on port 8000",
    });
});

module.exports = getRoute;
