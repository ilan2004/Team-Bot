'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { TEAM_MEMBERS, MEMBER_DISPLAY_NAMES } from '@/lib/constants'
import { Home } from 'lucide-react'

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">Team Update Bot</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Home Button */}
            <Button
              asChild
              variant={pathname === '/' ? 'default' : 'outline'}
              size="sm"
            >
              <Link href="/" className="flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
            </Button>

            {/* Member Buttons */}
            {TEAM_MEMBERS.map((member) => (
              <Button
                key={member}
                asChild
                variant={pathname === `/${member}` ? 'default' : 'outline'}
                size="sm"
              >
                <Link href={`/${member}`}>
                  {MEMBER_DISPLAY_NAMES[member]}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
