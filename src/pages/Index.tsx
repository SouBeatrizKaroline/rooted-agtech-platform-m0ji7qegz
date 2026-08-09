import { Link } from 'react-router-dom'
import {
  Sprout,
  Route,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  Layers,
  Bot,
  Truck,
  CheckCircle2,
} from 'lucide-react'
import { useI18n } from '@/hooks/use-i18n'
import { Button } from '@/components/ui/button'

export default function Index() {
  const { t } = useI18n()

  return (
    <div className="space-y-16 pb-16">
      {/* Hero */}
      <section className="relative pt-12 pb-20 px-4 max-w-6xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDEBDD] border border-[#2F6B45]/20 text-[#214D34] text-xs font-semibold">
          <Sprout className="w-3.5 h-3.5 text-[#2F6B45]" />
          <span>Agricultural Logistics & Decision Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#214D34] tracking-tight leading-tight">
          {t('tagline')}
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#536057]">{t('subtitle')}</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button
            asChild
            size="lg"
            className="bg-[#2F6B45] hover:bg-[#214D34] text-white px-8 rounded-xl shadow-subtle gap-2"
          >
            <Link to="/signup">
              {t('getStarted')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-[#DCE3DC] text-[#214D34] hover:bg-[#F6F7F2] rounded-xl"
          >
            <Link to="/how-it-works">{t('seeHowItWorks')}</Link>
          </Button>
        </div>

        {/* Hero Visual Mockup */}
        <div className="mt-12 bg-white border border-[#DCE3DC] rounded-2xl p-4 sm:p-6 shadow-elevation max-w-4xl mx-auto text-left relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#DCE3DC] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="font-bold text-sm text-[#214D34]">Recommended Route Analysis</span>
            </div>
            <span className="text-xs bg-[#DDEBDD] text-[#214D34] px-2.5 py-0.5 rounded-full font-bold">
              12% Fuel Savings
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-[#F6F7F2] border border-[#DCE3DC]">
              <span className="text-[10px] text-[#737D75] uppercase font-bold">
                Recommended Path
              </span>
              <p className="font-bold text-sm text-[#214D34] mt-0.5">Highway BR-060 Bypass</p>
              <p className="text-xs text-[#536057] mt-2">64 km · 75 min · ~$420 est.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F6F7F2] border border-[#DCE3DC]">
              <span className="text-[10px] text-[#737D75] uppercase font-bold">
                Road Restriction
              </span>
              <p className="font-bold text-sm text-amber-800 mt-0.5">Weigh Station Km 22</p>
              <p className="text-xs text-[#536057] mt-2">Compliant axle limit for 32t truck</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F6F7F2] border border-[#DCE3DC]">
              <span className="text-[10px] text-[#737D75] uppercase font-bold">
                Destination Capacity
              </span>
              <p className="font-bold text-sm text-[#214D34] mt-0.5">Riverside Terminal</p>
              <p className="text-xs text-[#536057] mt-2">Open receiving window until 18:00</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-[#DCE3DC] py-16 px-4">
        <div className="max-w-5xl mx-auto space-y-10 text-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#214D34]">
              {t('howItWorksTitle')}
            </h2>
            <p className="text-sm text-[#536057] mt-1">{t('howItWorksDesc')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              { title: t('step1'), desc: t('step1Desc'), icon: Truck },
              { title: t('step2'), desc: t('step2Desc'), icon: Route },
              { title: t('step3'), desc: t('step3Desc'), icon: ShieldCheck },
              { title: t('step4'), desc: t('step4Desc'), icon: Bot },
            ].map((step, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#F6F7F2] border border-[#DCE3DC] space-y-2"
              >
                <div className="w-10 h-10 rounded-xl bg-[#DDEBDD] text-[#2F6B45] flex items-center justify-center font-bold">
                  <step.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#214D34]">{step.title}</h3>
                <p className="text-xs text-[#536057] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-4 space-y-10">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#214D34]">{t('benefitsTitle')}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: t('benefit1'), desc: t('benefit1Desc') },
            { title: t('benefit2'), desc: t('benefit2Desc') },
            { title: t('benefit3'), desc: t('benefit3Desc') },
            { title: t('benefit4'), desc: t('benefit4Desc') },
            { title: t('benefit5'), desc: t('benefit5Desc') },
            { title: t('benefit6'), desc: t('benefit6Desc') },
          ].map((b, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-[#DCE3DC] shadow-subtle space-y-2"
            >
              <CheckCircle2 className="w-5 h-5 text-[#2F6B45]" />
              <h3 className="font-bold text-sm text-[#214D34]">{b.title}</h3>
              <p className="text-xs text-[#536057] leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Target Audience */}
      <section className="bg-[#214D34] text-white py-16 px-4">
        <div className="max-w-5xl mx-auto space-y-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">{t('peopleTitle')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              { role: t('farmerRole'), line: t('farmerLine') },
              { role: t('agriBizRole'), line: t('agriBizLine') },
              { role: t('logisticsRole'), line: t('logisticsLine') },
              { role: t('decisionRole'), line: t('decisionLine') },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#2F6B45]/50 border border-emerald-500/20"
              >
                <h4 className="font-bold text-sm text-emerald-200">{item.role}</h4>
                <p className="text-xs text-emerald-100 mt-1">{item.line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl font-bold text-[#214D34]">Let's make your next shipment easier.</h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="bg-[#2F6B45] hover:bg-[#214D34] text-white px-8 rounded-xl"
          >
            <Link to="/signup">{t('planShipment')}</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-[#DCE3DC] text-[#214D34]">
            <Link to="/login">{t('talkToRooted')}</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
