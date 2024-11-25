export const TabBar = ({ tabs, activeTab, setActiveTab }: { tabs: string[], activeTab: number, setActiveTab: (tab: number) => void }) => {
  return (
    <div className="flex items-start">
      {tabs.map((t, i) => {
        return (<div onClick={() => setActiveTab(i)} className={`hover:bg-slate-200 font-semibold cursor-pointer rounded mx-1 p-2 my-2 ${activeTab === i && "bg-slate-300 border-1 border-cyan-200"}`} key={i}>{t}</div>)
      })}
    </div>
  )
}