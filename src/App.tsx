import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import { I18nProvider } from '@/hooks/use-i18n'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { PublicRoute } from '@/components/PublicRoute'
import PublicLayout from '@/components/PublicLayout'
import Layout from '@/components/Layout'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
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
import DemoPage from './pages/DemoPage'

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <I18nProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public pages with header/footer */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/demo" element={<DemoPage />} />
            </Route>

            {/* Auth pages — redirect to app if already authenticated */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/confirm-email-change" element={<ConfirmEmailChange />} />
            </Route>

            {/* Protected application routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
                <Route path="/app/dashboard" element={<Overview />} />
                <Route path="/app/shipments" element={<PlanShipment />} />
                <Route path="/app/shipments/results/:shipmentId" element={<RouteResults />} />
                <Route path="/app/routes" element={<RoutesList />} />
                <Route path="/app/map" element={<MapPage />} />
                <Route path="/app/storage" element={<StoragePage />} />
                <Route path="/app/insights" element={<InsightsPage />} />
                <Route path="/app/assistant" element={<AssistantPage />} />
                <Route path="/app/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </I18nProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
