'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TEAM_MEMBERS, MEMBER_DISPLAY_NAMES } from '@/lib/constants'
import { Home, Menu, X, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all">
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
              className="transition-all hover:scale-105"
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
                className="transition-all hover:scale-105"
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
              className="justify-start transition-all"
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
                className="justify-start transition-all"
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
