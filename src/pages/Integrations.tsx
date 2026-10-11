import { Badge, Card, CardBody, CardHeader, EmptyState, PageHeader } from '../components/ui'
import { Icon } from '../components/icons'
import type { IconName } from '../components/icons'

interface Integration {
  name: string
  description: string
  icon: IconName
  configured: boolean
  phase: string
}

export function Integrations() {
  const aiUrl = import.meta.env.VITE_AI_BACKEND_URL?.trim() ?? ''
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
  const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? ''

  const integrations: Integration[] = [
    {
      name: 'Secure AI backend',
      description: 'Proxies AI provider calls, manages secrets, rate limits, and validates requests. The frontend never holds AI keys.',
      icon: 'sparkles',
      configured: aiUrl.length > 0,
      phase: 'Phase 2',
    },
    {
      name: 'Auth & hosted database',
      description: 'Real authentication and user-specific persistence (e.g. Supabase/Postgres) with row-level security.',
      icon: 'settings',
      configured: supabaseUrl.length > 0 && supabaseAnon.length > 0,
      phase: 'Phase 2',
    },
    {
      name: 'Company-data providers',
      description: 'Authorized APIs and registries for live company, contact, and financial data with provenance.',
      icon: 'discover',
      configured: false,
      phase: 'Phase 2',
    },
    {
      name: 'Email provider',
      description: 'Authorized sending with explicit confirmation and delivery status. Currently outreach is copy/export only.',
      icon: 'outreach',
      configured: false,
      phase: 'Phase 4',
    },
    {
      name: 'CRM & calendar sync',
      description: 'Two-way sync with CRM pipelines and calendar events for team workspaces.',
      icon: 'calendar',
      configured: false,
      phase: 'Phase 4',
    },
  ]

  const anyConfigured = integrations.some((i) => i.configured)

  return (
    <div>
      <PageHeader
        title="Integrations"
        description="Live services are intentionally optional in this build. The app runs fully on demo data."
      />

      <Card className="mb-5">
        <CardBody>
          <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Browser builds can only read public, <code className="rounded bg-slate-200 px-1">VITE_</code>-prefixed
              environment variables. Any value configured below is public. Private credentials belong on a secure
              backend — never in the frontend.
            </p>
          </div>
        </CardBody>
      </Card>

      {anyConfigured ? (
        <div className="mb-4">
          <Badge tone="success">Some integrations configured</Badge>
        </div>
      ) : (
        <div className="mb-4">
          <Badge tone="warning">No production integrations configured — demo mode</Badge>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {integrations.map((integration) => (
          <Card key={integration.name}>
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <Icon name={integration.icon} className="h-4 w-4 text-indigo-600" />
                  {integration.name}
                </span>
              }
              action={
                <Badge tone={integration.configured ? 'success' : 'neutral'}>
                  {integration.configured ? 'Configured' : 'Not connected'}
                </Badge>
              }
            />
            <CardBody>
              <p className="text-xs leading-relaxed text-slate-600">{integration.description}</p>
              <p className="mt-2 text-[11px] font-medium text-slate-400">{integration.phase} · planned</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader title="What happens when configuration is missing" />
        <CardBody className="text-xs text-slate-600">
          <p>
            Missing integrations never block the demo workflow, and production features fail clearly rather than
            silently pretending to work. See <code className="rounded bg-slate-100 px-1">.env.example</code> for the
            supported variables.
          </p>
        </CardBody>
      </Card>

      {!anyConfigured ? (
        <div className="mt-5">
          <EmptyState title="Everything here is optional in demo mode" description="Configure placeholders in a .env file to test public connection values at build time." />
        </div>
      ) : null}
    </div>
  )
}