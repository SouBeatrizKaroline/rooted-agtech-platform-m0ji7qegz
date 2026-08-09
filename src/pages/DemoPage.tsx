import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sprout, Truck, Route, Bot, ArrowRight, Shield, Eye } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

export default function DemoPage() {
  const { enterDemo } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleStartDemo = async () => {
    setLoading(true)
    setError('')
    const { error } = await enterDemo()
    setLoading(false)
    if (error) {
      setError('Could not start the demo. Please try again later.')
    } else {
      navigate('/app/dashboard', { replace: true })
    }
  }

  const features = [
    {
      icon: Truck,
      title: 'Sample Shipments',
      desc: 'Pre-loaded corn and soybean transports with real route data.',
    },
    {
      icon: Route,
      title: 'Route Analysis',
      desc: 'See recommended and alternative routes with cost estimates.',
    },
    {
      icon: Bot,
      title: 'AI Assistant',
      desc: 'Ask Rooted questions about routes, risks, and storage.',
    },
    {
      icon: Eye,
      title: 'Full Preview',
      desc: 'Explore dashboard, maps, storage, and insights — all with sample data.',
    },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#DDEBDD] text-[#2F6B45] flex items-center justify-center mx-auto">
          <Sprout className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#214D34]">Try Rooted Demo</h1>
        <p className="text-sm text-[#536057] max-w-xl mx-auto">
          Explore a sample Rooted workspace with pre-loaded shipments, routes, and alerts. No real
          account data is used or modified — this is a safe, isolated preview.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((f, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-white border border-[#DCE3DC] flex items-start gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-[#DDEBDD] text-[#2F6B45] flex items-center justify-center flex-shrink-0">
              <f.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#214D34]">{f.title}</h3>
              <p className="text-xs text-[#536057] mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 text-center">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          onClick={handleStartDemo}
          disabled={loading}
          size="lg"
          className="bg-[#2F6B45] hover:bg-[#214D34] text-white gap-2 w-full sm:w-auto"
        >
          {loading ? 'Starting demo…' : 'Start Demo'}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="border-[#DCE3DC] text-[#214D34] w-full sm:w-auto"
        >
          <Link to="/signup">Create Account Instead</Link>
        </Button>
      </div>

      <div className="p-4 bg-[#F6F7F2] border border-[#DCE3DC] rounded-xl flex items-center gap-3">
        <Shield className="w-5 h-5 text-[#2F6B45] flex-shrink-0" />
        <p className="text-xs text-[#536057]">
          The demo uses a dedicated sample account with isolated data. Your actions won't affect any
          real user. You can exit the demo at any time to sign in or create your own account.
        </p>
      </div>
    </div>
  )
}
