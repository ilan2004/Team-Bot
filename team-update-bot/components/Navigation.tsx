'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TEAM_MEMBERS, MEMBER_DISPLAY_NAMES } from '@/lib/constants'
import { Home, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)

  return (
    <nav className="bg-white shadow-sm border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="text-xl font-bold text-stone-900 hover:text-stone-700 transition-colors">
              Nudge
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Home Button */}
            <Button
              asChild
              variant={pathname === '/' ? 'default' : 'ghost'}
              size="sm"
            >
              <Link href="/" className="flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span className="hidden lg:inline">Home</span>
              </Link>
            </Button>

            {/* Member Buttons */}
            {TEAM_MEMBERS.map((member) => (
              <Button
                key={member}
                asChild
                variant={pathname === `/${member}` ? 'default' : 'ghost'}
                size="sm"
              >
                <Link href={`/${member}`}>
                  {MEMBER_DISPLAY_NAMES[member]}
                </Link>
              </Button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          mobileMenuOpen ? "max-h-64 pb-4" : "max-h-0"
        )}>
          <div className="flex flex-col space-y-2 pt-2">
            {/* Mobile Home Button */}
            <Button
              asChild
              variant={pathname === '/' ? 'default' : 'ghost'}
              size="sm"
              className="justify-start"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Link href="/" className="flex items-center space-x-3 w-full">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
            </Button>

            {/* Mobile Member Buttons */}
            {TEAM_MEMBERS.map((member) => (
              <Button
                key={member}
                asChild
                variant={pathname === `/${member}` ? 'default' : 'ghost'}
                size="sm"
                className="justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href={`/${member}`} className="w-full text-left">
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
