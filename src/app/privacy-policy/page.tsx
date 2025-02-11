import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privātuma politika | Regbija Klubs',
  description: 'Mūsu privātuma politika un personas datu apstrādes principi.',
};

export default function PrivacyPolicy() {
  return (
    <div className="container-width py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Privātuma politika
        </h1>

        <section className="prose dark:prose-invert max-w-none space-y-8">
          <div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Šī privātuma politika informē par privātuma praksi un personas datu apstrādes principiem saistībā ar biedrības regbija klubs ''fēnikss'' mājas lapu un pakalpojumiem. Lai sazinātos saistībā ar datu apstrādes jautājumiem, lūdzu rakstiet e-pastu uz rkfenikss@gmail.com.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Kādu informāciju mēs iegūstam?
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Mēs iegūstam tādus personas datus, ko jūs mums brīvprātīgi sniedzat ar e-pasta starpniecību, aizpildot tīmeklī bāzētās anketas un citā tiešā saziņā ar jums.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Kā mēs izmantojam iegūtos personas datus?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Mēs varam izmantot iegūtos personas datus, lai:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
              <li>sniegtu jums jūsu pieprasītos pakalpojumus un informāciju,</li>
              <li>apstrādātu jūsu pasūtījumus un noformētu nepieciešamos dokumentus,</li>
              <li>sniegtu jums efektīvu klientu atbalstu,</li>
              <li>palīdzētu novērst apdraudējumu vai krāpnieciskas darbības,</li>
              <li>nosūtītu jums informatīvus ziņojumus, ja esat nepārprotami piekrituši tādus saņemt,</li>
              <li>ievērotu normatīvo aktu prasības,</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Kā mēs aizsargājam personas datus?
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Jūsu personas datu aizsardzībai mēs izmantojam dažādus tehniskus un organizatoriskus drošības pasākumus. Jūsu personas dati ir pieejami ierobežotam cilvēku skaitam, tikai pilnvarotām personām.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Cik ilgi mēs glabājam personas datus?
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Mēs glabājam jūsu personas datus tik ilgi, cik ilgi tie ir mums nepieciešami atbilstoši to ieguves mērķim un kā to pieļauj vai nosaka normatīvo aktu prasības.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Kā mēs izmantojam sīkdatnes?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Sīkdatnes ir nelielas teksta datnes, ko jūsu apmeklētās mājas lapas saglabā jūsu datorā. Tās tiek izmantotas, lai nodrošinātu mājas lapas darbību, kā arī lai sniegtu informāciju vietnes īpašniekiem.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Šī mājas lapa var iestatīt sekojošas sīkdatnes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
              <li><strong>Funkcionālās sīkdatnes.</strong> Šīs sīkdatnes ir nepieciešamas, lai jūs spētu pārvietoties mājas lapā un lietot tās funkcijas.</li>
              <li><strong>Google Analytics sīkdatnes.</strong> Šīs sīkdatnes lieto, lai iegūtu mūsu mājas lapas apmeklējuma statistiku.</li>
              <li><strong>Mērķētas reklāmas rīku sīkdatnes.</strong> Šīs sīkdatnes lieto, lai paaugstinātu reklāmas efektivitāti.</li>
              <li><strong>Trešās puses pakalpojumu sniedzēja sīkdatnes.</strong> Sīkdatnes var iestatīt šajā mājas lapā lietotie trešo pušu pakalpojumi.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Jūsu tiesības saistībā ar jūsu personas datiem
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Ja jūs esat datu subjekts saskaņā ar ES VDAR, jums ir sekojošas tiesības:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
              <li><strong>Tiesības piekļūt informācijai.</strong> Saņemt informāciju par datu apstrādi un datu kopiju.</li>
              <li><strong>Tiesības labot.</strong> Panākt neprecīzu datu labošanu.</li>
              <li><strong>Tiesības "tikt aizmirstam".</strong> Panākt savu datu dzēšanu.</li>
              <li><strong>Tiesības ierobežot apstrādi.</strong> Ierobežot datu apstrādi noteiktos gadījumos.</li>
              <li><strong>Tiesības iebilst.</strong> Iebilst pret datu apstrādi jebkurā brīdī.</li>
            </ul>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mt-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pēdējo reizi atjaunināts: {new Date().toLocaleDateString('lv-LV')}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
} 