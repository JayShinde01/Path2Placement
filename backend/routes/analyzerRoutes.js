
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { analyzeResume } = require("../controllers/analyzerController");

router.post("/analyze/:id", auth, analyzeResume);

module.exports = router;
