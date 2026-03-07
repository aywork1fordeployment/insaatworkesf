import Navbar from '../components/Navbar'
import { MapPin, Phone, Mail, Clock, MessageSquare } from 'lucide-react'

export default function Contact() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-6 py-20 md:py-28 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
            <MessageSquare size={11} /> İletişim
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
            Bize Ulaşın
          </h1>
          <p className="text-blue-200/70 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Sorularınız, siparişleriniz veya teknik danışmanlık için aşağıdaki kanallardan bize ulaşabilirsiniz.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16">

        {/* İletişim kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          {[
            {
              icon: MapPin,
              title: 'Adres',
              lines: ['Erzurum, Türkiye'],
              color: 'bg-blue-600',
              href: 'https://www.google.com/maps/dir/39.9133958,41.1901572/Çifte+Minareli+Medrese,+Rabia+Ana,+Cumhuriyet+Cd.+No:3,+25030+Yakutiye',
              cta: 'Yol Tarifi Al'
            },
            {
              icon: Phone,
              title: 'Telefon',
              lines: ['Bilgi için iletişime geçin'],
              color: 'bg-green-600',
              href: 'tel:+90',
              cta: 'Ara'
            },
            {
              icon: Mail,
              title: 'E-posta',
              lines: ['Bilgi için iletişime geçin'],
              color: 'bg-indigo-600',
              href: 'mailto:info@esfyapi.com',
              cta: 'Mail Gönder'
            },
            {
              icon: Clock,
              title: 'Çalışma Saatleri',
              lines: ['Pazartesi – Cumartesi', '08:00 – 18:00'],
              color: 'bg-slate-700',
              href: null,
              cta: null
            },
          ].map(({ icon: Icon, title, lines, color, href, cta }) => (
            <div key={title} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-start gap-4">
              <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                <Icon size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-base mb-1">{title}</p>
                {lines.map((line, i) => (
                  <p key={i} className="text-slate-500 text-sm">{line}</p>
                ))}
                {href && cta && (
                  <a href={href} target={href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold mt-2 hover:underline">
                    {cta} →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Harita */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-10">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Çifte Minareli Medrese</p>
              <p className="text-slate-400 text-xs">Cumhuriyet Cd. No:3, 25030 Yakutiye / Erzurum</p>
            </div>
            <a href="https://www.google.com/maps/dir/39.9133958,41.1901572/Çifte+Minareli+Medrese,+Rabia+Ana,+Cumhuriyet+Cd.+No:3,+25030+Yakutiye"
              target="_blank" rel="noopener noreferrer"
              className="ml-auto text-xs text-blue-600 font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition flex-shrink-0">
              Yol Tarifi →
            </a>
          </div>
          <div style={{ height: '380px' }}>
            <iframe
              src="https://maps.google.com/maps?q=Çifte+Minareli+Medrese,+Erzurum&z=16&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              title="Çifte Minareli Medrese"
              allowFullScreen
            />
          </div>
        </div>

        {/* Permolit linki */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-10 text-center shadow-xl shadow-blue-200">
          <h2 className="font-bold text-white text-3xl mb-3">Permolit Boya Resmî Sitesi</h2>
          <p className="text-blue-200 text-base mb-7">Ürün kataloğu ve teknik bilgiler için Permolit'in resmî sitesini ziyaret edin.</p>
          <a href="https://www.permolitboya.com.tr/" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-blue-700 px-7 py-3.5 rounded-xl font-bold text-sm transition shadow-md">
            permolitboya.com.tr ↗
          </a>
        </div>
      </section>
    </div>
  )
}