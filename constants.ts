
import type { SectionData, PainField, Option, PainState, FormState, LayoutSettings, ScenarioCategory } from './types';

export const initialPainState: PainState = {
  p: [], q: [], r: [], site: '', s: '', t: [], u: [], medicament: '', interventionsNonPharma: []
};

// Initial form state definition for FormState
export const initialFormState: FormState = {
  quart: '',
  gender: '',
  heure: '',
  // Admission
  admissionCheckboxes: [],
  orientation: [],
  autonomie: '',
  effetsPersonnels: '',
  accesVeineux: false,
  accesVeineux_gauge: '',
  accesVeineux_site: '',
  piccLine: false,
  piccLine_site: '',
  drains: [],
  sondes: [],
  // Sections
  position: [],
  etatEveil: '',
  signesVitaux: '',
  signesNeuro: '',
  respiratoire: [],
  respiratoire_medicament: '',
  respiratoire_interventions: [],
  respiratoire_o2_litres: '',
  digestif: [],
  digestif_medicament: '',
  digestif_interventions: [],
  urinaire: [],
  urinaire_medicament: '',
  urinaire_interventions: [],
  tegumentaire: [],
  tegumentaire_medicament: '',
  tegumentaire_interventions: [],
  geriatrie: [],
  finDeVie: [],
  finDeVie_other: '',
  observations: [],
  visites: '',
  particularites: '',
  douleur: initialPainState,
  addExtraSpace: false, // Default to false
};


export const defaultLayoutSettings: LayoutSettings = {
  lineHeight: 2.03,
  fontSize: 10.5,
  textTopPosition: 7.3,
  textLeftPosition: 1.5,
  textBlockWidth: 18.5,
  letterSpacing: 0,
  fontWeight: 700,
  fontFamily: 'courier',
  isOfflineQueueEnabled: true, // Default to true
  addExtraSpaceAssistant: false, // NEW: Default to false for assistant
};

export const fontOptions: { value: string, label: string }[] = [
    { value: 'courier', label: 'Courier' },
    { value: 'helvetica', label: 'Helvetica' },
    { value: 'times', label: 'Times New Roman' },
];

export const complexityOptions: Option[] = [
    { value: 'Simple', label: 'Simple (pour patient/étudiant)' },
    { value: 'Détaillé', label: 'Détaillé (pour professionnel)' },
];


// Nouvelles constantes pour la section Admission détaillée
export const admissionBaseOptions: Option[] = [
    { value: 'Bracelet d\'identification vérifié et conforme', label: 'Bracelet d\'identification vérifié' },
    { value: 'Allergies vérifiées et signalées au dossier', label: 'Allergies vérifiées' },
    { value: 'Enseignement sur le fonctionnement de l\'unité et l\'appel infirmier effectué', label: 'Enseignement patient effectué' },
    { value: 'Évaluation initiale de la douleur effectuée', label: 'Évaluation douleur initiale' },
];
export const orientationOptions: Option[] = [
    { value: 'Temps', label: 'Temps' },
    { value: 'Lieu', label: 'Lieu' },
    { value: 'Personne', label: 'Personne' },
];
export const autonomieOptions: Option[] = [
    { value: 'Autonome', label: 'Autonome' },
    { value: 'Aide x 1', label: 'Aide x 1' },
    { value: 'Aide x 2', label: 'Aide x 2' },
    { value: 'Aide totale', label: 'Aide totale' },
];
export const accesVeineuxGaugeOptions: Option[] = [
    { value: '#18', label: '#18' },
    { value: '#20', label: '#20' },
    { value: '#22', label: '#22' },
    { value: '#24', label: '#24' },
];
export const drainsOptions: Option[] = [
    { value: 'Jackson-Pratt (JP)', label: 'Jackson-Pratt (JP)' },
    { value: 'Hemovac', label: 'Hemovac' },
    { value: 'Penrose', label: 'Penrose' },
    { value: 'Drain thoracique', label: 'Drain thoracique' },
    { value: 'Pigtail', label: 'Pigtail' },
];
export const sondesOptions: Option[] = [
    { value: 'Sonde urinaire (Foley)', label: 'Sonde urinaire (Foley)' },
    { value: 'Sonde naso-gastrique (SNG)', label: 'Sonde naso-gastrique (SNG)' },
    { value: 'Sonde de gastrostomie (PEG)', label: 'Sonde de gastrostomie (PEG)' },
    { value: 'Étui pénien', label: 'Étui pénien' },
];
export const siteMembreOptions: Option[] = [
    { value: 'bras droit (BD)', label: 'Bras droit (BD)' },
    { value: 'bras gauche (BG)', label: 'Bras gauche (BG)' },
    { value: 'avant-bras droit (ABD)', label: 'Avant-bras droit (ABD)' },
    { value: 'avant-bras gauche (ABG)', label: 'Avant-bras gauche (ABG)' },
];


export const finDeVieOptions: Option[] = [
    { value: 'Pauses respiratoires', label: 'Pauses respiratoires' },
    { value: 'Râles terminaux (sécrétions audibles)', label: 'Râles terminaux (sécrétions audibles)' },
    { value: 'Cyanose ou marbrures des extrémités', label: 'Cyanose ou marbrures des extrémités' },
    { value: 'Altération de l\'état de conscience', label: 'Altération de l\'état de conscience' },
    { value: 'Diminution des apports oraux', label: 'Diminution des apports oraux' },
    { value: 'Agitation ou confusion', label: 'Agitation ou confusion' },
    { value: 'Incapacité à bouger', label: 'Incapacité à bouger' },
    { value: 'Incontinence urinaire ou fécale', label: 'Incontinence urinaire ou fécale' },
    { value: 'Douleur incontrôlée', label: 'Douleur incontrôlée' },
    { value: 'Retrait social / Perte d\'intérêt', label: 'Retrait social / Perte d\'intérêt' },
    { value: 'Œdème périphérique', label: 'Œdème périphérique' },
    { value: 'Autre (à préciser)', label: 'Autre (à préciser)' }, // Added "Other" option
];

// New constant for non-pharmacological pain interventions
export const painNonPharmaInterventions: Option[] = [
    { value: 'Positionnement confortable', label: 'Positionnement confortable' },
    { value: 'Application de chaud/froid', label: 'Application de chaud/froid' },
    { value: 'Massage léger', label: 'Massage léger' },
    { value: 'Techniques de relaxation (respiration, imagerie)', label: 'Techniques de relaxation (respiration, imagerie)' },
    { value: 'Distraction (musique, télévision, conversation)', label: 'Distraction (musique, télévision, conversation)' },
    { value: 'Présence rassurante', label: 'Présence rassurante' },
    { value: 'Réduction des stimuli environnementaux (lumière, bruit)', label: 'Réduction des stimuli environnementaux (lumière, bruit)' },
];

// Define painFieldsData based on PainField type
export const painFieldsData: PainField[] = [
  {
    id: 'p',
    label: 'P : Provoqué / Pallié (facteurs déclenchants ou soulageants)',
    type: 'checkbox',
    options: [
      { value: 'Mouvement', label: 'Mouvement' },
      { value: 'Pression', label: 'Pression' },
      { value: 'Stress', label: 'Stress' },
      { value: 'Repos', label: 'Repos' },
      { value: 'Médication', label: 'Médication' },
      { value: 'Position spécifique', label: 'Position spécifique' },
    ],
  },
  {
    id: 'q',
    label: 'Q : Qualité (comment décririez-vous la douleur ?)',
    type: 'checkbox',
    options: [
      { value: 'Lancinante', label: 'Lancinante' },
      { value: 'Sourde', label: 'Sourde' },
      { value: 'Crampe', label: 'Crampe' },
      { value: 'Brûlure', label: 'Brûlure' },
      { value: 'Coupante', label: 'Coupante' },
      { value: 'Piquante', label: 'Piquante' },
      { value: 'Pression', label: 'Pression' },
      { value: 'Serrement', label: 'Serrement' },
    ],
  },
  {
    id: 'r',
    label: 'R : Région / Irradiation (où se situe la douleur et irradie-t-elle ?)',
    type: 'checkbox',
    options: [
      { value: 'Localisée', label: 'Localisée' },
      { value: 'Généralisée', label: 'Généralisée' },
      { value: 'Irradiation au bras gauche', label: 'Irradiation au bras gauche' },
      { value: 'Irradiation au dos', label: 'Irradiation au dos' },
      { value: 'Irradiation à la mâchoire', label: 'Irradiation à la mâchoire' },
    ],
  },
  {
    id: 's',
    label: 'S : Sévérité (sur une échelle de 0 à 10)',
    type: 'radio',
    options: [
      { value: '0 - Aucune douleur', label: '0 - Aucune douleur' },
      { value: '1-3 - Douleur légère', label: '1-3 - Douleur légère' },
      { value: '4-6 - Douleur modérée', label: '4-6 - Douleur modérée' },
      { value: '7-10 - Douleur sévère', label: '7-10 - Douleur sévère' },
    ],
  },
  {
    id: 't',
    label: 'T : Temps (depuis quand, constante, intermittente ?)',
    type: 'checkbox',
    options: [
      { value: 'Constante', label: 'Constante' },
      { value: 'Intermittente', label: 'Intermittente' },
      { value: 'Aiguë (apparition soudaine)', label: 'Aiguë (apparition soudaine)' },
      { value: 'Chronique (longue durée)', label: 'Chronique (longue durée)' },
    ],
  },
  {
    id: 'u',
    label: 'U : Understanding (impact sur les activités, ce que le patient en pense)',
    type: 'checkbox',
    options: [
      { value: 'Impact sur le sommeil', label: 'Impact sur le sommeil' },
      { value: 'Impact sur l\'appétit', label: 'Impact sur l\'appétit' },
      { value: 'Impact sur les activités quotidiennes', label: 'Impact sur les activités quotidiennes' },
      { value: 'Patient exprime de l\'anxiété/détresse', label: 'Patient exprime de l\'anxiété/détresse' },
      { value: 'Patient semble indifférent à la douleur', label: 'Patient semble indifférent' },
    ],
  },
];


export const sectionsData: SectionData[] = [
  {
    id: 'position',
    title: 'Position du patient',
    type: 'checkbox',
    options: [
      { value: 'Décubitus dorsal', label: 'Décubitus dorsal' },
      { value: 'Décubitus latéral droit', label: 'Décubitus latéral droit' },
      { value: 'Décubitus latéral gauche', label: 'Décubitus latéral gauche' },
      { value: 'Semi-Fowler', label: 'Semi-Fowler' },
      { value: 'Fowler', label: 'Fowler' },
      { value: 'Assis au fauteuil', label: 'Assis au fauteuil' },
      { value: 'Ambulatoire', label: 'Ambulatoire' },
    ],
  },
  {
    id: 'etatEveil',
    title: 'État d\'éveil',
    type: 'radio',
    options: [
      { value: 'Éveillé et alerte', label: 'Éveillé et alerte' },
      { value: 'Léthargique', label: 'Léthargique' },
      { value: 'Somnolent', label: 'Somnolent' },
      { value: 'Obnubilé', label: 'Obnubilé' },
      { value: 'Stuporeux', label: 'Stuporeux' },
      { value: 'Comateux', label: 'Comateux' },
    ],
  },
  {
    id: 'signesVitaux',
    title: 'Signes vitaux',
    type: 'radio',
    options: [
        { value: 'Stable', label: 'Stable' },
        { value: 'Instable', label: 'Instable' },
        { value: 'Dans les limites normales', label: 'Dans les limites normales' },
        { value: 'Voir feuille spéciale', label: 'Voir feuille spéciale' },
    ],
  },
  {
    id: 'signesNeuro',
    title: 'Signes neurologiques',
    type: 'radio',
    options: [
        { value: 'Pupilles isocores et réactives', label: 'Pupilles isocores et réactives' },
        { value: 'Diminution état de conscience', label: 'Diminution état de conscience' },
        { value: 'Mouvements anormaux', label: 'Mouvements anormaux' },
        { value: 'Faiblesse/paralysie', label: 'Faiblesse/paralysie' },
        { value: 'Céphalées', label: 'Céphalées' },
        { value: 'Vertiges', label: 'Vertiges' },
        { value: 'Voir feuille spéciale', label: 'Voir feuille spéciale' },
    ],
  },
  {
    id: 'respiratoire',
    title: 'Respiratoire',
    type: 'checkbox',
    options: [
      { value: 'Respiration régulière et facile', label: 'Respiration régulière et facile' },
      { value: 'Toux présente', label: 'Toux présente' },
      { value: 'Sécrétions abondantes', label: 'Sécrétions abondantes' },
      { value: 'Dyspnée', label: 'Dyspnée' },
      { value: 'Utilisation d’O₂', label: 'Utilisation d’O₂' },
      { value: 'Sons pulmonaires anormaux (crépitants, sibilants)', label: 'Sons pulmonaires anormaux' },
    ],
    hasIntervention: true,
    interventions: [
      { value: 'Aspiration des sécrétions', label: 'Aspiration des sécrétions' },
      { value: 'Exercices de respiration profonde', label: 'Exercices de respiration profonde' },
      { value: 'Positionnement pour optimiser la respiration', label: 'Positionnement pour optimiser la respiration' },
      { value: 'Enseignement sur spirométrie incitative', label: 'Enseignement sur spirométrie incitative' },
    ]
  },
  {
    id: 'digestif',
    title: 'Digestif',
    type: 'checkbox',
    options: [
      { value: 'Abdomen souple et non douloureux', label: 'Abdomen souple et non douloureux' },
      { value: 'Bruits intestinaux présents', label: 'Bruits intestinaux présents' },
      { value: 'Nausées', label: 'Nausées' },
      { value: 'Vomissements', label: 'Vomissements' },
      { value: 'Distension abdominale', label: 'Distension abdominale' },
      { value: 'Diarrhée', label: 'Diarrhée' },
      { value: 'Constipation', label: 'Constipation' },
      { value: 'Appétit diminué', label: 'Appétit diminué' },
      { value: 'Appétit normal', label: 'Appétit normal' },
    ],
    hasIntervention: true,
    interventions: [
      { value: 'Surveillance des apports/éliminations', label: 'Surveillance des apports/éliminations' },
      { value: 'Administration d\'antiémétiques', label: 'Administration d\'antiémétiques' },
      { value: 'Mesures de confort (positionnement, compresses)', label: 'Mesures de confort (positionnement, compresses)' },
      { value: 'Enseignement diététique', label: 'Enseignement diététique' },
    ]
  },
  {
    id: 'urinaire',
    title: 'Urinaire',
    type: 'checkbox',
    options: [
      { value: 'Mictions régulières et sans douleur', label: 'Mictions régulières et sans douleur' },
      { value: 'Dysurie', label: 'Dysurie' },
      { value: 'Hématurie', label: 'Hématurie' },
      { value: 'Rétention urinaire', label: 'Rétention urinaire' },
      { value: 'Incontinence urinaire', label: 'Incontinence urinaire' },
      { value: 'Oligurie', label: 'Oligurie' },
      { value: 'Polyurie', label: 'Polyurie' },
    ],
    hasIntervention: true,
    interventions: [
      { value: 'Surveillance des apports/éliminations', label: 'Surveillance des apports/éliminations' },
      { value: 'Hygiène périnéale', label: 'Hygiène périnéale' },
      { value: 'Aide à la miction (positionnement, intimité)', label: 'Aide à la miction (positionnement, intimité)' },
    ]
  },
  {
    id: 'tegumentaire',
    title: 'Tégumentaire',
    type: 'checkbox',
    options: [
      { value: 'Peau intacte et propre', label: 'Peau intacte et propre' },
      { value: 'Rougeur', label: 'Rougeur' },
      { value: 'Oedème', label: 'Oedème' },
      { value: 'Peau sèche', label: 'Peau sèche' },
      { value: 'Lésion (décrire)', label: 'Lésion (décrire)' },
      { value: 'Diaphorèse', label: 'Diaphorèse' },
      { value: 'Chaleur / froideur', label: 'Chaleur / froideur' },
    ],
    hasIntervention: true,
    interventions: [
      { value: 'Changement de position aux 2h', label: 'Changement de position aux 2h' },
      { value: 'Application de crème/onguent', label: 'Application de crème/onguent' },
      { value: 'Pansement refait (décrire)', label: 'Pansement refait (décrire)' },
      { value: 'Soins d\'hygiène', label: 'Soins d\'hygiène' },
    ]
  },
  {
    id: 'geriatrie',
    title: 'Gériatrie',
    type: 'checkbox',
    options: [
      { value: 'Chutes récentes', label: 'Chutes récentes' },
      { value: 'Délirium', label: 'Délirium' },
      { value: 'Démence', label: 'Démence' },
      { value: 'Incontinence urinaire/fécale', label: 'Incontinence urinaire/fécale' },
      { value: 'Problèmes de vision/audition', label: 'Problèmes de vision/audition' },
      { value: 'Risque de dénutrition', label: 'Risque de dénutrition' },
      { value: 'Risque d\'escarres', label: 'Risque d\'escarres' },
    ],
  },
  {
    id: 'finDeVie',
    title: 'Fin de vie / Soins palliatifs',
    type: 'checkbox',
    options: finDeVieOptions, // Uses the separate finDeVieOptions constant
    hasOtherField: true,
  },
  {
    id: 'observations',
    title: 'Observations générales',
    type: 'checkbox',
    options: [
      { value: 'Patient calme et confortable', label: 'Patient calme et confortable' },
      { value: 'Anxiété', label: 'Anxiété' },
      { value: 'Agitation', label: 'Agitation' },
      { value: 'Tristesse / Humeur dépressive', label: 'Tristesse / Humeur dépressive' },
      { value: 'Colère / Irritabilité', label: 'Colère / Irritabilité' },
      { value: 'Sollicitations fréquentes', label: 'Sollicitations fréquentes' },
      { value: 'Aide à l\'alimentation', label: 'Aide à l\'alimentation' },
      { value: 'Repos au lit', label: 'Repos au lit' },
      { value: 'Participation aux soins', label: 'Participation aux soins' },
      { value: 'Refus de soins', label: 'Refus de soins' },
      { value: 'Plaintes exprimées (non douloureuses)', label: 'Plaintes exprimées (non douloureuses)' },
    ],
  },
  {
    id: 'visites',
    title: 'Visites',
    type: 'radio',
    options: [
      { value: 'Visite de la famille', label: 'Visite de la famille' },
      { value: 'Visite du médecin', label: 'Visite du médecin' },
      { value: 'Aucune visite', label: 'Aucune visite' },
    ],
  },
];

export const scenariosData: ScenarioCategory[] = [
    {
        title: 'Routine & Événements',
        scenarios: [
            {
                label: 'Admission Standard',
                state: {
                    admissionCheckboxes: ['Bracelet d\'identification vérifié et conforme', 'Allergies vérifiées et signalées au dossier', 'Enseignement sur le fonctionnement de l\'unité et l\'appel infirmier effectué', 'Évaluation initiale de la douleur effectuée'],
                    orientation: ['Temps', 'Lieu', 'Personne'],
                    autonomie: 'Autonome',
                    effetsPersonnels: 'Lunettes, prothèses dentaires',
                    accesVeineux: true,
                    accesVeineux_gauge: '#20',
                    accesVeineux_site: 'avant-bras gauche (ABG)',
                    piccLine: false,
                    drains: [],
                    sondes: [],
                    etatEveil: 'Éveillé et alerte',
                    signesVitaux: 'Stable',
                    signesNeuro: 'Pupilles isocores et réactives',
                    respiratoire: ['Respiration régulière et facile'],
                    digestif: ['Abdomen souple et non douloureux', 'Bruits intestinaux présents', 'Appétit normal'],
                    urinaire: ['Mictions régulières et sans douleur'],
                    tegumentaire: ['Peau intacte et propre'],
                    geriatrie: [],
                    observations: ['Patient calme et confortable'],
                    visites: 'Aucune visite',
                }
            },
            {
                label: 'Post-Op (Stable)',
                state: {
                    admissionCheckboxes: [],
                    orientation: ['Temps', 'Lieu', 'Personne'],
                    autonomie: 'Aide x 1',
                    effetsPersonnels: '',
                    accesVeineux: true,
                    accesVeineux_gauge: '#18',
                    accesVeineux_site: 'bras droit (BD)',
                    piccLine: false,
                    drains: ['Jackson-Pratt (JP)'],
                    sondes: [],
                    position: ['Décubitus dorsal'],
                    etatEveil: 'Éveillé et alerte',
                    signesVitaux: 'Stable',
                    signesNeuro: 'Pupilles isocores et réactives',
                    respiratoire: ['Respiration régulière et facile', 'Toux présente'],
                    respiratoire_interventions: ['Exercices de respiration profonde'],
                    digestif: ['Abdomen souple et non douloureux', 'Bruits intestinaux présents', 'Nausées'],
                    digestif_medicament: 'Ondansétron 4mg IV PRN',
                    urinaire: ['Mictions régulières et sans douleur'],
                    tegumentaire: ['Lésion (décrire)'],
                    tegumentaire_interventions: ['Pansement refait (décrire)'],
                    douleur: {
                        ...initialPainState,
                        s: '4-6 - Douleur modérée',
                        medicament: 'Morphine 2mg IV à 14h00',
                    },
                    observations: ['Patient calme et confortable'],
                    visites: 'Visite de la famille',
                }
            },
            {
                label: 'Routine (Stable)',
                state: {
                    admissionCheckboxes: [],
                    orientation: ['Temps', 'Lieu', 'Personne'],
                    autonomie: 'Autonome',
                    effetsPersonnels: '',
                    accesVeineux: false,
                    piccLine: false,
                    drains: [],
                    sondes: [],
                    position: ['Assis au fauteuil'],
                    etatEveil: 'Éveillé et alerte',
                    signesVitaux: 'Dans les limites normales',
                    signesNeuro: 'Pupilles isocores et réactives',
                    respiratoire: ['Respiration régulière et facile'],
                    digestif: ['Abdomen souple et non douloureux', 'Bruits intestinaux présents', 'Appétit normal'],
                    urinaire: ['Mictions régulières et sans douleur'],
                    tegumentaire: ['Peau intacte et propre'],
                    geriatrie: [],
                    finDeVie: [],
                    observations: ['Patient calme et confortable'],
                    visites: 'Aucune visite',
                    particularites: '',
                    douleur: initialPainState,
                }
            },
            {
                label: 'Transfert vers une autre unité',
                state: {
                    particularites: 'Patient transféré à l\'unité de [Nom de l\'unité] pour [Raison du transfert]. Rapport complet transmis à l\'infirmière réceptrice. Patient stable durant le transport.',
                    signesVitaux: 'Stable',
                    etatEveil: 'Éveillé et alerte',
                    observations: ['Patient calme et confortable'],
                }
            },
            {
                label: 'Congé du patient',
                state: {
                    particularites: 'Congé du patient. Enseignement de départ effectué concernant [médication, soins, suivi]. Le patient a verbalisé sa compréhension. A quitté l\'unité accompagné de [famille/ami].',
                    signesVitaux: 'Stable',
                    autonomie: 'Autonome',
                    observations: ['Participation aux soins'],
                }
            },
        ],
    },
    {
        title: 'Suivis Spécifiques',
        scenarios: [
            {
                label: 'Douleur chronique exacerbée',
                state: {
                    douleur: {
                        p: ['Mouvement'], q: ['Lancinante', 'Sourde'], r: ['Localisée'], site: 'Région lombaire', s: '7-10 - Douleur sévère', t: ['Constante', 'Chronique (longue durée)'], u: ['Impact sur les activités quotidiennes', 'Patient exprime de l\'anxiété/détresse'], medicament: 'Hydromorphone 2mg PO PRN', interventionsNonPharma: ['Application de chaud/froid', 'Techniques de relaxation (respiration, imagerie)']
                    },
                    observations: ['Anxiété', 'Sollicitations fréquentes'],
                    etatEveil: 'Éveillé et alerte',
                    signesVitaux: 'Stable',
                }
            },
            {
                label: 'Insuffisance Respiratoire (O₂)',
                state: {
                    respiratoire: ['Dyspnée', 'Utilisation d’O₂', 'Sons pulmonaires anormaux (crépitants, sibilants)'],
                    respiratoire_o2_litres: '3',
                    respiratoire_medicament: 'Salbutamol 2.5mg nébulisation',
                    respiratoire_interventions: ['Positionnement pour optimiser la respiration'],
                    signesVitaux: 'Instable',
                    etatEveil: 'Léthargique',
                    observations: ['Anxiété'],
                }
            },
            {
                label: 'Problèmes digestifs (Nausées/Vomissements)',
                state: {
                    digestif: ['Nausées', 'Vomissements', 'Appétit diminué'],
                    digestif_medicament: 'Ondansétron 4mg IV',
                    digestif_interventions: ['Surveillance des apports/éliminations', 'Mesures de confort (positionnement, compresses)'],
                    observations: ['Patient exprime de l\'anxiété/détresse'],
                }
            },
            {
                label: 'Surveillance Glycémique',
                state: {
                    particularites: 'Glycémie capillaire à [Heure] : [Valeur] mmol/L. Administration de [X] unités d\'insuline [Type] selon le protocole.',
                    digestif: ['Appétit normal'],
                    signesNeuro: 'Pupilles isocores et réactives',
                    observations: ['Patient calme et confortable'],
                }
            },
            {
                label: 'Soin de Plaie Complexe',
                state: {
                    tegumentaire: ['Lésion (décrire)'],
                    tegumentaire_interventions: ['Pansement refait (décrire)'],
                    particularites: 'Pansement de la plaie [Site de la plaie] refait selon protocole. Aspect de la plaie : [description]. Patient a toléré la procédure sans douleur significative.',
                    douleur: {
                        ...initialPainState,
                        s: '1-3 - Douleur légère',
                    },
                }
            },
        ],
    },
    {
        title: 'Alertes & Situations Aiguës',
        scenarios: [
            {
                label: 'Chute du patient',
                state: {
                    geriatrie: ['Chutes récentes'],
                    particularites: 'Patient retrouvé au sol près du lit. Pas de perte de conscience apparente. Signes vitaux stables post-chute. Examen physique sans lésion visible immédiate. Informé le médecin traitant. Surveillance accrue mise en place.',
                    observations: ['Agitation', 'Anxiété'],
                    etatEveil: 'Éveillé et alerte',
                    signesNeuro: 'Pupilles isocores et réactives',
                    signesVitaux: 'Stable',
                }
            },
            {
                label: 'Changement aigu état de conscience',
                state: {
                    etatEveil: 'Obnubilé',
                    signesNeuro: 'Diminution état de conscience',
                    signesVitaux: 'Instable',
                    particularites: 'Changement soudain de l\'état de conscience. Patient répond difficilement aux commandes. Patient répond difficilement aux commandes. Pupilles réactives mais lentes. Avis médical urgent demandé. Préparation pour imagerie cérébrale.',
                }
            },
            {
                label: 'Épisode d\'Hypotension',
                state: {
                    signesVitaux: 'Instable',
                    particularites: 'Épisode d\'hypotension avec une TA à [valeur] à [heure]. Patient a rapporté des étourdissements. Position de Trendelenburg adoptée et médecin avisé. Bolus de [fluide] IV débuté. TA subséquente à [valeur].',
                    signesNeuro: 'Vertiges',
                    etatEveil: 'Léthargique',
                }
            },
            {
                label: 'Réaction Allergique Légère',
                state: {
                    tegumentaire: ['Rougeur'],
                    particularites: 'Patient a développé une éruption cutanée prurigineuse après l\'administration de [Médicament]. Médecin avisé. Administration de diphenhydramine 25mg PO. Surveillance accrue des signes vitaux et respiratoires.',
                    respiratoire: ['Respiration régulière et facile'],
                    observations: ['Anxiété'],
                }
            },
        ],
    },
    {
        title: 'Soins Palliatifs',
        scenarios: [
            {
                label: 'Symptômes de fin de vie (standard)',
                state: {
                    finDeVie: ['Pauses respiratoires', 'Râles terminaux (sécrétions audibles)', 'Diminution des apports oraux', 'Altération de l\'état de conscience'],
                    observations: ['Patient calme et confortable'],
                    particularites: 'Patient en soins de confort. Administration de morphine sc pour confort respiratoire.',
                    etatEveil: 'Somnolent',
                }
            },
            {
                label: 'Symptômes de fin de vie (avec agitation)',
                state: {
                    finDeVie: ['Agitation ou confusion', 'Râles terminaux (sécrétions audibles)', 'Incapacité à bouger'],
                    observations: ['Agitation', 'Anxiété'],
                    particularites: 'Patient agité, désorienté. Mesures de confort intensifiées. Avis médical pour ajustement de la sédation.',
                    etatEveil: 'Obnubilé',
                }
            },
            {
                label: 'Soutien à la famille',
                state: {
                    finDeVie: ['Retrait social / Perte d\'intérêt'],
                    observations: ['Visite de la famille'],
                    particularites: 'Longue discussion avec la famille concernant l\'évolution de l\'état du patient et le plan de soins de confort. Soutien émotionnel offert. La famille exprime sa compréhension et son accord avec l\'approche palliative.',
                }
            },
        ],
    },
];