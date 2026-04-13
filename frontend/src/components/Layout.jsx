import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen w-full bg-slate-50 px-3 py-4 md:px-5 md:py-5">
      <div className="w-full space-y-5">
        <Navbar mode="faculty" />
        <div className="grid gap-5 md:grid-cols-[270px_1fr]">
          <Sidebar />
          <main className="space-y-5">{children}</main>
        </div>
      </div>
    </div>
  )
}
