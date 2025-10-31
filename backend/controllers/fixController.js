const Resume = require("../models/Resume");

exports.applyFix = async (req, res) => {
  try {
    const { fixType } = req.body; // like "addSummary" or "addSkills"

    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!resume) return res.status(404).json({ msg: "Resume not found" });

    if (fixType === "addSummary") {
      resume.summary = "Motivated Computer Science student with hands-on experience in MERN stack, problem solving, and real-world project development.";
    }

    if (fixType === "addSkills") {
      resume.skills = ["JavaScript", "React", "Node.js", "MongoDB", "Git", "HTML", "CSS"];
    }

    await resume.save();
    res.json({ msg: "Fix applied", resume });

  } catch (err) {
    res.status(500).json({ msg: "Error applying fix" });
  }
};
