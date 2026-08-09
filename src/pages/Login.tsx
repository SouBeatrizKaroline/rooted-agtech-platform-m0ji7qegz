import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Sprout, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useI18n } from '@/hooks/use-i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Login() {
  const { signIn } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const from = (location.state as { from?: string })?.from || '/app/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) setErrorMsg("We couldn't sign you in — please check your details.")
    else navigate(from, { replace: true })
  }

  const handleDemo = () => navigate('/demo')

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#DCE3DC] rounded-2xl p-6 sm:p-8 shadow-elevation space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#DDEBDD] text-[#2F6B45] flex items-center justify-center mx-auto">
            <Sprout className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#214D34]">Welcome back</h1>
          <p className="text-xs text-[#536057]">
            Sign in to continue planning smarter agricultural logistics with Rooted.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#536057]">Email Address</Label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="manager@farm.com"
              className="border-[#DCE3DC] focus-visible:ring-[#2F6B45]"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-bold text-[#536057]">Password</Label>
              <Link to="/forgot-password" className="text-xs text-[#2F6B45] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border-[#DCE3DC] focus-visible:ring-[#2F6B45] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737D75]"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2F6B45] hover:bg-[#214D34] text-white"
          >
            {loading ? 'Signing in…' : t('signIn')}
          </Button>
        </form>

        <div className="text-center text-xs text-[#536057]">
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold text-[#2F6B45] hover:underline">
            {t('signUp')}
          </Link>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#DCE3DC]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-[10px] text-[#737D75] uppercase">or</span>
          </div>
        </div>

        <div className="text-center space-y-3">
          <p className="text-xs text-[#536057]">Want to explore Rooted first?</p>
          <Button
            onClick={handleDemo}
            variant="outline"
            className="w-full border-[#DCE3DC] text-[#214D34] hover:bg-[#F6F7F2] gap-2"
          >
            Try Demo <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
