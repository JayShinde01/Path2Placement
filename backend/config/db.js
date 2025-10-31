const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.URL);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;