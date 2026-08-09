import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ConfirmEmailChange() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const { confirmEmailChange } = useAuth()
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await confirmEmailChange(token, password)
    if (error) setErr('Could not confirm email change. Please check password.')
    else setDone(true)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-[#DCE3DC] p-6 rounded-2xl text-center space-y-4 shadow-elevation">
        <h1 className="text-xl font-bold text-[#214D34]">Confirm Email Change</h1>
        {done ? (
          <div className="space-y-3">
            <p className="text-xs text-emerald-800">
              Email updated! Please sign in with your new email address.
            </p>
            <Button asChild size="sm" className="bg-[#2F6B45]">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-left">
            {err && <p className="text-xs text-rose-600">{err}</p>}
            <Input
              type="password"
              placeholder="Confirm password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-[#DCE3DC]"
            />
            <Button type="submit" className="w-full bg-[#2F6B45]">
              Confirm Email Change
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
