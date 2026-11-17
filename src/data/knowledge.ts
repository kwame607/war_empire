import type { KnowledgeEntry } from '../game/types';

/**
 * Historical knowledge library.
 * Stage 1 (Discovery) reveals the historical record; stage 2 (Understanding)
 * reveals the analysis and how to apply it in the game.
 * Casualty and troop figures come from ancient or contested sources and are given as estimates.
 */
export const KNOWLEDGE_ENTRIES: KnowledgeEntry[] = [
  {
    id: 'cannae',
    title: "Hannibal's Double Envelopment",
    era: 'Cannae, 216 BC',
    summary: 'A smaller army lets the enemy push into its centre, then closes around both flanks.',
    studyCost: 80,
    studySeconds: 60,
    sections: [
      {
        heading: 'Where and when',
        unlocksAtStage: 1,
        body: 'Cannae, on the open plain of Apulia in southern Italy, on 2 August 216 BC, during the Second Punic War between Carthage and Rome.',
      },
      {
        heading: 'The battle',
        unlocksAtStage: 1,
        body: 'Two years into Hannibal\'s invasion of Italy, Rome raised an unusually large army to destroy him in one decisive fight. Ancient writers give the Roman and allied force as roughly 80,000 men against around 50,000 Carthaginians, though exact numbers are debated.',
      },
      {
        heading: 'Commanders and forces',
        unlocksAtStage: 1,
        body: 'Carthage: Hannibal Barca, with Libyan heavy infantry, Iberian and Gallic infantry and cavalry, and Numidian light cavalry. Rome: the consuls Gaius Terentius Varro and Lucius Aemilius Paullus (who was killed), with legions and allied infantry. Rome was weaker in cavalry.',
      },
      {
        heading: 'How it worked',
        unlocksAtStage: 2,
        body: 'Hannibal placed his weaker Gallic and Iberian infantry in the centre, bowed forward like a crescent, with his best Libyan infantry on both ends. Rome, deep in dense ranks, shoved the centre back. The centre gave ground in good order while the Libyans on each side turned inward. Meanwhile the Carthaginian cavalry defeated the Roman cavalry on the flanks and swept behind the Roman army to close the trap. Packed together, the Romans could not use their numbers.',
      },
      {
        heading: 'Conditions that helped',
        unlocksAtStage: 2,
        body: 'Flat, open ground with no obstacles to hinder cavalry or a wide encirclement. Roman habits also helped: a deep, narrow formation and a determination to force a decision. Ancient accounts also mention wind and dust blowing in Roman faces.',
      },
      {
        heading: 'Weaknesses',
        unlocksAtStage: 2,
        body: 'It demands cavalry superiority and a centre that retreats without collapsing. If the centre routs early, or the enemy keeps strong reserves or attacks the flanks first, the plan fails. It also needs an enemy willing to fight head-on. And a tactical masterpiece did not win the war: Rome refused to make peace, raised new armies and wore Carthage down over the following years.',
      },
      {
        heading: 'How an opponent can counter it',
        unlocksAtStage: 2,
        body: 'Do not mass everything in one deep block. Keep strong flank guards and reserves, protect your cavalry, scout the enemy deployment, choose broken ground, or refuse a decisive battle and attack supply lines instead, as Fabius did before Cannae.',
      },
      {
        heading: 'In WAR EMPIRE',
        unlocksAtStage: 2,
        body: 'Future battles will reward this doctrine on open terrain when you have cavalry superiority and a disciplined centre. It will fail in forests or hills, or against a commander who scouts well and keeps reserves.',
      },
    ],
  },
  {
    id: 'buffalo-horns',
    title: 'The Horns of the Buffalo',
    era: 'Zulu Kingdom, early 19th century onward',
    summary: 'A fast encircling formation: a chest pins the enemy while two horns sweep around.',
    studyCost: 90,
    studySeconds: 75,
    sections: [
      {
        heading: 'Where and when',
        unlocksAtStage: 1,
        body: 'Southern Africa. The formation is associated with the Zulu Kingdom under Shaka (who ruled from about 1816 to 1828), building on military reforms already underway among neighbouring Nguni states.',
      },
      {
        heading: 'The battle',
        unlocksAtStage: 1,
        body: 'Its best-known use is the Battle of Isandlwana on 22 January 1879, in the Anglo-Zulu War, where a Zulu army overwhelmed a British column camped beneath Isandlwana hill.',
      },
      {
        heading: 'Commanders and forces',
        unlocksAtStage: 1,
        body: 'Zulu: an army of roughly 20,000 men organised in age-regiments (amabutho), directed by commanders such as Ntshingwayo kaMahole under King Cetshwayo. British: a column under Lord Chelmsford, with a large part of the force left in camp under Colonel Pulleine while Chelmsford marched out.',
      },
      {
        heading: 'How it worked',
        unlocksAtStage: 2,
        body: 'The army split into the "chest" (the main body that engaged the enemy head-on), two "horns" (fast flanking regiments that circled the enemy) and the "loins" (a reserve held back to exploit gaps). Regiments trained to move quickly on foot and to keep formation under a few simple signals. At Isandlwana the horns closed around a British line that had stretched thin.',
      },
      {
        heading: 'Conditions that helped',
        unlocksAtStage: 2,
        body: 'Broken, grassy ground that hid the advance, surprise, a British camp that was not fortified, and a defending line spread out too widely to concentrate its fire.',
      },
      {
        heading: 'Weaknesses',
        unlocksAtStage: 2,
        body: 'Charging against concentrated rifle and artillery fire is extremely costly, and the plan depends on closing quickly. Zulu victory at Isandlwana was followed by heavy losses at Rorke\'s Drift and defeat at Ulundi in July 1879, where British troops formed a defensive square.',
      },
      {
        heading: 'How an opponent can counter it',
        unlocksAtStage: 2,
        body: 'Scout widely so you are not surprised, keep a compact defensive formation or fortified camp, concentrate firepower and keep ammunition supplied.',
      },
      {
        heading: 'In WAR EMPIRE',
        unlocksAtStage: 2,
        body: 'In future battles, fast infantry with good scouting and a held-back reserve can encircle a stretched enemy. Fortified positions and concentrated ranged fire will punish it.',
      },
    ],
  },
  {
    id: 'feigned-retreat',
    title: 'The Feigned Retreat',
    era: 'Kalka River, 1223',
    summary: 'Pretend to flee, draw the enemy out of formation, then turn and destroy the pursuers.',
    studyCost: 70,
    studySeconds: 60,
    sections: [
      {
        heading: 'Where and when',
        unlocksAtStage: 1,
        body: 'The Pontic steppe near the Kalka River (in present-day Ukraine), on 31 May 1223.',
      },
      {
        heading: 'The battle',
        unlocksAtStage: 1,
        body: 'A Mongol reconnaissance force met an allied army of Rus\' princes and Cumans. Mongol forces withdrew for several days, reportedly around nine, drawing the allies deeper into the steppe before turning on them.',
      },
      {
        heading: 'Commanders and forces',
        unlocksAtStage: 1,
        body: 'Mongols: the generals Subutai and Jebe with mobile mounted archers. Allies: a coalition of Rus\' princes (including Mstislav of Kiev and Mstislav of Halych) and Cuman allies, whose command was divided.',
      },
      {
        heading: 'How it worked',
        unlocksAtStage: 2,
        body: 'The Mongols fell back steadily, stretching the allied column across the steppe so that the fastest troops arrived first and exhausted. When the pursuers were strung out and disordered, the Mongols turned and attacked with mounted archers and charges. The allied coalition could not coordinate a response.',
      },
      {
        heading: 'Conditions that helped',
        unlocksAtStage: 2,
        body: 'Open steppe, fast horses, a divided enemy command and an eager enemy who believed the withdrawal was a real retreat.',
      },
      {
        heading: 'Weaknesses',
        unlocksAtStage: 2,
        body: 'It needs exceptional discipline: a real retreat that looks like a fake one is a rout. The enemy may refuse to follow, or may keep formation and reserves, in which case the retreating force has only given up ground.',
      },
      {
        heading: 'How an opponent can counter it',
        unlocksAtStage: 2,
        body: 'Do not break formation to chase, keep a reserve, scout the ground ahead for a prepared turning point, and avoid pursuing far from your supplies.',
      },
      {
        heading: 'In WAR EMPIRE',
        unlocksAtStage: 2,
        body: 'In future battles, fast and disciplined troops can use a staged withdrawal to split an eager enemy. Armies with strict control of their pursuit will not fall for it.',
      },
    ],
  },
  {
    id: 'russia-1812',
    title: 'Strategic Withdrawal and the Russian Campaign',
    era: 'Russia, 1812',
    summary: 'Trade space for time, deny supplies and let distance wear the invader down.',
    studyCost: 100,
    studySeconds: 90,
    sections: [
      {
        heading: 'Where and when',
        unlocksAtStage: 1,
        body: 'The Russian Empire, from the French crossing of the Niemen on 24 June 1812 to the end of the retreat in December 1812.',
      },
      {
        heading: 'The campaign',
        unlocksAtStage: 1,
        body: 'Napoleon invaded with a Grande Armée of several hundred thousand men drawn from France and allied states. He hoped for a quick decisive battle. Instead Russian armies kept withdrawing. The campaign included the costly battle of Borodino (7 September), the French occupation of Moscow (from 14 September) and a long, disastrous retreat.',
      },
      {
        heading: 'Commanders and forces',
        unlocksAtStage: 1,
        body: 'France: Napoleon Bonaparte. Russia: Mikhail Barclay de Tolly and Pyotr Bagration at first, with Mikhail Kutuzov taking overall command in August. Cossack light cavalry harassed French foragers and stragglers.',
      },
      {
        heading: 'How it worked',
        unlocksAtStage: 2,
        body: 'Russian armies avoided a decisive battle early, retreating eastward and destroying or removing food and fodder along the way. The French lengthened their supply lines across poor roads while the army shrank from hunger, disease (typhus especially), exhaustion, desertion and constant skirmishing. Occupying Moscow did not bring the peace Napoleon expected.',
      },
      {
        heading: 'Conditions that helped',
        unlocksAtStage: 2,
        body: 'Vast distances, thin road networks, scarce food for such a large army, summer heat and disease, and later the arrival of severe cold. Winter made the retreat worse, but the army was already badly weakened long before the cold set in, so it is a mistake to blame snow alone.',
      },
      {
        heading: 'Weaknesses',
        unlocksAtStage: 2,
        body: 'Abandoning territory costs cities, farmland and civilians, and it risks political collapse at home. The defender still needs armies strong enough to fight when the moment comes, and it needs time and a willing government.',
      },
      {
        heading: 'How an opponent can counter it',
        unlocksAtStage: 2,
        body: 'Limit the campaign to what supply can carry, build forward depots, protect convoys, advance on a narrow front and force a decisive battle early or negotiate while strong.',
      },
      {
        heading: 'In WAR EMPIRE',
        unlocksAtStage: 2,
        body: 'In future campaigns, supply and distance will matter as much as battles. A defender who trades space for time can wear down an overextended attacker.',
      },
    ],
  },
];

export function getKnowledgeEntry(id: string): KnowledgeEntry | undefined {
  return KNOWLEDGE_ENTRIES.find((e) => e.id === id);
}

export const KNOWLEDGE_STAGE_NAMES = ['Unknown', 'Discovery', 'Understanding', 'Practical Experience', 'Mastery'] as const;
