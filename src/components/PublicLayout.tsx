import { Link, Outlet } from 'react-router-dom'
import { Sprout, Globe, LayoutDashboard } from 'lucide-react'
import { useI18n } from '@/hooks/use-i18n'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

export default function PublicLayout() {
  const { language, setLanguage, t } = useI18n()
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F2] text-[#17221A]">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#DCE3DC] px-3 sm:px-4 lg:px-8 py-3 flex items-center justify-between safe-area-top">
        <Link
          to="/"
          className="flex items-center gap-2.5 group flex-shrink-0"
          aria-label="Rooted home"
        >
          <div className="w-9 h-9 rounded-xl bg-[#2F6B45] text-white flex items-center justify-center shadow-subtle group-hover:bg-[#214D34] transition-colors flex-shrink-0">
            <Sprout className="w-5 h-5" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-[#214D34]">Rooted</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-[#536057] hover:text-[#17221A]"
              >
                <Globe className="w-4 h-4" />
                <span className="uppercase font-semibold">{language}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem
                onClick={() => setLanguage('en')}
                className={language === 'en' ? 'font-bold text-[#2F6B45]' : ''}
              >
                English
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLanguage('pt')}
                className={language === 'pt' ? 'font-bold text-[#2F6B45]' : ''}
              >
                Português
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLanguage('es')}
                className={language === 'es' ? 'font-bold text-[#2F6B45]' : ''}
              >
                Español
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated ? (
            <Button asChild size="sm" className="bg-[#2F6B45] hover:bg-[#214D34] text-white gap-2">
              <Link to="/app/dashboard">
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-[#2F6B45] text-[#2F6B45] hover:bg-[#DDEBDD]"
              >
                <Link to="/login">{t('signIn')}</Link>
              </Button>
              <Button asChild size="sm" className="bg-[#2F6B45] hover:bg-[#214D34] text-white">
                <Link to="/signup">
                  <span className="hidden sm:inline">{t('getStarted')}</span>
                  <span className="sm:hidden">Start</span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-[#DCE3DC] py-8 sm:py-10 px-4 lg:px-8 safe-area-bottom">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 text-sm text-[#737D75]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#2F6B45] text-white flex items-center justify-center text-xs">
              <Sprout className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-[#214D34]">Rooted AgTech Platform</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/how-it-works" className="hover:text-[#214D34] transition-colors">
              {t('seeHowItWorks')}
            </Link>
            <Link to="/login" className="hover:text-[#214D34] transition-colors">
              {t('signIn')}
            </Link>
            <Link to="/signup" className="hover:text-[#214D34] transition-colors">
              {t('getStarted')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
