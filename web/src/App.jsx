import { Routes, Route, useLocation } from 'react-router-dom'
import { MobileShell } from './components/MobileShell'
import { StatusBar } from './components/StatusBar'
import { MainLayout } from './layouts/MainLayout'
import { Onboarding } from './screens/Onboarding'
import { Home } from './screens/Home'
import { MapScreen } from './screens/Map'
import { Saved } from './screens/Saved'
import { My } from './screens/My'
import { Capture } from './screens/Capture'
import { Analyzing } from './screens/Analyzing'
import { Identify } from './screens/Identify'
import { Detail } from './screens/Detail'
import { Notifications } from './screens/Notifications'
import { Unsupported } from './screens/Unsupported'
import { WebLanding } from './screens/WebLanding'
import { WebMap } from './screens/WebMap'

function Phone({ children }) {
  const loc = useLocation()
  // 경로가 바뀔 때마다 key가 갱신되어 화면이 부드럽게 슬라이드·페이드 인 된다.
  return (
    <MobileShell>
      <StatusBar />
      <div key={loc.pathname} className="absolute inset-0 animate-screenIn">{children}</div>
    </MobileShell>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Phone><Onboarding /></Phone>} />
      <Route path="/home" element={<Phone><MainLayout><Home /></MainLayout></Phone>} />
      <Route path="/map" element={<Phone><MainLayout><MapScreen /></MainLayout></Phone>} />
      <Route path="/saved" element={<Phone><MainLayout><Saved /></MainLayout></Phone>} />
      <Route path="/my" element={<Phone><MainLayout><My /></MainLayout></Phone>} />
      <Route path="/capture" element={<Phone><Capture /></Phone>} />
      <Route path="/analyzing" element={<Phone><Analyzing /></Phone>} />
      <Route path="/identify" element={<Phone><Identify /></Phone>} />
      <Route path="/detail/:id" element={<Phone><Detail /></Phone>} />
      <Route path="/notifications" element={<Phone><Notifications /></Phone>} />
      <Route path="/unsupported" element={<Phone><Unsupported /></Phone>} />
      <Route path="/web" element={<WebLanding />} />
      <Route path="/web/map" element={<WebMap />} />
    </Routes>
  )
}
