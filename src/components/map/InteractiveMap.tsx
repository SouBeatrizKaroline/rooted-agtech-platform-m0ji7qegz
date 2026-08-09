import { useState } from 'react'
import { MapPin, AlertTriangle, Layers, Navigation, Info, ShieldAlert } from 'lucide-react'
import { BadgeTag } from '@/components/ui/BadgeTag'

export interface MapPoint {
  id: string
  name: string
  type: 'origin' | 'destination' | 'restriction' | 'facility' | 'storage'
  lat: number
  lng: number
  description?: string
  status?: string
}

interface InteractiveMapProps {
  points?: MapPoint[]
  showRoutePolyline?: boolean
  selectedPointId?: string
  onSelectPoint?: (point: MapPoint) => void
  height?: string
}

export function InteractiveMap({
  points = [],
  showRoutePolyline = true,
  selectedPointId,
  onSelectPoint,
  height = 'h-[400px] sm:h-[420px]',
}: InteractiveMapProps) {
  const [activeLayers, setActiveLayers] = useState({
    routes: true,
    restrictions: true,
    storage: true,
  })
  const [activePoint, setActivePoint] = useState<MapPoint | null>(null)

  const defaultPoints: MapPoint[] = [
    {
      id: 'p1',
      name: 'Green Valley Farm (Origin)',
      type: 'origin',
      lat: 30,
      lng: 25,
      description: '32t Corn harvest ready for transport',
    },
    {
      id: 'p2',
      name: 'Riverside Grain Terminal',
      type: 'destination',
      lat: 75,
      lng: 80,
      description: 'Export grain port terminal',
    },
    {
      id: 'p3',
      name: 'Bridge Inspection Km 22',
      type: 'restriction',
      lat: 50,
      lng: 50,
      description: 'Weight limit check & single lane traffic',
    },
    {
      id: 'p4',
      name: 'Cerrado Silo #1',
      type: 'storage',
      lat: 60,
      lng: 40,
      description: '4,200t available capacity',
    },
  ]

  const displayPoints = points.length > 0 ? points : defaultPoints

  const handleMarkerClick = (pt: MapPoint) => {
    setActivePoint(pt)
    if (onSelectPoint) onSelectPoint(pt)
  }

  return (
    <div
      className={`relative w-full ${height} bg-[#EEF2EA] rounded-2xl border border-[#DCE3DC] overflow-hidden flex flex-col shadow-subtle`}
    >
      {/* Map Tile Canvas Simulation */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#2F6B45_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Layer Toggles */}
      <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-sm border border-[#DCE3DC] rounded-xl p-1.5 flex gap-1 text-[11px] shadow-subtle flex-wrap max-w-[calc(100%-1.5rem)] min-w-0">
        <button
          onClick={() => setActiveLayers((p) => ({ ...p, routes: !p.routes }))}
          aria-pressed={activeLayers.routes}
          className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors min-h-[32px] ${
            activeLayers.routes ? 'bg-[#2F6B45] text-white' : 'text-[#536057] hover:bg-[#F6F7F2]'
          }`}
        >
          Routes
        </button>
        <button
          onClick={() => setActiveLayers((p) => ({ ...p, restrictions: !p.restrictions }))}
          aria-pressed={activeLayers.restrictions}
          className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors min-h-[32px] ${
            activeLayers.restrictions
              ? 'bg-[#2F6B45] text-white'
              : 'text-[#536057] hover:bg-[#F6F7F2]'
          }`}
        >
          Alerts
        </button>
        <button
          onClick={() => setActiveLayers((p) => ({ ...p, storage: !p.storage }))}
          aria-pressed={activeLayers.storage}
          className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors min-h-[32px] ${
            activeLayers.storage ? 'bg-[#2F6B45] text-white' : 'text-[#536057] hover:bg-[#F6F7F2]'
          }`}
        >
          Storage
        </button>
      </div>

      {/* Map Graphic Viewport */}
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
        viewBox="0 0 600 400"
      >
        {/* Recommended Route Polyline */}
        {activeLayers.routes && showRoutePolyline && (
          <path
            d="M 120 280 C 220 200, 320 220, 520 120"
            fill="none"
            stroke="#2F6B45"
            strokeWidth="5"
            strokeDasharray="6 4"
            className="animate-pulse"
          />
        )}

        {/* Alternative Route Polyline */}
        {activeLayers.routes && showRoutePolyline && (
          <path
            d="M 120 280 C 180 340, 420 320, 520 120"
            fill="none"
            stroke="#B98B4A"
            strokeWidth="3"
            strokeDasharray="4 4"
            opacity="0.7"
          />
        )}
      </svg>

      {/* Interactive Markers */}
      <div className="absolute inset-0 pointer-events-none">
        {displayPoints.map((pt) => {
          if (pt.type === 'restriction' && !activeLayers.restrictions) return null
          if (pt.type === 'storage' && !activeLayers.storage) return null

          const isSelected = activePoint?.id === pt.id || selectedPointId === pt.id

          return (
            <button
              key={pt.id}
              onClick={() => handleMarkerClick(pt)}
              style={{ top: `${pt.lat}%`, left: `${pt.lng}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto p-2 rounded-full transition-transform hover:scale-110 shadow-elevation ${
                pt.type === 'origin'
                  ? 'bg-emerald-600 text-white'
                  : pt.type === 'destination'
                    ? 'bg-[#214D34] text-white'
                    : pt.type === 'restriction'
                      ? 'bg-amber-500 text-white'
                      : 'bg-[#B98B4A] text-white'
              } ${isSelected ? 'ring-4 ring-[#2F6B45]/40 scale-125' : ''}`}
            >
              {pt.type === 'restriction' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : pt.type === 'origin' || pt.type === 'destination' ? (
                <MapPin className="w-4 h-4" />
              ) : (
                <Layers className="w-4 h-4" />
              )}
            </button>
          )
        })}
      </div>

      {/* Detail Card Overlay */}
      {activePoint && (
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-sm bg-white border border-[#DCE3DC] rounded-xl p-3.5 shadow-elevation animate-fade-in z-20 max-h-[40%] overflow-y-auto">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-[#536057] uppercase tracking-wider block">
                {activePoint.type}
              </span>
              <h4 className="font-bold text-sm text-[#214D34]">{activePoint.name}</h4>
              {activePoint.description && (
                <p className="text-xs text-[#536057] mt-1">{activePoint.description}</p>
              )}
            </div>
            <button
              onClick={() => setActivePoint(null)}
              className="text-[#737D75] hover:text-[#17221A] text-xs font-bold px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
