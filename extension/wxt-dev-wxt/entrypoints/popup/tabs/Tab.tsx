export const Tab = ({ tabNumber, activeTab, children }: { tabNumber: number, activeTab: number, children: JSX.Element }) => {
  return activeTab === tabNumber && (
    <>
      {children}
    </>
  )
}