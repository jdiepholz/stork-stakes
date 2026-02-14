import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ImpressumPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Impressum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <section>
            <h2 className="text-xl font-semibold">Angaben gemäß § 5 TMG</h2>
            <p>
              [Name des Unternehmens / Inhabers]<br />
              [Straße Hausnummer]<br />
              [PLZ Ort]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Kontakt</h2>
            <p>
              Telefon: [Telefonnummer]<br />
              E-Mail: [E-Mail-Adresse]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Umsatzsteuer-ID</h2>
            <p>
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
              [DE 123 456 789]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Redaktionell verantwortlich</h2>
            <p>
              [Name]<br />
              [Anschrift]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">EU-Streitschlichtung</h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
              <Link href="https://ec.europa.eu/consumers/odr/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                https://ec.europa.eu/consumers/odr/
              </Link>.<br />
              Unsere E-Mail-Adresse finden Sie oben im Impressum.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Verbraucherstreitbeilegung/Universalschlichtungsstelle</h2>
            <p>
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
