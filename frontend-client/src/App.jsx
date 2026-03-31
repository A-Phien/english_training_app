import { Routes, Route } from "react-router-dom";
import LessonList from "./pages/LessonList";
import LessonDetail from "./pages/LessonDetail";
import Header from "./Layout/header";
import Footer from "./Layout/Footer";
import Login from "./auth/login";

function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<LessonList />} />
        <Route path="/lesson/:id" element={<LessonDetail />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;