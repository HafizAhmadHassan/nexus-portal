import { Link } from 'react-router-dom'
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  PageHeader,
  ProgressBar,
  StatCard,
} from '../components/ui'
import { PriorityBadge, StageBadge } from '../components/badges'
import { Icon } from '../components/icons'
import { DEMO_DATA_NOTICE } from '../lib/demoData'
import { describeRelative, formatDateTime } from '../lib/format'
import { effectivePriority } from '../lib/scoring'
import {
  getCompany,
  getMetrics,
  getWeeklyProgress,
  priorityOpportunities,
  recentActivity,
  recommendedActions,
  upcomingTasks,
} from '../lib/selectors'
import { useApp } from '../state/AppState'

export function Overview() {
  const { state } = useApp()
  const metrics = getMetrics(state)
  const weekly = getWeeklyProgress(state)
  const priority = priorityOpportunities(state, 4)
  const tasks = upcomingTasks(state).slice(0, 5)
  const activity = recentActivity(state, 7)
  const actions = recommendedActions(state)

  return (
    <div>
      <PageHeader
        title="Overview"
        description="What you have accomplished, which opportunities matter, and what to do next."
      />

      <div className="mb-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{DEMO_DATA_NOTICE}</p>
      </div>

      <section aria-label="Summary metrics" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Companies discovered" value={metrics.companiesDiscovered} />
        <StatCard label="Companies researched" value={metrics.companiesResearched} />
        <StatCard label="Opportunities identified" value={metrics.opportunitiesIdentified} />
        <StatCard label="Contacts verified" value={metrics.contactsVerified} />
        <StatCard label="Outreach drafts" value={metrics.outreachDrafts} />
        <StatCard
          label="Follow-ups due"
          value={metrics.followupsDue}
          hint={metrics.followupsDue > 0 ? 'Needs attention' : 'All clear'}
        />
      </section>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader
              title="Weekly progress"
              description="Targets you set, measured from tracked activity events."
              action={
                <Link to="/goals" className="text-xs font-medium text-indigo-600 hover:underline">
                  Manage goals
                </Link>
              }
            />
            <CardBody className="space-y-3">
              {weekly.map((goal) => (
                <div key={goal.metric}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{goal.label}</span>
                    <span className="text-slate-500">
                      {goal.count} / {goal.target}
                    </span>
                  </div>
                  <ProgressBar value={goal.ratio} />
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Priority opportunities"
              description="Ranked by the transparent weighted score."
              action={
                <Link
                  to="/opportunities"
                  className="text-xs font-medium text-indigo-600 hover:underline"
                >
                  View all
                </Link>
              }
            />
            <CardBody className="space-y-2.5">
              {priority.length === 0 ? (
                <EmptyState
                  title="No opportunities yet"
                  description="Open a company profile and record an opportunity to see it here."
                />
              ) : (
                priority.map((opp) => {
                  const company = getCompany(state, opp.companyId)
                  return (
                    <div
                      key={opp.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{opp.title}</p>
                        <p className="truncate text-xs text-slate-500">
                          {company?.name ?? 'Unknown company'}
                          {company ? ` · ${company.comune}` : ''}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <StageBadge stage={opp.stage} />
                        <PriorityBadge score={effectivePriority(opp, state.settings.weights)} />
                      </div>
                    </div>
                  )
                })
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Upcoming follow-ups"
              description="Open tasks ordered by due date."
              action={
                <Link to="/tasks" className="text-xs font-medium text-indigo-600 hover:underline">
                  All tasks
                </Link>
              }
            />
            <CardBody className="space-y-2">
              {tasks.length === 0 ? (
                <EmptyState title="No open follow-ups" description="You are up to date." />
              ) : (
                tasks.map((task) => {
                  const company = getCompany(state, task.companyId)
                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm text-slate-800">{task.title}</p>
                        {company ? (
                          <Link
                            to={`/companies/${company.id}`}
                            className="truncate text-xs text-indigo-600 hover:underline"
                          >
                            {company.name}
                          </Link>
                        ) : null}
                      </div>
                      <Badge tone={describeRelative(task.dueDate).includes('ago') ? 'danger' : 'neutral'}>
                        <Icon name="calendar" className="h-3 w-3" />
                        {describeRelative(task.dueDate)}
                      </Badge>
                    </div>
                  )
                })
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Recommended next actions" description="Based on current app state." />
            <CardBody className="space-y-2">
              {actions.map((action) => (
                <Link
                  key={action.title}
                  to={action.to}
                  className="flex items-start gap-2 rounded-lg border border-slate-100 px-3 py-2 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
                >
                  <Icon name="arrowRight" className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                  <span>
                    <span className="block text-sm font-medium text-slate-800">{action.title}</span>
                    <span className="block text-xs text-slate-500">{action.description}</span>
                  </span>
                </Link>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Recent activity"
              description="Meaningful actions with timestamps."
              action={
                <Link to="/history" className="text-xs font-medium text-indigo-600 hover:underline">
                  History
                </Link>
              }
            />
            <CardBody>
              <ul className="space-y-2.5">
                {activity.map((event) => (
                  <li key={event.id} className="flex gap-2 text-xs">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                    <span>
                      <span className="block text-slate-700">{event.label}</span>
                      <span className="block text-slate-400">{formatDateTime(event.at)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
