import pb from '@/lib/pocketbase/client'

export interface LocationItem {
  id: string
  name: string
  type:
    | 'farm'
    | 'warehouse'
    | 'distribution_center'
    | 'processing_facility'
    | 'port'
    | 'buyer'
    | 'custom'
  address?: string
  lat?: number
  lng?: number
  description?: string
}

export const getLocations = () =>
  pb.collection('locations').getFullList<LocationItem>({ sort: 'name' })
export const getLocation = (id: string) => pb.collection('locations').getOne<LocationItem>(id)
