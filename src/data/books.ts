import { Book } from '../types';

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'panchatantra-stories',
    title: 'Panchatantra Tales (పంచతంత్ర కథలు)',
    author: 'Vishnu Sharma',
    description: 'An ancient Indian collection of interrelated animal fables in Sanskrit verse and prose, arranged within a frame story designed to impart wisdom, moral education, and political strategy to young minds.',
    category: 'Kids & Education',
    costToUnlock: 20,
    costPerMinute: 1,
    chapters: [
      {
        id: 'panch-1',
        title: 'అధ్యాయం 1: మిత్రభేదం - కోతి మరియు మేకు (The Monkey and the Wedge)',
        content: `ఒకానొక పట్టణ శివార్లలో ఒక ధనవంతుడు పెద్ద మందిరాన్ని నిర్మించడం ప్రారంభించాడు. అక్కడ పని చేసే వడ్రంగులు సగం కోసిన పెద్ద కలప దిమ్మెను మధ్యలో మేకు గుప్పి భోజనానికి వెళ్లారు.

అక్కడికి కొన్ని కోతులు వచ్చాయి. ఒక చిన్న కోతి కుతూహలంతో ఆ కలప దిమ్మెపై కూర్చుని, మధ్యలో ఉన్న మేకును గట్టిగా పట్టుకుని ఊపడం ప్రారంభించింది. కొంతసేపటికి మేకు బయటకు రావడంతో, ఊడిపోయిన దిమ్మెల మధ్య కోతి తోక చిక్కుకుని తీవ్రంగా గాయపడింది.

నీతి: అనవసరమైన విషయాల్లో తలదూర్చడం ప్రమాదకరం.`
      },
      {
        id: 'panch-2',
        title: 'అధ్యాయం 2: నక్క మరియు మురళి (The Jackal and the Drum)',
        content: `ఒక ఆకలితో ఉన్న నక్క ఆహారం వెతుక్కుంటూ అడవిలో నడుస్తోంది. హఠాత్తుగా గాలికి చెట్టు కొమ్మలు తగిలి పెద్ద శబ్దం రావడం గమనించింది. అది యుద్ధభూమిలో వదిలేసిన పెద్ద డ్రమ్ శబ్దం.

నక్క మొదట భయపడింది, కానీ ధైర్యం చేసి పరిశీలించగా అది కేవలం శబ్దం చేసే చర్మపు డ్రమ్ అని, అందులో ఎటువంటి క్రూరజంతువు లేదని గ్రహించింది.

నీతి: భయపడకుండా ధైర్యంగా నిజాన్ని పరిశోధించాలి.`
      }
    ]
  },
  {
    id: 'vedic-mantras-spirituality',
    title: 'Vedic Mantras & Stotramalika (వేద మంత్రాలు & స్తోత్రములు)',
    author: 'Maharshi Vedavyasa',
    description: 'A sacred compilation of powerful Vedic hymns, Gayatri Mantra explanations, Peace Chants (Shanti Mantras), and spiritual meditation guides for inner peace and mental clarity.',
    category: 'Mantras & Spirituality',
    costToUnlock: 35,
    costPerMinute: 1,
    chapters: [
      {
        id: 'vms-1',
        title: 'Chapter 1: Gayatri Mantra & Meaning (గాయత్రీ మంత్రం)',
        content: `ఓం భూర్భువస్సువః | తత్సవితుర్వరేణ్యం | భర్గో దేవస్య ధీమహి | ధియో యో నః ప్రచోదయాత్ ||

అర్థం:
ఓ భగవంతుడా! నీవు సచ్చిదానంద స్వరూపుడవు. ప్రకాశమానుడవు, పాపనాశకుడవు అయిన ఆ సర్వేశ్వరుని దివ్యకాంతిని మేము ధ్యానిస్తున్నాము. ఆ పరమాత్మ మన బుద్ధిని సన్మార్గంలో నడిపించు గాక!`
      },
      {
        id: 'vms-2',
        title: 'Chapter 2: Mahamrityunjaya Mantra (మహామృత్యుంజయ మంత్రం)',
        content: `ఓం త్రయంబకం యజామహే సుగంధిం పుష్టివర్ధనమ్ |
ఉర్వారుకమివ బంధనాన్మృత్యోర్ముక్షీయ మామృతాత్ ||

అర్థం:
మూడు నేత్రములు కలవాడు, సుగంధ భరితుడు, జీవులను పోషించువాడైన పరమశివుడిని ఆరాధిస్తున్నాము. తొడిమ నుండి దోసపండు విడివడినట్లు మమ్మల్ని మృత్యుపాశాల నుండి విడిపించి అమృతత్వము వైపు నడిపించు గాక.`
      }
    ]
  },
  {
    id: 'indian-culture-heritage',
    title: 'Culture & Heritage of India (భారతీయ సంస్కృతి & వారసత్వం)',
    author: 'Dr. S. Radhakrishnan',
    description: 'An insightful exploration of India\'s rich architectural marvels, classical art forms, ancient universities like Nalanda and Takshashila, and enduring cultural philosophies.',
    category: 'Culture & Heritage',
    costToUnlock: 40,
    costPerMinute: 2,
    chapters: [
      {
        id: 'ich-1',
        title: 'Chapter 1: The Splendor of Ancient Architecture',
        content: `Indian architecture is a deeply spiritual expression woven with intricate mathematics and stone carvings. From the monolithic Kailasa Temple at Ellora carved out of a single rock to the magnificent Brihadeeswarar Temple of Thanjavur, ancient craftsmen engineered wonders that baffle modern science.

The precision of solar alignment in Konark Sun Temple and Tanjore's Shadowless Vimanam demonstrate advanced metallurgy and structural engineering thousands of years ago.`
      }
    ]
  },
  {
    id: 'aryabhata-science-tech',
    title: 'Ancient Indian Science & Metallurgy (ప్రాచీన సైన్స్ & సాంకేతికత)',
    author: 'Aryabhata & Sushruta',
    description: 'Discover the groundbreaking scientific discoveries of ancient India: zero (Shunya), Sushruta\'s pioneer surgical operations, metallurgy of Delhi\'s Iron Pillar, and planetary distances.',
    category: 'Technology & Science',
    costToUnlock: 45,
    costPerMinute: 2,
    chapters: [
      {
        id: 'ais-1',
        title: 'Chapter 1: Aryabhata and the Concept of Zero',
        content: `Aryabhata, born in 476 CE, laid the foundation of modern mathematics and astronomy. He posited that the Earth rotates on its axis, accurately calculated the length of the solar year to 365.258 days, and formulated the decimal place-value system.`
      }
    ]
  },
  {
    id: 'gitanjali-literature',
    title: 'Gitanjali & Indian Poetry (గీతాంజలి)',
    author: 'Rabindranath Tagore',
    description: 'Nobel-prize winning collection of prose poems by Rabindranath Tagore, celebrating human connection with the divine, love, freedom, and timeless literary mastery.',
    category: 'Literature & Novels',
    costToUnlock: 30,
    costPerMinute: 1,
    chapters: [
      {
        id: 'git-1',
        title: 'Poem 35: Where the Mind is Without Fear',
        content: `Where the mind is without fear and the head is held high;
Where knowledge is free;
Where the world has not been broken up into fragments by narrow domestic walls;
Where words come out from the depth of truth;
Where tireless striving stretches its arms towards perfection;
Where the clear stream of reason has not lost its way into the dreary desert sand of dead habit;
Where the mind is led forward by thee into ever-widening thought and action—
Into that heaven of freedom, my Father, let my country awake.`
      }
    ]
  },
  {
    id: 'art-of-war',
    title: 'The Art of War',
    author: 'Sun Tzu',
    description: 'An ancient military treatise composing 13 chapters, offering timeless wisdom on strategy, leadership, discipline, and conflict resolution.',
    category: 'Literature & Novels',
    costToUnlock: 50,
    costPerMinute: 2,
    chapters: [
      {
        id: 'aow-1',
        title: 'Chapter 1: Laying Plans',
        content: `Sun Tzu said: The art of war is of vital importance to the State. It is a matter of life and death, a road either to safety or to ruin. Hence it is a subject of inquiry which can on no account be neglected.`
      }
    ]
  }
];
