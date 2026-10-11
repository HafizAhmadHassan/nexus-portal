import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Overview } from './pages/Overview'
import { Discover } from './pages/Discover'
import { Companies } from './pages/Companies'
import { CompanyDetail } from './pages/CompanyDetail'
import { Opportunities } from './pages/Opportunities'
import { Contacts } from './pages/Contacts'
import { OutreachStudio } from './pages/OutreachStudio'
import { Tasks } from './pages/Tasks'
import { Goals } from './pages/Goals'
import { History } from './pages/History'
import { Integrations } from './pages/Integrations'
import { Settings } from './pages/Settings'
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Overview />} />
        <Route path="discover" element={<Discover />} />
        <Route path="companies" element={<Companies />} />
        <Route path="companies/:companyId" element={<CompanyDetail />} />
        <Route path="opportunities" element={<Opportunities />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="outreach" element={<OutreachStudio />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="goals" element={<Goals />} />
        <Route path="history" element={<History />} />
        <Route path="integrations" element={<Integrations />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
