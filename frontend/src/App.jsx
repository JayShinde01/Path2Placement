import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Templates from "./pages/Templates";
import ResumeEditor from "./pages/ResumeEditor";
import Home from "./pages/Home";
import Template1 from "./components/Template1";
import Template2 from "./components/Template2";
import Template3 from "./components/Template3";
import Template4 from "./components/Template4";
import ResumeBuilderFront from "./pages/ResumeBuilderFront";
import ProblemsList from "./pages/ProblemsList";
import ProblemPage from "./pages/ProblemPage";
import CodingPracticeHome from "./pages/CodingPracticeHome";
import Interview from "./pages/Interview"
function App() {
 

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/editor" element={<ResumeEditor />} />
        <Route path="/resume" element={<ResumeBuilderFront />} />
        <Route path="/coding" element={<ProblemsList />} />
        <Route path="/problem/:id" element={<ProblemPage />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/codinghome" element={<CodingPracticeHome />} />
        <Route path="/template/Template1" element={<Template1 />} />
        <Route path="/template/Template2" element={<Template2 />} />
        <Route path="/template/Template3" element={<Template3 />} />
        <Route path="/template/Template4" element={<Template4 />} />

       
      </Routes>
    </Router>
  );
}

export default App;
