import { LiquidField } from './LiquidField'
import { Nav } from './Nav'
import { Hero } from './Hero'
import { Work } from './Work'
import { About } from './About'
import { Resume } from './Resume'
import { Contact } from './Contact'

/** The original single-page composition; used as a scaffold while a variant is built. */
export function Classic() {
  return (
    <div className="relative min-h-svh">
      <LiquidField />
      <main className="relative z-10">
        <Hero />
        <Work />
        <About />
        <Resume />
        <Contact />
      </main>
      <Nav />
    </div>
  )
}
