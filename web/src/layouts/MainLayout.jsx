import { BottomNav } from '../components/BottomNav'
import { CaptureSheet } from '../screens/Capture'

export function MainLayout({ children }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 overflow-y-auto nsb pb-[110px]">{children}</div>
      <BottomNav />
      <CaptureSheet />
    </div>
  )
}
