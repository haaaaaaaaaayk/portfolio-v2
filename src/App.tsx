import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Work } from './components/Work'
import { About } from './components/About'
import { Resume } from './components/Resume'
import { Contact } from './components/Contact'
import { CursorRing } from './components/CursorRing'

export default function App() {
  return (
    <div className="grain relative min-h-svh">
      <Nav />
      <main>
        <Hero />
        <Work />
        <About />
        <Resume />
        <Contact />
      </main>
      <CursorRing />
    </div>
  )
}
