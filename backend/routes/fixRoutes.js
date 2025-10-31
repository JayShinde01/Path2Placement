const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { applyFix } = require("../controllers/fixController");

router.patch("/fix/:id", auth, applyFix);

module.exports = router;
