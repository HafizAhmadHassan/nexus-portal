import { Link } from 'react-router-dom'
import { Button, EmptyState, PageHeader } from '../components/ui'

export function NotFound() {
  return (
    <div>
      <PageHeader title="Page not found" />
      <EmptyState
        title="404 — this page does not exist"
        description="The link may be broken, or the company/record may have been removed."
        action={
          <Link to="/">
            <Button variant="primary">Back to overview</Button>
          </Link>
        }
      />
    </div>
  )
}