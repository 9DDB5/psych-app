import { Template } from '@/types';
import { generateId } from '@/utils/generateId';

function split(items: string[]): string[] {
  return items.flatMap(item =>
    item.split(' - ').map(s => s.trim()).filter(s => s.length > 0)
  );
}

export function createDefaultTemplate(): Template {
  const s1id = generateId();
  const s2id = generateId();
  const s3id = generateId();

  return {
    id: generateId(),
    name: 'Template Standard',
    createdAt: new Date().toISOString(),
    sections: [
      {
        id: s1id,
        title: 'Tipo di freezing vissuto',
        maxSelect: 2,
        color: '#FFFFFF',
        bgColor: '#3B5BDB',
        items: [
          'Chock', 'Sgomento', 'Sconcerto', 'Spiazzamento', 'Dubbio', 'Dissociazione',
          'Disorientamento', 'Spaesamento', 'Smarrimento', 'Irrealtà', 'Incredulità', 'Derealizzazione',
          'Stupore', 'Estraneità', 'Sorpresa', 'Blocco', 'Meraviglia',
          'Inibizione', 'Paralisi', 'Spavento', 'Terrore', 'Distacco',
        ],
      },
      {
        id: s2id,
        title: 'Evento vissuto come...',
        color: '#FFFFFF',
        bgColor: '#1A237E',
        items: split([
          'Minaccia', 'Agguato', 'Trappola', 'Angoscia', 'Conflitto', 'Costrizione', 'Violenza', 'Tragedia', 'Trauma',
          'Rischio', 'Pericolo', 'Danno', 'Perdita', 'Rinuncia', 'Necessità - Bisogno', 'Mancanza', 'Crisi', 'Distruzione', 'Dipendenza', 'Rovina',
          'Tradimento di aspettativa', 'Cambiamento', 'Instabilità', 'Contrarietà', 'Forzatura - Obbligo', 'Inganno', 'Perfidia', 'Ignoranza - Ottusità', 'Arroganza', 'Manipolazione', 'Errore',
          'Fallimento', 'Incapacità', 'Impotenza', 'Inadeguatezza', 'Inferiorità', 'Debolezza', 'Incertezza', 'Giudizio', 'Persecuzione', 'Condanna',
          'Dolore', 'Ferita', 'Punizione', 'Rifiuto', 'Esclusione', 'Solitudine', 'Abbandono', 'Fine', 'Morte',
          'Ingiustizia', 'Sopruso', 'Ricatto', 'Pretesa', 'Offesa', 'Umiliazione', 'Derisione', 'Accusa', 'Vergogna', 'Colpa', 'Ipocrisia',
          'Speranza - Aspettativa', 'Curiosità - Meraviglia', 'Fortuna - Opportunità', 'Desiderio', 'Gratificazione', 'Piacere', 'Sollievo', 'Vittoria', 'Appagamento', 'Riconoscimento', 'Accettazione - Accoglienza', 'Onnipotenza',
        ]),
      },
      {
        id: s3id,
        title: 'Caratteristiche della situazione / esperienza / realtà',
        color: '#FFFFFF',
        bgColor: '#880E4F',
        items: split([
          'Inaspettata - Imprevista - Imprevedibile', 'Improvvisa', 'Inevitabile - Inarrestabile', 'Ingestibile',
          'Invivibile - Insupportabile - Inaffrontabile', 'Indesiderata - Indesiderabile',
          'Dura - Faticosa - Difficile', 'Stressante', 'Condizionante',
          'Irrimediabile - Irreversibile', 'Insormontabile - Soverchiante - Limitante',
          'Soffocante - Annientante - Fagocitante', 'Incontrollabile', 'Su cui non ho potere',
          'Caotica - Confusa', 'Troppo grande per me', 'Fuori misura',
          'Nuova - Ignota - Sconosciuta', 'Sconvolgente - Sottosopra',
          'Spaventosa - Minacciosa - Pericolosa', 'Paralizzante - Bloccante',
          'Agghiacciante - Mostruosa', 'Dolorosa', 'Vissuta in silenzio', 'Mortale',
          'Incomprensibile', 'Inconoscibile', 'Assurda', 'Surreale',
          'Insensata - Insostenibile', 'Illogica', 'Infondata', 'Inverosimile',
          'Irrazionale', 'Incredibile', 'Inconcepibile - Impossibile',
          'Allucinante', 'Paradossale', 'Irreale', 'Folle', 'Diabolica',
          'Incosciente - Irresponsabile', 'Incoerente - Incongruente', 'Sfuggente', 'Strana', 'Ambigua',
          'Ingiusta', 'Ingiustificata - Ingiustificabile', 'Immeritata',
          'Irrespettosa - Incivile', 'Arbitraria - Involontaria', 'Inaffidabile',
          'Colpevole', 'Vergognosa', 'Indecente - Infamante', 'Brutta - Sporca',
          'Imperdonabile', 'Inaccettabile', 'Crudele', 'Sbagliata',
          'Iniqua - Ingenerosa', 'Sleale', 'Stupida', 'Arretrata', 'Immatura',
          'Non amorevole', 'Disumana', 'Innaturale', 'Amorale',
        ]),
      },
    ],
  };
}
