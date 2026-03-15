import Navbar from '../components/Navbar'
import { Shield, Truck, Package, MapPin, Star, Users, Award } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-6 py-20 md:py-28 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
            <Award size={11} /> Hakkımızda
          </div>
<h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-6 tracking-tight">
            ESF Yapı & İnşaat<br />
            <span className="text-blue-400">Biz Kimiz?</span>
          </h1>
          <p className="text-blue-200/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Permolit Boya'nın Doğu Anadolu Bölge Bayii olarak Erzurum ve çevresine profesyonel boya ve yapı malzemeleri sunuyoruz.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
          {[
            {
              icon: Star,
              title: 'Misyonumuz',
              desc: 'Erzurum ve Doğu Anadolu bölgesindeki müşterilerimize orijinal Permolit Boya ürünlerini teknik destek ve danışmanlık hizmetiyle birlikte sunmak. Her projeye özel çözümler üretmek.',
            },
            {
              icon: Users,
              title: 'Vizyonumuz',
              desc: 'Bölgenin en güvenilir yapı malzemeleri tedarikçisi olarak müşteri memnuniyetini ön planda tutarak büyümeye ve gelişmeye devam etmek.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mb-5">
                <Icon size={22} className="text-blue-600" />
              </div>
              <h2 className="font-bold text-slate-900 text-2xl mb-3">{title}</h2>
              <p className="text-slate-500 text-base leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-14">
          {[
            { icon: Shield, title: 'Orijinal Ürün', desc: 'Tüm ürünler doğrudan Permolit Boya fabrikasından temin edilir.' },
            { icon: Truck, title: 'Hızlı Teslimat', desc: 'Erzurum ve çevre illere hızlı ve güvenli teslimat imkânı.' },
            { icon: Package, title: 'Teknik Destek', desc: 'Ürün seçimi ve uygulama konusunda uzman ekibimizden destek.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-blue-200">
                <Icon size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-10 text-center shadow-xl shadow-blue-200">
          <h2 className="font-bold text-white text-3xl mb-3">Bizimle İletişime Geçin</h2>
          <p className="text-blue-200 text-base mb-7">Sorularınız ve siparişleriniz için her zaman buradayız.</p>
          <Link to="/iletisim"
            className="inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-blue-700 px-7 py-3.5 rounded-xl font-bold text-sm transition shadow-md">
            İletişim Sayfası →
          </Link>
        </div>
      </section>
    </div>
  )
}