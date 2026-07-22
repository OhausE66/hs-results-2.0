import React, { useState, useEffect } from 'react';
import { ViewState } from '../types';
import { 
  ChevronLeft, FileText, Book, Download, ExternalLink, 
  Newspaper, GraduationCap, ArrowRight, Library
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { db, collection, onSnapshot } from '../services/firebase';

interface PublicationsProps {
  setView: (view: ViewState) => void;
}

const ARTICLE_MIT_DEM_RUECKEN_TEXT = `
MIT DEM RÜCKEN ZUR WAND … – START-UP-LOGIKEN ZUR KRISENBEKÄMPFUNG IN EINEM TECHNOLOGIEUNTERNEHMEN
Susanne Hanke, Andre Stuer, Robin Höher

"We build the future of R&D to be the best partner of our customers" (Slogan des Start-up-Teams)

Wie kann in einem Konzern unternehmerische Eigenverantwortung gefördert werden? In der folgenden Studie soll die agile unternehmerische Arbeitsweise eines kleinen Projektteams in einer ansonsten klassisch-hierarchischen Konzernstruktur mit klar definierten Zuständigkeiten und Prozessen untersucht werden. Beleuchtet wird dabei insbesondere das dadurch entstehende Spannungsfeld zwischen diesem „Start-up-Team“ und dem Konzern: Wie wird sich David gegen Goliath behaupten?

2.1. EIN TRADITIONSGESCHÄFT WIRD ZUM SORGENKIND
Die Herausforderungen des Konzerns Siemens Energy im Gasturbinengeschäft bei einer stark rückläufigen Nachfrage in einem schrumpfenden Weltmarkt sind immens. Überkapazitäten und die Bevorzugung von kohlebefeuerten Dampfturbinenkraftwerken auf der einen Seite sowie exponentielles Wachstum regenerativer Stromerzeugungsanlagen in klimapolitisch aktiven Ländern auf der anderen Seite prägen den Weltmarkt, der für große Gasturbinen heute im Vergleich zu noch vor zehn Jahren um den Faktor fünf geschrumpft ist.

Wie viel Veränderungsbereitshaft braucht ein Weltkonzern in seiner Organisationsstruktur, um sich im täglichen Überlebenskampf diesem Wandel auf dem Weltmarkt zu stellen? Wie ist damit umzugehen, dass sich auch das Selbstverständnis der Mitarbeiter:innen von ihrer eigenen Rolle im Unternehmen stetig weiterentwickelt? In dem Hochleistungsfeld der Abteilung „Forschung und Entwicklung (R&D)“ ist organisationale Stabilität bisher die verlässliche, kalkulierbare Komponente, um dem täglichen Wettkampf um Marktanteile mit technischen Neuerungen und Weiterentwicklungen zu begegnen. Die Überlebensfrage stellt sich demnach für diese Unternehmenssparte ernsthaft und führt zu vielfältigen Restrukturierungen, aber auch zu ungewöhnlichen Lösungsansätzen.

DIE UNTERSUCHTE EINHEIT
Die hier untersuchte Unternehmenseinheit erbringt hauptsächlich technische Entwicklungsleistungen im fossilen Kraftwerksanlagengeschäft. Mit einem neu zusammengestellten Projektteam, dem „Gasturbinen-Start-up“, soll im Forschungs- und Entwicklungsbereich der Siemens Energy ein technisches Upgrade für eine Gasturbinenanlage entwickelt werden, um den Wirkungsgrad einer bestehenden Turbine zu verbessern.

AUS FÜNF PERSPEKTIVEN
Aus fünf unterschiedlichen Perspektiven (Projektleitung, Teammitglied, interner Kunde, obere Führungskraft, interner Coach) wird in Einzelinterviews auf die Änderungen der organisationalen Entscheidungsprämissen sowie der Muster zur Bewältigung von Paradoxien geschaut, die sich mit der Einführung eines organisationsunüblichen selbstorganisierten „Start-up“-Teams in einer ansonsten klassischen Konzernstruktur ergeben haben.

DER ANDERE WEG (2.2)
Im Gegensatz zum alten Vorgehen, Arbeitsaufträge an Expertensilos zu verteilen, in denen Expertenkapazitäten tendenziell untereinander austauschbar sind, beruht dieser Ansatz auf drei für das bisherige klassische Projektmanagement unüblichen Rahmenbedingungen:

• „100% Dedication“: Die benannten „Start-up“-Mitarbeiter:innen arbeiten ausschließlich in diesem Projekt. Das Projekt bekommt also feste, nicht beliebig austauschbare Ressourcen.
• „Co-Location“: Alle Projektteammitglieder sollen möglichst immer räumlich zusammensitzen, um direkt im Austausch sein zu können, anstatt über E-Mail oder Interface-Dokumente zu kommunizieren.
• „Multiskilling“: Um die Zahl von 45 auf schließlich 16 zu reduzieren, müssen Mitarbeiter:innen mehrere Skills abdecken bzw. sich darin gegenseitig unterstützen können.

ZENTRALE ROLLE DES KICK-OFFS
Besonders hervorgehoben werden muss, dass für alle Interviewten der Drei-Wochen-Kick-off-Workshop eine ganz zentrale Bedeutung hat; er wird quasi als „Conditio sine qua non“ für den Erfolg gesehen.

2.2.1. DIE NEUEN SPIELREGELN
Kernpunkt des neuen Arbeitsansatzes ist die Selbstorganisation und -führung. Wo sonst qua Funktion die Führungskraft entscheidet, übernimmt jetzt das Team. Die geänderte Führungsstruktur schafft Offenheit und Vertrauen. Der Projektleiter wird intern in seiner Rolle als Product Owner eher zum Coach seines Teams.

2.3. DIE ORGANISATION IST IRRITIERT
Der Teamspirit wird so hoch, dass jeder „Eingriff von außen“ als Störung begriffen wird. Die Logiken des „Start-up-Teams“, das flexibel und dynamisch auftritt, und der Restorganisation, die sich hochstrukturiert und standardisiert präsentiert, prallen diametral aufeinander.

ERFOLGSFAKTOREN (AUSBLICK 2.6)
Als Erfolgsfaktoren kann man aus dieser Studie ableiten:
• Eine existenzielle Herausforderung
• Ein kleines Team von „Verrückten“
• Ein Chef mit Risikobereitschaft
• Ein Drei-Wochen-Kick-off als „Gehirnwäsche“
• Eine hohe Konfliktbereitschaft
• Die Bereitschaft, kreative neue Lösungen neben einem Entweder/oder zu finden.

KEY LEARNINGS
• Die hohe Teamidentität führt zu einem Ausblenden der Interessen der Restorganisation.
• Der Anspruch völliger Gleichheit kann in der Praxis nicht dauerhaft aufrechterhalten werden; das Team wählt schließlich eine interne Führung.
• Nicht jeder kann auf Dauer dem hohen Anspruch an Selbstmotivation und gegenseitiger Unterstützung gerecht werden.

Veröffentlicht im Buch „New Organizing“, Carl-Auer-Verlag 2021.
`;

const ARTICLE_SIXT_TEXT = `
PS-STARKE UNTERNEHMENSFÜHRUNG – SIXT IM SPANNUNGSFELD VON HIERARCHIE UND SELBSTORGANISATION
Kurt Rachlitz, Andre Stuer, Wolfgang Zimmermann

9.1 NEW ORGANIZING ALS KATALYSATOR FÜR DIE UMSTELLUNG DES GESCHÄFTSMODELLS?
Neue Organisationsformen sind in aller Munde. Speziell in großen Konzernen ist dieses Thema bereits von verschiedensten Seiten beleuchtet worden. Wie gut passen diese neuen Ansätze mit dem speziellen Organisationstyp „familiengeführtes Unternehmen“ zusammen? Die Transformation der Sixt SE bietet eine ausgezeichnete Möglichkeit, um diese Fragen zu beantworten.

IM KERN
Der Fall zeigt, dass die Einführung neuer Organisationsformen einen intelligenten Umgang mit unterschiedlichen Veränderungsmodellen sowie mit dem Zusammenspiel unterschiedlicher Generationen in der Unternehmerfamilie voraussetzt. Es ist eine Stärke, wenn man Strukturen sowohl „von unten“ wachsen lässt als auch durch Entscheidung „von oben“ einführt.

HINTERGRUND & KULTUR (9.3)
Kennzeichen der Sixt SE is die konsequente Kundenorientierung und eine gelebte Innovationskultur mit starker Technologiekompetenz. 2008 bot Sixt als weltweit erste Autovermietung eine Mietwagenbuchung per iPhone-App an.
Wichtige Merkmale:
• Fehler werden zugelassen (Experimentierfreude).
• Bürokratie wird vermieden, Entscheidungen basieren auf Vertrauen.
• Flexibilität und Leistungskultur.

AUS U-BOOTEN UND TANKERN WERDEN SPRINTS UND ZÜGE (9.4)
Zunächst gab es eine nicht geplant Entstehung agiler Formen (Scrum seit 2008). Diese „U-Boote“ waren wenig abgestimmt. 2018 entschied man sich für ein gezieltes Top-down-Design der circa 500-köpfigen Sixt Tech.

DER TRANSFORMATIONSZPROZESS (9.5)
Die Sixt Tech wurde nach inhaltlichen Abhängigkeiten in „Release Trains“ aufgeteilt (analog zur SAFe-Systematik). 
Wichtige Gründe:
• Bessere Anbindung der IT an das Business.
• Verstärkung des Selbstverständnisses als „Tech Company“.
• Erhöhung der Attraktivität als Arbeitgeber.

NEUE STEUERUNG (OKR)
Der früher zentralistische Priorisierungsprozess wurde durch die OKR-Methode (Objectives & Key Results) ersetzt. Jede Tech-Division arbeitet eng mit dem Vorstand zusammen, um Machbarkeit and Abhängigkeiten frühzeitig zu prüfen.

FAZIT & AUSBLICK (9.7)
Der Erfolg liegt im Balanceakt: Die parallele Existenz hierarchischer Muster und experimenteller Selbstorganisation. Eine der großen Stärken dieser Kultur ist die Paradoxiefähigkeit – mit Widersprüchen und Mehrdeutigkeiten kompetent umzugehen (Ambiguitätstoleranz).

Veröffentlicht im Buch „New Organizing“, Carl-Auer-Verlag 2021.
`;

const ARTICLE_GVH_TEXT = `
DER PROFESSIONELLE KEY-ACCOUNTER IM ÖPNV – PROJEKT ZUR VERBESSERUNG DES KEY-ACCOUNT-MANAGEMENTS
Peter Bierschwale, Violetta Schollmeyer, Olaf Heger

BEGEISTERTE KUNDEN SCHAFFEN GEWINN
Begeisterte Kunden schaffen Gewinn, Kritiker vernichten ihn. In einem beispielhaften Projekt gelang es dem Großraum-Verkehr Hannover (GVH), dem schon sehr erfolgreichen Key-Account-Management in Hannover neue Qualitäten zu verleihen. Durch innovative Coachingmaßnahmen schaffen GVH und üstra begeisterte Großkunden.

120 MIO EURO KUNDENWERT GUT MANAGEN
Die Kernfrage stellte sich schnell: Werden die Energien richtig verteilt? Wie viel Marktpotenzial steckt im Großraum Hannover für das Firmenticket? Konzentriert sich das Key-Account-Management auf die richtigen Aufgaben?

WIE DIE KRÄFTE RICHTIG EINTEILEN?
Das Ziel der Neuorganisation: Weg von der professionellen, aber reaktiven Bearbeitung von Kundenanfragen hin zu einer sinnvollen aktiven Bearbeitung des Gesamtmarktes. Weg von der Priorisierung durch die Lautstärke der Kundenanfrage hin zu der Gewichtung einer Anfrage nach Kundenwert.

BEGLEITUNG BEIM KUNDEN
Neben der Neu-Gestaltung des Aufgabenspektrums war auch die Vorbereitung und Begleitung von anspruchsvollen Kundensituationen Inhalt des Coachings. Beim GVH entschied man sich dafür, in aller Transparenz dem Kunden gegenüber aufzutreten.

DER NUTZEN DES KUNDEN
Doch was ist es, was Kunden wirklich interessiert? Für viele Geschäftsführer zählen Zahlen, Daten und Fakten.
• Einsparung an Personalkosten und Krankentagen.
• Einsparung von Parkplätzen und Kosten.
• Geringere Mitarbeiterfluktuation.
• Nachhaltigkeit: Reduzierung des CO2-Ausstoßes (Beispiel: 200 Mitarbeiter sparen ca. 226 Tonnen CO2 pro Jahr).

AKTIVE NEUKUNDENGEWINNUNG
Zwei Alternativen bieten sich hier an:
1. Die Einbindung von Nichtkunden in Betreuungsroutinen.
2. Die Schaffung eines Beziehungsnetzwerkes von Unterstützern bei Nichtkunden.

BESTANDSKUNDEN BINDEN UND WERT STEIGERN
Neben der Neugewinnung ist es zentrale Aufgabe, bestehende Großkunden angemessen zu betreuen und in ihrem Wert zu steigern (Marktdurchdringung erhöhen).

ZUSAMMENARBEIT OPTIMIEREN
Eine Veränderung kann dann gut gelingen, wenn angrenzende Bereiche in den Prozess integriert sind. Notwendig dafür ist eine deutliche gegenseitige Erwartungsklärung.

Veröffentlicht in: Der Nahverkehr 12/2011.
`;

export const Publications: React.FC<PublicationsProps> = ({ setView }) => {
  const { t } = useLanguage();
  const [pdfMappings, setPdfMappings] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "publication_mappings"), (snapshot) => {
      const mappings: Record<string, string> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        mappings[data.articleId] = data.pdfUrl;
      });
      setPdfMappings(mappings);
    });
    return unsub;
  }, []);

  const handleDownloadSpecificArticle = (id: string, title: string, fallbackContent: string) => {
    // Check if uploaded PDF exists first
    if (pdfMappings[id]) {
      window.open(pdfMappings[id], '_blank');
      return;
    }

    // Fallback to text download
    const element = document.createElement("a");
    const file = new Blob([fallbackContent], {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const articles = [
    {
      id: 'wand',
      title: "Mit dem Rücken zur Wand – Start-up-Logiken zur Krisenbekämpfung in einem Technologieunternehmen aktivieren",
      source: "(Veröffentlicht im Buch „New Organizing“, Carl-Auer-Verlag 2021)",
      category: "Management & Transformation",
      isReady: true, // Legacy flag, now we also check pdfMappings[id]
      content: ARTICLE_MIT_DEM_RUECKEN_TEXT
    },
    {
      id: 'sixt',
      title: "PS-starke Unternehmensführung – SIXT im Spannungsfeld von Hierarchie und Selbstorganisation",
      source: "(Veröffentlicht im Buch „New Organizing“, Carl-Auer-Verlag 2021)",
      category: "Leadership",
      isReady: true,
      content: ARTICLE_SIXT_TEXT
    },
    {
      id: 'lufthansa',
      title: "Change-Driver bei der Lufthansa-Group",
      desc: "Wie Veränderung auf allen Ebenen unterstützt",
      source: "(Personalwirtschaft 03/2018)",
      category: "Case Study",
      isReady: false
    },
    {
      id: 'vip',
      title: "Service Offensive im Fahrdienst der ViP Verkehrsbetriebe Potsdam",
      desc: "Praxisprojekt zur Optimierung von Führung, Kundenorientierung und Mitarbeiter-Engagement.",
      source: "(Personalwirtschaft 04/2015)",
      category: "Mobility & Service",
      isReady: false
    },
    {
      id: 'dhl',
      title: "Fit für den Vertrieb",
      desc: "Wissensmanagement ganz praktisch im DHL Cityvertrieb",
      source: "(Personalwirtschaft 02/2013)",
      category: "Sales",
      isReady: false
    },
    {
      id: 'gvh',
      title: "Der professionelle Key-Accounter im ÖPNV",
      desc: "Wie beim GVH in Hannover durch professionelles Key-Account-Management erfolgreich begeisterte Groß-Kunden gewonnen wurden.",
      source: "(Der Nahverkehr 12/2011)",
      category: "Sales & Mobility",
      isReady: true,
      content: ARTICLE_GVH_TEXT
    },
    {
      id: 'giesskanne',
      title: "Individuell statt Gießkanne",
      desc: "Geschäftskundenvertrieb",
      source: "(ZfK 08/2011)",
      category: "Sales",
      isReady: false
    },
    {
      id: 'mauerfall',
      title: "Der Mauerfall zwischen Energie und Verkehr",
      desc: "Vertriebskonzepte",
      source: "(ZfK 11/2010)",
      category: "Strategic Concepts",
      isReady: false
    },
    {
      id: 'fuehrungskultur',
      title: "Erfolgreich Führungskultur verändern",
      desc: "Durch innovative Veränderungs-Ansätze Führungskultur weiterentwicklen",
      source: "(Kommunalwirtschaft 10-11/2010)",
      category: "Culture Change",
      isReady: false
    },
    {
      id: 'puls',
      title: "Stets am Puls der Mitarbeiter",
      desc: "Erfolgsüberprüfung",
      source: "(Personalmagazin 01/2010)",
      category: "Analytics",
      isReady: false
    },
    {
      id: 'aktivieren',
      title: "Mitarbeiter aktivieren",
      source: "(PERSONAL 12/2009)",
      category: "Empowerment",
      isReady: false
    }
  ];

  const books = [
    {
      title: "New Organizing: Wie Großorganisationen Agilität, Holacracy & Co. einführen – und was man daraus lernen kann",
      authors: "Thorsten Groth, Gerhard P. Krejci, Stefan Günther (Hrsg.) – mit einem Beitrag von Andre Stuer",
      source: "(Carl-Auer-Verlag 2021)",
      img: "https://firebasestorage.googleapis.com/v0/b/hs-results.firebasestorage.app/o/homepage_assets%2FNew%20Organizing.jpeg?alt=media&token=e108b897-a3b1-42b6-a69e-bed7dcfee8b1",
      amazonUrl: "https://www.amazon.de/dp/3849704025?ref=cm_sw_r_ffobk_cso_wa_apan_dp_3DE8WGHHG78EZ1CPB840&ref_=cm_sw_r_ffobk_cso_wa_apan_dp_3DE8WGHHG78EZ1CPB840&social_share=cm_sw_r_ffobk_cso_wa_apan_dp_3DE8WGHHG78EZ1CPB840&skipTwisterOG=1&bestFormat=true"
    },
    {
      title: "Sustainability Leadership: Wie Führungskräfte mittelständischer Unternehmen Nachhaltigkeit verankern können",
      authors: "Wolfgang Zimmermann, Felix Richter, Andre Stuer",
      source: "(Springer Gabler 2024)",
      img: "https://firebasestorage.googleapis.com/v0/b/hs-results.firebasestorage.app/o/homepage_assets%2Fsustainability.jpeg?alt=media&token=88ec3537-b5cb-4cbd-8420-c7acbd2c49c9",
      amazonUrl: "https://www.amazon.de/dp/3658443286?ref=cm_sw_r_ffobk_cso_wa_apan_dp_60GPVCREHP4VVFFCVW5N&ref_=cm_sw_r_ffobk_cso_wa_apan_dp_60GPVCREHP4VVFFCVW5N&social_share=cm_sw_r_ffobk_cso_wa_apan_dp_60GPVCREHP4VVFFCVW5N&skipTwisterOG=1&bestFormat=true"
    }
  ];

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button 
          onClick={() => setView(ViewState.HOME)} 
          className="mb-10 flex items-center text-slate-400 hover:text-hs-blue transition-colors font-black uppercase text-xs tracking-widest no-print"
        >
          <ChevronLeft size={16} className="mr-1" /> {t('ui.back')}
        </button>

        {/* Hero Section */}
        <div className="mb-24">
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-[3px] w-16 bg-hs-orange"></div>
            <p className="text-hs-orange font-black uppercase tracking-[0.3em] text-sm">Wissensbasis</p>
          </div>
          <h1 className="text-6xl font-black text-hs-blue uppercase tracking-tight leading-none mb-8">
            Publikationen
          </h1>
          <p className="text-2xl font-bold text-hs-accent max-w-3xl leading-tight">
            Theoretisch fundiert. Praktisch erprobt. <br/>
            <span className="text-slate-400 font-medium">Einblick in unsere Forschung und Projektergebnisse.</span>
          </p>
        </div>

        {/* Artikel Section */}
        <div className="mb-32">
          <div className="flex items-center space-x-4 mb-12">
            <h2 className="text-3xl font-black text-hs-blue uppercase tracking-tight flex items-center">
              <Newspaper className="mr-4 text-hs-orange" size={32} /> Artikel
            </h2>
            <div className="flex-grow h-[1px] bg-slate-200"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((art, idx) => {
              const hasPdf = !!pdfMappings[art.id];
              const isAvailable = art.isReady || hasPdf;
              
              return (
                <div 
                  key={idx} 
                  className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-all group flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-hs-blue/5 flex items-center justify-center text-hs-blue group-hover:bg-hs-blue group-hover:text-white transition-all duration-300">
                      <FileText size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 bg-slate-50 px-3 py-1 rounded-full group-hover:text-hs-orange transition-colors">
                      {art.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-hs-blue uppercase mb-3 leading-snug group-hover:text-hs-accent transition-colors">
                    {art.title}
                  </h3>
                  {art.desc && <p className="text-sm text-slate-500 mb-4 italic leading-relaxed">{art.desc}</p>}
                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide max-w-[70%]">
                      {art.source}
                    </p>
                    <button 
                      onClick={() => isAvailable && handleDownloadSpecificArticle(art.id, art.title, art.content || '')}
                      className={`p-3 rounded-full transition-all shadow-inner ${isAvailable ? 'bg-hs-orange text-white hover:bg-hs-blue' : 'bg-slate-50 text-slate-300 cursor-not-allowed'}`} 
                      title={hasPdf ? "PDF Dokument öffnen" : isAvailable ? "Text-Version herunterladen" : "PDF folgt in Kürze"}
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bücher Section */}
        <div className="mb-24">
          <div className="flex items-center space-x-4 mb-12">
            <h2 className="text-3xl font-black text-hs-blue uppercase tracking-tight flex items-center">
              <Library className="mr-4 text-hs-orange" size={32} /> Bücher
            </h2>
            <div className="flex-grow h-[1px] bg-slate-200"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {books.map((book, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row group hover:shadow-2xl transition-shadow"
              >
                <div className="md:w-2/5 relative overflow-hidden bg-slate-50 flex items-center justify-center p-6 border-r border-slate-100">
                  <a href={book.amazonUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full flex items-center justify-center">
                    <img 
                      src={book.img} 
                      alt={book.title} 
                      className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-700 shadow-2xl rounded-sm cursor-pointer" 
                    />
                  </a>
                  <div className="absolute top-6 left-6 bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-lg pointer-events-none">
                    <Book className="text-hs-orange" size={24} />
                  </div>
                </div>
                <div className="md:w-3/5 p-10 flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-2xl font-black text-hs-blue uppercase leading-tight mb-4 group-hover:text-hs-orange transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-sm font-bold text-hs-accent uppercase tracking-widest mb-2">
                      Autoren & Mitwirkung
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                      {book.authors}
                    </p>
                  </div>
                  <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      {book.source}
                    </p>
                    <a 
                      href={book.amazonUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center text-hs-blue font-black uppercase text-[10px] tracking-widest hover:text-hs-orange transition-colors"
                    >
                      Amazon Shop <ArrowRight size={14} className="ml-2 text-hs-orange" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Closing Insight */}
        <div className="bg-hs-blue text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden text-center">
           <div className="absolute -bottom-20 -right-20 text-white/5 pointer-events-none">
             <GraduationCap size={400} />
           </div>
           <div className="relative z-10 max-w-3xl mx-auto">
             <p className="text-2xl font-bold italic leading-relaxed mb-6">
               „Unsere Publikationen sind das Destillat aus hunderten Projekten und dem kontinuierlichen Bestreben, moderne Organisationstheorie in wirksame Management-Praxis zu übersetzen.“
             </p>
             <div className="w-12 h-[2px] bg-hs-accent mx-auto mb-4"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-hs-accent">hs:results - Leading with Knowledge</p>
           </div>
        </div>

      </div>
    </div>
  );
};