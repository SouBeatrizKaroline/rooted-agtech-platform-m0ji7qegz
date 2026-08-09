import { Link } from 'react-router-dom'
import { Sprout, Route, Layers, ShieldCheck, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HowItWorks() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-[#2F6B45] uppercase tracking-wider">
          Product Process
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#214D34]">How Rooted Works</h1>
        <p className="text-base text-[#536057] max-w-xl mx-auto">
          Rooted transforms complex agricultural supply chain data into clear, simple choices.
        </p>
      </div>

      <div className="space-y-6">
        {[
          {
            step: '01',
            title: 'Collect Cargo & Logistics Details',
            desc: 'Select crop type (corn, soybeans, wheat, produce), weight in tons, vehicle dimensions, and origin/destination points.',
          },
          {
            step: '02',
            title: 'Analyze Constraints & Road Restrictions',
            desc: 'Rooted evaluates highway weight limits, toll structures, weigh stations, bridge clearances, and secondary bypasses.',
          },
          {
            step: '03',
            title: 'AI Decision & Simple Recommendations',
            desc: 'Receive clear route recommendations labeled by Data, Estimate, Recommendation, or Warning in plain language.',
          },
          {
            step: '04',
            title: 'Act & Monitor Storage',
            desc: 'Track active shipments in real-time and locate available silos or cold storage facilities near your terminal.',
          },
        ].map((s, idx) => (
          <div
            key={idx}
            className="p-6 bg-white border border-[#DCE3DC] rounded-2xl flex gap-4 items-start shadow-subtle"
          >
            <span className="text-2xl font-black text-[#2F6B45]">{s.step}</span>
            <div>
              <h3 className="font-bold text-lg text-[#214D34]">{s.title}</h3>
              <p className="text-sm text-[#536057] mt-1">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-4">
        <Button asChild size="lg" className="bg-[#2F6B45] hover:bg-[#214D34] text-white rounded-xl">
          <Link to="/signup">Start Planning Your Shipment</Link>
        </Button>
      </div>
    </div>
  )
}
