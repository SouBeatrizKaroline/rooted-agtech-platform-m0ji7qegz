import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Route, ShieldCheck, Filter } from 'lucide-react'
import { getRoutes, RouteItem } from '@/services/routes'
import { BadgeTag } from '@/components/ui/BadgeTag'
import { Button } from '@/components/ui/button'

export default function RoutesList() {
  const [routes, setRoutes] = useState<RouteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await getRoutes()
      setRoutes(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#214D34]">Analyzed Routes</h1>
        <p className="text-xs sm:text-sm text-[#536057] mt-1">
          History of calculated agricultural corridors
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-[#536057]">Loading route catalog…</div>
      ) : error ? (
        <div className="p-8 bg-white rounded-2xl border border-[#DCE3DC] text-center space-y-3">
          <p className="text-xs text-[#536057]">Failed to load routes.</p>
          <Button onClick={loadData} size="sm" className="bg-[#2F6B45] text-white">
            Retry
          </Button>
        </div>
      ) : routes.length === 0 ? (
        <div className="p-8 bg-white rounded-2xl border border-[#DCE3DC] text-center text-xs text-[#536057]">
          No analyzed routes found. Plan a shipment to create your first route analysis.
        </div>
      ) : (
        <div className="space-y-3">
          {routes.map((r) => (
            <div
              key={r.id}
              className="p-4 bg-white border border-[#DCE3DC] rounded-2xl shadow-subtle space-y-2"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-bold text-sm text-[#214D34] break-words">{r.name}</span>
                {r.is_recommended && <BadgeTag type="recommendation" label="Recommended" />}
              </div>
              <p className="text-xs text-[#536057] break-words">{r.summary_text}</p>
              <div className="pt-2 border-t border-[#DCE3DC] flex flex-wrap justify-between gap-2 text-xs text-[#737D75]">
                <span>Distance: {r.distance_km} km</span>
                <span>Travel Time: {r.travel_time_min} min</span>
                <span>Risk: {r.risk_level}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
