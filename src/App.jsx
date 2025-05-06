import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Navbar from "./components/Navbar";
import Manager from "./components/Manager";
import Footer from "./components/Footer";
import Login from "./components/Login";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  const [count, setCount] = useState(0);
  // determine the route of the app and redirect to the correct page
  const [route, setRoute] = useState(window.location.pathname);
  return (
    <>
      <Navbar />
      <BrowserRouter>
        <Routes>
          <Route path="/manage" element={<Manager />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
      </BrowserRouter>
      <Footer />
    </>
  );
}

export default App;
