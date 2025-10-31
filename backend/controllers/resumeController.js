const Resume = require("../models/Resume");


// CREATE RESUME
exports.createResume = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);   // <---- ADD THIS LINE
    console.log("REQ USER:", req.user);   // <---- AND THIS

    const resume = await Resume.create({ ...req.body, userId: req.user.id });
    res.status(201).json(resume);
  } catch (err) {
  console.log("CREATE ERROR ===>", err);  // <-- ADD THIS LINE
  res.status(500).json({ msg: "Error creating resume" });
  console.log("REQ BODY:", req.body);
console.log("REQ USER:", req.user);
console.log("CREATE ERROR ===>", err);
}
};


// GET ALL RESUMES OF LOGGED USER
exports.getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id });
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching resumes" });
  }
};

// GET SINGLE RESUME BY ID (SECURE)
exports.getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!resume) return res.status(404).json({ msg: "Resume not found" });

    res.json(resume);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching resume" });
  }
};

// UPDATE RESUME (SECURE)
exports.updateResume = async (req, res) => {
  try {
    const updated = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ msg: "Resume not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: "Error updating resume" });
  }
};

exports.setTemplate = async (req, res) => {
  try {
    const updated = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { templateId: req.body.templateId },
      { new: true }
    );

    if (!updated) return res.status(404).json({ msg: "Resume not found" });

    res.json({ msg: "Template updated", resume: updated });
  } catch (err) {
    res.status(500).json({ msg: "Error updating template" });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const deleted = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deleted) return res.status(404).json({ msg: "Resume not found" });

    res.json({ msg: "Resume deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting resume" });
  }
};

