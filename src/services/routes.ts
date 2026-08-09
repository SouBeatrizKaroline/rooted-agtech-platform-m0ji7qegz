import pb from '@/lib/pocketbase/client'

export interface RouteItem {
  id: string
  shipment: string
  name: string
  is_recommended: boolean
  distance_km: number
  travel_time_min: number
  estimated_cost?: number
  risk_level: 'low' | 'medium' | 'high'
  restrictions?: string
  risk_areas?: string
  considerations?: string
  confidence_level?: string
  summary_text: string
  created: string
  updated: string
}

export const getRoutes = () => pb.collection('routes').getFullList<RouteItem>({ sort: '-created' })
export const getShipmentRoutes = (shipmentId: string) =>
  pb
    .collection('routes')
    .getFullList<RouteItem>({ filter: `shipment = "${shipmentId}"`, sort: '-is_recommended' })
export const getRoute = (id: string) => pb.collection('routes').getOne<RouteItem>(id)
