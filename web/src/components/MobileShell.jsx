export function MobileShell({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 py-8">
      <div className="p-[13px] bg-[#161617] rounded-[56px] shadow-2xl">
        <div className="relative w-[448px] h-[946px] bg-white overflow-hidden rounded-[44px]">
          {children}
        </div>
      </div>
    </div>
  )
}
