import type { Project } from '../content/projects'

/** Shared case-study article. Variants wrap this in windows, sheets, or snaps. */
export function CaseArticle({
  project,
  compact = false,
}: {
  project: Project
  compact?: boolean
}) {
  return (
    <article>
      <p className="text-secondary text-ink-muted tabular-nums">Case study {project.index}</p>
      <h3 className={`mt-3 max-w-3xl ${compact ? 'text-title sm:text-heading' : 'text-role sm:text-specimen'}`}>
        {project.title}
      </h3>
      <p className={`mt-6 max-w-2xl text-ink-muted ${compact ? 'text-secondary' : 'text-heading'}`}>
        {project.hook}
      </p>
      <dl className="mt-10 grid gap-x-6 gap-y-4 border-t border-rule pt-4 sm:grid-cols-2 lg:grid-cols-4">
        {project.meta.map((m) => (
          <div key={m.k}>
            <dt className="text-caption text-ink-muted">{m.k}</dt>
            <dd className="mt-1 text-compact">{m.v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-12 flex flex-wrap gap-2">
        {project.tags.map((t) => (
          <span
            key={t}
            className="inline-flex h-8 items-center rounded-full border border-rule px-3 text-compact text-ink-muted"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mt-16">{project.body()}</div>
    </article>
  )
}