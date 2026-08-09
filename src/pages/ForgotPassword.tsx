import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sprout, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await requestPasswordReset(email)
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#DCE3DC] rounded-2xl p-6 sm:p-8 shadow-elevation space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#DDEBDD] text-[#2F6B45] flex items-center justify-center mx-auto">
            <Sprout className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#214D34]">Reset Password</h1>
          <p className="text-xs text-[#536057]">We will send you a password reset link</p>
        </div>

        {sent ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 text-center">
            <CheckCircle2 className="w-8 h-8 text-[#2F6B45] mx-auto" />
            <p className="text-xs text-emerald-900 font-medium">
              If an account exists for {email}, a password reset link has been sent.
            </p>
            <Button asChild variant="outline" size="sm" className="w-full mt-2">
              <Link to="/login">Back to Sign In</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#536057]">Email Address</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@farm.com"
                className="border-[#DCE3DC]"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-[#2F6B45] text-white">
              {loading ? 'Sending link…' : 'Send Reset Link'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
