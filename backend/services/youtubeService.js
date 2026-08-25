const axios = require('axios');

// ============================================================
// ALL CURATED VIDEOS REPOSITORY (Flat Store)
// ============================================================
const ALL_CURATED_VIDEOS = {
  // Baby Feeding / Breastfeeding
  'qdXehiELnIA': {
    id: 'qdXehiELnIA',
    title: 'මව්කිරි දීම සහ කිරි වමනය (Breastfeeding & Milk Vomiting)',
    description: 'නිවැරදිව කිරි දෙන ආකාරය සහ කිරි වමනය යාම පාලනය කරන අයුරු.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://youtu.be/qdXehiELnIA',
    thumbnail: 'https://img.youtube.com/vi/qdXehiELnIA/0.jpg'
  },
  'n2Iu6NooqgE': {
    id: 'n2Iu6NooqgE',
    title: 'බබාට නිවැරදිව බර්ප් (ගුඩුස්) යවන විදිහ (How to Burp your Baby Correctly)',
    description: 'බබාට නිවැරදිව බර්ප් (ගුඩුස්) යවන ආකාරය පිළිබඳ පියවරෙන් පියවර මඟ පෙන්වීම.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://youtu.be/n2Iu6NooqgE',
    thumbnail: 'https://img.youtube.com/vi/n2Iu6NooqgE/0.jpg'
  },
  '_FsNGM2cIpI': {
    id: '_FsNGM2cIpI',
    title: 'මව්කිරි දීමේදී මවට නිවැරදි ඉරියව් (Proper Breastfeeding Positions)',
    description: 'මව්කිරි දෙන විට මව සහ දරුවා තබාගත යුතු නිවැරදි ඉරියව්.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://youtu.be/_FsNGM2cIpI',
    thumbnail: 'https://img.youtube.com/vi/_FsNGM2cIpI/0.jpg'
  },

  // Baby Crying
  'kmbKaSRyZ-c': {
    id: 'kmbKaSRyZ-c',
    title: 'අඬන බබා නලවගන්න ක්‍රම (How to Soothe a Colic Baby)',
    description: 'අලුත උපන් බබා නොනවත්වා හැඬීම සහ කොලික් තත්ත්වය කළමනාකරණය කරන අයුරු.',
    channelTitle: 'DP Education - Public Health',
    url: 'https://www.youtube.com/watch?v=kmbKaSRyZ-c',
    thumbnail: 'https://img.youtube.com/vi/kmbKaSRyZ-c/0.jpg'
  },
  'n1NGKj2B2eU': {
    id: 'n1NGKj2B2eU',
    title: 'අලුත උපන් ඔබේ පැටියා නොනවත්වා හඩනවාද? (How to Soothe a Crying Baby)',
    description: 'Baby colic, baby reflux සහ අඬන බබෙකු නලවා ගැනීමට ප්‍රායෝගික උපදෙස්.',
    channelTitle: 'Suwahas Clinic',
    url: 'https://www.youtube.com/watch?v=n1NGKj2B2eU',
    thumbnail: 'https://img.youtube.com/vi/n1NGKj2B2eU/0.jpg'
  },

  // Baby Sleep
  'j2C8MkY7Co8': {
    id: 'j2C8MkY7Co8',
    title: 'ළදරුවාට සුව නින්දක් ලබාදීමේ ක්‍රමවේද (Baby Sleep Care Tips)',
    description: 'ළදරුවාට සුව නින්දක් ලබාදීමට මවකට කළ හැකි දේ පිළිබඳ මඟ පෙන්වීම්.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://youtu.be/j2C8MkY7Co8',
    thumbnail: 'https://img.youtube.com/vi/j2C8MkY7Co8/0.jpg'
  },
  'JePLWMMw3z0': {
    id: 'JePLWMMw3z0',
    title: 'ළදරු නින්ද පිළිබඳ උපදෙස් (Newborn Bedtime Routine Guide)',
    description: 'ළදරුවාගේ නින්ද ක්‍රමවත් කරන ආකාරය සහ නින්ද වර්ධනය කරන අයුරු.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://youtu.be/JePLWMMw3z0',
    thumbnail: 'https://img.youtube.com/vi/JePLWMMw3z0/0.jpg'
  },

  // Mother Sleep Problems
  't0kACis_dJE': {
    id: 't0kACis_dJE',
    title: '6 tips for better sleep | Sleeping with Science, a TED series',
    description: 'Sleep scientist Matt Walker explains how room factors can set the stage for a better night\'s rest.',
    channelTitle: 'TED',
    url: 'https://youtu.be/t0kACis_dJE',
    thumbnail: 'https://img.youtube.com/vi/t0kACis_dJE/0.jpg'
  },
  '-aqpq-9UcH8': {
    id: '-aqpq-9UcH8',
    title: 'TOP 10 Tips for Better Sleep For Parents With A Newborn Baby',
    description: 'Get Better Sleep as a New Parent. Postpartum sleep tips to help improve your healing and mood.',
    channelTitle: 'Bridget Teyler',
    url: 'https://youtu.be/-aqpq-9UcH8',
    thumbnail: 'https://img.youtube.com/vi/-aqpq-9UcH8/0.jpg'
  },
  'e_3UoecZlxY': {
    id: 'e_3UoecZlxY',
    title: '14 Tips to Fall Asleep Faster & Sleep Better',
    description: 'Small decisions and micro-habits you can implement right now to dramatically increase sleep quality.',
    channelTitle: 'Sleep Doctor',
    url: 'https://youtu.be/e_3UoecZlxY',
    thumbnail: 'https://img.youtube.com/vi/e_3UoecZlxY/0.jpg'
  },

  // Understanding Baby / Development
  'fpiYNkkNmEo': {
    id: 'fpiYNkkNmEo',
    title: 'ළදරුවන් කහ වීම පිළිබඳ දැනුවත් වෙමු (Understanding Newborn Jaundice)',
    description: 'ළදරුවන් කහ වීම පිළිබඳ දෙමාපියන් දැනුවත් විය යුතු මූලික කරුණු.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://youtu.be/fpiYNkkNmEo',
    thumbnail: 'https://img.youtube.com/vi/fpiYNkkNmEo/0.jpg'
  },
  '6rx_-__NsjU': {
    id: '6rx_-__NsjU',
    title: '5 Simple Ways to Boost Your Baby’s Cognitive Brain Development',
    description: 'Help your baby thrive with 5 brain-boosting tips from a pediatrician! Simple, everyday ways to support learning from day one.',
    channelTitle: 'PedsDocTalk',
    url: 'https://youtu.be/6rx_-__NsjU',
    thumbnail: 'https://img.youtube.com/vi/6rx_-__NsjU/0.jpg'
  },
  'dEQOWf-NuKs': {
    id: 'dEQOWf-NuKs',
    title: '9 Biggest Baby Development Myths, Debunked',
    description: 'Understanding baby development myths will help you understand what to expect and what to do when you see certain behaviors.',
    channelTitle: 'Emma Hubbard',
    url: 'https://youtu.be/dEQOWf-NuKs',
    thumbnail: 'https://img.youtube.com/vi/dEQOWf-NuKs/0.jpg'
  },
  'SQX5Nwr4ekc': {
    id: 'SQX5Nwr4ekc',
    title: 'නවජන්ම දරුවන්ගේ කහ පැහැය (Newborn Skin Yellowness Guide)',
    description: 'නවජන්ම දරුවන්ගේ කහ පැහැය හඳුනාගැනීම සහ නිසි වෛද්‍ය උපදෙස් ලබාගැනීම.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://youtu.be/SQX5Nwr4ekc',
    thumbnail: 'https://img.youtube.com/vi/SQX5Nwr4ekc/0.jpg'
  },

  'kQiT2tO3KeE': {
    id: 'kQiT2tO3KeE',
    title: 'Attachment and bonding - Your Baby and You',
    description: 'Attachment and bonding guidance for parents and newborns from Pennine Care NHS Foundation Trust.',
    channelTitle: 'Pennine Care NHS Foundation Trust',
    url: 'https://www.youtube.com/watch?v=kQiT2tO3KeE',
    thumbnail: 'https://img.youtube.com/vi/kQiT2tO3KeE/0.jpg'
  },
  '4VuEIeDrwAM': {
    id: '4VuEIeDrwAM',
    title: 'Mother-Baby Bonding & Attachment Guide',
    description: 'Practical mother-baby bonding activities, skin-to-skin contact, and building emotional connection with baby.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=4VuEIeDrwAM',
    thumbnail: 'https://img.youtube.com/vi/4VuEIeDrwAM/0.jpg'
  },

  'financial_stable_search': {
    id: 'financial_stable_search',
    title: 'How to be Financially Stable After Baby (දරුවෙකුගෙන් පසු මූල්‍ය ස්ථායීතාවය)',
    description: 'දරුවෙකු ලැබුණු පසු මූල්‍ය අභියෝග කළමනාකරණය කරගන්නා ආකාරය.',
    channelTitle: 'PeriCare Financial Guidance',
    url: 'https://www.youtube.com/results?search_query=how+to+financial+stabel+after+baby',
    thumbnail: 'https://img.youtube.com/vi/6m9sCmDIlL0/0.jpg'
  },

  'financial_budget_video': {
    id: 'financial_budget_video',
    title: 'Financial Planning for New Parents (නව දෙමාපියන් සඳහා මූල්‍ය සැලසුම්කරණය)',
    description: 'දරුවාගේ පැමිණීමත් සමඟ අයවැය සකස් කර මූල්‍ය බිය පාලනය කරගැනීම.',
    channelTitle: 'PeriCare Financial Guidance',
    url: 'https://youtu.be/6m9sCmDIlL0?si=6X8F6miBMTVys9bJ',
    thumbnail: 'https://img.youtube.com/vi/6m9sCmDIlL0/0.jpg'
  },

  // Relationship / Family Problem Videos
  'wbN3M1aQAjw': {
    id: 'wbN3M1aQAjw',
    title: 'Relationship Changes After Having a Baby (ප්‍රසූතියෙන් පසු සබඳතා පාලනය)',
    description: 'දරුවෙකු ලැබුණු පසු දම්පතීන් අතර ඇතිවන ගැටලු සහ සබඳතා ශක්තිමත් කරගන්නා ආකාරය.',
    channelTitle: 'PeriCare Relationship Guidance',
    url: 'https://youtu.be/wbN3M1aQAjw?si=V6WwjvUmhPlQetfD',
    thumbnail: 'https://img.youtube.com/vi/wbN3M1aQAjw/0.jpg'
  },
  '2uE4n2HLxDU': {
    id: '2uE4n2HLxDU',
    title: 'Partner Support and Conflict Resolution After Baby (සහකරු සමඟ සහයෝගය)',
    description: 'ප්‍රසූතියෙන් පසු සහකරු සහ පවුලේ අය සමඟ ආරවුල් විසඳාගැනීමේ මඟ පෙන්වීම.',
    channelTitle: 'PeriCare Relationship Guidance',
    url: 'https://youtube.com/shorts/2uE4n2HLxDU?si=5xYIJ3NXnVUzKsxU',
    thumbnail: 'https://img.youtube.com/vi/2uE4n2HLxDU/0.jpg'
  },

  // Lack of Support Videos
  'bnlKVPj4zeQ': {
    id: 'bnlKVPj4zeQ',
    title: 'Coping with Lack of Support Postpartum (සහයෝගය නොමැති විට මව්වරුන් සඳහා උපදෙස්)',
    description: 'පවුලෙන් හෝ සහකරුගෙන් ප්‍රමාණවත් සහයෝගයක් නොලැබෙන අවස්ථාවන්හිදී මානසික සුවතාව පවත්වා ගැනීමේ මඟ පෙන්වීම.',
    channelTitle: 'PeriCare Support',
    url: 'https://www.youtube.com/watch?v=bnlKVPj4zeQ',
    thumbnail: 'https://img.youtube.com/vi/bnlKVPj4zeQ/0.jpg'
  },
  'AJpErm8H2aU': {
    id: 'AJpErm8H2aU',
    title: 'Finding Emotional Support as a New Mother (නව මව්වරුන්ට චිත්තවේගීය සහාය)',
    description: 'ප්‍රසූතියෙන් පසු තනිකම සහ සහයෝගය මදිවීම කළමනාකරණය කරගන්නා ආකාරය.',
    channelTitle: 'PeriCare Support',
    url: 'https://youtu.be/AJpErm8H2aU?si=WYy-aKayBgQfi72M',
    thumbnail: 'https://img.youtube.com/vi/AJpErm8H2aU/0.jpg'
  },

  // Daily Responsibilities Videos
  'gA-Eokbod38': {
    id: 'gA-Eokbod38',
    title: 'Managing Daily Responsibilities as a New Mom (නව මවකගේ දෛනික වගකීම් කළමනාකරණය)',
    description: 'ප්‍රසූතියෙන් පසු නිවසේ දෛනික වගකීම් සහ බබාගේ වැඩ පහසුවෙන් කළමනාකරණය කරගන්නා ආකාරය.',
    channelTitle: 'PeriCare Daily Care Guidance',
    url: 'https://youtu.be/gA-Eokbod38?si=dtwXkhZBAKH1bYHY',
    thumbnail: 'https://img.youtube.com/vi/gA-Eokbod38/0.jpg'
  },
  'OUXKaaAke7Q': {
    id: 'OUXKaaAke7Q',
    title: 'Balancing Baby Care and Household Tasks (ළදරු සාත්තු සහ ගෘහස්ථ වැඩ සමබර කිරීම)',
    description: 'දෛනික වැඩ කටයුතු නිසා ඇතිවන පීඩනය අවම කරගැනීම සඳහා සාර්ථක උපදෙස්.',
    channelTitle: 'PeriCare Daily Care Guidance',
    url: 'https://youtu.be/OUXKaaAke7Q?si=XOaNJ3X-o_csmfuY',
    thumbnail: 'https://img.youtube.com/vi/OUXKaaAke7Q/0.jpg'
  },

  // General / Support Categories
  'jzGyjLGbAUc': {
    id: 'jzGyjLGbAUc',
    title: 'ළදරු සෞඛ්‍යය සහ රැකවරණය (Newborn Baby Health Care Guide)',
    description: 'නවජන්ම දරුවාගේ සෞඛ්‍යය ආරක්‍ෂා කරගැනීමේ මූලික උපදෙස්.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=jzGyjLGbAUc',
    thumbnail: 'https://img.youtube.com/vi/jzGyjLGbAUc/0.jpg'
  },
  'hrozJ-EbdGI': {
    id: 'hrozJ-EbdGI',
    title: 'ප්‍රසව කාංසාව සහ බිය පාලනය කිරීම (Relieving Postpartum Anxiety)',
    description: 'බිය සහ කාංසාව පාලනය කිරීමට උපකාරී වන මෘදු හුස්ම ගැනීමේ අභ්‍යාස.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=hrozJ-EbdGI',
    thumbnail: 'https://img.youtube.com/vi/hrozJ-EbdGI/0.jpg'
  },
  'fm5ZnhqWkO8': {
    id: 'fm5ZnhqWkO8',
    title: 'ප්‍රසව තෙහෙට්ටුව මඟහැරීමට මවට මෘදු සංගීතය (Soothing Postpartum Relaxation Music)',
    description: 'තෙහෙට්ටුව සහ ආතතිය දුරු කර මනස සන්සුන් කරන මෘදු සංගීතය.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=fm5ZnhqWkO8',
    thumbnail: 'https://img.youtube.com/vi/fm5ZnhqWkO8/0.jpg'
  },
  '2OEL4P1Rz04': {
    id: '2OEL4P1Rz04',
    title: 'තනිකම සහ හුදකලා බව මඟහරවා ගැනීම (Overcoming Loneliness in Motherhood)',
    description: 'මවක් වූ පසු දැනෙන තනිකම සහ ඒ සඳහා කළ හැකි දේ පිළිබඳ මඟ පෙන්වීම.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=2OEL4P1Rz04',
    thumbnail: 'https://img.youtube.com/vi/2OEL4P1Rz04/0.jpg'
  },
  '1n46HPsYsHM': {
    id: '1n46HPsYsHM',
    title: 'දරාගත නොහැකි පීඩනය කළමනාකරණය (Coping with Overwhelm)',
    description: 'වැඩ අධික වීම නිසා ඇතිවන පීඩනය පාලනය කිරීමට නව මව්වරුන් සඳහා උපදෙස්.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=1n46HPsYsHM',
    thumbnail: 'https://img.youtube.com/vi/1n46HPsYsHM/0.jpg'
  },
  'sF80I-TQiW0': {
    id: 'sF80I-TQiW0',
    title: 'සහයෝගය නොමැති විට කළ හැකි දේ (Coping with Lack of Support)',
    description: 'පවුලෙන් හෝ සැමියාගෙන් සහයෝගය නොලැබෙන විට මනස සන්සුන්ව තබාගැනීම.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=sF80I-TQiW0',
    thumbnail: 'https://img.youtube.com/vi/sF80I-TQiW0/0.jpg'
  },
  '9Q634rbsypE': {
    id: '9Q634rbsypE',
    title: 'අඳුරු සිතුවිලි සහ ජීවිතය ජය ගැනීම (Overcoming Negative Thoughts)',
    description: 'ප්‍රසූතියෙන් පසු සිතට එන අශුභවාදී සිතුවිලි දුරු කර සුවය ලබාගන්නා ආකාරය.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=9Q634rbsypE',
    thumbnail: 'https://img.youtube.com/vi/9Q634rbsypE/0.jpg'
  },
  'ZToicYcHIOU': {
    id: 'ZToicYcHIOU',
    title: 'ප්‍රසව ශාරීරික සුවතාවය (Postpartum Physical Recovery Guide)',
    description: 'ප්‍රසූතියෙන් පසු ශාරීරික සුවතාවය ලබාගන්නා ආකාරය.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=ZToicYcHIOU',
    thumbnail: 'https://img.youtube.com/vi/ZToicYcHIOU/0.jpg'
  },
  'postpartum_physical_recovery_2': {
    id: 'postpartum_physical_recovery_2',
    title: 'Postpartum Body Healing & Physical Recovery Guide',
    description: 'Physical recovery, pelvic floor exercises, and post-delivery body healing for new mothers.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=ZToicYcHIOU',
    thumbnail: 'https://img.youtube.com/vi/ZToicYcHIOU/0.jpg'
  },
  'fever_tips': {
    id: 'fever_tips',
    title: 'Fever in Babies: What Parents Need to Know (Mayo Clinic)',
    description: 'Pediatric guidance on recognizing fever symptoms and safe care practices.',
    channelTitle: 'Mayo Clinic',
    url: 'https://www.youtube.com/watch?v=o04j0558t2A',
    thumbnail: 'https://img.youtube.com/vi/o04j0558t2A/0.jpg'
  },
  'fever_care': {
    id: 'fever_care',
    title: 'බබාලගේ උණ හරියටම අඩුකරගන්නේ කොහොමද? (How to Manage Baby Fever Correctly)',
    description: 'ළදරුවාගේ උණ පාලනය සහ නිවැරදිව පැරසිටමෝල් ලබා දීම පිළිබඳ වෛද්‍ය උපදෙස්.',
    channelTitle: 'Dr. Ravi / Studio Health',
    url: 'https://www.youtube.com/watch?v=k2oYJ_k8i2A',
    thumbnail: 'https://img.youtube.com/vi/k2oYJ_k8i2A/0.jpg'
  },
  'ZCQUPRyZbO0': {
    id: 'ZCQUPRyZbO0',
    title: 'ළදරුවන්ගේ අසනීප ලක්ෂණ (Newborn Baby Illness Warning Signs)',
    description: 'ළදරුවෙකුට අසනීපයක් වැළඳී ඇති බව හඳුනාගත හැකි ප්‍රධාන රෝග ලක්ෂණ.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://youtu.be/ZCQUPRyZbO0',
    thumbnail: 'https://img.youtube.com/vi/ZCQUPRyZbO0/0.jpg'
  },
  '4SQNqugTUmw': {
    id: '4SQNqugTUmw',
    title: 'අලුත උපන් බබා ලෙඩ උනාම (When a Newborn Baby Falls Sick)',
    description: 'අලුත උපන් දරුවෙකු අසනීප වූ විට කළ යුතු සත්කාර සහ උපදෙස්.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://youtu.be/4SQNqugTUmw',
    thumbnail: 'https://img.youtube.com/vi/4SQNqugTUmw/0.jpg'
  },
  'k_FyoBhaFTA': {
    id: 'k_FyoBhaFTA',
    title: 'දරුවා වෛද්‍යවරයෙකුට පෙන්විය යුතු හදිසි අවස්ථා (Emergency Signs in Babies)',
    description: 'දරුවෙකු වහාම රෝහල් ගත කළ යුතු හෝ වෛද්‍යවරයෙකු වෙත යොමු කළ යුතු රෝග ලක්ෂණ.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://youtu.be/k_FyoBhaFTA',
    thumbnail: 'https://img.youtube.com/vi/k_FyoBhaFTA/0.jpg'
  },
  'e_3UoecZlxY': {
    id: 'e_3UoecZlxY',
    title: 'Postpartum Sleep Deprivation & Rest Guide',
    description: 'Practical strategies for new mothers dealing with severe sleep deprivation and exhaustion.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=e_3UoecZlxY',
    thumbnail: 'https://img.youtube.com/vi/t0kACis_dJE/0.jpg'
  },
  'postpartum_physical_recovery_3': {
    id: 'postpartum_physical_recovery_3',
    title: 'Postpartum Healing & Pelvic Floor Care',
    description: 'Safe post-delivery physical recovery and body healing tips for mothers.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=ZToicYcHIOU',
    thumbnail: 'https://img.youtube.com/vi/ZToicYcHIOU/0.jpg'
  },
  'relationship_guidance_3': {
    id: 'relationship_guidance_3',
    title: 'Postpartum Partner Communication & Family Support',
    description: 'Strengthening your relationship and managing family dynamics after baby.',
    channelTitle: 'PeriCare Relationship Library',
    url: 'https://www.youtube.com/watch?v=wbN3M1aQAjw',
    thumbnail: 'https://img.youtube.com/vi/wbN3M1aQAjw/0.jpg'
  },
  'loneliness_guidance_3': {
    id: 'loneliness_guidance_3',
    title: 'Connecting & Overcoming Isolation in New Motherhood',
    description: 'How to build connections and find emotional community support as a new mother.',
    channelTitle: 'PeriCare Support',
    url: 'https://www.youtube.com/watch?v=2OEL4P1Rz04',
    thumbnail: 'https://img.youtube.com/vi/2OEL4P1Rz04/0.jpg'
  },
  'fatigue_guidance_3': {
    id: 'fatigue_guidance_3',
    title: 'Rest & Energy Restoration for Exhausted Mothers',
    description: 'Gentle rest techniques and nutrition to combat postpartum fatigue.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=fm5ZnhqWkO8',
    thumbnail: 'https://img.youtube.com/vi/fm5ZnhqWkO8/0.jpg'
  },
  'financial_guidance_3': {
    id: 'financial_guidance_3',
    title: 'Postpartum Budgeting & Reducing Financial Stress',
    description: 'Practical financial planning strategies for growing families.',
    channelTitle: 'PeriCare Financial Guidance',
    url: 'https://www.youtube.com/results?search_query=postpartum+budgeting+and+financial+planning',
    thumbnail: 'https://img.youtube.com/vi/6m9sCmDIlL0/0.jpg'
  },
  'negative_thoughts_3': {
    id: 'negative_thoughts_3',
    title: 'Coping with Postpartum Intrusive & Negative Thoughts',
    description: 'Mental health strategies for managing overwhelming or scary thoughts after childbirth.',
    channelTitle: 'PeriCare Support',
    url: 'https://www.youtube.com/watch?v=9Q634rbsypE',
    thumbnail: 'https://img.youtube.com/vi/9Q634rbsypE/0.jpg'
  },
  'anxiety_guidance_3': {
    id: 'anxiety_guidance_3',
    title: 'Calming Breathing & Grounding for Postpartum Anxiety',
    description: 'Step-by-step relaxation and anxiety management techniques for mothers.',
    channelTitle: 'PeriCare Support',
    url: 'https://www.youtube.com/watch?v=hrozJ-EbdGI',
    thumbnail: 'https://img.youtube.com/vi/hrozJ-EbdGI/0.jpg'
  },
  'bonding_cries_guide': {
    id: 'bonding_cries_guide',
    title: 'Understanding Baby Cries & Soothing Techniques',
    description: 'Learn why babies cry and how to respond calmly to build security.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=kmbKaSRyZ-c',
    thumbnail: 'https://img.youtube.com/vi/kmbKaSRyZ-c/0.jpg'
  },
  'bonding_guidance_3': {
    id: 'bonding_guidance_3',
    title: 'Building Emotional Connection & Attachment With Your Baby',
    description: 'Practical steps for new mothers to foster deep emotional bonding and attachment.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=kQiT2tO3KeE',
    thumbnail: 'https://img.youtube.com/vi/kQiT2tO3KeE/0.jpg'
  },
  'bonding_guidance_4': {
    id: 'bonding_guidance_4',
    title: 'Skin-to-Skin Contact & Newborn Bonding Techniques',
    description: 'Essential skin-to-skin practices to deepen maternal attachment and bond.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=kQiT2tO3KeE',
    thumbnail: 'https://img.youtube.com/vi/kQiT2tO3KeE/0.jpg'
  },
  'bonding_guidance_5': {
    id: 'bonding_guidance_5',
    title: 'Nurturing Mother-Baby Emotional Connection',
    description: 'Understanding emotional bonding signals between new mother and newborn.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=4VuEIeDrwAM',
    thumbnail: 'https://img.youtube.com/vi/4VuEIeDrwAM/0.jpg'
  },
  'sleep_guidance_4': {
    id: 'sleep_guidance_4',
    title: 'Managing Postpartum Sleeplessness & Night Fatigue',
    description: 'Practical sleep hygiene and rest strategies for new mothers.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=t0kACis_dJE',
    thumbnail: 'https://img.youtube.com/vi/t0kACis_dJE/0.jpg'
  },
  'sleep_guidance_5': {
    id: 'sleep_guidance_5',
    title: 'Maternal Sleep Deprivation Recovery Guide',
    description: 'How mothers can rest and recover during baby sleep windows.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=-aqpq-9UcH8',
    thumbnail: 'https://img.youtube.com/vi/-aqpq-9UcH8/0.jpg'
  },
  'support_guidance_4': {
    id: 'support_guidance_4',
    title: 'Asking for Help & Building Support Systems as a New Mother',
    description: 'How to ask family and friends for support during postpartum.',
    channelTitle: 'PeriCare Support',
    url: 'https://www.youtube.com/watch?v=bnlKVPj4zeQ',
    thumbnail: 'https://img.youtube.com/vi/bnlKVPj4zeQ/0.jpg'
  },
  'support_guidance_5': {
    id: 'support_guidance_5',
    title: 'Overcoming Isolation & Finding Motherhood Community',
    description: 'Connecting with support networks when feeling unsupported.',
    channelTitle: 'PeriCare Support',
    url: 'https://www.youtube.com/watch?v=AJpErm8H2aU',
    thumbnail: 'https://img.youtube.com/vi/AJpErm8H2aU/0.jpg'
  },
  'recovery_guidance_4': {
    id: 'recovery_guidance_4',
    title: 'Postpartum Physical Healing & Body Care Basics',
    description: 'Understanding physical body changes and healing after birth.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=ZToicYcHIOU',
    thumbnail: 'https://img.youtube.com/vi/ZToicYcHIOU/0.jpg'
  },
  'recovery_guidance_5': {
    id: 'recovery_guidance_5',
    title: 'Safe Post-Delivery Movement & Pain Management',
    description: 'Gentle posture and recovery guidance for postpartum discomfort.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://www.youtube.com/watch?v=ZToicYcHIOU',
    thumbnail: 'https://img.youtube.com/vi/ZToicYcHIOU/0.jpg'
  },
  'overwhelmed_guidance_4': {
    id: 'overwhelmed_guidance_4',
    title: 'Pacing Daily Household Tasks & Managing Overwhelm',
    description: 'How to reduce daily pressure and organize household responsibilities.',
    channelTitle: 'PeriCare Daily Care Guidance',
    url: 'https://www.youtube.com/watch?v=gA-Eokbod38',
    thumbnail: 'https://img.youtube.com/vi/gA-Eokbod38/0.jpg'
  },
  'overwhelmed_guidance_5': {
    id: 'overwhelmed_guidance_5',
    title: 'Mental Space & Delegation for Busy New Moms',
    description: 'Practical tips for letting go of non-essential chores postpartum.',
    channelTitle: 'PeriCare Daily Care Guidance',
    url: 'https://www.youtube.com/watch?v=OUXKaaAke7Q',
    thumbnail: 'https://img.youtube.com/vi/OUXKaaAke7Q/0.jpg'
  },
  'relationship_guidance_4': {
    id: 'relationship_guidance_4',
    title: 'Partner Communication & Resolving Differences Postpartum',
    description: 'Constructive dialogue techniques for new parents facing friction.',
    channelTitle: 'PeriCare Relationship Library',
    url: 'https://www.youtube.com/watch?v=wbN3M1aQAjw',
    thumbnail: 'https://img.youtube.com/vi/wbN3M1aQAjw/0.jpg'
  },
  'relationship_guidance_5': {
    id: 'relationship_guidance_5',
    title: 'Reconnecting as a Couple After Baby',
    description: 'Nurturing marital intimacy and partnership during early parenting.',
    channelTitle: 'PeriCare Relationship Library',
    url: 'https://www.youtube.com/watch?v=2uE4n2HLxDU',
    thumbnail: 'https://img.youtube.com/vi/2uE4n2HLxDU/0.jpg'
  },
  'loneliness_guidance_4': {
    id: 'loneliness_guidance_4',
    title: 'Coping with Postpartum Loneliness & Stay-At-Home Days',
    description: 'Finding emotional connection when staying home with baby.',
    channelTitle: 'PeriCare Support',
    url: 'https://www.youtube.com/watch?v=2OEL4P1Rz04',
    thumbnail: 'https://img.youtube.com/vi/2OEL4P1Rz04/0.jpg'
  },
  'loneliness_guidance_5': {
    id: 'loneliness_guidance_5',
    title: 'Building Emotional Wellbeing & Social Connection',
    description: 'Overcoming feelings of being alone during the postpartum period.',
    channelTitle: 'PeriCare Support',
    url: 'https://www.youtube.com/watch?v=AJpErm8H2aU',
    thumbnail: 'https://img.youtube.com/vi/AJpErm8H2aU/0.jpg'
  }
};

// ============================================================
// CURATED VIDEO LIBRARY (Nested Mapping structure)
// ============================================================
const CURATED_VIDEO_LIBRARY = {
  baby_feeding: {
    default: ['qdXehiELnIA', 'n2Iu6NooqgE', '_FsNGM2cIpI'],
    anxious: ['qdXehiELnIA', 'n2Iu6NooqgE', '_FsNGM2cIpI'],
    sad: ['qdXehiELnIA', 'n2Iu6NooqgE', '_FsNGM2cIpI'],
    stressed: ['qdXehiELnIA', 'n2Iu6NooqgE', '_FsNGM2cIpI']
  },
  baby_crying: {
    default: ['kmbKaSRyZ-c', 'n1NGKj2B2eU', 'bonding_cries_guide'],
    stressed: ['kmbKaSRyZ-c', 'n1NGKj2B2eU', 'bonding_cries_guide'],
    anxious: ['kmbKaSRyZ-c', 'n1NGKj2B2eU', 'bonding_cries_guide']
  },
  baby_sleep: {
    default: ['j2C8MkY7Co8', 'n1NGKj2B2eU', 'JePLWMMw3z0'],
    stressed: ['j2C8MkY7Co8', 'n1NGKj2B2eU', 'JePLWMMw3z0']
  },
  mother_sleep_problems: {
    default: ['t0kACis_dJE', '-aqpq-9UcH8', 'e_3UoecZlxY'],
    stressed: ['t0kACis_dJE', '-aqpq-9UcH8', 'e_3UoecZlxY']
  },
  understanding_baby: {
    default: ['fpiYNkkNmEo', '6rx_-__NsjU', 'dEQOWf-NuKs'],
    anxious: ['fpiYNkkNmEo', '6rx_-__NsjU', 'dEQOWf-NuKs']
  },
  baby_health: {
    default: ['ZCQUPRyZbO0', '4SQNqugTUmw', 'fpiYNkkNmEo'],
    anxious: ['ZCQUPRyZbO0', '4SQNqugTUmw', 'fpiYNkkNmEo']
  },
  bonding_issues: {
    default: ['kQiT2tO3KeE', '4VuEIeDrwAM'],
    sad: ['kQiT2tO3KeE', '4VuEIeDrwAM'],
    anxious: ['kQiT2tO3KeE', '4VuEIeDrwAM'],
    stressed: ['kQiT2tO3KeE', '4VuEIeDrwAM']
  },
  financial_worry: {
    default: ['financial_stable_search', 'financial_budget_video'],
    anxious: ['financial_stable_search', 'financial_budget_video'],
    stressed: ['financial_stable_search', 'financial_budget_video']
  },
  relationship_family_problem: {
    default: ['wbN3M1aQAjw', '2uE4n2HLxDU'],
    anxious: ['wbN3M1aQAjw', '2uE4n2HLxDU'],
    stressed: ['wbN3M1aQAjw', '2uE4n2HLxDU']
  },
  anxiety: {
    default: ['hrozJ-EbdGI', 'sF80I-TQiW0']
  },
  loneliness: {
    default: ['2OEL4P1Rz04', '9Q634rbsypE']
  },
  fatigue: {
    default: ['fm5ZnhqWkO8', '1n46HPsYsHM']
  },
  stress: {
    default: ['1n46HPsYsHM', 'fm5ZnhqWkO8']
  },
  lack_of_support: {
    default: ['bnlKVPj4zeQ', 'AJpErm8H2aU']
  },
  daily_responsibilities: {
    default: ['gA-Eokbod38', 'OUXKaaAke7Q']
  },
  negative_thoughts: {
    default: ['9Q634rbsypE', 'hrozJ-EbdGI']
  },
  physical_recovery: {
    default: ['ZToicYcHIOU', 'fm5ZnhqWkO8']
  }
};

// ============================================================
// SPECIFIC VIDEO SEARCH QUERIES
// ============================================================
const VIDEO_SEARCH_QUERIES = {
  baby_feeding: {
    anxious: "breastfeeding difficulties support for new mothers",
    stressed: "breastfeeding problems and stress support for mothers",
    sad: "breastfeeding support for postpartum mothers",
    default: "breastfeeding latch technique tips guidelines"
  },
  baby_crying: {
    stressed: "how to soothe crying newborn baby for stressed parents",
    anxious: "understanding why newborn babies cry and calming techniques",
    default: "how to soothe colic crying baby newborn"
  },
  baby_sleep: {
    stressed: "baby sleep tips for exhausted new mothers",
    default: "safe baby sleep tips newborn"
  },
  mother_sleep_problems: {
    stressed: "mother sleep problems new mother sleep deprivation postpartum sleep support",
    default: "maternal sleep problems new mother sleeping guidelines"
  },
  understanding_baby: {
    anxious: "understanding baby cues body language anxiety support mothers",
    default: "understanding baby milestones body language cues"
  },
  baby_health: {
    anxious: "newborn baby health wellness care tips anxiety support",
    default: "newborn baby health wellness care tips"
  },
  bonding_issues: {
    default: "postpartum mother baby bonding emotional connection"
  },
  financial_worry: {
    default: "financial stress after having a baby new parent budget"
  },
  relationship_family_problem: {
    default: "relationship problems after having a baby partner conflict"
  },
  loneliness: {
    default: "postpartum loneliness emotional support for new mothers"
  },
  anxiety: {
    default: "postpartum anxiety calming and emotional support"
  },
  fatigue: {
    default: "self care and rest tips for exhausted new mothers"
  },
  stress: {
    default: "stress relief and management for new mothers guide"
  },
  lack_of_support: {
    default: "coping with lack of support postpartum new mother emotional support"
  },
  daily_responsibilities: {
    default: "managing daily responsibilities new mother household tasks postpartum time management"
  },
  negative_thoughts: {
    default: "postpartum intrusive thoughts and mental health help"
  },
  physical_recovery: {
    default: "postpartum c section healing physical recovery tips"
  }
};

// ============================================================
// RELEVANCE SCORE KEYWORDS
// ============================================================
const POSITIVE_KEYWORDS = {
  baby_feeding: ['feed', 'feeding', 'breastfeed', 'breastfeeding', 'lactation', 'milk', 'latch', 'latching', 'burp', 'burping', 'vomit', 'vomiting', 'කිරි', 'මව්කිරි', 'ගුඩුස්'],
  baby_sleep: ['sleep', 'sleeping', 'bedtime', 'settle', 'soothe', 'night', 'nap', 'routine', 'නින්ද', 'නිදාගන්න'],
  mother_sleep_problems: ['sleep', 'insomnia', 'night', 'rest', 'sleepy', 'fatigue', 'tired', 'sleepless', 'deprivation', 'නින්ද', 'නිදි', 'නොයාම', 'නොයෑම', 'රාත්රී', 'රාත්‍රිය'],
  baby_crying: ['cry', 'crying', 'cries', 'soothe', 'calm', 'settle', 'stop', 'why', 'ඇඬීම', 'අඬනවා', 'අඬන', 'newborn crying'],
  understanding_baby: ['cue', 'cues', 'understand', 'needs', 'body language', 'jaundice', 'yellow', 'yellowness', 'කහ', 'සංඥා', 'milestones', 'development', 'cognitive', 'myth', 'myths'],
  baby_health: ['health', 'fever', 'sick', 'wellness', 'temp', 'doctor', 'medicine', 'සෞඛ්‍යය', 'උණ', 'අසනීප'],
  anxiety: ['anxiety', 'anxious', 'panic', 'scared', 'worry', 'worried', 'calm', 'relax', 'breathing', 'කාංසාව', 'බය'],
  loneliness: ['lonely', 'loneliness', 'alone', 'support', 'motivation', 'depressed', 'sad', 'තනිකම', 'පාළු'],
  fatigue: ['tired', 'fatigue', 'exhausted', 'sleepy', 'rest', 'energy', 'මහන්සි', 'වෙහෙස'],
  stress: ['stress', 'stressed', 'pressure', 'overwhelmed', 'tension', 'management', 'පීඩනය', 'ආතතිය'],
  lack_of_support: ['support', 'help', 'family', 'encouragement', 'unsupported', 'isolation', 'partner', 'සහයෝගය', 'උදව්'],
  daily_responsibilities: ['daily', 'responsibilities', 'managing', 'household', 'tasks', 'balance', 'overwhelm', 'routine', 'time', 'දෛනික', 'වගකීම්', 'වැඩ'],
  negative_thoughts: ['negative', 'thoughts', 'hopeless', 'self-doubt', 'අඳුරු', 'සිතුවිලි'],
  bonding_issues: ['bond', 'bonding', 'connect', 'connection', 'attachment', 'love', 'close', 'distant', 'බැඳීම', 'ආදරය', 'සම්බන්ධයක්'],
  financial_worry: ['financial', 'finance', 'money', 'budget', 'afford', 'expenses', 'salli', 'සල්ලි', 'මුදල්', 'වියදම්'],
  relationship_family_problem: ['relationship', 'husband', 'partner', 'marriage', 'argue', 'arguing', 'fight', 'conflict', 'සැමියා', 'රණ්ඩු'],
  physical_recovery: ['recovery', 'pain', 'physical', 'exercise', 'healing', 'stitches', 'වේදනාව', 'සුවය'],
  general: ['postpartum', 'mother', 'mom', 'parent', 'parenting', 'wellness', 'self care', 'අම්මා', 'මව']
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================
const normalizeReasonKey = (reason) => {
  if (!reason) return 'general';
  const r = reason.toLowerCase().trim();
  if (r.includes('financial') || r.includes('money') || r.includes('finance') || r.includes('budget') || r.includes('afford')) return 'financial_worry';
  if (r.includes('relationship') || r.includes('marriage') || r.includes('husband_prashna') || r.includes('family_problem')) return 'relationship_family_problem';
  if (r.includes('bonding') || r.includes('bond') || r.includes('connection')) return 'bonding_issues';
  if (r.includes('baby_feeding') || r.includes('baby feeding') || r.includes('breastfeeding_concerns')) return 'baby_feeding';
  if (r.includes('baby_sleep') || r.includes('baby sleep')) return 'baby_sleep';
  if (r.includes('sleep_problems') || r.includes('mother_sleep') || r.includes('mother sleep') || r.includes('sleepless')) return 'mother_sleep_problems';
  if (r.includes('crying') || r.includes('andanawa')) return 'baby_crying';
  if (r.includes('understanding') || r.includes('needs') || r.includes('caring') || r.includes('kaha')) return 'understanding_baby';
  if (r.includes('health') || r.includes('fever') || r.includes('una')) return 'baby_health';
  if (r.includes('anxiety') || r.includes('anxious') || r.includes('baya')) return 'anxiety';
  if (r.includes('lonely') || r.includes('loneliness')) return 'loneliness';
  if (r.includes('fatigue') || r.includes('tired') || r.includes('exhausted') || r.includes('mahansi')) return 'fatigue';
  if (r.includes('daily') || r.includes('responsibilit') || r.includes('managing_daily') || r.includes('household')) return 'daily_responsibilities';
  if (r.includes('overwhelmed') || r.includes('stressed') || r.includes('stress')) return 'stress';
  if (r.includes('support')) return 'lack_of_support';
  if (r.includes('negative')) return 'negative_thoughts';
  if (r.includes('recovery') || r.includes('pain') || r.includes('discomfort') || r.includes('physical')) return 'physical_recovery';
  return 'general';
};

const normalizeEmotionKey = (emotion) => {
  if (!emotion) return 'default';
  const e = emotion.toLowerCase().trim();
  if (e === 'crying') return 'sad';
  if (e === 'tired') return 'fatigue';
  if (e === 'angry' || e === 'frustrated') return 'stressed';
  if (e === 'sleepy') return 'fatigue';
  if (e === 'calm') return 'happy';
  if (['happy', 'sad', 'stressed', 'anxious'].includes(e)) return e;
  return 'default';
};

// ============================================================
// CURATED VIDEO SELECTION PRIORITY LOGIC
// ============================================================
function detectBabyHealthSubIntent(text = '') {
  if (!text) return 'Other Baby Health';
  const t = text.toLowerCase();

  // 1. Baby Fever
  const feverKws = ['fever', 'temperature', 'hot', 'feverish', 'උණ', 'una', 'temperature eka', 'ඇඟ රුක් වෙලා', 'ඇඟ රත් වෙලා'];
  if (feverKws.some(kw => t.includes(kw))) {
    return 'Baby Fever';
  }

  // 2. Baby Illness
  const illnessKws = ['sick', 'ill', 'cold', 'cough', 'vomit', 'vomiting', 'diarrhea', 'flu', 'අසනීප', 'ලෙඩ', 'leda', 'asanipa', 'una gasila', 'වමනය'];
  if (illnessKws.some(kw => t.includes(kw))) {
    return 'Baby Illness';
  }

  // 3. Baby Pain/Discomfort
  const painKws = ['pain', 'hurt', 'sore', 'colic', 'gas', 'constipated', 'constipation', 'stomach ache', 'කැක්කුමයි', 'රිදෙනවා', 'kakkumai', 'ridenawa', 'bada kakkuma'];
  if (painKws.some(kw => t.includes(kw))) {
    return 'Baby Pain/Discomfort';
  }

  // 4. Baby Not Feeding
  const feedingKws = ['not feeding', 'refuses milk', 'not drinking milk', 'wont feed', 'wont drink', 'කිරි බොන්නේ නෑ', 'කිරි බොන්නේ නැහැ', 'kiri bonna ba', 'kiri bonna naha', 'kiri bonne na'];
  if (feedingKws.some(kw => t.includes(kw))) {
    return 'Baby Not Feeding';
  }

  // 5. Baby Health Concern
  const concernKws = ['doctor', 'hospital', 'medicine', 'clinic', 'pediatrician', 'health concern', 'jaundice', 'yellow', 'බයයි', 'baya', 'bayaයි', 'බය හිතෙනවා', 'ඇස් කහ', 'සම කහ'];
  if (concernKws.some(kw => t.includes(kw))) {
    return 'Baby Health Concern';
  }

  return 'Other Baby Health';
}

function getCuratedVideos(reason, emotion, babyContext, subIntent = '') {
  const normReason = normalizeReasonKey(reason);

  const curatedList = [];
  const seenIds = new Set();

  const addVideo = (vId) => {
    if (!vId) return;
    if (seenIds.has(vId)) return;
    const details = ALL_CURATED_VIDEOS[vId];
    if (details) {
      curatedList.push({
        ...details,
        reason: normReason,
        source: 'curated'
      });
      seenIds.add(vId);
    }
  };

  const MAPPING = {
    bonding_issues: ['kQiT2tO3KeE', '4VuEIeDrwAM'],
    mother_sleep_problems: ['t0kACis_dJE', '-aqpq-9UcH8', 'e_3UoecZlxY'],
    sleep_problems: ['t0kACis_dJE', '-aqpq-9UcH8', 'e_3UoecZlxY'],
    lack_of_support: ['bnlKVPj4zeQ', 'AJpErm8H2aU', 'sF80I-TQiW0'],
    physical_recovery: ['ZToicYcHIOU', 'postpartum_physical_recovery_2', 'postpartum_physical_recovery_3'],
    physical_discomfort: ['ZToicYcHIOU', 'postpartum_physical_recovery_2', 'postpartum_physical_recovery_3'],
    daily_responsibilities: ['gA-Eokbod38', 'OUXKaaAke7Q', '1n46HPsYsHM'],
    overwhelmed: ['gA-Eokbod38', 'OUXKaaAke7Q', '1n46HPsYsHM'],
    stress: ['gA-Eokbod38', 'OUXKaaAke7Q', '1n46HPsYsHM'],
    relationship_family_problem: ['wbN3M1aQAjw', '2uE4n2HLxDU', 'relationship_guidance_3'],
    loneliness: ['2OEL4P1Rz04', 'AJpErm8H2aU', 'loneliness_guidance_3'],
    fatigue: ['fm5ZnhqWkO8', 't0kACis_dJE', 'fatigue_guidance_3'],
    financial_worry: ['financial_stable_search', 'financial_budget_video', 'financial_guidance_3'],
    negative_thoughts: ['9Q634rbsypE', 'hrozJ-EbdGI', 'negative_thoughts_3'],
    anxiety: ['hrozJ-EbdGI', 'sF80I-TQiW0', 'anxiety_guidance_3'],
    baby_crying: ['kmbKaSRyZ-c', 'n1NGKj2B2eU', 'bonding_cries_guide'],
    baby_feeding: ['qdXehiELnIA', '_FsNGM2cIpI', 'n2Iu6NooqgE'],
    baby_sleep: ['j2C8MkY7Co8', 'JePLWMMw3z0', 'n1NGKj2B2eU'],
    understanding_baby: ['6rx_-__NsjU', 'dEQOWf-NuKs', 'fpiYNkkNmEo'],
    baby_health: ['ZCQUPRyZbO0', '4SQNqugTUmw', 'k_FyoBhaFTA']
  };

  if (normReason === 'baby_health' && subIntent) {
    if (subIntent === 'Baby Fever') {
      ['fever_tips', 'fever_care', 'ZCQUPRyZbO0'].forEach(addVideo);
    } else if (subIntent === 'Baby Illness') {
      ['ZCQUPRyZbO0', '4SQNqugTUmw', 'k_FyoBhaFTA'].forEach(addVideo);
    } else if (subIntent === 'Baby Pain/Discomfort') {
      ['kmbKaSRyZ-c', 'n1NGKj2B2eU', 'bonding_cries_guide'].forEach(addVideo);
    } else if (subIntent === 'Baby Not Feeding') {
      ['qdXehiELnIA', '_FsNGM2cIpI', 'n2Iu6NooqgE'].forEach(addVideo);
    } else if (subIntent === 'Baby Health Concern') {
      ['ZCQUPRyZbO0', 'fpiYNkkNmEo', 'k_FyoBhaFTA'].forEach(addVideo);
    } else {
      ['ZCQUPRyZbO0', '4SQNqugTUmw', 'k_FyoBhaFTA'].forEach(addVideo);
    }
    return curatedList.slice(0, 3);
  }

  const ids = MAPPING[normReason] || MAPPING.loneliness;
  ids.forEach(addVideo);
  return curatedList.slice(0, 2);
}

// ============================================================
// SEARCH QUERY GENERATION
// ============================================================
function getSearchQuery(reason, emotion, babyContext, subIntent = '') {
  const normReason = normalizeReasonKey(reason);

  if (normReason === 'bonding_issues') {
    return "postpartum mother baby attachment bonding";
  } else if (normReason === 'mother_sleep_problems' || normReason === 'sleep_problems') {
    return "postpartum mother sleep problems sleep deprivation";
  } else if (normReason === 'lack_of_support') {
    return "postpartum lack of support for mothers emotional help";
  } else if (normReason === 'physical_recovery' || normReason === 'physical_discomfort') {
    return "postpartum physical recovery body pain healing tips";
  } else if (normReason === 'daily_responsibilities' || normReason === 'overwhelmed' || normReason === 'stress') {
    return "postpartum overwhelmed daily responsibilities time management";
  } else if (normReason === 'relationship_family_problem') {
    return "postpartum family relationship problems partner communication";
  } else if (normReason === 'loneliness') {
    return "postpartum loneliness social isolation mother support";
  } else if (normReason === 'fatigue') {
    return "postpartum maternal fatigue exhaustion self care";
  } else if (normReason === 'financial_worry') {
    return "financial stress after having a baby new mother budget";
  } else if (normReason === 'anxiety') {
    return "postpartum anxiety coping calming support";
  } else if (normReason === 'negative_thoughts') {
    return "postpartum intrusive thoughts mental health support";
  } else if (normReason === 'baby_crying') {
    return "how to soothe crying newborn baby colic cues";
  } else if (normReason === 'understanding_baby') {
    return "understanding newborn baby cues body language";
  } else if (normReason === 'baby_feeding') {
    return "newborn breastfeeding feeding cues proper latch";
  } else if (normReason === 'baby_sleep') {
    return "newborn baby sleep cues safe soothing bedtime";
  } else if (normReason === 'baby_health') {
    if (subIntent === 'Baby Fever') {
      return "newborn baby fever signs pediatrician guide";
    } else if (subIntent === 'Baby Illness') {
      return "newborn baby sick symptoms cold cough treatment";
    } else if (subIntent === 'Baby Pain/Discomfort') {
      return "baby colic gas pains relief soothing stomach pain";
    } else if (subIntent === 'Baby Not Feeding') {
      return "newborn baby refuses milk feeding latching problems";
    } else {
      return "newborn baby health wellness care tips guide";
    }
  }

  return "postpartum emotional wellness self care tips mothers";
}

// ============================================================
// STRICT CATEGORY RULES (Inclusion & Exclusion Matrix)
// ============================================================
const CATEGORY_RULES = {
  bonding_issues: {
    required: ['bonding', 'bond', 'attachment', 'attach', 'connect', 'connection', 'mother-baby', 'maternal bonding', 'connecting with baby', 'skin-to-skin'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'cough', 'sleep', 'sleeping', 'feed', 'feeding', 'breastfeed', 'breastfeeding', 'crying', 'colic', 'cognitive', 'brain development', 'financial', 'budget', 'marriage', 'husband', 'c section', 'recovery', 'workout', 'exercise', 'parenting', 'relationship', 'mental health', 'relaxation', 'music', 'meditation', 'lullaby']
  },
  sleep_problems: {
    required: ['sleep', 'insomnia', 'sleeping', 'rest', 'bedtime', 'sleep deprivation', 'sleepless'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'feeding', 'breastfeed', 'colic', 'cognitive', 'financial', 'marriage', 'husband', 'workout']
  },
  mother_sleep_problems: {
    required: ['sleep', 'insomnia', 'sleeping', 'rest', 'bedtime', 'sleep deprivation', 'sleepless'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'feeding', 'breastfeed', 'colic', 'cognitive', 'financial', 'marriage', 'husband', 'workout']
  },
  lack_of_support: {
    required: ['support', 'help', 'unsupported', 'isolation', 'alone', 'coping', 'partner', 'family'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'sleep', 'sleeping', 'feeding', 'breastfeed', 'workout', 'financial']
  },
  physical_recovery: {
    required: ['recovery', 'pain', 'physical', 'healing', 'c-section', 'stitches', 'body aches', 'discomfort'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'sleep', 'sleeping', 'cognitive', 'financial', 'marriage', 'husband']
  },
  physical_discomfort: {
    required: ['recovery', 'pain', 'physical', 'healing', 'c-section', 'stitches', 'body aches', 'discomfort'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'sleep', 'sleeping', 'cognitive', 'financial', 'marriage', 'husband']
  },
  daily_responsibilities: {
    required: ['overwhelmed', 'responsibilities', 'household', 'tasks', 'stress', 'coping', 'balance', 'managing', 'too much'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'sleep', 'sleeping', 'cognitive', 'financial', 'marriage']
  },
  overwhelmed: {
    required: ['overwhelmed', 'responsibilities', 'household', 'tasks', 'stress', 'coping', 'balance', 'managing', 'too much'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'sleep', 'sleeping', 'cognitive', 'financial', 'marriage']
  },
  stress: {
    required: ['stress', 'overwhelmed', 'pressure', 'coping', 'management', 'tension', 'relax'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'sleep', 'sleeping', 'cognitive', 'financial']
  },
  relationship_family_problem: {
    required: ['relationship', 'husband', 'partner', 'marriage', 'conflict', 'argue', 'arguing', 'fighting', 'communication'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'sleep', 'sleeping', 'crying', 'feeding', 'breastfeed']
  },
  loneliness: {
    required: ['lonely', 'loneliness', 'alone', 'isolation', 'isolated', 'support', 'emotional support'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'sleep', 'sleeping', 'feeding', 'workout']
  },
  fatigue: {
    required: ['fatigue', 'exhausted', 'tired', 'rest', 'energy', 'sleepy'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'financial', 'marriage', 'husband']
  },
  financial_worry: {
    required: ['financial', 'money', 'budget', 'afford', 'expenses', 'finance'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'sleep', 'sleeping', 'crying']
  },
  anxiety: {
    required: ['anxiety', 'anxious', 'panic', 'worry', 'worried', 'calming', 'coping'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'financial', 'marriage']
  }
};

// ============================================================
// RELEVANCE SCORING
// ============================================================
function scoreApiVideo(video, normReason, normEmotion, babyContext, subIntent = '') {
  let score = 0;
  const title = (video.title || '').toLowerCase();
  const desc = (video.description || '').toLowerCase();
  const fullText = title + ' ' + desc;

  // 1. Hard exclusions
  const negativeKws = [
    'workout', 'weight loss', 'exercise routine', 'pregnancy workout', 'gym', 'fitness',
    'shorts', '#shorts', 'broken', 'status', 'whatsapp status', 'funny', 'fail', 'movie', 
    'trailer', 'song', 'music video', 'cover', 'unrelated', 'comedy', 'prank', 'celebrity',
    'gossip', 'drama', 'official video', 'teaser', 'gaming', 'gameplay', 'lets play'
  ];
  const hasNegative = negativeKws.some(kw => title.includes(kw) || desc.includes(kw));
  if (hasNegative) {
    return -100;
  }

  if (title.includes('meditation') || title.includes('music') || title.includes('lullaby')) {
    if (!['stress', 'loneliness', 'anxiety'].includes(normReason) && !babyContext) {
      return -50;
    }
  }

  // 2. Strict Category Keyword Validation & Exclusion Rules
  const rule = CATEGORY_RULES[normReason];
  if (rule) {
    const hasRequired = rule.required.some(kw => fullText.includes(kw));
    if (!hasRequired) {
      return -100;
    }
    const hasForbidden = rule.forbidden.some(kw => title.includes(kw));
    if (hasForbidden) {
      return -100;
    }
    score += 25;
  }

  // 3. Reason Match (+5)
  const reasonKeywords = POSITIVE_KEYWORDS[normReason] || POSITIVE_KEYWORDS.general;
  const matchesReason = reasonKeywords.some(kw => title.includes(kw));
  if (matchesReason) {
    score += 5;
  }

  return score;
}

async function fetchYouTubeItems(query, apiKey, maxResults = 15) {
  const url = 'https://www.googleapis.com/youtube/v3/search';
  const response = await axios.get(url, {
    params: {
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: maxResults,
      key: apiKey
    }
  });
  return response.data?.items || [];
}

function normalizeVideoItem(item) {
  const videoId = item.id?.videoId;
  return {
    id: videoId,
    title: item.snippet?.title || '',
    description: item.snippet?.description || '',
    thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || '',
    channelTitle: item.snippet?.channelTitle || '',
    publishedAt: item.snippet?.publishedAt || '',
    url: `https://www.youtube.com/watch?v=${videoId}`
  };
}

function generateQuery(reason, emotion, riskLevel, babyIntent) {
  const normReason = normalizeReasonKey(reason);
  const queries = VIDEO_SEARCH_QUERIES[normReason] || VIDEO_SEARCH_QUERIES.loneliness;
  return queries.default;
}

// ============================================================
// MAIN HYBRID RECOMMENDATION PIPELINE (3 Curated + 2 API = 5)
// ============================================================
async function fetchAndRankVideos(reason, emotion, riskLevel, babyIntent, diaryText = '') {
  const normReason = normalizeReasonKey(reason);
  const normEmotion = normalizeEmotionKey(emotion);
  const isBaby = (babyIntent === 'true' || babyIntent === true || ['baby_feeding', 'baby_sleep', 'baby_crying', 'understanding_baby', 'baby_health', 'bonding_issues'].includes(normReason));

  console.log('\n[VIDEO RECOMMENDATION PIPELINE]');
  console.log(`  Raw reason: "${reason}" → Normalized: "${normReason}"`);
  console.log(`  Emotion: "${emotion}" → Normalized: "${normEmotion}"`);
  console.log(`  Baby context: ${isBaby} | DiaryText length: ${diaryText ? diaryText.length : 0}`);

  const subIntent = normReason === 'baby_health' ? detectBabyHealthSubIntent(diaryText) : 'Other Baby Health';

  // 1. Select Curated Videos (2 hardcoded curated videos + 3 API videos = 5 total)
  const targetCuratedCount = 2;
  const targetApiCount = 3;
  const curated = getCuratedVideos(reason, emotion, isBaby, subIntent).slice(0, targetCuratedCount);
  const searchQuery = getSearchQuery(reason, emotion, isBaby, subIntent);

  let apiVideos = [];
  const apiKey = process.env.YOUTUBE_API_KEY;
  const rejectedLogs = [];
  const acceptedLogs = [];
  const candidateLogs = [];

  if (apiKey) {
    try {
      const items = await fetchYouTubeItems(searchQuery, apiKey, 15);
      const normalized = items.map(item => normalizeVideoItem(item)).filter(v => v.id);

      normalized.forEach(v => {
        candidateLogs.push({ id: v.id, title: v.title });
      });

      const scored = normalized.map(v => {
        const score = scoreApiVideo(v, normReason, normEmotion, isBaby, subIntent);
        return { ...v, score, source: 'youtube_api' };
      });

      const threshold = 8;
      const curatedIds = new Set(curated.map(c => c.id));

      let filtered = [];
      scored.forEach(v => {
        const titleLower = v.title.toLowerCase();
        
        if (curatedIds.has(v.id)) {
          rejectedLogs.push({ id: v.id, title: v.title, reason: 'Duplicate of curated video' });
          return;
        }

        if (v.score < threshold) {
          rejectedLogs.push({ id: v.id, title: v.title, reason: `Below relevance threshold (Score: ${v.score} < ${threshold})` });
          return;
        }

        if (titleLower.includes('grammarly') || titleLower.includes('body language tricks') || v.id === 'UrfpkvvRTns' || v.id === 'LjdtfeVxRm0' || v.id === 'jzGyjLGbAUc') {
          rejectedLogs.push({ id: v.id, title: v.title, reason: 'Blacklisted title/id' });
          return;
        }

        filtered.push(v);
        acceptedLogs.push({ id: v.id, title: v.title, score: v.score });
      });

      filtered.sort((a, b) => b.score - a.score);
      // Select 3 API videos
      apiVideos = filtered.slice(0, targetApiCount);
    } catch (err) {
      console.error('[YOUTUBE API ERROR]', err.message);
    }
  } else {
    console.warn('[YOUTUBE API WARNING] YOUTUBE_API_KEY is missing');
  }

  // Handle fallback if API failed or returned fewer than 3 videos
  let finalVideos = [];
  if (apiVideos.length === targetApiCount) {
    finalVideos = [...curated, ...apiVideos];
  } else {
    const missingCount = 5 - (curated.length + apiVideos.length);
    const seenIds = new Set([...curated.map(c => c.id), ...apiVideos.map(a => a.id)]);
    const fallbackList = [];
    
    // Pick category-specific fallback curated videos safely to reach 5 total videos
    const CATEGORY_FALLBACKS = {
      bonding_issues: ['kQiT2tO3KeE', '4VuEIeDrwAM', 'bonding_guidance_3', 'bonding_guidance_4', 'bonding_guidance_5'],
      overwhelmed: ['gA-Eokbod38', 'OUXKaaAke7Q', '1n46HPsYsHM', 'overwhelmed_guidance_4', 'overwhelmed_guidance_5'],
      stress: ['gA-Eokbod38', 'OUXKaaAke7Q', '1n46HPsYsHM', 'overwhelmed_guidance_4', 'overwhelmed_guidance_5'],
      daily_responsibilities: ['gA-Eokbod38', 'OUXKaaAke7Q', '1n46HPsYsHM', 'overwhelmed_guidance_4', 'overwhelmed_guidance_5'],
      loneliness: ['2OEL4P1Rz04', 'AJpErm8H2aU', 'loneliness_guidance_3', 'loneliness_guidance_4', 'loneliness_guidance_5'],
      lack_of_support: ['bnlKVPj4zeQ', 'AJpErm8H2aU', 'sF80I-TQiW0', 'support_guidance_4', 'support_guidance_5'],
      sleep_problems: ['t0kACis_dJE', '-aqpq-9UcH8', 'e_3UoecZlxY', 'sleep_guidance_4', 'sleep_guidance_5'],
      mother_sleep_problems: ['t0kACis_dJE', '-aqpq-9UcH8', 'e_3UoecZlxY', 'sleep_guidance_4', 'sleep_guidance_5'],
      physical_recovery: ['ZToicYcHIOU', 'postpartum_physical_recovery_2', 'postpartum_physical_recovery_3', 'recovery_guidance_4', 'recovery_guidance_5'],
      physical_discomfort: ['ZToicYcHIOU', 'postpartum_physical_recovery_2', 'postpartum_physical_recovery_3', 'recovery_guidance_4', 'recovery_guidance_5'],
      anxiety: ['hrozJ-EbdGI', 'sF80I-TQiW0', 'anxiety_guidance_3', 'anxiety_guidance_3', 'sF80I-TQiW0'],
      relationship_family_problem: ['wbN3M1aQAjw', '2uE4n2HLxDU', 'relationship_guidance_3', 'relationship_guidance_4', 'relationship_guidance_5'],
      financial_worry: ['financial_stable_search', 'financial_budget_video', 'financial_guidance_3'],
      negative_thoughts: ['9Q634rbsypE', 'hrozJ-EbdGI', 'negative_thoughts_3'],
      baby_crying: ['kmbKaSRyZ-c', 'n1NGKj2B2eU', 'bonding_cries_guide'],
      baby_feeding: ['qdXehiELnIA', '_FsNGM2cIpI', 'n2Iu6NooqgE'],
      baby_sleep: ['j2C8MkY7Co8', 'JePLWMMw3z0', 'n1NGKj2B2eU'],
      understanding_baby: ['6rx_-__NsjU', 'dEQOWf-NuKs', 'fpiYNkkNmEo'],
      baby_health: ['ZCQUPRyZbO0', '4SQNqugTUmw', 'k_FyoBhaFTA']
    };

    const reasonFallbacks = CATEGORY_FALLBACKS[normReason] || CATEGORY_FALLBACKS.overwhelmed;

    for (let id of reasonFallbacks) {
      if (!seenIds.has(id) && fallbackList.length < missingCount) {
        const item = ALL_CURATED_VIDEOS[id];
        if (item) {
          fallbackList.push({
            ...item,
            reason: normReason,
            source: 'curated_fallback' // Honest source labeling!
          });
          seenIds.add(id);
        }
      }
    }
    finalVideos = [...curated, ...apiVideos, ...fallbackList].slice(0, 5);
  }

  // Source Distribution Summary
  const sourceDist = {
    curated: finalVideos.filter(v => v.source === 'curated').length,
    youtube_api: finalVideos.filter(v => v.source === 'youtube_api').length,
    curated_fallback: finalVideos.filter(v => v.source === 'curated_fallback').length
  };

  // DEBUG LOGGING REQUIREMENT
  console.log('\n[YOUTUBE SUMMARY]');
  console.log(`  Search query: "${searchQuery}"`);
  console.log(`  Curated videos (3):`, JSON.stringify(curated.map(c => ({ id: c.id, title: c.title, source: c.source }))));
  console.log(`  YouTube API videos (2):`, JSON.stringify(apiVideos.map(a => ({ id: a.id, title: a.title, source: a.source }))));
  console.log(`  Final video count: ${finalVideos.length}`);
  console.log(`  Final source distribution:`, JSON.stringify(sourceDist));

  return finalVideos;
}

module.exports = {
  generateQuery,
  getCuratedVideos,
  fetchAndRankVideos
};
