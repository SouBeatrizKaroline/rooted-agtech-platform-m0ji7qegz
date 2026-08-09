import pb from '@/lib/pocketbase/client'

export interface ShipmentItem {
  id: string
  user: string
  cargo_type: 'corn' | 'soybeans' | 'wheat' | 'fruits' | 'vegetables' | 'other'
  cargo_detail?: string
  origin_name: string
  origin_lat?: number
  origin_lng?: number
  destination_name: string
  destination_lat?: number
  destination_lng?: number
  destination_type:
    | 'warehouse'
    | 'distribution_center'
    | 'processing_facility'
    | 'port'
    | 'buyer'
    | 'custom'
  vehicle_type: 'small_truck' | 'medium_truck' | 'large_truck' | 'other'
  cargo_weight_t?: number
  dimensions?: string
  preferred_departure?: string
  constraints?: string
  status: 'planned' | 'analyzed' | 'in_transit' | 'delayed' | 'delivered'
  created: string
  updated: string
}

export interface AnalyzeShipmentPayload {
  cargo_type: string
  cargo_detail?: string
  origin_name: string
  origin_lat?: number
  origin_lng?: number
  destination_name: string
  destination_lat?: number
  destination_lng?: number
  destination_type: string
  vehicle_type: string
  cargo_weight_t?: number
  dimensions?: string
  preferred_departure?: string
  constraints?: string
  simple_language?: boolean
}

export const getShipments = () =>
  pb.collection('shipments').getFullList<ShipmentItem>({ sort: '-created' })
export const getShipment = (id: string) => pb.collection('shipments').getOne<ShipmentItem>(id)

export const analyzeShipment = (payload: AnalyzeShipmentPayload) =>
  pb.send<{ shipment_id: string; recommended_route_id: string }>('/backend/v1/routes/analyze', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  })
