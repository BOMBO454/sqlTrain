import { Route, Routes } from 'react-router'
import { Shell } from './components/Shell.tsx'
import { ExercisePage } from './pages/ExercisePage.tsx'
import { HomePage } from './pages/HomePage.tsx'
import { SandboxPage } from './pages/SandboxPage.tsx'
import { TopicPage } from './pages/TopicPage.tsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/topic/:topicId" element={<TopicPage />} />
        <Route path="/exercise/:exerciseId" element={<ExercisePage />} />
        <Route path="/sandbox" element={<SandboxPage />} />
      </Route>
    </Routes>
  )
}
