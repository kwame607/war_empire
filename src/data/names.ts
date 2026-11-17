/** Name pools for hired commanders, by civilisation. Plain given names only. */
const POOLS: Record<string, string[]> = {
  sikaman: ['Kwadwo', 'Yaw', 'Kofi', 'Kwabena', 'Ama', 'Abena', 'Akosua', 'Adwoa', 'Nana Yaa', 'Kwaku'],
  niani: ['Mamadou', 'Souleymane', 'Fanta', 'Mariam', 'Kankou', 'Balla', 'Sekou', 'Aminata', 'Modibo', 'Nama'],
  fjordlands: ['Halvard', 'Sigrun', 'Torsten', 'Ylva', 'Eirik', 'Astrid', 'Gunnar', 'Ingrid', 'Bjarni', 'Solveig'],
  aurelia: ['Marcus', 'Livia', 'Lucius', 'Cornelia', 'Gaius', 'Flavia', 'Titus', 'Valeria', 'Decimus', 'Aurelia'],
  serene: ['Matteo', 'Lucrezia', 'Giacomo', 'Caterina', 'Lorenzo', 'Bianca', 'Paolo', 'Isabella', 'Marco', 'Chiara'],
};

export function namePool(civId: string): string[] {
  return POOLS[civId] ?? POOLS.aurelia;
}

export const TRAIT_TEXT = {
  bold: 'Bold: +10% attack when advancing or concentrating',
  cautious: 'Cautious: +10% defence when holding or fortifying',
  quartermaster: 'Quartermaster: one extra round of supplies',
  scholar: 'Scholar: +10% from doctrines you have studied',
} as const;
