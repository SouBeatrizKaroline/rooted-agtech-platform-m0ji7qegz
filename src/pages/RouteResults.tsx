import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Route, CheckCircle2, AlertTriangle, ArrowLeft, Bot } from 'lucide-react'
import { getShipment, ShipmentItem } from '@/services/shipments'
import { getShipmentRoutes, RouteItem } from '@/services/routes'
import { InteractiveMap } from '@/components/map/InteractiveMap'
import { BadgeTag } from '@/components/ui/BadgeTag'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/use-i18n'

export default function RouteResults() {
  const { shipmentId } = useParams()
  const { t } = useI18n()

  const [shipment, setShipment] = useState<ShipmentItem | null>(null)
  const [routes, setRoutes] = useState<RouteItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (shipmentId) {
      Promise.all([getShipment(shipmentId), getShipmentRoutes(shipmentId)])
        .then(([s, r]) => {
          setShipment(s)
          setRoutes(r)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [shipmentId])

  if (loading) {
    return <div className="p-8 text-center text-xs text-[#536057]">Analyzing shipment routes…</div>
  }

  const recRoute = routes.find((r) => r.is_recommended) || routes[0]
  const altRoutes = routes.filter((r) => !r.is_recommended)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="text-xs text-[#536057]">
          <Link to="/app/dashboard">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Overview
          </Link>
        </Button>{' '}
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#214D34]">
          Route Analysis: {shipment?.origin_name} → {shipment?.destination_name}
        </h1>
        <p className="text-xs text-[#536057] mt-1">
          Cargo: {shipment?.cargo_type} · {shipment?.cargo_weight_t || 20}t
        </p>
      </div>

      {/* Recommended Route Banner */}
      {recRoute && (
        <div className="p-5 bg-white border-2 border-[#2F6B45] rounded-2xl space-y-4 shadow-elevation">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#2F6B45]" />
              <h2 className="font-bold text-base text-[#214D34]">{recRoute.name}</h2>
            </div>
            <BadgeTag type="recommendation" label="Recommended Route" />
          </div>

          <div className="p-3 bg-[#DDEBDD] rounded-xl text-xs text-[#214D34]">
            <strong>{t('whyRecommended')}</strong> {recRoute.summary_text}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-[#F6F7F2]">
              <span className="text-[10px] text-[#737D75] font-bold uppercase">Distance</span>
              <p className="font-extrabold text-sm text-[#214D34]">{recRoute.distance_km} km</p>
              <BadgeTag type="data" className="mt-1" />
            </div>
            <div className="p-2.5 rounded-xl bg-[#F6F7F2]">
              <span className="text-[10px] text-[#737D75] font-bold uppercase">
                Est. Travel Time
              </span>
              <p className="font-extrabold text-sm text-[#214D34]">
                {recRoute.travel_time_min} min
              </p>
              <BadgeTag type="estimate" className="mt-1" />
            </div>
            <div className="p-2.5 rounded-xl bg-[#F6F7F2]">
              <span className="text-[10px] text-[#737D75] font-bold uppercase">
                Est. Freight Cost
              </span>
              <p className="font-extrabold text-sm text-[#214D34]">
                ${recRoute.estimated_cost || 420}
              </p>
              <BadgeTag type="estimate" className="mt-1" />
            </div>
            <div className="p-2.5 rounded-xl bg-[#F6F7F2]">
              <span className="text-[10px] text-[#737D75] font-bold uppercase">Risk Level</span>
              <p className="font-extrabold text-sm text-[#214D34] uppercase">
                {recRoute.risk_level}
              </p>
              <BadgeTag
                type={recRoute.risk_level === 'high' ? 'warning' : 'normal'}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <InteractiveMap showRoutePolyline height="h-[360px]" />

      {/* Alternative Routes */}
      {altRoutes.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-base text-[#214D34]">Alternative Options</h3>
          {altRoutes.map((alt) => (
            <div key={alt.id} className="p-4 bg-white border border-[#DCE3DC] rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-[#214D34]">{alt.name}</h4>
                <span className="text-xs font-semibold text-[#536057]">
                  {alt.distance_km} km · {alt.travel_time_min} min
                </span>
              </div>
              <p className="text-xs text-[#536057]">{alt.summary_text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
