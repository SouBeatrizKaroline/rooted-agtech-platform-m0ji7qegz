import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  Sprout,
  LayoutDashboard,
  Route,
  Map,
  Warehouse,
  BarChart3,
  Bot,
  Settings,
  Globe,
  LogOut,
  Menu,
  PlusCircle,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useI18n } from '@/hooks/use-i18n'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { DockedAssistant } from '@/components/DockedAssistant'
import { OnboardingModal } from '@/components/OnboardingModal'
import { DemoBanner } from '@/components/DemoBanner'

export default function Layout() {
  const location = useLocation()
  const { user, signOut, demoMode, exitDemo } = useAuth()
  const { language, setLanguage, t } = useI18n()
  const [assistantOpen, setAssistantOpen] = useState(false)

  const navItems = [
    { path: '/app/dashboard', label: t('navOverview'), icon: LayoutDashboard },
    { path: '/app/shipments', label: t('navPlan'), icon: PlusCircle },
    { path: '/app/routes', label: t('navRoutes'), icon: Route },
    { path: '/app/map', label: t('navMap'), icon: Map },
    { path: '/app/storage', label: t('navStorage'), icon: Warehouse },
    { path: '/app/insights', label: t('navInsights'), icon: BarChart3 },
    { path: '/app/assistant', label: t('navAssistant'), icon: Bot },
    { path: '/app/settings', label: t('navSettings'), icon: Settings },
  ]

  const mobileNavFive = [
    { path: '/app/dashboard', label: t('navOverview'), icon: LayoutDashboard },
    { path: '/app/shipments', label: t('navPlan'), icon: PlusCircle },
    { path: '/app/map', label: t('navMap'), icon: Map },
    { path: '/app/assistant', label: t('navAssistant'), icon: Bot },
    { path: '/app/settings', label: t('navMore'), icon: Settings },
  ]

  const handleSignOut = () => {
    if (demoMode) exitDemo()
    else signOut()
  }

  return (
    <div className="min-h-[100dvh] bg-[#F6F7F2] text-[#17221A] flex flex-col lg:flex-row">
      {!demoMode && <OnboardingModal />}
      {demoMode && <DemoBanner onExit={exitDemo} />}

      <aside className="hidden lg:flex w-[260px] flex-col fixed inset-y-0 left-0 bg-white border-r border-[#DCE3DC] z-30">
        <div className="p-5 border-b border-[#DCE3DC] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2F6B45] text-white flex items-center justify-center shadow-subtle">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-[#214D34]">Rooted</span>
            <span className="text-[10px] block text-[#737D75] font-semibold">AgTech Platform</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B45] focus-visible:ring-offset-2 ${
                  active
                    ? 'bg-[#DDEBDD] text-[#214D34] font-semibold border-l-4 border-[#2F6B45]'
                    : 'text-[#536057] hover:bg-[#F6F7F2] hover:text-[#17221A]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#2F6B45]' : 'text-[#737D75]'}`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-[#DCE3DC] space-y-3">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#F6F7F2]">
            <div className="flex items-center gap-2 text-xs text-[#536057]">
              <Globe className="w-3.5 h-3.5" />
              <span>Language</span>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              aria-label="Select application language"
              className="text-xs bg-transparent font-bold text-[#2F6B45] border-none focus:ring-0 cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="pt">PT</option>
              <option value="es">ES</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-[#F6F7F2] border border-[#DCE3DC]">
            <div className="flex items-center gap-2 overflow-hidden min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#2F6B45] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                {demoMode ? 'D' : user?.name?.[0] || 'U'}
              </div>
              <div className="overflow-hidden text-xs min-w-0">
                <p className="font-bold text-[#214D34] truncate">
                  {demoMode ? 'Demo Explorer' : user?.name || 'Manager'}
                </p>
                <p className="text-[10px] text-[#737D75] truncate">
                  {demoMode ? 'Demo Mode' : user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              title={demoMode ? 'Exit Demo' : 'Sign Out'}
              aria-label={demoMode ? 'Exit Demo' : 'Sign Out'}
              className="h-8 w-8 text-[#737D75] hover:text-rose-600 flex-shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#DCE3DC] px-4 py-3 flex items-center justify-between safe-area-top">
        <Link to="/app/dashboard" className="flex items-center gap-2" aria-label="Rooted home">
          <div className="w-8 h-8 rounded-xl bg-[#2F6B45] text-white flex items-center justify-center flex-shrink-0">
            <Sprout className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg text-[#214D34]">Rooted</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === 'en' ? 'pt' : language === 'pt' ? 'es' : 'en')}
            className="text-xs font-bold text-[#2F6B45] bg-[#DDEBDD] px-2.5 py-1.5 rounded-lg uppercase min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label={`Switch language, current: ${language}`}
          >
            {language}
          </button>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-[#DCE3DC]"
                aria-label="Open navigation menu"
              >
                <Menu className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(280px,85vw)] bg-white border-[#DCE3DC] p-4 flex flex-col"
            >
              <SheetHeader className="text-left mb-4">
                <SheetTitle className="text-lg font-bold text-[#214D34]">
                  Rooted Navigation
                </SheetTitle>
              </SheetHeader>
              <nav className="flex-1 space-y-1 overflow-y-auto" aria-label="Mobile navigation">
                {navItems.map((item) => {
                  const active = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                        active
                          ? 'bg-[#DDEBDD] text-[#214D34] font-semibold'
                          : 'text-[#536057] hover:bg-[#F6F7F2]'
                      }`}
                    >
                      <item.icon className="w-4 h-4 text-[#2F6B45] flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
              <Button
                onClick={handleSignOut}
                variant="destructive"
                size="sm"
                className="w-full mt-auto gap-2"
              >
                <LogOut className="w-4 h-4" />
                {demoMode ? 'Exit Demo' : t('signOut')}
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1 lg:ml-[260px] p-4 lg:p-8 pb-24 lg:pb-8 max-w-7xl mx-auto w-full min-w-0">
        <Outlet />
      </main>

      <button
        onClick={() => setAssistantOpen((p) => !p)}
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 bg-[#2F6B45] hover:bg-[#214D34] text-white p-3.5 rounded-full shadow-elevation flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B45] focus-visible:ring-offset-2"
        title={t('askRooted')}
        aria-label={t('askRooted')}
        aria-expanded={assistantOpen}
      >
        <Bot className="w-5 h-5" />
        <span className="hidden sm:inline font-bold text-xs">{t('askRooted')}</span>
      </button>

      <DockedAssistant open={assistantOpen} onClose={() => setAssistantOpen(false)} />

      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[#DCE3DC] z-30 px-2 py-1.5 flex justify-around items-center safe-area-bottom"
        aria-label="Bottom navigation"
      >
        {mobileNavFive.map((item) => {
          const active = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-lg text-[10px] font-medium transition-colors min-h-[44px] min-w-[44px] ${
                active ? 'text-[#2F6B45] font-bold' : 'text-[#737D75]'
              }`}
            >
              <item.icon className="w-4 h-4 mb-0.5" />
              <span className="truncate max-w-[60px]">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
