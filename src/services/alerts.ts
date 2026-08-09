import pb from '@/lib/pocketbase/client'

export interface AlertItem {
  id: string
  user: string
  shipment?: string
  route?: string
  category:
    | 'road_restriction'
    | 'route_disruption'
    | 'capacity_issue'
    | 'potential_delay'
    | 'high_risk_route'
    | 'normal'
  severity: 'normal' | 'attention' | 'critical'
  label: string
  explanation: string
  recommended_action: string
  created: string
  updated: string
}

export const getAlerts = () => pb.collection('alerts').getFullList<AlertItem>({ sort: '-created' })
