import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DatenschutzPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Datenschutzerklärung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Datenschutz auf einen Blick</h2>
            <h3 className="font-semibold">Allgemeine Hinweise</h3>
            <p className="mb-2">
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
            </p>
            <h3 className="font-semibold">Datenerfassung auf dieser Website</h3>
            <p>
              <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
              Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Hosting</h2>
            <p>
              Wir hosten die Inhalte unserer Website bei folgendem Anbieter:<br />
              [Name des Hosters, z.B. Vercel]<br />
              [Adresse des Hosters]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Allgemeine Hinweise und Pflichtinformationen</h2>
            <h3 className="font-semibold">Datenschutz</h3>
            <p className="mb-2">
              Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
            </p>
            <h3 className="font-semibold">Hinweis zur verantwortlichen Stelle</h3>
            <p className="mb-2">
              Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:<br />
              [Name des Unternehmens / Inhabers]<br />
              [Straße Hausnummer]<br />
              [PLZ Ort]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Datenerfassung auf dieser Website</h2>
            <h3 className="font-semibold">Cookies</h3>
            <p className="mb-2">
              Unsere Internetseiten verwenden so genannte „Cookies“. Cookies sind kleine Datenpakete und richten auf Ihrem Endgerät keinen Schaden an. Sie werden entweder vorübergehend für die Dauer einer Sitzung (Session-Cookies) oder dauerhaft (permanente Cookies) auf Ihrem Endgerät gespeichert.
            </p>
            <p className="mb-2">
              Wir setzen ausschließlich technisch notwendige Cookies ein, die für den Betrieb der Website zwingend erforderlich sind (z.B. für den Login-Bereich oder Spracheinstellungen). Diese Cookies benötigen gemäß § 25 Abs. 2 Nr. 2 TTDSG keine Einwilligung. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO zur Wahrung unseres berechtigten Interesses an einer fehlerfreien und optimierten Bereitstellung unserer Dienste.
            </p>
            <h3 className="font-semibold">Server-Log-Dateien</h3>
            <p>
              Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">5. Analyse-Tools und Werbung</h2>
            <p>
              [Hier ggf. Google Analytics oder ähnliche Dienste aufführen, falls verwendet. Falls nicht, diesen Abschnitt entfernen oder anpassen.]
            </p>
          </section>

          <section>
             <h2 className="text-xl font-semibold mb-2">6. Plugins und Tools</h2>
             <p>
               [Hier ggf. Google Fonts, Google Maps etc. aufführen.]
             </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
