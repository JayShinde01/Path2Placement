
const express = require("express");
const cors = require("cors");
const app = express();
const connectDB = require("./config/db");
const dotenv= require('dotenv')
dotenv.config()
connectDB();
app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/templates", require("./routes/templateRoutes"));
app.use("/api/analyzer", require("./routes/analyzerRoutes"));
app.use("/api/resume", require("./routes/fixRoutes"));   // PATCH only
app.use("/api/resumes", require("./routes/resumeRoutes")); // CRUD only


app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
