import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import problems from "../data/problems";
import "../page_style/problemlist.css";

function ProblemsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All Topics");

  const filteredProblems = problems.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "All Topics" ? true : p.category === filter;
    return matchesSearch && matchesFilter;
  });

  const categories = ["All Topics", "Algorithms", "Database", "Shell", "Java"];

  return (
    <div className="problems-page">
      {/* Header */}
      <div className="problems-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>💻 All Coding Problems</h1>
      </div>

      {/* Filter Section */}
      <div className="problems-filter">
        <input
          type="text"
          placeholder="🔍 Search problems..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-tags">
          {categories.map((cat) => (
            <span
              key={cat}
              className={`filter-tag ${filter === cat ? "active" : ""}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Problems List */}
      <div className="problems-list">
        {filteredProblems.map((p, index) => (
          <div key={p.id} className="problem-card">
            <div className="problem-header">
              <span className="problem-number">#{index + 1}</span>
              <h3>{p.title}</h3>
              <span
                className={`difficulty ${
                  p.difficulty.toLowerCase()
                }`}
              >
                {p.difficulty}
              </span>
            </div>

            <p className="problem-desc">
              {p.description.slice(0, 120)}...
            </p>

            <div className="problem-footer">
              <span className="category">{p.category}</span>
              <Link to={`/problem/${p.id}`} className="solve-btn">
                Solve →
              </Link>
            </div>
          </div>
        ))}
        {filteredProblems.length === 0 && (
          <p className="no-results">No problems found 😢</p>
        )}
      </div>
    </div>
  );
}

export default ProblemsList;
