// Name: Pratik Satpute
const express = require("express");
const router = express.Router();

// STATIC SAMPLE TEMPLATES (for now no DB)
router.get("/", (req, res) => {
  res.json([
    {
      id: "template1",
      name: "Classic Professional",
      previewImage: "/images/template1.png"
    },
    {
      id: "template2",
      name: "Modern Minimal",
      previewImage: "/images/template2.png"
    },
    {
      id: "template3",
      name: "Elegant Blue",
      previewImage: "/images/template3.png"
    }
  ]);
});

module.exports = router;
