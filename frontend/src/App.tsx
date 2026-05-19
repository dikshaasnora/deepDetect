import { Routes, Route } from "react-router-dom"
import Layout from "@/components/Layout"
import Detect from "@/pages/Detect"
import Research from "@/pages/Research"
import About from "@/pages/About"

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Detect />} />
        <Route path="/research" element={<Research />} />
        <Route path="/about" element={<About />} />
      </Route>
    </Routes>
  )
}
