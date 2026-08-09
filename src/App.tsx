/* Main App Component - Handles routing (using react-router-dom), query client and other providers - use this file to add all routes */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import { I18nProvider } from '@/hooks/use-i18n'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import PlanShipment from './pages/PlanShipment'
import RouteResults from './pages/RouteResults'
import RoutesList from './pages/RoutesList'
import MapPage from './pages/MapPage'
import StoragePage from './pages/StoragePage'
import InsightsPage from './pages/InsightsPage'
import AssistantPage from './pages/AssistantPage'
import SettingsPage from './pages/SettingsPage'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import HowItWorks from './pages/HowItWorks'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'
import ConfirmEmailChange from './pages/ConfirmEmailChange'

// ONLY IMPORT AND RENDER WORKING PAGES, NEVER ADD PLACEHOLDER COMPONENTS OR PAGES IN THIS FILE
// AVOID REMOVING ANY CONTEXT PROVIDERS FROM THIS FILE (e.g. TooltipProvider, Toaster, Sonner)

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <I18nProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public routes (outside Layout) */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/confirm-email-change" element={<ConfirmEmailChange />} />

            {/* App routes (inside Layout with sidebar navigation) */}
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/overview" element={<Overview />} />
              <Route path="/plan" element={<PlanShipment />} />
              <Route path="/plan/results/:shipmentId" element={<RouteResults />} />
              <Route path="/routes" element={<RoutesList />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/storage" element={<StoragePage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/assistant" element={<AssistantPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </I18nProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
