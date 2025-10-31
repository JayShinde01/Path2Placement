const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    templateId: {
      type: String, // which resume template chosen (e.g., "Template1")
      required: true,
    },

    // 🧾 Personal Information
    personal: {
      name: String,
      title: String,
      email: String,
      phone: String,
      address: String,
      github: String,
      linkedin: String,
      summary: String,
    },

    // 🧠 Skills
    skills: {
      type: [String],
      default: [],
    },

    // 💼 Experience
    experience: [
      {
        role: String,
        company: String,
        duration: String,
        description: String,
      },
    ],

    // 🎓 Education
    education: [
      {
        degree: String,
        institute: String,
        year: String,
        grade: String,
      },
    ],

    // 🧩 Projects
    projects: [
      {
        title: String,
        tech: String,
        description: String,
      },
    ],

    // 🏅 Certifications
    certifications: {
      type: [String],
      default: [],
    },

    // 🏆 Achievements
    achievements: {
      type: [String],
      default: [],
    },

    // 🎯 Activities
    activities: {
      type: [String],
      default: [],
    },

    // 🌐 Languages
    languages: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);
