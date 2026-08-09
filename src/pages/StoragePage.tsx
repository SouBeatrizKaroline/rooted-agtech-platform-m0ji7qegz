import { useState, useEffect } from 'react'
import { Warehouse, MapPin, CheckCircle2 } from 'lucide-react'
import { getStorageOptions, StorageItem } from '@/services/storage'
import { BadgeTag } from '@/components/ui/BadgeTag'
import { useI18n } from '@/hooks/use-i18n'

export default function StoragePage() {
  const { t } = useI18n()
  const [storage, setStorage] = useState<StorageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await getStorageOptions()
      setStorage(data)
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#214D34]">{t('navStorage')}</h1>
        <p className="text-xs sm:text-sm text-[#536057] mt-1">
          Nearby grain silos, warehouses & cold storage
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-[#536057]">Loading storage options…</div>
      ) : error ? (
        <div className="p-8 bg-white rounded-2xl border border-[#DCE3DC] text-center space-y-3">
          <p className="text-xs text-[#536057]">Failed to load storage options.</p>
          <Button onClick={loadData} size="sm" className="bg-[#2F6B45] text-white">
            Retry
          </Button>
        </div>
      ) : storage.length === 0 ? (
        <div className="p-8 bg-white rounded-2xl border border-[#DCE3DC] text-center text-xs text-[#536057]">
          No storage facilities found nearby.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {storage.map((s) => (
            <div
              key={s.id}
              className="p-4 sm:p-5 bg-white border border-[#DCE3DC] rounded-2xl shadow-subtle space-y-3 min-w-0"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#214D34] uppercase tracking-wider">
                  {s.type}
                </span>
                <BadgeTag
                  type={s.suitability === 'high' ? 'recommendation' : 'normal'}
                  label={`Suitability: ${s.suitability}`}
                />
              </div>

              <div>
                <h3 className="font-bold text-base text-[#214D34]">{s.name}</h3>
                <p className="text-xs text-[#536057] mt-0.5">
                  {s.address || 'Port Logistics Zone'}
                </p>
              </div>

              <p className="text-xs text-[#536057] italic bg-[#F6F7F2] p-2.5 rounded-xl border border-[#DCE3DC]">
                "{s.consideration}"
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs text-[#536057] pt-2 border-t border-[#DCE3DC] break-words">
                <div>
                  Total Capacity: <strong>{s.capacity_t?.toLocaleString()} t</strong>
                </div>
                <div>
                  Available Today: <strong>{s.available_t?.toLocaleString()} t</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
