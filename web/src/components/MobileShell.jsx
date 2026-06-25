export function MobileShell({ children }) {
  return (
    // 좁은 화면(실제 폰): 베젤 없이 전체화면. sm(640px)+ 데스크탑: 핸드폰 베젤 안에 표시.
    <div className="min-h-screen sm:flex sm:items-center sm:justify-center sm:bg-neutral-100 sm:py-8">
      <div className="sm:p-[13px] sm:bg-[#161617] sm:rounded-[56px] sm:shadow-2xl">
        <div className="relative w-full h-screen sm:w-[448px] sm:h-[946px] bg-white overflow-hidden sm:rounded-[44px]">
          {children}
        </div>
      </div>
    </div>
  )
}
