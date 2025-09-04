import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0e111b] border-r border-white/10 flex flex-col p-6 space-y-6">
        <div className="flex items-center space-x-3">
          <Image src="/logo.png" alt="MOD Logo" width={40} height={40} />
          <h1 className="text-xl font-bold text-blue-500">MOD Admin</h1>
        </div>

        <nav className="flex flex-col space-y-2 mt-4">
          <Link href="/dashboard" className="hover:text-blue-400 transition">Dashboard</Link>
          <Link href="/dashboard/users" className="hover:text-blue-400 transition">Users</Link>
          <Link href="/dashboard/settings" className="hover:text-blue-400 transition">Settings</Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <form action="/auth/signout" method="post">
            <button className="text-red-400 hover:text-red-600 text-sm transition">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10">{children}</main>
    </div>
  )
}
