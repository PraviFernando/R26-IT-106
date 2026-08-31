const { DOMAIN_CATEGORIES } = require('../../config/ragConfig');

const MMH = DOMAIN_CATEGORIES.MATERNAL_MENTAL_HEALTH;

// Hand-tagged per Knowglagepdf/ source file. Titles confirmed by opening each PDF's
// first page directly (not guessed from filenames). Keys must match on-disk filenames
// byte-for-byte (spaces, case) — ingest.js looks entries up by exact filename.
//
// 'Pregnancy WHO article.pdf' is the WHO/UNFPA/UNICEF "Pregnancy, Childbirth, Postpartum
// and Newborn Care" guide — genuinely dual-domain (postpartum + newborn care), but tagged
// maternal_mental_health here for simplicity (per-file, not per-chunk, categorization).
// Revisit with finer per-chunk tagging once a dedicated newborn-care corpus is sourced.
module.exports = {
  'CMJ_Perinatal mental health in Sri Lanka.pdf': {
    title: 'Perinatal Mental Health in Sri Lanka',
    category: MMH,
    language: 'en',
  },
  'CMJ_Post partum depression.pdf': {
    title: 'Post Partum Depression',
    category: MMH,
    language: 'en',
  },
  'CMJ_Postnatal mental disorders.pdf': {
    title: 'Postnatal Mental Disorders',
    category: MMH,
    language: 'en',
  },
  'OpenUnivrsity_THE PSYCHOSOCIAL FACTORS RELATED TO POST-PARTUM.pdf': {
    title:
      'The Psychosocial Factors Related to Post-Partum Depression Among Mothers in the Post-Partum Period at the De Soyza Maternity Hospital for Women in Sri Lanka',
    category: MMH,
    language: 'en',
  },
  'Pregnancy WHO article.pdf': {
    title: 'Pregnancy, Childbirth, Postpartum and Newborn Care: A Guide for Essential Practice (WHO/UNFPA/UNICEF, 3rd Ed.)',
    category: MMH,
    language: 'en',
  },
  'Researcgate_Effect of childbirth experiencet.pdf': {
    title:
      'Effect of Childbirth Experience on the Development of Early Postpartum Depression in Mothers Admitted to Postnatal Wards at a Tertiary Care Hospital in Galle, Sri Lanka',
    category: MMH,
    language: 'en',
  },
  'Researchgate_Maternal_mental_health_services_in_Sri_Lanka_chall.pdf': {
    title: 'Maternal Mental Health Services in Sri Lanka: Challenges and Solutions',
    category: MMH,
    language: 'en',
  },
  'Researchgate_Risk Factors of Postpartum Depression.pdf': {
    title: 'Risk Factors of Postpartum Depression',
    category: MMH,
    language: 'en',
  },
  'WHO-eng.pdf': {
    title: 'Guide for Integration of Perinatal Mental Health in Maternal and Child Health Services',
    category: MMH,
    language: 'en',
  },
  'WHO_Brief-postnatal-care-for-mothers-and-newborns-highlights-from-the-WHO-2013-Guidelines.pdf': {
    title: 'WHO Brief: Postnatal Care for Mothers and Newborns — Highlights from the WHO 2013 Guidelines',
    category: MMH,
    language: 'en',
  },
  'WHO_MSD_MER_15.1_eng.pdf': {
    title: 'Thinking Healthy: A Manual for Psychosocial Management of Perinatal Depression (WHO mhGAP)',
    category: MMH,
    language: 'en',
  },
  'WHO_basic guide-eng.pdf': {
    title: 'mhGAP Intervention Guide for Mental, Neurological and Substance Use Disorders in Non-Specialized Health Settings, v2.0',
    category: MMH,
    language: 'en',
  },
  'pmc_srilanka.pdf': {
    title: 'Mothers at Risk of Postpartum Depression in Sri Lanka: A Population-Based Study Using a Validated Screening Tool',
    category: MMH,
    language: 'en',
  },
};
