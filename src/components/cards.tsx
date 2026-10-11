import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Badge, Button, Card, cn } from './ui'
import {
  CategoryBadge,
  ConfidenceBadge,
  EvidenceBadge,
  PriorityBadge,
  ResearchStatusBadge,
  StageBadge,
  TaskPriorityBadge,
  TaskStatusBadge,
  VerificationBadge,
} from './badges'
import { Icon } from './icons'
import { effectivePriority } from '../lib/scoring'
import { describeRelative, formatDate } from '../lib/format'
import { pipelineStages, stageLabels, taskStatusLabels } from '../lib/labels'
import { getCompany } from '../lib/selectors'
import { useApp } from '../state/AppState'
import type {
  Company,
  Contact,
  Opportunity,
  OpportunityStage,
  Task,
  TaskStatus,
} from '../lib/types'

// --- Company -----------------------------------------------------------------

export function CompanyCard({
  company,
  relevance,
  actions,
}: {
  company: Company
  relevance?: string
  actions?: ReactNode
}) {
  return (
    <Card as="article" className="flex h-full flex-col p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900">
            <Link to={`/companies/${company.id}`} className="hover:text-indigo-700">
              {company.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {company.industry} · {company.comune} ({company.province})
          </p>
        </div>
        <ResearchStatusBadge status={company.status} />
      </div>

      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">
        {company.description}
      </p>

      {relevance ? (
        <p className="mt-2 rounded-md bg-slate-50 px-2 py-1.5 text-[11px] leading-snug text-slate-500">
          {relevance}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge tone="neutral">{company.employeeRange} employees</Badge>
        {company.website ? (
          <a
            href={company.website}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:underline"
          >
            Website
            <Icon name="external" className="h-3 w-3" />
          </a>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <Link
          to={`/companies/${company.id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline"
        >
          Open intelligence profile
          <Icon name="arrowRight" className="h-3.5 w-3.5" />
        </Link>
        {actions}
      </div>
    </Card>
  )
}

// --- Opportunity -------------------------------------------------------------

export function OpportunityCard({
  opportunity,
  showCompany = true,
}: {
  opportunity: Opportunity
  showCompany?: boolean
}) {
  const { state, dispatch } = useApp()
  const company = getCompany(state, opportunity.companyId)
  const score = effectivePriority(opportunity, state.settings.weights)

  return (
    <Card as="article" className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-slate-900">{opportunity.title}</h3>
          {showCompany && company ? (
            <Link
              to={`/companies/${company.id}`}
              className="text-xs text-slate-500 hover:text-indigo-700"
            >
              {company.name} · {company.comune}
            </Link>
          ) : null}
        </div>
        <PriorityBadge score={score} />
      </div>

      <p className="mt-2 text-xs leading-relaxed text-slate-600">{opportunity.problem}</p>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <StageBadge stage={opportunity.stage} />
        <CategoryBadge category={opportunity.category} />
        <EvidenceBadge evidence={opportunity.evidence} />
        <ConfidenceBadge confidence={opportunity.confidence} />
      </div>

      <p className="mt-2 text-[11px] text-slate-500">
        <span className="font-medium text-slate-600">Evidence:</span> {opportunity.evidenceNote}
      </p>

      {opportunity.nextAction ? (
        <p className="mt-1.5 text-[11px] text-slate-500">
          <span className="font-medium text-slate-600">Next action:</span> {opportunity.nextAction}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
        <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
          Stage
          <select
            value={opportunity.stage}
            onChange={(e) =>
              dispatch({
                type: 'SET_OPPORTUNITY_STAGE',
                id: opportunity.id,
                stage: e.target.value as OpportunityStage,
              })
            }
            className="rounded-md border border-slate-300 bg-white px-1.5 py-1 text-[11px] text-slate-700"
            aria-label={`Change stage for ${opportunity.title}`}
          >
            {pipelineStages.concat(['lost', 'hold']).map((stage) => (
              <option key={stage} value={stage}>
                {stageLabels[stage]}
              </option>
            ))}
          </select>
        </label>
        <Link
          to={`/outreach?company=${opportunity.companyId}&opportunity=${opportunity.id}`}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
        >
          <Icon name="outreach" className="h-3.5 w-3.5" />
          Prepare outreach
        </Link>
        {company ? (
          <Link
            to={`/companies/${company.id}`}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:underline"
          >
            View company
          </Link>
        ) : null}
      </div>
    </Card>
  )
}

// --- Contact -----------------------------------------------------------------

export function ContactRow({
  contact,
  onEdit,
}: {
  contact: Contact
  onEdit?: (contact: Contact) => void
}) {
  const { state, dispatch } = useApp()
  const company = getCompany(state, contact.companyId)

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="px-3 py-2.5 align-top">
        <p className="text-sm font-medium text-slate-900">{contact.name}</p>
        <p className="text-xs text-slate-500">{contact.role}</p>
      </td>
      <td className="px-3 py-2.5 align-top">
        {company ? (
          <Link to={`/companies/${company.id}`} className="text-xs text-indigo-600 hover:underline">
            {company.name}
          </Link>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>
      <td className="px-3 py-2.5 align-top text-xs text-slate-600">
        <p>{contact.relevance}</p>
        <p className="mt-1 text-slate-400">
          {contact.email ?? 'No public email'} · {contact.phone ?? 'no phone'}
        </p>
      </td>
      <td className="px-3 py-2.5 align-top">
        <VerificationBadge verification={contact.verification} />
        <p className="mt-1 text-[11px] text-slate-400">
          {contact.lastCheckedAt ? `Checked ${formatDate(contact.lastCheckedAt)}` : 'Never checked'}
        </p>
      </td>
      <td className="px-3 py-2.5 align-top">
        <div className="flex flex-col items-start gap-1">
          {contact.verification !== 'verified' ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                dispatch({
                  type: 'UPDATE_CONTACT',
                  id: contact.id,
                  patch: {
                    verification: 'verified',
                    lastCheckedAt: new Date().toISOString(),
                  },
                })
              }
            >
              <Icon name="check" className="h-3.5 w-3.5" />
              Mark verified
            </Button>
          ) : null}
          {onEdit ? (
            <Button size="sm" variant="ghost" onClick={() => onEdit(contact)}>
              Edit
            </Button>
          ) : null}
        </div>
      </td>
    </tr>
  )
}

// --- Task --------------------------------------------------------------------

export function TaskCard({ task }: { task: Task }) {
  const { state, dispatch } = useApp()
  const company = getCompany(state, task.companyId)

  return (
    <Card className={cn('p-3.5', task.status === 'completed' && 'opacity-70')}>
      <div className="flex items-start gap-2">
        <button
          type="button"
          aria-label={task.status === 'completed' ? 'Reopen task' : 'Mark task complete'}
          title={task.status === 'completed' ? 'Reopen task' : 'Mark task complete'}
          onClick={() =>
            dispatch({
              type: 'UPDATE_TASK',
              id: task.id,
              patch:
                task.status === 'completed'
                  ? { status: 'todo', completedAt: undefined }
                  : { status: 'completed', completedAt: new Date().toISOString() },
            })
          }
          className={cn(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border',
            task.status === 'completed'
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-slate-300 bg-white text-transparent hover:border-indigo-500',
          )}
        >
          <Icon name="check" className="h-3.5 w-3.5" />
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'text-sm font-medium text-slate-900',
              task.status === 'completed' && 'line-through',
            )}
          >
            {task.title}
          </p>
          {task.description ? (
            <p className="mt-0.5 text-xs text-slate-500">{task.description}</p>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <TaskStatusBadge status={task.status} />
            <TaskPriorityBadge priority={task.priority} />
            {task.dueDate ? (
              <Badge tone="neutral">
                <Icon name="calendar" className="h-3 w-3" />
                {describeRelative(task.dueDate)}
              </Badge>
            ) : null}
            {company ? (
              <Link
                to={`/companies/${company.id}`}
                className="text-[11px] font-medium text-indigo-600 hover:underline"
              >
                {company.name}
              </Link>
            ) : null}
          </div>
        </div>

        <label className="shrink-0">
          <span className="sr-only">Task status</span>
          <select
            value={task.status}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_TASK',
                id: task.id,
                patch: {
                  status: e.target.value as TaskStatus,
                  completedAt: e.target.value === 'completed' ? new Date().toISOString() : undefined,
                },
              })
            }
            className="rounded-md border border-slate-300 bg-white px-1.5 py-1 text-[11px] text-slate-600"
          >
            {(Object.keys(taskStatusLabels) as TaskStatus[]).map((s) => (
              <option key={s} value={s}>
                {taskStatusLabels[s]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </Card>
  )
}
