import { useState } from 'react'
import { X, ShieldCheck, FileText, Lock } from 'lucide-react'

export default function KvkkModal({ isOpen, onClose, defaultTab = 'kvkk' }) {
  const [tab, setTab] = useState(defaultTab)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-200">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">Yasal Bilgilendirme ve Güvence</h3>
              <p className="text-xs text-slate-500">ESF Yapı & İnşaat · 6698 Sayılı KVKK Uyumluluğu</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-100 px-6 bg-white gap-2 pt-2">
          <button
            onClick={() => setTab('kvkk')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition ${
              tab === 'kvkk'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <FileText size={15} />
            KVKK Aydınlatma Metni
          </button>
          <button
            onClick={() => setTab('gizlilik')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition ${
              tab === 'gizlilik'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Lock size={15} />
            Gizlilik ve Çerez Politikası
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto text-slate-600 text-sm leading-relaxed space-y-4">
          {tab === 'kvkk' ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-900">
                <p className="font-bold text-blue-950 mb-1">6698 SAYILI KİŞİSEL VERİLERİN KORUNMASI KANUNU (KVKK) KAPSAMINDA AYDINLATMA METNİ</p>
                Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") m. 10 ile Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ uyarınca hazırlanmıştır.
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">1. Veri Sorumlusu</h4>
                <p className="text-xs text-slate-600 leading-normal">
                  Kişisel verileriniz, 6698 sayılı Kanun kapsamında veri sorumlusu sıfatıyla <strong>ESF Yapı ve İnşaat Malzemeleri</strong> ("ESF Yapı") tarafından aşağıda açıklanan çerçevede işlenmektedir.<br />
                  <strong>Adres:</strong> Ilıca, Hoca Ahmet Yesevi Mahallesi No: 19/B, 25700 Aziziye / Erzurum<br />
                  <strong>E-posta:</strong> esfyapi@hotmail.com | <strong>Telefon:</strong> +90 (532) 358 17 92
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">2. İşlenen Kişisel Verileriniz ve Toplama Yöntemi</h4>
                <p className="text-xs text-slate-600 leading-normal mb-1.5">
                  Web sitemize üye olurken veya sipariş oluştururken doğrudan tarafınızca paylaşılan aşağıdaki veriler elektronik ortamda işlenmektedir:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-1">
                  <li><strong>Kimlik Bilgisi:</strong> Ad ve Soyad.</li>
                  <li><strong>İletişim Bilgisi:</strong> E-posta adresi, Telefon numarası, Teslimat/İrtibat adresi.</li>
                  <li><strong>Müşteri İşlem Bilgisi:</strong> Sepet içerikleri, sipariş geçmişi, talep edilen ürünler, sipariş notları.</li>
                  <li><strong>İşlem Güvenliği Bilgisi:</strong> Kriptografik olarak şifrelenmiş (hash) parola, kullanıcı kimliği (ID), oturum kayıtları.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">3. Kişisel Verilerin İşlenme Amaçları ve Hukuki Sebepleri</h4>
                <p className="text-xs text-slate-600 leading-normal mb-1.5">
                  Toplanan kişisel verileriniz, KVKK'nın 5. maddesinde belirtilen aşağıdaki hukuki sebeplere dayalı olarak işlenir:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-1">
                  <li><strong>Sözleşmenin Kurulması ve İfası (KVKK m. 5/2-c):</strong> Sipariş taleplerinizin alınması, teyit edilmesi, ürünlerin hazırlanması, Erzurum ve çevre illere teslimatı, sipariş durumundaki güncellemeler hakkında tarafınıza bilgi verilmesi.</li>
                  <li><strong>Hukuki Yükümlülüğün Yerine Getirilmesi (KVKK m. 5/2-ç):</strong> Vergi, fatura ve muhasebe mevzuatından doğan kayıt saklama yükümlülükleri.</li>
                  <li><strong>Meşru Menfaat (KVKK m. 5/2-f):</strong> Kullanıcı hesap güvenliğinin sağlanması, yetkisiz veya şüpheli işlemlerin engellenmesi, müşteri memnuniyeti ve teknik destek sağlanması.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">4. Kişisel Verilerin Aktarılması</h4>
                <p className="text-xs text-slate-600 leading-normal">
                  ESF Yapı olarak kişisel verilerinizi reklam, pazarlama, veri ticareti gibi amaçlarla <strong>üçüncü şahıslara veya kurumlara kesinlikle satmaz ve devretmeyiz.</strong> Verileriniz yalnızca yasal bir zorunluluk bulunması durumunda yetkili kamu kurum ve kuruluşları (mahkemeler, kolluk kuvvetleri, vergi daireleri) ile yasal mevzuat sınırları dahilinde paylaşılabilir.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">5. İlgili Kişi Olarak Haklarınız (KVKK Madde 11)</h4>
                <p className="text-xs text-slate-600 leading-normal mb-1.5">
                  Kanun'un 11. maddesi uyarınca veri sahibi olarak;
                </p>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5 pl-1">
                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
                  <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
                  <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
                  <li>Verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
                  <li>KVKK'nın 7. maddesi uyarınca verilerinizin silinmesini veya yok edilmesini talep etme (Hesabınızın kapatılması ve verilerinizin silinmesi),</li>
                  <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme haklarına sahipsiniz.</li>
                </ul>
                <p className="text-xs text-slate-600 mt-2">
                  Taleplerinizi <strong>esfyapi@hotmail.com</strong> e-posta adresimize yazılı olarak veya bizzat mağazamıza başvurarak iletebilirsiniz. Başvurularınız en geç 30 gün içinde ücretsiz olarak sonuçlandırılır.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-800">
                <p className="font-bold text-slate-900 mb-1">GİZLİLİK VE ÇEREZ (COOKIE) POLİTİKASI</p>
                ESF Yapı & İnşaat olarak web sitemizi ziyaret eden ve hizmetlerimizden yararlanan tüm müşterilerimizin gizliliğine ve bilgi güvenliğine azami önem veriyoruz.
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">1. Çerezler (Cookies) ve Yerel Depolama (LocalStorage)</h4>
                <p className="text-xs text-slate-600 leading-normal mb-1.5">
                  Web sitemiz, temel işlevlerini yerine getirebilmek ve kullanıcı deneyimini kesintisiz kılmak amacıyla yalnızca <strong>zorunlu teknik çerezler ve yerel depolama anahtarları</strong> kullanmaktadır:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-1">
                  <li><strong>Sepet Verisi (esf-cart):</strong> Sayfayı yenilediğinizde veya siteyi tekrar ziyaret ettiğinizde sepetinizdeki ürünlerin kaybolmaması için tarayıcınızın kendi belleğinde tutulur.</li>
                  <li><strong>Oturum Bilgisi:</strong> Sisteme giriş yaptığınızda güvenli oturumun açık kalmasını sağlamak için şifreli belirteçler (token) kullanılır.</li>
                  <li><strong>Çerez Tercihi:</strong> Çerez bilgilendirmesini onayladığınızda bu tercihin hatırlanması amacıyla saklanır.</li>
                </ul>
                <p className="text-xs text-slate-600 mt-1.5">
                  Web sitemizde kullanıcıları internet genelinde izleyen üçüncü taraf reklam/hedefleme çerezleri <u>kullanılmamaktadır</u>.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">2. Şifre ve Hesap Güvenliği</h4>
                <p className="text-xs text-slate-600 leading-normal">
                  Hesabınıza ait şifreler veritabanımızda asla açık metin olarak tutulmaz; endüstri standardı tek yönlü kriptografik özetleme (hashing) algoritmalarıyla korunur. Şirket personeli dahil hiç kimse şifrenizi açık halde göremez.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">3. Ödeme ve Finansal Bilgiler</h4>
                <p className="text-xs text-slate-600 leading-normal">
                  Web sitemiz üzerinden kredi kartı, banka kartı veya finansal ödeme bilgisi <strong>alınmamakta ve depolanmamaktadır.</strong> Sitemizden verilen siparişler bayimiz tarafından doğrudan hazırlanan ve teslimatta/mağazada kararlaştırılan toptan/perakende teklif ve teslimat usulüyle çalışır.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">4. İletişim Güvenliği</h4>
                <p className="text-xs text-slate-600 leading-normal">
                  Web sitemiz ile tarayıcınız arasındaki tüm veri trafiği 256-bit SSL/TLS şifreleme sertifikası ile korunmaktadır.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            ESF Yapı & İnşaat · Aziziye / Erzurum
          </p>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md shadow-blue-200"
          >
            Okudum, Anladım
          </button>
        </div>

      </div>
    </div>
  )
}
