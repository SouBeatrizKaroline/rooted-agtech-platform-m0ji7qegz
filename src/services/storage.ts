import pb from '@/lib/pocketbase/client'

export interface StorageItem {
  id: string
  name: string
  type: 'warehouse' | 'silo' | 'cold_storage' | 'distribution_center'
  lat?: number
  lng?: number
  address?: string
  capacity_t?: number
  available_t?: number
  distance_km?: number
  suitability: 'low' | 'medium' | 'high'
  consideration?: string
  cargo_types?: string[]
}

export const getStorageOptions = () =>
  pb.collection('storage_options').getFullList<StorageItem>({ sort: 'name' })
