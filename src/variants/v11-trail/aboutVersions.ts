/**
 * Every draft of Trail's about paragraph, kept so none is lost. Each reads `before` + hayk + `after`,
 * so the name always carries its hike note. Browse them with the toggle above the about (shown
 * when the switcher UI is on) or share one with ?about=N.
 */
export interface AboutVersion {
  /** the positioning in a few words */
  label: string
  round: 'draft' | 1 | 2 | 'final'
  before: string
  after: string
  /** a second paragraph, if the draft has one */
  more?: string
}

export const ABOUT_VERSIONS: readonly AboutVersion[] = [
  {
    label: 'Your draft',
    round: 'draft',
    before: 'I am ',
    after:
      ', designing for startups who can’t afford confusion, taking products from zero to one. Currently I am a design engineer at mymizu, improving donations.',
  },

  /* round 1: one positioning, ten framings */
  {
    label: 'The photographer’s eye',
    round: 1,
    before: 'I’m ',
    after:
      ', a design engineer who learned to see through a camera before a screen. I’ve shown my photography in exhibitions, and I bring the same eye for framing and light to interfaces, then build them myself. Now at mymizu, I’m looking for an early-stage team that cares how things look and feel.',
  },
  {
    label: 'Six cities',
    round: 1,
    before: 'I’m ',
    after:
      '. In the last four years I’ve lived in six cities and worked across their countries, and every move taught me how fast a product gets confusing when people don’t share your context. I design and build for startups who can’t afford that confusion, taking products from zero to one.',
  },
  {
    label: 'Chose design',
    round: 1,
    before: 'I’m ',
    after:
      '. I’ve done go-to-market, product and event organizing, and I chose design because it’s where all three meet. Today I’m a design engineer at mymizu, improving donations in an app with 500K+ downloads. I want to do this at an early-stage startup.',
  },
  {
    label: 'Zero to one, end to end',
    round: 1,
    before: 'I’m ',
    after:
      ', a design engineer who takes products from zero to one for founders and small teams, from the brand all the way to the shipped app. Currently at mymizu, designing in-app donations that don’t break a free product’s promise.',
  },
  {
    label: 'Designs and ships',
    round: 1,
    before: 'I’m ',
    after:
      '. I design the product and ship the code. At Minerva I turned feedback buried behind a 25-second click path into one searchable dashboard: front-end, back-end, tests and SQL. Now I’m doing the same for donations at mymizu, and looking for a startup team to build with.',
  },
  {
    label: 'Can’t afford confusion',
    round: 1,
    before: 'I’m ',
    after:
      ', designing for startups who can’t afford confusion, taking products from zero to one. Currently a design engineer at mymizu, improving donations. Before design: go-to-market, product, events, and a camera.',
  },
  {
    label: 'Composition',
    round: 1,
    before: 'I’m ',
    after:
      ', a photographer turned design engineer. A good photo and a good interface ask the same question: what do you look at first? I answer it in Figma and in code, for startups that need one person to carry an idea all the way to the shipped app.',
  },
  {
    label: 'Short',
    round: 1,
    before: 'I’m ',
    after: ', a design engineer and photographer. I take startup products from zero to one, then ship them. Currently at mymizu.',
  },
  {
    label: 'The path',
    round: 1,
    before: 'I’m ',
    after:
      '. I studied computational sciences and the arts at Minerva, across six countries. Along the way I ran go-to-market, organized events and exhibited my photography, and I kept ending up at the same place: making things people use. Now I do that full time as a design engineer, at mymizu and, next, at a startup.',
  },
  {
    label: 'Open to',
    round: 1,
    before: 'I’m ',
    after:
      ', a design engineer who takes products from zero to one, with a photographer’s eye for what matters in the frame. Currently at mymizu. I’m looking to join an early-stage startup in San Francisco as its first or second designer, someone who can own the brand, the product and the code that ships it.',
  },

  /* round 2: ten different positionings, each a different reason to hire him */
  {
    label: 'Founding designer',
    round: 2,
    before: 'I’m ',
    after:
      ', a design engineer looking to be the first designer at an early-stage startup. At mymizu and at Minerva I owned the work end to end, from the first question to the shipped code. I’d rather set the bar for design on a team than inherit one.',
  },
  {
    label: 'Engineer who designs',
    round: 2,
    before: 'I’m ',
    after:
      '. I write the code for what I design, so nothing gets lost between the file and the product. At Minerva I shipped a searchable feedback dashboard across the front-end, back-end, tests and SQL. I’m looking for a startup where design and engineering sit at the same desk.',
  },
  {
    label: 'Visual craft',
    round: 2,
    before: 'I’m ',
    after:
      ', a photographer and design engineer. Exhibiting my work taught me that people decide in a glance whether something is worth their time. I design for that glance, and build what comes after it, for startups that need to earn attention fast.',
  },
  {
    label: 'Operator turned designer',
    round: 2,
    before: 'I’m ',
    after:
      '. I came to design from go-to-market, product and event organizing, so I design with the launch, the sales call and the room full of people in mind. Now a design engineer at mymizu, looking for a startup that wants a designer who thinks about the whole business.',
  },
  {
    label: 'Designing across cultures',
    round: 2,
    before: 'I’m ',
    after:
      ', a design engineer who has lived in six cities in four years and worked across their countries. Products travel further than their teams expect, so I design them to make sense to people who don’t share your language or context. I’m looking for a startup building for more than one market.',
  },
  {
    label: 'Designing for trust',
    round: 2,
    before: 'I’m ',
    after:
      '. I design the moments where a product asks people for something: money, data, attention. At mymizu I’m designing in-app donations for a free app with 500K+ downloads, without breaking its free-by-principle promise. I want to bring that care to a startup earning its first users’ trust.',
  },
  {
    label: 'Clarity from messy data',
    round: 2,
    before: 'I’m ',
    after:
      ', a design engineer who turns messy information into something people can act on. At Minerva, student feedback lived behind a 25-second click path; I designed and shipped one private, searchable dashboard instead. I’m looking for a startup with hard information problems.',
  },
  {
    label: 'Curator',
    round: 2,
    before: 'I’m ',
    after:
      '. I’ve curated photography exhibitions, and I approach products the same way: decide what to show, in what order, and what to leave out. I design and build for startups that need their product to tell one clear story.',
  },
  {
    label: 'One person, brand to app',
    round: 2,
    before: 'I’m ',
    after:
      ', a design engineer who takes products from zero to one for founders and small teams, from the brand to the shipped app. One vision, no handoffs in between. Currently at mymizu, and looking for the next team to build with.',
  },
  {
    label: 'Useful fast, anywhere',
    round: 2,
    before: 'I’m ',
    after:
      '. I studied computational sciences and the arts at Minerva, in classrooms across six countries, and learned to get useful fast in unfamiliar places. That’s what an early-stage startup needs from its designer, and it’s what I’m looking for: a small team, a big unknown, and room to ship.',
  },

  /* the final copy, put together from 19, 16 and 20 */
  {
    label: 'Final',
    round: 'final',
    before: 'I’m ',
    after:
      ', a design engineer who takes products from zero to one for startups, from the brand to the shipped app. I design the moments where a product asks people for something (money, data, attention), and I care about doing it without breaking their trust. At mymizu I’m designing in-app donations for a free app with 500K+ downloads.',
    more: 'I studied computational sciences and the arts at Minerva across SF, Berlin, Seoul, Buenos Aires, Taipei and Tokyo, and learned to get useful fast in unfamiliar places. So I’m looking for an exciting, fast-paced environment where there’s a big unknown and room to ship.',
  },
]

/** the one visitors see */
export const FINAL_VERSION = ABOUT_VERSIONS.length - 1
