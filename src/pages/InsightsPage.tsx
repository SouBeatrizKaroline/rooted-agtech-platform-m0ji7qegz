import { BarChart3, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { AreaChart, Area, XAxis, YAxis, BarChart, Bar, CartesianGrid } from 'recharts'
import { useI18n } from '@/hooks/use-i18n'

export default function InsightsPage() {
  const { t } = useI18n()

  const costTrendsData = [
    { month: 'Jan', cost: 480 },
    { month: 'Feb', cost: 460 },
    { month: 'Mar', cost: 440 },
    { month: 'Apr', cost: 420 },
    { month: 'May', cost: 410 },
    { month: 'Jun', cost: 395 },
  ]

  const efficiencyData = [
    { name: 'Route A', planned: 64, actual: 64 },
    { name: 'Route B', planned: 78, actual: 82 },
    { name: 'Route C', planned: 95, actual: 98 },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#214D34]">{t('navInsights')}</h1>
        <p className="text-xs sm:text-sm text-[#536057] mt-1">
          Logistics decisions & transportation efficiency metrics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Cost Trend Chart */}
        <div className="p-4 sm:p-5 bg-white border border-[#DCE3DC] rounded-2xl shadow-subtle space-y-3 min-w-0">
          <h3 className="font-bold text-sm text-[#214D34]">Freight Cost Trend ($ / trip)</h3>
          <p className="text-xs text-[#536057]">Demonstrating savings from route optimization</p>

          <ChartContainer
            config={{ cost: { label: 'Cost', color: 'hsl(142, 39%, 30%)' } }}
            className="h-[180px] sm:h-48 w-full"
          >
            <AreaChart data={costTrendsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" textAnchor="middle" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="cost" stroke="#2F6B45" fill="#DDEBDD" />
            </AreaChart>
          </ChartContainer>
        </div>

        {/* Route Efficiency */}
        <div className="p-4 sm:p-5 bg-white border border-[#DCE3DC] rounded-2xl shadow-subtle space-y-3 min-w-0">
          <h3 className="font-bold text-sm text-[#214D34]">Route Distance Efficiency (km)</h3>
          <p className="text-xs text-[#536057]">Planned vs Actual distance per trip</p>

          <ChartContainer
            config={{
              planned: { label: 'Planned', color: '#2F6B45' },
              actual: { label: 'Actual', color: '#B98B4A' },
            }}
            className="h-[180px] sm:h-48 w-full"
          >
            <BarChart data={efficiencyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="planned" fill="#2F6B45" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" fill="#B98B4A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  )
}
