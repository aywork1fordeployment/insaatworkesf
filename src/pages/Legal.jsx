import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { ShieldCheck, FileText, Lock } from 'lucide-react'

export default function Legal() {
  const location = useLocation()
  const isPrivacyPath = location.pathname.includes('gizlilik')
  const [tab, setTab] = useState(isPrivacyPath ? 'gizlilik' : 'kvkk')

  useEffect(() => {
    setTab(location.pathname.includes('gizlilik') ? 'gizlilik' : 'kvkk')
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 relative overflow-hidden py-14 md:py-20 text-center">
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold px-4 py-2 rounded-full mb-4 uppercase tracking-widest">
            <ShieldCheck size={13} /> Hukuki Bilgilendirme
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            {tab === 'kvkk' ? 'KVKK Aydınlatma Metni' : 'Gizlilik ve Çerez Politikası'}
          </h1>
          <p className="text-blue-200/70 text-sm sm:text-base max-w-xl mx-auto">
            ESF Yapı ve İnşaat Malzemeleri olarak 6698 sayılı Kişisel Verilerin Korunması Kanunu'na tam uyum sağlıyoruz.
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Sekmeler */}
        <div className="flex gap-2 bg-white border border-slate-200 p-1.5 rounded-2xl mb-8 shadow-xs">
          <button
            onClick={() => setTab('kvkk')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition ${
              tab === 'kvkk'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText size={16} /> KVKK Aydınlatma Metni
          </button>
          <button
            onClick={() => setTab('gizlilik')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition ${
              tab === 'gizlilik'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock size={16} /> Gizlilik ve Çerez Politikası
          </button>
        </div>

        {/* Metin İçeriği */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-10 shadow-sm leading-relaxed text-slate-700 text-sm space-y-6">
          {tab === 'kvkk' ? (
            <>
              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-5 text-xs text-blue-950 font-medium leading-relaxed">
                <p className="font-bold text-sm text-blue-900 mb-1">
                  6698 SAYILI KİŞİSEL VERİLERİN KORUNMASI KANUNU ("KVKK") KAPSAMINDA MÜŞTERİ AYDINLATMA METNİ
                </p>
                Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu’nun 10. maddesi ile Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ kapsamında, veri sorumlusu sıfatıyla <strong>ESF Yapı ve İnşaat Malzemeleri</strong> tarafından hazırlanmıştır.
              </div>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900">1. Veri Sorumlusunun Kimliği</h2>
                <p>
                  Kişisel verileriniz, veri sorumlusu sıfatıyla <strong>ESF Yapı ve İnşaat Malzemeleri</strong> ("Şirket") tarafından işlenmektedir.
                </p>
                <div className="bg-slate-50 rounded-xl p-3.5 text-xs text-slate-600 border border-slate-100">
                  <p><strong>Unvan:</strong> ESF Yapı ve İnşaat Malzemeleri</p>
                  <p><strong>Adres:</strong> Ilıca, Hoca Ahmet Yesevi Mahallesi, No: 19/B, 25700 Aziziye / Erzurum</p>
                  <p><strong>Telefon:</strong> +90 (532) 358 17 92 / +90 (533) 053 95 35</p>
                  <p><strong>E-posta:</strong> esfyapi@hotmail.com</p>
                </div>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900">2. İşlenen Kişisel Veri Kategorileri ve Toplama Yöntemi</h2>
                <p>
                  Web sitemiz (<a href="https://www.esfyapi.tr" className="text-blue-600 underline">esfyapi.tr</a>) üzerinden elektronik ortamda doğrudan sizlerin beyanı ile toplanan kişisel verileriniz şunlardır:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li><strong>Kimlik Bilgileri:</strong> Ad ve soyad.</li>
                  <li><strong>İletişim Bilgileri:</strong> E-posta adresi, cep telefonu numarası, sipariş teslimat adresi.</li>
                  <li><strong>Müşteri İşlem Bilgileri:</strong> Talep edilen sipariş kalemleri, adetler, fiyatlar, sepet içerikleri, sipariş notları ve sipariş tarihi.</li>
                  <li><strong>İşlem Güvenliği Bilgileri:</strong> Şifrelenmiş parola özetleri (hash), oturum belirteçleri ve sistem işlem logları.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900">3. Kişisel Verilerin İşlenme Amaçları ve Hukuki Sebepleri</h2>
                <p>
                  Kişisel verileriniz, 6698 sayılı Kanun’un 5. maddesinde belirtilen aşağıdaki hukuki sebepler uyarınca işlenmektedir:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  <li>
                    <strong>Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması (KVKK m. 5/2-c):</strong> Sipariş taleplerinizin sisteme kaydedilmesi, hazırlanması, stok kontrolünün yapılması, ürünlerin sevk ve teslimatı ve sipariş durumu ile ilgili tarafınıza bilgilendirme yapılması.
                  </li>
                  <li>
                    <strong>Hukuki yükümlülüklerin yerine getirilmesi (KVKK m. 5/2-ç):</strong> Vergi Usul Kanunu, Türk Ticaret Kanunu ve ilgili tüketici mevzuatı gereğince yasal defter ve fatura/fiş kayıtlarının tutulması.
                  </li>
                  <li>
                    <strong>Meşru menfaat (KVKK m. 5/2-f):</strong> Web sitemizin güvenliğinin sağlanması, şüpheli işlemlerin engellenmesi, müşteri destek taleplerinin karşılanması.
                  </li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900">4. Kişisel Verilerin Aktarılması</h2>
                <p>
                  ESF Yapı olarak müşteri gizliliğini temel ilke kabul ederiz. Toplanan kişisel verileriniz <strong>hiçbir şekilde reklam, pazarlama, ticari veri paylaşımı amacıyla üçüncü taraflarla paylaşılmaz veya satılmaz.</strong>
                </p>
                <p>
                  Verileriniz yalnızca kanunen yetkili kamu kurum ve kuruluşları (adli makamlar, emniyet, vergi daireleri) tarafından usulüne uygun talep edilmesi halinde yasal sınırlar çerçevesinde paylaşılabilir.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900">5. Veri Sahibinin Hakları (KVKK Madde 11)</h2>
                <p>
                  KVKK’nın 11. maddesi kapsamında dilediğiniz zaman Şirketimize başvurarak:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
                  <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
                  <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
                  <li>Eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
                  <li>KVKK 7. maddesi uyarınca silinmesini veya yok edilmesini talep etme (üyeliğinizi ve verilerinizi tamamen sildirme),</li>
                  <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme haklarına sahipsiniz.</li>
                </ul>
                <p className="mt-3">
                  Bu haklarınızı kullanmak için <strong>esfyapi@hotmail.com</strong> e-posta adresimize yazabilir veya doğrudan Aziziye/Erzurum'daki mağazamıza başvurabilirsiniz.
                </p>
              </section>
            </>
          ) : (
            <>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-800 font-medium leading-relaxed">
                <p className="font-bold text-sm text-slate-900 mb-1">
                  GİZLİLİK VE ÇEREZ (COOKIE) POLİTİKASI
                </p>
                Bu Gizlilik Politikası, ESF Yapı ve İnşaat Malzemeleri’nin sunduğu hizmetleri kullanırken gizliliğinizin nasıl korunduğunu açıklar.
              </div>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900">1. Çerezler ve Tarayıcı Depolaması</h2>
                <p>
                  Sitemiz, temel e-ticaret fonksiyonlarının (ürün sepeti, oturum yönetimi) aksamadan çalışması için yalnızca <strong>zorunlu teknik çerezler ve yerel depolama (localStorage)</strong> unsurları kullanır:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li><strong>Sepet Çerezi (`esf-cart`):</strong> Seçtiğiniz boya ve malzemelerin siz siparişi tamamlayana kadar tarayıcınızda güvenle saklanmasını sağlar.</li>
                  <li><strong>Oturum Çerezleri:</strong> Güvenli giriş yapabilmeniz ve sayfa geçişlerinde oturumunuzun korunması için kullanılan şifreli belirteçlerdir.</li>
                  <li><strong>Çerez Onay Tercihi:</strong> Sitemizdeki çerez bildirimini kabul edip etmediğinizi hatırlar.</li>
                </ul>
                <p className="mt-2 text-xs text-slate-500">
                  * Sitemizde kullanıcıları internette takip eden, profil çıkaran üçüncü taraf reklam ağları (Google AdSense, Meta Pixel vb.) <u>kullanılmamaktadır</u>.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900">2. Finansal Bilgiler ve Ödeme Güvenliği</h2>
                <p>
                  ESF Yapı web sitesi üzerinden herhangi bir kredi kartı çekimi, banka hesabı veya kart bilgisi toplanmaz ve depolanmaz. Sitemizdeki siparişler bayimiz ile müşteri arasında fiziki/doğrudan yürütülen malzeme temini ve teklif süreçlerine dayanır.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900">3. Veri Güvenliği Standartları</h2>
                <p>
                  Tüm parolalar tek yönlü şifreleme algoritmalarıyla korunur. Ziyaretçilerimiz ile web sitemiz arasındaki tüm iletişim modern SSL/TLS şifreleme protokolleri ile güvence altındadır.
                </p>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
