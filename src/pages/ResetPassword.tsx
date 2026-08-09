import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const { confirmPasswordReset } = useAuth()

  const [password, setPassword] = useState('')
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await confirmPasswordReset(token, password)
    if (error) setErrorMsg('Password reset failed or token expired.')
    else setSuccess(true)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#DCE3DC] rounded-2xl p-6 shadow-elevation space-y-4">
        <h1 className="text-xl font-bold text-[#214D34]">Set New Password</h1>
        {success ? (
          <div className="text-xs text-emerald-800 space-y-3">
            <p>Password updated successfully!</p>
            <Button asChild size="sm" className="w-full bg-[#2F6B45]">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && <p className="text-xs text-rose-600">{errorMsg}</p>}
            <Input
              type="password"
              placeholder="New password (min 8 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-[#DCE3DC]"
            />
            <Button type="submit" className="w-full bg-[#2F6B45] text-white">
              Update Password
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
