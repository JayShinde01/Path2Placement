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
import Template5 from "./components/Template5";
import Template6 from "./components/Template6";
import Template7 from "./components/Template7";
import Template8 from "./components/Template8";
import Template9 from "./components/Template9";
import Template10 from "./components/Template10";
import Template11 from "./components/Template11";
import Template12 from "./components/Template12";
import Template13 from "./components/Template13";
import Template14 from "./components/Template14";
import Template15 from "./components/Template15";
import ResumeBuilderFront from "./pages/ResumeBuilderFront";
import ProblemsList from "./pages/ProblemsList";
import ProblemPage from "./pages/ProblemPage";
import CodingPracticeHome from "./pages/CodingPracticeHome";
import Interview from "./pages/Interview";
import Reports from "./pages/Reports";
import JobRecommendation from "./pages/JobRecommendation";
import FloatingAssistant from "./components/FloatingAssistant";

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
        <Route path="/reports" element={<Reports />} />
        <Route path="/job-recommendation" element={<JobRecommendation />} />
        <Route path="/template/Template1" element={<Template1 />} />
        <Route path="/template/Template2" element={<Template2 />} />
        <Route path="/template/Template3" element={<Template3 />} />
        <Route path="/template/Template4" element={<Template4 />} />
        <Route path="/template/Template5" element={<Template5 />} />
        <Route path="/template/Template6" element={<Template6 />} />
        <Route path="/template/Template7" element={<Template7 />} />
        <Route path="/template/Template8" element={<Template8 />} />
        <Route path="/template/Template9" element={<Template9 />} />
        <Route path="/template/Template10" element={<Template10 />} />
        <Route path="/template/Template11" element={<Template11 />} />
        <Route path="/template/Template12" element={<Template12 />} />
        <Route path="/template/Template13" element={<Template13 />} />
        <Route path="/template/Template14" element={<Template14 />} />
        <Route path="/template/Template15" element={<Template15 />} />
      </Routes>
      <FloatingAssistant />
    </Router>
  );
}

export default App;
