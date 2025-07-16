// Shared Monday.com ECH data for ECH Resource Management System
// This file contains the complete dataset of Monday.com ECH prospects with sales status tracking

export interface MondayECH {
  id: string;
  name: string;
  location: string;
  address: string;
  salesStatus: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: string;
  interestedTherapyTypes: string[];
}

// Monday.com ECH data - prospects with sales status instead of prescriptions
// Expanded to 30 entries with realistic distribution across German sales pipeline stages
export const mondayECHs: MondayECH[] = [
  // Interessiert (Early stage) - 7 entries
  {
    id: 'M1',
    name: 'Seniorenresidenz Prenzlauer Berg',
    location: 'Berlin',
    address: 'Prenzlauer Allee 234, 10405 Berlin-Prenzlauer Berg',
    salesStatus: 'Interessiert',
    contactPerson: 'Dr. Petra Hoffmann',
    phone: '+49 30 98765432',
    email: 'info@residenz-prenzlauer.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Physiotherapy', 'Occupational Therapy']
  },
  {
    id: 'M2',
    name: 'Pflegezentrum Am Stadtpark München',
    location: 'Munich',
    address: 'Stadtparkstraße 45, 80339 München-Maxvorstadt',
    salesStatus: 'Interessiert',
    contactPerson: 'Maria Huber',
    phone: '+49 89 87654321',
    email: 'kontakt@stadtpark-muenchen.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Physiotherapy', 'Speech Therapy']
  },
  {
    id: 'M3',
    name: 'Altersheim Blankenese Hamburg',
    location: 'Hamburg',
    address: 'Blankeneser Landstraße 123, 22587 Hamburg-Blankenese',
    salesStatus: 'Interessiert',
    contactPerson: 'Hans-Jürgen Nielsen',
    phone: '+49 40 76543210',
    email: 'leitung@blankenese-hamburg.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Occupational Therapy', 'Speech Therapy']
  },
  {
    id: 'M4',
    name: 'Seniorenpark Düsseldorf',
    location: 'Düsseldorf',
    address: 'Königsallee 89, 40212 Düsseldorf-Stadtmitte',
    salesStatus: 'Interessiert',
    contactPerson: 'Klaus Brenner',
    phone: '+49 211 87654321',
    email: 'info@seniorenpark-duesseldorf.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Physiotherapy']
  },
  {
    id: 'M5',
    name: 'Residenz Goldener Herbst Frankfurt',
    location: 'Frankfurt',
    address: 'Goldstraße 78, 60329 Frankfurt am Main-Innenstadt',
    salesStatus: 'Interessiert',
    contactPerson: 'Sabine Richter',
    phone: '+49 69 65432109',
    email: 'info@goldener-herbst.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Physiotherapy', 'Occupational Therapy', 'Speech Therapy']
  },
  {
    id: 'M6',
    name: 'Tagespflege Leipzig Zentrum',
    location: 'Leipzig',
    address: 'Grimmaische Straße 45, 04109 Leipzig-Zentrum',
    salesStatus: 'Interessiert',
    contactPerson: 'Anja Scholz',
    phone: '+49 341 76543210',
    email: 'kontakt@tagespflege-leipzig.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Physiotherapy', 'Occupational Therapy']
  },
  {
    id: 'M7',
    name: 'Pflegeheim Nürnberg Nord',
    location: 'Nürnberg',
    address: 'Fürther Straße 123, 90429 Nürnberg-Großreuth',
    salesStatus: 'Interessiert',
    contactPerson: 'Helmut Zimmermann',
    phone: '+49 911 54321098',
    email: 'info@pflegeheim-nuernberg.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Speech Therapy']
  },

  // IP Meeting (Qualified leads) - 5 entries
  {
    id: 'M8',
    name: 'Kölner Seniorenwohnpark',
    location: 'Cologne',
    address: 'Rheinuferstraße 156, 50668 Köln-Altstadt',
    salesStatus: 'IP Meeting',
    contactPerson: 'Wolfgang Schmidt',
    phone: '+49 221 54321098',
    email: 'verwaltung@wohnpark-koeln.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Physiotherapy']
  },
  {
    id: 'M9',
    name: 'Villa Sonnenschein Berlin-Zehlendorf',
    location: 'Berlin',
    address: 'Zehlendorfer Damm 89, 14169 Berlin-Zehlendorf',
    salesStatus: 'IP Meeting',
    contactPerson: 'Christine Weber',
    phone: '+49 30 43210987',
    email: 'info@villa-sonnenschein.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Occupational Therapy', 'Speech Therapy']
  },
  {
    id: 'M10',
    name: 'Seniorenpark Isar München',
    location: 'Munich',
    address: 'Isarstraße 234, 80469 München-Isarvorstadt',
    salesStatus: 'IP Meeting',
    contactPerson: 'Dr. Andreas Bauer',
    phone: '+49 89 32109876',
    email: 'kontakt@seniorenpark-isar.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Physiotherapy', 'Speech Therapy']
  },
  {
    id: 'M11',
    name: 'Altenheim Stuttgart Mitte',
    location: 'Stuttgart',
    address: 'Königstraße 67, 70173 Stuttgart-Mitte',
    salesStatus: 'IP Meeting',
    contactPerson: 'Ursula Maier',
    phone: '+49 711 87654321',
    email: 'info@altenheim-stuttgart.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Occupational Therapy']
  },
  {
    id: 'M12',
    name: 'Residenz Dresden Neustadt',
    location: 'Dresden',
    address: 'Hauptstraße 89, 01097 Dresden-Neustadt',
    salesStatus: 'IP Meeting',
    contactPerson: 'Dr. Matthias Lehmann',
    phone: '+49 351 65432109',
    email: 'kontakt@residenz-dresden.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Physiotherapy', 'Speech Therapy']
  },

  // Onboarding (Therapeutensuche) (Converting prospects) - 4 entries
  {
    id: 'M13',
    name: 'Pflegeheim Am Elbufer Hamburg',
    location: 'Hamburg',
    address: 'Elbufer 67, 20459 Hamburg-St. Pauli',
    salesStatus: 'Onboarding (Therapeutensuche)',
    contactPerson: 'Ingrid Larsen',
    phone: '+49 40 21098765',
    email: 'info@elbufer-hamburg.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Physiotherapy', 'Occupational Therapy']
  },
  {
    id: 'M14',
    name: 'Seniorenzentrum Rheinblick Köln',
    location: 'Cologne',
    address: 'Rheinstraße 123, 50676 Köln-Südstadt',
    salesStatus: 'Onboarding (Therapeutensuche)',
    contactPerson: 'Andrea Neumann',
    phone: '+49 221 09876543',
    email: 'info@rheinblick-koeln.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Physiotherapy', 'Occupational Therapy', 'Speech Therapy']
  },
  {
    id: 'M15',
    name: 'Haus Morgensonne Berlin-Tempelhof',
    location: 'Berlin',
    address: 'Tempelhofer Damm 178, 12099 Berlin-Tempelhof',
    salesStatus: 'Onboarding (Therapeutensuche)',
    contactPerson: 'Susanne Braun',
    phone: '+49 30 87654321',
    email: 'kontakt@morgensonne-berlin.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Physiotherapy', 'Occupational Therapy']
  },
  {
    id: 'M16',
    name: 'Pflegezentrum Frankfurt Süd',
    location: 'Frankfurt',
    address: 'Südstraße 234, 60596 Frankfurt am Main-Sachsenhausen',
    salesStatus: 'Onboarding (Therapeutensuche)',
    contactPerson: 'Roland Kraft',
    phone: '+49 69 12345678',
    email: 'info@pflegezentrum-frankfurt.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Speech Therapy']
  },

  // Onboarding (Simple) - 3 entries
  {
    id: 'M17',
    name: 'Alpenblick Seniorenheim München',
    location: 'Munich',
    address: 'Alpenstraße 89, 80335 München-Ludwigsvorstadt',
    salesStatus: 'Onboarding',
    contactPerson: 'Franz Obermeier',
    phone: '+49 89 76543210',
    email: 'info@alpenblick-muenchen.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Physiotherapy', 'Speech Therapy']
  },
  {
    id: 'M18',
    name: 'Seniorenresidenz Hamburg Altona',
    location: 'Hamburg',
    address: 'Große Bergstraße 145, 22767 Hamburg-Altona',
    salesStatus: 'Onboarding',
    contactPerson: 'Petra Johannsen',
    phone: '+49 40 98765432',
    email: 'info@residenz-altona.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Occupational Therapy']
  },
  {
    id: 'M19',
    name: 'Tagespflege Düsseldorf Bilk',
    location: 'Düsseldorf',
    address: 'Bilker Allee 67, 40219 Düsseldorf-Bilk',
    salesStatus: 'Onboarding',
    contactPerson: 'Michael Bergmann',
    phone: '+49 211 43210987',
    email: 'kontakt@tagespflege-bilk.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Physiotherapy', 'Occupational Therapy']
  },

  // Aktiv (Therapeutensuche) (Active with therapist search) - 3 entries
  {
    id: 'M20',
    name: 'Residenz Am Main Frankfurt',
    location: 'Frankfurt',
    address: 'Mainufer 45, 60594 Frankfurt am Main-Sachsenhausen',
    salesStatus: 'Aktiv (Therapeutensuche)',
    contactPerson: 'Martin Fischer',
    phone: '+49 69 10987654',
    email: 'leitung@residenz-main.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Speech Therapy']
  },
  {
    id: 'M21',
    name: 'Seniorenpark Leipzig Süd',
    location: 'Leipzig',
    address: 'Karl-Liebknecht-Straße 89, 04275 Leipzig-Süd',
    salesStatus: 'Aktiv (Therapeutensuche)',
    contactPerson: 'Gabriele Richter',
    phone: '+49 341 21098765',
    email: 'info@seniorenpark-leipzig.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Physiotherapy', 'Occupational Therapy']
  },
  {
    id: 'M22',
    name: 'Pflegeheim Nürnberg Süd',
    location: 'Nürnberg',
    address: 'Münchener Straße 123, 90478 Nürnberg-Mögeldorf',
    salesStatus: 'Aktiv (Therapeutensuche)',
    contactPerson: 'Thomas Huber',
    phone: '+49 911 87654321',
    email: 'info@pflegeheim-nuernberg-sued.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Speech Therapy']
  },

  // Aktiv (Successful clients) - 4 entries
  {
    id: 'M23',
    name: 'Seniorenzentrum Stuttgart West',
    location: 'Stuttgart',
    address: 'Rotebühlstraße 178, 70178 Stuttgart-West',
    salesStatus: 'Aktiv',
    contactPerson: 'Cornelia Schmid',
    phone: '+49 711 65432109',
    email: 'info@seniorenzentrum-stuttgart.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Physiotherapy', 'Occupational Therapy']
  },
  {
    id: 'M24',
    name: 'Altenheim Dresden Altstadt',
    location: 'Dresden',
    address: 'Prager Straße 67, 01069 Dresden-Altstadt',
    salesStatus: 'Aktiv',
    contactPerson: 'Elke Hartmann',
    phone: '+49 351 54321098',
    email: 'kontakt@altenheim-dresden.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Physiotherapy', 'Speech Therapy']
  },
  {
    id: 'M25',
    name: 'Residenz Berlin Charlottenburg',
    location: 'Berlin',
    address: 'Kurfürstendamm 234, 10719 Berlin-Charlottenburg',
    salesStatus: 'Aktiv',
    contactPerson: 'Dr. Jürgen Wolff',
    phone: '+49 30 32109876',
    email: 'info@residenz-charlottenburg.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Occupational Therapy', 'Speech Therapy']
  },
  {
    id: 'M26',
    name: 'Pflegezentrum München Ost',
    location: 'Munich',
    address: 'Rosenheimer Straße 145, 81669 München-Berg am Laim',
    salesStatus: 'Aktiv',
    contactPerson: 'Ingrid Hofmann',
    phone: '+49 89 10987654',
    email: 'info@pflegezentrum-muenchen-ost.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Physiotherapy', 'Occupational Therapy', 'Speech Therapy']
  },

  // Nicht interessiert (Not interested) - 2 entries
  {
    id: 'M27',
    name: 'Altersheim Hamburg Harburg',
    location: 'Hamburg',
    address: 'Harburger Rathausstraße 89, 21073 Hamburg-Harburg',
    salesStatus: 'Nicht interessiert',
    contactPerson: 'Rainer Kurtz',
    phone: '+49 40 09876543',
    email: 'info@altersheim-harburg.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Physiotherapy']
  },
  {
    id: 'M28',
    name: 'Seniorenheim Köln Ehrenfeld',
    location: 'Cologne',
    address: 'Venloer Straße 67, 50823 Köln-Ehrenfeld',
    salesStatus: 'Nicht interessiert',
    contactPerson: 'Monika Decker',
    phone: '+49 221 76543210',
    email: 'info@seniorenheim-ehrenfeld.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Occupational Therapy']
  },

  // Lost - 1 entry
  {
    id: 'M29',
    name: 'Tagespflege Frankfurt Nord',
    location: 'Frankfurt',
    address: 'Friedberger Landstraße 123, 60316 Frankfurt am Main-Nordend',
    salesStatus: 'Lost',
    contactPerson: 'Stefan Richter',
    phone: '+49 69 87654321',
    email: 'info@tagespflege-frankfurt-nord.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Speech Therapy']
  },

  // Von uns abgelehnt (Rejected by us) - 1 entry
  {
    id: 'M30',
    name: 'Pflegeheim Stuttgart Süd',
    location: 'Stuttgart',
    address: 'Tübinger Straße 89, 70178 Stuttgart-Süd',
    salesStatus: 'Von uns abgelehnt',
    contactPerson: 'Bernd Müller',
    phone: '+49 711 43210987',
    email: 'info@pflegeheim-stuttgart-sued.de',
    status: 'Prospect',
    interestedTherapyTypes: ['Physiotherapy']
  }
]; 