import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Navbar from './components/Navbar.tsx'
import Footer from './components/Footer.tsx'
import App from './App.tsx'
import About from './pages/About.tsx'
import Blog from './pages/Blog.tsx'
import FAQ from './pages/FAQ.tsx'
import Contact from './pages/Contact.tsx'
import TurnerIndex from './pages/TurnerIndex.tsx'

import SmoothScroll from './components/SmoothScroll.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SmoothScroll>
        <div className="min-h-screen bg-[#f1eee7] text-[#232323] flex flex-col font-pixel selection:bg-[#232323] selection:text-[#22c55e]">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/turner-index" element={<TurnerIndex />} />
              <Route path="/turing-index" element={<TurnerIndex />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </SmoothScroll>
    </BrowserRouter>
  </StrictMode>,
)
