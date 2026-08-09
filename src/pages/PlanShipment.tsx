import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, MapPin, Navigation, ShieldCheck, Sparkles, Check, ArrowRight } from 'lucide-react'
import { getLocations, LocationItem } from '@/services/locations'
import { analyzeShipment } from '@/services/shipments'
import { useI18n } from '@/hooks/use-i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function PlanShipment() {
  const navigate = useNavigate()
  const { t } = useI18n()

  const [step, setStep] = useState(1)
  const [locations, setLocations] = useState<LocationItem[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeMessage, setAnalyzeMessage] = useState(t('analyzingText'))

  // Form State
  const [cargoType, setCargoType] = useState('corn')
  const [cargoDetail, setCargoDetail] = useState('')
  const [originName, setOriginName] = useState('Green Valley Farm')
  const [destinationName, setDestinationName] = useState('Riverside Grain Terminal')
  const [destinationType, setDestinationType] = useState('port')
  const [vehicleType, setVehicleType] = useState('large_truck')
  const [cargoWeight, setCargoWeight] = useState('32')
  const [constraints, setConstraints] = useState('')

  useEffect(() => {
    getLocations()
      .then(setLocations)
      .catch(() => {})
  }, [])

  const handleAnalyze = async () => {
    setAnalyzing(true)
    const messages = [t('analyzingText'), t('checkingConstraints'), t('comparingOptions')]
    let idx = 0
    const interval = setInterval(() => {
      idx = (idx + 1) % messages.length
      setAnalyzeMessage(messages[idx])
    }, 1000)

    try {
      const res = await analyzeShipment({
        cargo_type: cargoType,
        cargo_detail: cargoDetail,
        origin_name: originName,
        destination_name: destinationName,
        destination_type: destinationType,
        vehicle_type: vehicleType,
        cargo_weight_t: Number(cargoWeight) || 20,
        constraints,
      })
      clearInterval(interval)
      navigate(`/app/shipments/results/${res.shipment_id}`)
    } catch (_) {
      clearInterval(interval)
      setAnalyzing(false)
    }
  }

  const cargoOptions = [
    { id: 'corn', label: 'Corn' },
    { id: 'soybeans', label: 'Soybeans' },
    { id: 'wheat', label: 'Wheat' },
    { id: 'fruits', label: 'Fruits' },
    { id: 'vegetables', label: 'Vegetables' },
    { id: 'other', label: 'Other Cargo' },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#214D34]">{t('planShipment')}</h1>
        <p className="text-xs sm:text-sm text-[#536057] mt-1">Guided agricultural route planner</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-[#DCE3DC]">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onClick={() => s < step && setStep(s)}
            className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg transition-colors ${
              step === s
                ? 'bg-[#2F6B45] text-white'
                : step > s
                  ? 'bg-[#DDEBDD] text-[#214D34]'
                  : 'text-[#737D75]'
            }`}
          >
            <span>{s}</span>
            {step > s && <Check className="w-3 h-3" />}
          </button>
        ))}
      </div>

      {/* Step Contents */}
      <div className="bg-white border border-[#DCE3DC] rounded-2xl p-6 shadow-elevation space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#214D34]">
              Step 1 — What are you transporting?
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {cargoOptions.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCargoType(c.id)}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    cargoType === c.id
                      ? 'border-[#2F6B45] bg-[#DDEBDD] text-[#214D34] font-bold'
                      : 'border-[#DCE3DC] text-[#536057] hover:bg-[#F6F7F2]'
                  }`}
                >
                  <span className="text-sm">{c.label}</span>
                </button>
              ))}
            </div>

            {cargoType === 'other' && (
              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#536057]">Specify Cargo</Label>
                <Input
                  value={cargoDetail}
                  onChange={(e) => setCargoDetail(e.target.value)}
                  placeholder="e.g., Organic Fertilizer / Seed Sacks"
                  className="border-[#DCE3DC]"
                />
              </div>
            )}

            <Button onClick={() => setStep(2)} className="w-full bg-[#2F6B45] text-white gap-2">
              Next: Origin & Destination <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#214D34]">Step 2 — Origin & Destination</h2>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#536057]">Origin Location</Label>
              <Input
                value={originName}
                onChange={(e) => setOriginName(e.target.value)}
                placeholder="Farm name or address"
                className="border-[#DCE3DC]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#536057]">Destination Location</Label>
              <Input
                value={destinationName}
                onChange={(e) => setDestinationName(e.target.value)}
                placeholder="Terminal or processing plant"
                className="border-[#DCE3DC]"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="w-1/2 border-[#DCE3DC]"
              >
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="w-1/2 bg-[#2F6B45] text-white">
                Next: Transport
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#214D34]">Step 3 — Vehicle & Cargo Weight</h2>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#536057]">Vehicle Type</Label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#DCE3DC] text-sm text-[#17221A] bg-white"
              >
                <option value="small_truck">Small Truck (up to 8t)</option>
                <option value="medium_truck">Medium Truck (up to 18t)</option>
                <option value="large_truck">Large Truck / Triple Axle (30t+)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#536057]">
                Total Cargo Weight (Metric Tons)
              </Label>
              <Input
                type="number"
                value={cargoWeight}
                onChange={(e) => setCargoWeight(e.target.value)}
                className="border-[#DCE3DC]"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="w-1/2 border-[#DCE3DC]"
              >
                Back
              </Button>
              <Button onClick={() => setStep(4)} className="w-1/2 bg-[#2F6B45] text-white">
                Next: Constraints
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#214D34]">Step 4 — Special Constraints</h2>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#536057]">
                Logistics Restrictions or Preferences
              </Label>
              <Input
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="e.g., Avoid unpaved roads / temperature sensitive"
                className="border-[#DCE3DC]"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep(3)}
                className="w-1/2 border-[#DCE3DC]"
              >
                Back
              </Button>
              <Button onClick={() => setStep(5)} className="w-1/2 bg-[#2F6B45] text-white">
                Review Summary
              </Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#214D34]">Step 5 — Ready to Analyze Route</h2>

            <div className="p-4 bg-[#F6F7F2] rounded-xl border border-[#DCE3DC] space-y-2 text-xs text-[#536057]">
              <p>
                <strong>Cargo:</strong> {cargoType} ({cargoWeight}t)
              </p>
              <p>
                <strong>Origin:</strong> {originName}
              </p>
              <p>
                <strong>Destination:</strong> {destinationName}
              </p>
              <p>
                <strong>Vehicle:</strong> {vehicleType.replace('_', ' ')}
              </p>
            </div>

            {analyzing ? (
              <div className="p-6 text-center space-y-3 bg-[#DDEBDD] rounded-xl">
                <Sparkles className="w-6 h-6 text-[#2F6B45] animate-spin mx-auto" />
                <p className="font-bold text-sm text-[#214D34]">{analyzeMessage}</p>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(4)}
                  className="w-1/3 border-[#DCE3DC]"
                >
                  Back
                </Button>
                <Button
                  onClick={handleAnalyze}
                  className="w-2/3 bg-[#2F6B45] hover:bg-[#214D34] text-white font-bold"
                >
                  {t('analyzeRoute')}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
