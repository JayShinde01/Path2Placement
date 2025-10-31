// Name: Pratik Satpute
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createResume,
  getResumes,
  getResumeById,
  updateResume,
  setTemplate,
  deleteResume,
} = require("../controllers/resumeController");

// CREATE
router.post("/", auth, createResume);

// GET ALL
router.get("/", auth, getResumes);

// GET ONE BY ID  ✅ (missing earlier)
router.get("/:id", auth, getResumeById);

// UPDATE FULL RESUME
router.put("/:id", auth, updateResume);

// UPDATE TEMPLATE ONLY
router.patch("/:id/template", auth, setTemplate);

// DELETE
router.delete("/:id", auth, deleteResume);

module.exports = router;
