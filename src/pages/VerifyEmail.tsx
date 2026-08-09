import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'

export default function VerifyEmail() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')

  useEffect(() => {
    if (token) {
      pb.collection('users')
        .confirmVerification(token)
        .then(() => setStatus('success'))
        .catch(() => setStatus('failed'))
    } else {
      setStatus('failed')
    }
  }, [token])

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-[#DCE3DC] p-6 rounded-2xl text-center space-y-4 shadow-elevation">
        <h1 className="text-xl font-bold text-[#214D34]">Email Verification</h1>
        {status === 'verifying' && (
          <p className="text-xs text-[#536057]">Confirming your email address…</p>
        )}
        {status === 'success' && (
          <div className="space-y-3">
            <p className="text-xs text-emerald-800 font-semibold">Email verified successfully!</p>
            <Button asChild size="sm" className="bg-[#2F6B45]">
              <Link to="/login">Proceed to Sign In</Link>
            </Button>
          </div>
        )}
        {status === 'failed' && (
          <p className="text-xs text-rose-600">Verification link is invalid or has expired.</p>
        )}
      </div>
    </div>
  )
}
