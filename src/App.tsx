import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { JobsBoard } from "./components/JobsBoard";
import { JobDetail } from "./components/JobDetail";
import { ToastProvider } from "./components/ToastProvider";

const App: React.FC = () => {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<JobsBoard />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
};

export default App;
