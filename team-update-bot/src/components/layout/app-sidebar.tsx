'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { useTeamStore } from '@/store/team-store';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Target, BarChart3 } from 'lucide-react';

export default function AppSidebar() {
  const pathname = usePathname();
  const { teamMembers, stats } = useTeamStore();

  const navItems = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: Home,
    },
  ];

  const teamNavItems = teamMembers.map(member => ({
    title: member.name,
    url: `/dashboard/${member.id}`,
    icon: User,
    status: member.status,
    mood: member.currentMood,
  }));

  const statusColors = {
    available: 'bg-green-500',
    'on-leave': 'bg-yellow-500',
    exams: 'bg-blue-500',
    busy: 'bg-orange-500',
    sick: 'bg-red-500',
  };

  const moodEmojis = ['😟', '🙁', '😐', '🙂', '😄'];

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Target className="h-6 w-6 text-orange-600" />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-sm">Team Update Bot</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Team Members</SidebarGroupLabel>
          <SidebarMenu>
            {teamNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div 
                          className={`w-2 h-2 rounded-full ${statusColors[item.status as keyof typeof statusColors]}`}
                          title={item.status}
                        />
                        {item.mood && (
                          <span className="text-xs" title={`Mood: ${item.mood}/5`}>
                            {moodEmojis[item.mood - 1]}
                          </span>
                        )}
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-2 sm:p-4 space-y-2">
          <div className="text-xs text-muted-foreground text-center group-data-[collapsible=icon]:hidden">
            TestFlight Progress
          </div>
          <div className="flex items-center justify-center gap-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1">
            <BarChart3 className="h-4 w-4 flex-shrink-0" />
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5 group-data-[collapsible=icon]:px-1">
              {Math.round(stats.testFlightProgress)}%
            </Badge>
          </div>
          <div className="text-xs text-center text-muted-foreground group-data-[collapsible=icon]:hidden">
            <span className="block sm:inline">{stats.daysUntilDeadline} days</span>
            <span className="block sm:inline sm:ml-1">remaining</span>
          </div>
        </div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}
