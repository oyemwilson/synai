import { HashRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import LandingPage from './screens/landingpage/LandingPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/landingpage" element={<LandingPage />} />
        <Route path="/" element={<Navigate to="/landingpage" />} />
      </Routes>
    </Router>
  );
}

export default App;
