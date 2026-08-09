import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Truck, AlertTriangle, PlusCircle, Route, Bot, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useI18n } from '@/hooks/use-i18n'
import useRealtime from '@/hooks/use-realtime'
import { getShipments, ShipmentItem } from '@/services/shipments'
import { getAlerts, AlertItem } from '@/services/alerts'
import { Button } from '@/components/ui/button'
import { BadgeTag } from '@/components/ui/BadgeTag'

export default function Overview() {
  const { user, demoMode } = useAuth()
  const { t } = useI18n()

  const [shipments, setShipments] = useState<ShipmentItem[]>([])
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [sData, aData] = await Promise.all([getShipments(), getAlerts()])
      setShipments(sData)
      setAlerts(aData)
    } catch {
      /* ignored */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('shipments', () => {
    loadData()
  })
  useRealtime('alerts', () => {
    loadData()
  })

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#DCE3DC] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#214D34]">
            {demoMode
              ? 'Welcome to the Demo'
              : `Good to see you, ${user?.name?.split(' ')[0] || 'Manager'}.`}
          </h1>
          <p className="text-xs sm:text-sm text-[#536057] mt-1">{t('whatToDoNext')}</p>
        </div>
        <Button asChild className="bg-[#2F6B45] hover:bg-[#214D34] text-white gap-2 shadow-subtle">
          <Link to="/app/shipments">
            <PlusCircle className="w-4 h-4" />
            {t('planShipment')}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/app/shipments"
          className="p-4 rounded-2xl bg-white border border-[#DCE3DC] hover:border-[#2F6B45] transition-all shadow-subtle flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#DDEBDD] text-[#2F6B45] flex items-center justify-center group-hover:bg-[#2F6B45] group-hover:text-white transition-colors">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#214D34]">{t('planShipment')}</h3>
            <p className="text-[11px] text-[#536057]">Guided route optimization</p>
          </div>
        </Link>
        <Link
          to="/app/map"
          className="p-4 rounded-2xl bg-white border border-[#DCE3DC] hover:border-[#2F6B45] transition-all shadow-subtle flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#DDEBDD] text-[#2F6B45] flex items-center justify-center group-hover:bg-[#2F6B45] group-hover:text-white transition-colors">
            <Route className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#214D34]">Check Map & Routes</h3>
            <p className="text-[11px] text-[#536057]">Live restrictions & hubs</p>
          </div>
        </Link>
        <Link
          to="/app/assistant"
          className="p-4 rounded-2xl bg-white border border-[#DCE3DC] hover:border-[#2F6B45] transition-all shadow-subtle flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#DDEBDD] text-[#2F6B45] flex items-center justify-center group-hover:bg-[#2F6B45] group-hover:text-white transition-colors">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#214D34]">{t('askRooted')}</h3>
            <p className="text-[11px] text-[#536057]">Logistics AI advisor</p>
          </div>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#214D34]">{t('activeShipments')}</h2>
          <Link
            to="/app/routes"
            className="text-xs font-semibold text-[#2F6B45] hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {loading ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#DCE3DC] text-xs text-[#536057]">
            Loading active shipments…
          </div>
        ) : shipments.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#DCE3DC] space-y-3">
            <Truck className="w-10 h-10 text-[#2F6B45]/40 mx-auto" />
            <div>
              <h3 className="font-bold text-sm text-[#214D34]">{t('noShipmentsYet')}</h3>
              <p className="text-xs text-[#536057] mt-1">{t('planFirstShipment')}</p>
            </div>
            <Button asChild size="sm" className="bg-[#2F6B45] text-white">
              <Link to="/app/shipments">{t('planShipment')}</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shipments.map((s) => (
              <div
                key={s.id}
                className="p-4 bg-white border border-[#DCE3DC] rounded-2xl space-y-3 shadow-subtle hover:border-[#2F6B45] transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#214D34] uppercase tracking-wider">
                    {s.cargo_type}
                  </span>
                  <BadgeTag
                    type={s.status === 'analyzed' ? 'recommendation' : 'normal'}
                    label={s.status}
                  />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#214D34]">
                    {s.origin_name} → {s.destination_name}
                  </p>
                  <p className="text-xs text-[#536057] mt-0.5">
                    Vehicle: {s.vehicle_type.replace('_', ' ')} · {s.cargo_weight_t || 20}t weight
                  </p>
                </div>
                <div className="pt-2 border-t border-[#DCE3DC] flex justify-between items-center">
                  <span className="text-[11px] text-[#737D75]">Status: {s.status}</span>
                  <Button asChild variant="ghost" size="sm" className="text-xs text-[#2F6B45]">
                    <Link to={`/app/shipments/results/${s.id}`}>View Route Analysis →</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#214D34]">{t('importantAlerts')}</h2>
        {alerts.length === 0 ? (
          <div className="p-4 bg-white rounded-2xl border border-[#DCE3DC] text-xs text-[#536057] text-center">
            🟢 All routes clear — no critical disruptions reported.
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((a) => (
              <div
                key={a.id}
                className="p-4 bg-white border border-[#DCE3DC] rounded-2xl space-y-2 shadow-subtle"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className={`w-4 h-4 ${a.severity === 'critical' ? 'text-rose-600' : 'text-amber-600'}`}
                    />
                    <span className="font-bold text-sm text-[#214D34]">{a.label}</span>
                  </div>
                  <BadgeTag type={a.severity} />
                </div>
                <p className="text-xs text-[#536057] leading-relaxed">{a.explanation}</p>
                <div className="p-2.5 rounded-xl bg-[#F6F7F2] border border-[#DCE3DC] text-xs text-[#214D34] font-medium">
                  <strong>{t('recommendedAction')}</strong> {a.recommended_action}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
