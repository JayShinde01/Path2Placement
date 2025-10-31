const Resume = require("../models/Resume");

exports.analyzeResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!resume) return res.status(404).json({ msg: "Resume not found" });

    let grammarIssues = [];
    let atsSuggestions = [];
    let score = 0;

    // === BASIC RULES ===

    if (!resume.title || resume.title.length < 5) {
      grammarIssues.push("Your resume title is too short or missing.");
    } else {
      score += 10;
    }

    if (!resume.summary || resume.summary.length < 30) {
      atsSuggestions.push("Add a professional summary of at least 2–3 lines.");
    } else {
      score += 20;
    }

    if (!resume.skills || resume.skills.length === 0) {
      atsSuggestions.push("Add at least 5 relevant technical / soft skills.");
    } else {
      score += 20;
    }

    if (!resume.experience || resume.experience.length === 0) {
      atsSuggestions.push("Add your internship or project experience.");
    } else {
      score += 30;
    }

    // Max score = 80 (for now)

    res.json({
      grammarIssues,
      atsSuggestions,
      score,
      message: "Rule-based analyzer executed",
    });

  } catch (err) {
    res.status(500).json({ msg: "Error analyzing resume" });
  }
};
