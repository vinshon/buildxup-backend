const express = require("express");
const serverless = require("serverless-http");
const handleErrors = require("../module_auth/middleware/auth.middleware");
require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(cors());
app.disable("x-powered-by");

const AuthApiRoutes = require("./src/routes/auth.route");

app.use(express.json());

app.use("/auth", AuthApiRoutes);

// HANDLING ERRORS
app.use(handleErrors);

module.exports.app = serverless(app);
