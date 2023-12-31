import "./App.css";
import Home from "./components/Home";
import Footer from "./components/layot/Footer";
import Header from "./components/layot/Header";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProductDetails from "./components/product/ProductDetails";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <div className="App">
        <div className="container container-fluid">
          <Routes>
            <Route path="/" element={<Home />} exact />
            <Route path="/product/:id" element={<ProductDetails />} exact />
          </Routes>
        </div>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
