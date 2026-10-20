import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ImageSlot } from "./ImageSlot";
import { Container, RailLayout, SectionHead } from "./Section";
import { projects as CASES, type CaseId, type Project as CaseMeta } from "../content/projects";

/** 24th motion: open 360 ms, ease-out; the same curve carries the card back. */
const openMotion = { duration: 0.36, ease: [0.22, 0.61, 0.36, 1] as const };

export function Work() {
  const [openId, setOpenId] = useState<CaseId | null>(null);
  const reduced = useReducedMotion();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const openCase = CASES.find((c) => c.id === openId);

  // scroll lock + Escape + focus management while a case is open
  useEffect(() => {
    if (!openId) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    closeBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      returnFocusRef.current?.focus();
    };
  }, [openId]);

  return (
    <section id="work" className="relative py-24 sm:py-32">
      <Container>
        <SectionHead n="01" title="Selected work" />
        <RailLayout
          rail={
            <p>
              Two case studies. Open one to read the whole story — research,
              decisions and what shipped.
            </p>
          }
        >
          <div className="grid gap-6 md:grid-cols-2">
            {CASES.map((c) => (
              <CaseCard
                key={c.id}
                c={c}
                onOpen={(el) => {
                  returnFocusRef.current = el;
                  setOpenId(c.id);
                }}
                hidden={openId === c.id}
              />
            ))}
          </div>
        </RailLayout>
      </Container>

      {/* expanded case study — portalled so it sits above the floating nav */}
      {createPortal(
        <AnimatePresence>
          {openCase && (
            <motion.div
              key="overlay"
              className="fixed inset-0 z-[60] overflow-y-auto bg-canvas/50 p-2 backdrop-blur-xl sm:p-4 lg:p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.36 } }}
              exit={{ opacity: 0, transition: { duration: 0.26 } }}
              onClick={(e) => {
                if (e.target === e.currentTarget) setOpenId(null);
              }}
            >
              <motion.article
                layoutId={reduced ? undefined : `case-${openCase.id}`}
                transition={openMotion}
                role="dialog"
                aria-modal="true"
                aria-label={`Case study: ${openCase.title}`}
                className="glass mx-auto min-h-full max-w-5xl rounded-card bg-white/70"
              >
                <div className="p-4 sm:p-8 lg:p-12">
                  <div className="sticky top-2 z-10 flex justify-end sm:top-4">
                    <button
                      ref={closeBtnRef}
                      onClick={() => setOpenId(null)}
                      className="glass-dark inline-flex h-11 items-center gap-2 rounded-full px-5 text-compact text-white transition-colors duration-[260ms] hover:bg-pressed"
                    >
                      Close <span className="text-white/50">Esc</span>
                    </button>
                  </div>

                  <motion.header
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.2,
                      duration: 0.36,
                      ease: [0.22, 0.61, 0.36, 1],
                    }}
                    className="mb-16 mt-2"
                  >
                    <p className="text-secondary text-ink-muted tabular-nums">
                      Case study {openCase.index}
                    </p>
                    <h3 className="mt-3 max-w-3xl text-role sm:text-specimen">
                      {openCase.title}
                    </h3>
                    <p className="mt-6 max-w-2xl text-heading text-ink-muted">
                      {openCase.hook}
                    </p>
                    <dl className="mt-10 grid gap-x-6 gap-y-4 border-t border-rule pt-4 sm:grid-cols-2 lg:grid-cols-4">
                      {openCase.meta.map((m) => (
                        <div key={m.k}>
                          <dt className="text-caption text-ink-muted">{m.k}</dt>
                          <dd className="mt-1 text-compact">{m.v}</dd>
                        </div>
                      ))}
                    </dl>
                  </motion.header>

                  <motion.div
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.3,
                      duration: 0.36,
                      ease: [0.22, 0.61, 0.36, 1],
                    }}
                  >
                    {openCase.body()}
                  </motion.div>

                  <div className="mt-16 flex justify-center">
                    <button
                      onClick={() => setOpenId(null)}
                      className="glass inline-flex h-11 items-center rounded-full px-6 text-secondary transition-transform duration-[260ms] hover:-translate-y-0.5"
                    >
                      ← Back to work
                    </button>
                  </div>
                </div>
              </motion.article>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </section>
  );
}

function CaseCard({
  c,
  onOpen,
  hidden,
}: {
  c: CaseMeta;
  onOpen: (el: HTMLElement) => void;
  hidden: boolean;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.button
      layoutId={reduced ? undefined : `case-${c.id}`}
      transition={openMotion}
      onClick={(e) => onOpen(e.currentTarget)}
      whileHover={reduced ? undefined : { y: -2 }}
      aria-haspopup="dialog"
      className="glass sheen group flex w-full flex-col rounded-card p-4 text-left transition-shadow duration-[360ms] hover:shadow-glass-lift sm:p-6"
      style={{ visibility: hidden ? "hidden" : "visible" }}
    >
      <ImageSlot label={c.cardSlot.label} ratio={c.cardSlot.ratio} />
      <div className="mt-6 flex items-center justify-between gap-4">
        <span className="text-secondary text-ink-muted tabular-nums">
          {c.index}
        </span>
        <span className="inline-flex h-8 items-center rounded-full bg-control px-3 text-compact transition-colors duration-[260ms] group-hover:bg-ink group-hover:text-white">
          Open case study
        </span>
      </div>
      <h3 className="mt-3 text-title">{c.title}</h3>
      <p className="mt-1 text-compact text-ink-muted">{c.meta[0].v}</p>
      <p className="mt-4 text-secondary text-ink-muted">{c.hook}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {c.tags.map((t) => (
          <span
            key={t}
            className="inline-flex h-8 items-center rounded-full border border-rule px-3 text-compact text-ink-muted"
          >
            {t}
          </span>
        ))}
      </div>
    </motion.button>
  );
}
