import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import MobileCTA from './components/MobileCTA'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Contact from './pages/Contact'
import Call from './pages/Call'
import Quote from './pages/Quote'

export default function App() {
  return (
    <div className="grain min-h-dvh flex flex-col">
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/call" element={<Call />} />
          <Route path="/quote" element={<Quote />} />
        </Routes>
      </div>
      <Footer />
      <MobileCTA />
    </div>
  )
}
