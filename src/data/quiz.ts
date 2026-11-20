export type QuizQuestion = {
  id: string;
  entryId: string;
  question: string;
  options: string[];
  answer: number;
  explain: string;
};

/** Questions are answerable from the record's Discovery text, so they unlock when it is discovered. */
export const QUIZ: QuizQuestion[] = [
  { id: 'cannae-1', entryId: 'cannae', question: 'Who commanded the Carthaginian army at Cannae?', options: ['Scipio Africanus', 'Hannibal Barca', 'Hasdrubal the Fair', 'Hamilcar Barca'], answer: 1, explain: 'Hannibal Barca led Carthage at Cannae in 216 BC.' },
  { id: 'cannae-2', entryId: 'cannae', question: 'Which war was Cannae part of?', options: ['The First Punic War', 'The Second Punic War', 'The Peloponnesian War', 'The Social War'], answer: 1, explain: 'Cannae was fought in the Second Punic War, two years into Hannibal’s invasion of Italy.' },
  { id: 'cannae-3', entryId: 'cannae', question: 'Where did Hannibal place his best Libyan infantry?', options: ['In the centre', 'In reserve, far behind', 'On both ends of the line', 'On a hill to the rear'], answer: 2, explain: 'The strong Libyans stood on both ends, so that when Rome pushed in the centre they could close in from the sides.' },

  { id: 'horns-1', entryId: 'buffalo-horns', question: 'At which battle was the Buffalo Horns formation most famously used?', options: ['Rorke’s Drift', 'Ulundi', 'Isandlwana', 'Blood River'], answer: 2, explain: 'On 22 January 1879 at Isandlwana a Zulu army overwhelmed a British column.' },
  { id: 'horns-2', entryId: 'buffalo-horns', question: 'What was the job of the "horns"?', options: ['Hold the reserve back', 'Fast flankers that circled the enemy', 'Attack the enemy head-on', 'Guard the baggage'], answer: 1, explain: 'The chest engaged head-on, the horns circled the flanks, and the loins stayed back as a reserve.' },
  { id: 'horns-3', entryId: 'buffalo-horns', question: 'Which regiments system organised the Zulu army?', options: ['Amabutho (age-regiments)', 'Legions', 'Janissaries', 'Tercios'], answer: 0, explain: 'Zulu men were organised in age-regiments called amabutho.' },

  { id: 'retreat-1', entryId: 'feigned-retreat', question: 'At which river did the Mongols defeat the Rus’ princes in 1223?', options: ['Volga', 'Kalka', 'Danube', 'Dnieper'], answer: 1, explain: 'The battle of the Kalka River was fought in 1223.' },
  { id: 'retreat-2', entryId: 'feigned-retreat', question: 'What did the Mongols do before turning on their enemies?', options: ['Waited in ambush at the camp', 'Sent envoys to ask for peace', 'Withdrew for several days to draw them deep into the steppe', 'Burned the grass and fell back to the sea'], answer: 2, explain: 'They reportedly withdrew for around nine days, stretching the allied army before turning around.' },
  { id: 'retreat-3', entryId: 'feigned-retreat', question: 'Who fought on the other side, alongside the Rus’ princes?', options: ['Cumans', 'Ottomans', 'Normans', 'Vikings'], answer: 0, explain: 'An allied army of Rus’ princes and Cumans met the Mongol force.' },

  { id: '1812-1', entryId: 'russia-1812', question: 'What did Russian armies do instead of seeking a decisive battle early in 1812?', options: ['Kept withdrawing eastward', 'Attacked Paris', 'Waited in Moscow', 'Asked for terms at once'], answer: 0, explain: 'They kept withdrawing and removing food and fodder, stretching the French supply lines.' },
  { id: '1812-2', entryId: 'russia-1812', question: 'Which costly battle was fought on 7 September 1812?', options: ['Austerlitz', 'Waterloo', 'Borodino', 'Leipzig'], answer: 2, explain: 'Borodino was costly for both sides; Napoleon occupied Moscow a week later.' },
  { id: '1812-3', entryId: 'russia-1812', question: 'Why is it a mistake to blame snow alone for the French disaster?', options: ['There was no winter that year', 'The army was already badly weakened long before the cold set in', 'The French had warm clothing', 'Russia never fought at all'], answer: 1, explain: 'Hunger, disease and distance had already broken the army before winter arrived.' },

  { id: 'salamis-1', entryId: 'salamis', question: 'Who was the main source for the battle of Salamis (480 BC)?', options: ['Herodotus', 'Livy', 'Polybius', 'Plutarch'], answer: 0, explain: 'Herodotus gives our main account, though his figures for the Persians are widely doubted.' },
  { id: 'salamis-2', entryId: 'salamis', question: 'What kind of warship made up the Greek fleet?', options: ['Galleons', 'Triremes', 'Longships', 'Dromons'], answer: 1, explain: 'The Greeks fought in triremes.' },
  { id: 'salamis-3', entryId: 'salamis', question: 'What did the narrow waters do for the smaller Greek fleet?', options: ['Made the Persian numbers matter less', 'Hid them from enemy view', 'Forced Persians to anchor', 'Let them ram from open sea'], answer: 0, explain: 'In narrow water the larger Persian fleet could not use its numbers, and ships crowded each other.' },

  { id: 'lepanto-1', entryId: 'lepanto', question: 'In which year was the battle of Lepanto?', options: ['1453', '1492', '1571', '1683'], answer: 2, explain: 'Lepanto was fought in 1571.' },
  { id: 'lepanto-2', entryId: 'lepanto', question: 'Who commanded the Holy League fleet?', options: ['Ali Pasha', 'Don John of Austria', 'Andrea Doria', 'Barbarossa'], answer: 1, explain: 'Don John of Austria led the Holy League; Ali Pasha led the Ottomans.' },
  { id: 'lepanto-3', entryId: 'lepanto', question: 'What kind of fleets fought at Lepanto?', options: ['Sailing ships of the line', 'Great galley fleets', 'Ironclads', 'Fire ships only'], answer: 1, explain: 'Two galley fleets of roughly 200 ships each met in one of the largest naval battles in history.' },
];

export function getQuestion(id: string): QuizQuestion | undefined {
  return QUIZ.find((q) => q.id === id);
}
