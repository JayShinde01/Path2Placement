const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },          // Template name (e.g. Modern, Classic)
    previewImage: { type: String, required: true },  // URL of preview image
    htmlStructure: { type: String, required: true }  // HTML/CSS for rendering resume
  },
  { timestamps: true }
);

module.exports = mongoose.model("Template", templateSchema);
