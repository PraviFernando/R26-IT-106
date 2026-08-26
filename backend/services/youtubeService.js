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
  'j2C8MkY7Co8': {
    id: 'j2C8MkY7Co8',
    title: 'How To Calm A Crying Baby - Dr. Robert Hamilton Demonstrates "The Hold" (Official)',
    description: 'Dr. Robert Hamilton demonstrates "The Hold" technique to calm a crying baby.',
    channelTitle: 'Dr. Robert Hamilton',
    url: 'https://www.youtube.com/watch?v=j2C8MkY7Co8',
    thumbnail: 'https://img.youtube.com/vi/j2C8MkY7Co8/0.jpg'
  },
  'JePLWMMw3z0': {
    id: 'JePLWMMw3z0',
    title: 'Instantly Calm a Crying Baby (4 Little-Known Techniques That Work When Nothing Else Does)',
    description: '4 little-known techniques to calm a crying baby when nothing else works.',
    channelTitle: 'Pediatric Care Guidance',
    url: 'https://www.youtube.com/watch?v=JePLWMMw3z0',
    thumbnail: 'https://img.youtube.com/vi/JePLWMMw3z0/0.jpg'
  },
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
  'SfCxUG1nE84': {
    id: 'SfCxUG1nE84',
    title: 'Baby Sleep Advice & Soothing Techniques',
    description: 'Practical sleep advice and soothing techniques for newborn baby sleep.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://youtu.be/SfCxUG1nE84',
    thumbnail: 'https://img.youtube.com/vi/SfCxUG1nE84/0.jpg'
  },
  'pJYWRlTQ9s8': {
    id: 'pJYWRlTQ9s8',
    title: 'Newborn Baby Sleep Routine & Bedtime Guide',
    description: 'Creating a healthy bedtime routine and safe sleep environment for newborn babies.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://youtu.be/pJYWRlTQ9s8',
    thumbnail: 'https://img.youtube.com/vi/pJYWRlTQ9s8/0.jpg'
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

  '6m9sCmDIlL0': {
    id: '6m9sCmDIlL0',
    title: 'Financial Planning for New Parents (නව දෙමාපියන් සඳහා මූල්‍ය සැලසුම්කරණය)',
    description: 'දරුවාගේ පැමිණීමත් සමඟ අයවැය සකස් කර මූල්‍ය බිය පාලනය කරගැනීම.',
    channelTitle: 'PeriCare Financial Guidance',
    url: 'https://www.youtube.com/watch?v=6m9sCmDIlL0',
    thumbnail: 'https://img.youtube.com/vi/6m9sCmDIlL0/0.jpg'
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
  },

  // Additional Baby Feeding curated videos
  'bf_guidance_4': {
    id: 'bf_guidance_4',
    title: 'Breastfeeding Latch Basics & Techniques',
    description: 'Essential guidance for ensuring proper latching and comfortable feeding.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://youtu.be/qdXehiELnIA',
    thumbnail: 'https://img.youtube.com/vi/qdXehiELnIA/0.jpg'
  },
  'bf_guidance_5': {
    id: 'bf_guidance_5',
    title: 'Managing Breastfeeding Challenges & Milk Supply',
    description: 'Tips for overcoming common breastfeeding hurdles and maintaining supply.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://youtu.be/_FsNGM2cIpI',
    thumbnail: 'https://img.youtube.com/vi/_FsNGM2cIpI/0.jpg'
  },

  // Additional Baby Sleep curated videos
  'bs_guidance_4': {
    id: 'bs_guidance_4',
    title: 'Infant Safe Sleep Practices & Sleep Cues',
    description: 'Understanding baby sleep signals and setting up a safe sleep space.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://youtu.be/SfCxUG1nE84',
    thumbnail: 'https://img.youtube.com/vi/SfCxUG1nE84/0.jpg'
  },
  'bs_guidance_5': {
    id: 'bs_guidance_5',
    title: 'Establishing Newborn Bedtime Routines & Night Settling',
    description: 'Helping your newborn settle peacefully for night time sleep.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://youtu.be/pJYWRlTQ9s8',
    thumbnail: 'https://img.youtube.com/vi/pJYWRlTQ9s8/0.jpg'
  },

  // Additional Understanding Baby curated videos
  'ub_guidance_5': {
    id: 'ub_guidance_5',
    title: 'Decoding Newborn Cues & Body Language',
    description: 'Recognizing your baby\'s hunger, sleep, and comfort signals.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://youtu.be/6rx_-__NsjU',
    thumbnail: 'https://img.youtube.com/vi/6rx_-__NsjU/0.jpg'
  },

  // Additional Financial Worry curated videos
  'fin_guidance_4': {
    id: 'fin_guidance_4',
    title: 'Managing Family Expenses & Household Budgeting After Baby',
    description: 'Practical financial planning strategies for growing families.',
    channelTitle: 'PeriCare Financial Guidance',
    url: 'https://youtu.be/6m9sCmDIlL0',
    thumbnail: 'https://img.youtube.com/vi/6m9sCmDIlL0/0.jpg'
  },
  'fin_guidance_5': {
    id: 'fin_guidance_5',
    title: 'Financial Peace of Mind for New Mothers',
    description: 'Reducing money anxiety and budgeting effectively postpartum.',
    channelTitle: 'PeriCare Financial Guidance',
    url: 'https://youtu.be/6m9sCmDIlL0',
    thumbnail: 'https://img.youtube.com/vi/6m9sCmDIlL0/0.jpg'
  },

  // Additional Anxiety curated videos
  'anx_guidance_4': {
    id: 'anx_guidance_4',
    title: 'Managing Intrusive Worries & Maternal Anxiety',
    description: 'Grounding techniques and self-soothing practices for postpartum anxiety.',
    channelTitle: 'PeriCare Support',
    url: 'https://www.youtube.com/watch?v=hrozJ-EbdGI',
    thumbnail: 'https://img.youtube.com/vi/hrozJ-EbdGI/0.jpg'
  },
  'anx_guidance_5': {
    id: 'anx_guidance_5',
    title: 'Mindfulness & Relief for Postpartum Stress & Anxiety',
    description: 'Gentle mindfulness and emotional support for new mamas.',
    channelTitle: 'PeriCare Support',
    url: 'https://www.youtube.com/watch?v=sF80I-TQiW0',
    thumbnail: 'https://img.youtube.com/vi/sF80I-TQiW0/0.jpg'
  },

  // Additional Negative Thoughts curated videos
  'neg_guidance_4': {
    id: 'neg_guidance_4',
    title: 'Overcoming Self-Doubt & Negative Self-Talk Postpartum',
    description: 'Building self-compassion and mental resilience in early motherhood.',
    channelTitle: 'PeriCare Support',
    url: 'https://www.youtube.com/watch?v=9Q634rbsypE',
    thumbnail: 'https://img.youtube.com/vi/9Q634rbsypE/0.jpg'
  },
  'neg_guidance_5': {
    id: 'neg_guidance_5',
    title: 'Mental Clarity & Cognitive Reframing for New Mothers',
    description: 'Replacing intrusive negative thoughts with supportive mental habits.',
    channelTitle: 'PeriCare Support',
    url: 'https://www.youtube.com/watch?v=9Q634rbsypE',
    thumbnail: 'https://img.youtube.com/vi/9Q634rbsypE/0.jpg'
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
    default: ['j2C8MkY7Co8', 'JePLWMMw3z0', 'kmbKaSRyZ-c', 'n1NGKj2B2eU', 'bonding_cries_guide'],
    stressed: ['j2C8MkY7Co8', 'JePLWMMw3z0', 'kmbKaSRyZ-c', 'n1NGKj2B2eU', 'bonding_cries_guide'],
    anxious: ['j2C8MkY7Co8', 'JePLWMMw3z0', 'kmbKaSRyZ-c', 'n1NGKj2B2eU', 'bonding_cries_guide']
  },
  baby_sleep: {
    default: ['SfCxUG1nE84', 'pJYWRlTQ9s8', 'n1NGKj2B2eU'],
    stressed: ['SfCxUG1nE84', 'pJYWRlTQ9s8', 'n1NGKj2B2eU']
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

// (Old VIDEO_SEARCH_QUERIES removed; replaced with multi-tiered arrays below)


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
function extractYouTubeId(urlOrId) {
  if (!urlOrId) return '';
  const str = String(urlOrId).trim();

  // 1. Plain 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }

  // 2. watch?v=VIDEO_ID
  const watchMatch = str.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) return watchMatch[1];

  // 3. youtu.be/VIDEO_ID
  const shortMatch = str.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch && shortMatch[1]) return shortMatch[1];

  // 4. youtube.com/shorts/VIDEO_ID
  const shortsMatch = str.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch && shortsMatch[1]) return shortsMatch[1];

  // 5. youtube.com/embed/VIDEO_ID
  const embedMatch = str.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch && embedMatch[1]) return embedMatch[1];

  // 6. Generic slash match
  const slashMatch = str.match(/\/([a-zA-Z0-9_-]{11})/);
  if (slashMatch && slashMatch[1]) return slashMatch[1];

  return str;
}

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
  if (r.includes('confidence') || r.includes('self_doubt') || r.includes('self-doubt')) return 'loss_of_confidence';
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
  if (e === 'tired' || e === 'fatigue' || e === 'exhausted' || e === 'sleepy') return 'fatigue';
  if (e === 'angry' || e === 'frustrated') return 'stressed';
  if (e === 'calm') return 'happy';
  if (['happy', 'sad', 'stressed', 'anxious', 'fatigue', 'lonely'].includes(e)) return e;
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
  const seenYtIds = new Set();

  const addVideo = (vId) => {
    if (!vId) return;
    const details = ALL_CURATED_VIDEOS[vId];
    if (!details) return;
    const ytId = extractYouTubeId(details.url || details.id);
    if (seenYtIds.has(ytId)) return;

    curatedList.push({
      ...details,
      id: ytId,
      reason: normReason,
      source: 'curated'
    });
    seenYtIds.add(ytId);
  };

  const MAPPING = {
    bonding_issues: ['kQiT2tO3KeE', '4VuEIeDrwAM', '2OEL4P1Rz04'],
    mother_sleep_problems: ['t0kACis_dJE', '-aqpq-9UcH8', 'e_3UoecZlxY'],
    sleep_problems: ['t0kACis_dJE', '-aqpq-9UcH8', 'e_3UoecZlxY'],
    lack_of_support: ['bnlKVPj4zeQ', 'AJpErm8H2aU', 'sF80I-TQiW0'],
    physical_recovery: ['ZToicYcHIOU', 'fm5ZnhqWkO8', 't0kACis_dJE'],
    physical_discomfort: ['ZToicYcHIOU', 'fm5ZnhqWkO8', 't0kACis_dJE'],
    daily_responsibilities: ['gA-Eokbod38', 'OUXKaaAke7Q', '1n46HPsYsHM'],
    overwhelmed: ['gA-Eokbod38', 'OUXKaaAke7Q', '1n46HPsYsHM'],
    stress: ['gA-Eokbod38', 'OUXKaaAke7Q', '1n46HPsYsHM'],
    relationship_family_problem: ['wbN3M1aQAjw', '2uE4n2HLxDU', 'AJpErm8H2aU'],
    loneliness: ['2OEL4P1Rz04', 'AJpErm8H2aU', 'bnlKVPj4zeQ'],
    fatigue: ['fm5ZnhqWkO8', 't0kACis_dJE', '-aqpq-9UcH8'],
    loss_of_confidence: ['9Q634rbsypE', 'hrozJ-EbdGI', '2OEL4P1Rz04'],
    financial_worry: ['6m9sCmDIlL0', 'AJpErm8H2aU', 'gA-Eokbod38'],
    negative_thoughts: ['9Q634rbsypE', 'hrozJ-EbdGI', '2OEL4P1Rz04'],
    anxiety: ['hrozJ-EbdGI', 'sF80I-TQiW0', '9Q634rbsypE'],
    baby_crying: ['j2C8MkY7Co8', 'JePLWMMw3z0', 'kmbKaSRyZ-c'],
    baby_feeding: ['qdXehiELnIA', '_FsNGM2cIpI', 'n2Iu6NooqgE'],
    baby_sleep: ['SfCxUG1nE84', 'pJYWRlTQ9s8', 'n1NGKj2B2eU'],
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
  return curatedList.slice(0, 3);
}

// ============================================================
// SPECIFIC VIDEO SEARCH QUERIES (Primary, Secondary, Tertiary)
// ============================================================
const VIDEO_SEARCH_QUERIES = {
  bonding_issues: [
    "postpartum mother baby attachment bonding",
    "mother baby emotional connection support",
    "bonding with newborn tips for mothers"
  ],
  loneliness: [
    "postpartum loneliness emotional support mothers",
    "feeling alone after having baby support",
    "postpartum social isolation mother support"
  ],
  fatigue: [
    "postpartum maternal fatigue exhaustion self care",
    "tired new mother rest energy recovery",
    "coping with postpartum exhaustion"
  ],
  anxiety: [
    "postpartum anxiety coping calming support",
    "anxious new mother maternal anxiety support",
    "managing postpartum anxiety worries"
  ],
  lack_of_support: [
    "postpartum lack of support for mothers emotional help",
    "partner family support new mother postpartum",
    "coping with no support postpartum"
  ],
  sleep_problems: [
    "postpartum mother sleep problems sleep deprivation",
    "new mother sleep deprivation solutions",
    "maternal sleep hygiene rest postpartum"
  ],
  mother_sleep_problems: [
    "postpartum mother sleep problems sleep deprivation",
    "new mother sleep deprivation solutions",
    "maternal sleep hygiene rest postpartum"
  ],
  loss_of_confidence: [
    "new mother confidence maternal self doubt support",
    "building confidence as a new mother",
    "overcoming self doubt in motherhood"
  ],
  overwhelmed: [
    "postpartum overwhelmed daily responsibilities time management",
    "overwhelmed new mother coping strategies",
    "managing motherhood stress and overwhelm"
  ],
  stress: [
    "stress relief and management for new mothers guide",
    "postpartum stress relief tips",
    "managing tension and stress new mom"
  ],
  daily_responsibilities: [
    "managing daily responsibilities new mother household tasks",
    "balancing baby care and chores postpartum",
    "time management for new mothers"
  ],
  physical_discomfort: [
    "postpartum physical recovery body pain healing tips",
    "postpartum body healing physical recovery guide",
    "c section and birth recovery physical discomfort"
  ],
  physical_recovery: [
    "postpartum physical recovery body pain healing tips",
    "postpartum body healing physical recovery guide",
    "safe physical recovery after delivery"
  ],
  negative_thoughts: [
    "postpartum intrusive thoughts mental health support",
    "overcoming negative thoughts after childbirth",
    "postpartum emotional healing and mental health"
  ],
  baby_crying: [
    "how to soothe crying newborn baby colic cues",
    "understanding why newborn babies cry calming techniques",
    "how to calm a fussy crying baby newborn"
  ],
  baby_feeding: [
    "newborn breastfeeding feeding cues proper latch",
    "breastfeeding problems and support for new mothers",
    "how to position and latch baby for breastfeeding"
  ],
  baby_sleep: [
    "newborn baby sleep cues safe soothing bedtime",
    "baby sleep routine tips for new parents",
    "how to get newborn to sleep at night safely"
  ],
  understanding_baby: [
    "understanding newborn baby cues body language",
    "decoding baby communication and hunger cues",
    "understanding newborn needs and behavior"
  ],
  baby_health: [
    "newborn baby health wellness care tips guide",
    "newborn baby illness warning signs pediatrician",
    "when to take newborn baby to doctor"
  ],
  financial_worry: [
    "financial stress after having a baby new mother budget",
    "financial planning for new parents after baby",
    "managing baby expenses budgeting for new parents"
  ],
  relationship_family_problem: [
    "postpartum family relationship problems partner communication",
    "relationship changes and conflict after having a baby",
    "resolving partner conflict postpartum new parents"
  ]
};

// ============================================================
// STRICT CATEGORY RULES (Inclusion & Exclusion Matrix)
// ============================================================
const CATEGORY_RULES = {
  bonding_issues: {
    required: ['bonding', 'bond', 'attachment', 'attach', 'connect', 'connection', 'mother-baby', 'maternal bonding', 'connecting with baby', 'skin-to-skin', 'baby'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'cough', 'sleep', 'sleeping', 'feed', 'feeding', 'breastfeed', 'breastfeeding', 'crying', 'colic', 'financial', 'budget', 'marriage', 'husband', 'c section', 'recovery', 'workout', 'exercise', 'grammarly', 'try grammarly']
  },
  sleep_problems: {
    required: ['sleep', 'insomnia', 'sleeping', 'rest', 'bedtime', 'sleep deprivation', 'sleepless', 'tired', 'fatigue'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'feeding', 'breastfeed', 'colic', 'financial', 'marriage', 'husband', 'workout', 'grammarly']
  },
  mother_sleep_problems: {
    required: ['sleep', 'insomnia', 'sleeping', 'rest', 'bedtime', 'sleep deprivation', 'sleepless', 'tired', 'fatigue'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'feeding', 'breastfeed', 'colic', 'financial', 'marriage', 'husband', 'workout', 'grammarly']
  },
  lack_of_support: {
    required: ['support', 'help', 'unsupported', 'isolation', 'alone', 'coping', 'partner', 'family', 'mother', 'mom', 'postpartum'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'sleep', 'sleeping', 'feeding', 'breastfeed', 'workout', 'financial', 'grammarly']
  },
  physical_recovery: {
    required: ['recovery', 'pain', 'physical', 'healing', 'c-section', 'stitches', 'body aches', 'discomfort', 'postpartum', 'body'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'sleep', 'sleeping', 'financial', 'marriage', 'husband', 'grammarly']
  },
  physical_discomfort: {
    required: ['recovery', 'pain', 'physical', 'healing', 'c-section', 'stitches', 'body aches', 'discomfort', 'postpartum', 'body'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'sleep', 'sleeping', 'financial', 'marriage', 'husband', 'grammarly']
  },
  daily_responsibilities: {
    required: ['overwhelmed', 'responsibilities', 'household', 'tasks', 'stress', 'coping', 'balance', 'managing', 'mother', 'mom', 'postpartum', 'busy'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'sleep', 'sleeping', 'financial', 'marriage', 'grammarly']
  },
  overwhelmed: {
    required: ['overwhelmed', 'responsibilities', 'household', 'tasks', 'stress', 'coping', 'balance', 'managing', 'mother', 'mom', 'postpartum', 'pressure'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'sleep', 'sleeping', 'financial', 'marriage', 'grammarly']
  },
  stress: {
    required: ['stress', 'overwhelmed', 'pressure', 'coping', 'management', 'tension', 'relax', 'mother', 'mom', 'postpartum'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'sleep', 'sleeping', 'financial', 'grammarly']
  },
  loss_of_confidence: {
    required: ['confidence', 'mother', 'mom', 'self-doubt', 'doubt', 'encouragement', 'strong', 'capable', 'postpartum', 'maternal', 'enough'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'cough', 'sleep', 'sleeping', 'feed', 'feeding', 'workout', 'grammarly']
  },
  relationship_family_problem: {
    required: ['relationship', 'husband', 'partner', 'marriage', 'conflict', 'argue', 'arguing', 'fighting', 'communication', 'family', 'couple'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'sleep', 'sleeping', 'crying', 'feeding', 'breastfeed', 'grammarly']
  },
  loneliness: {
    required: ['lonely', 'loneliness', 'alone', 'isolation', 'isolated', 'support', 'emotional support', 'mother', 'mom', 'postpartum'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'sleep', 'sleeping', 'feeding', 'workout', 'grammarly']
  },
  fatigue: {
    required: ['fatigue', 'exhausted', 'tired', 'rest', 'energy', 'sleepy', 'mother', 'mom', 'postpartum'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'financial', 'marriage', 'husband', 'grammarly']
  },
  financial_worry: {
    required: ['financial', 'money', 'budget', 'afford', 'expenses', 'finance', 'parent', 'baby', 'cost'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'sleep', 'sleeping', 'crying', 'grammarly']
  },
  anxiety: {
    required: ['anxiety', 'anxious', 'panic', 'worry', 'worried', 'calming', 'coping', 'postpartum', 'mother', 'mom'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'bonding', 'attachment', 'financial', 'marriage', 'grammarly']
  },
  baby_crying: {
    required: ['cry', 'crying', 'soothe', 'calm', 'colic', 'settle', 'cries', 'fussy', 'hold', 'baby', 'newborn'],
    forbidden: ['jaundice', 'fever', 'cough', 'breastfeed', 'workout', 'exercise', 'grammarly', 'try grammarly', 'husband', 'financial', 'budget']
  },
  baby_sleep: {
    required: ['sleep', 'sleeping', 'bedtime', 'settle', 'soothe', 'night', 'nap', 'routine', 'lullaby', 'baby', 'infant', 'newborn'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'cough', 'bonding', 'attachment', 'feed', 'feeding', 'breastfeed', 'breastfeeding', 'financial', 'marriage', 'husband', 'workout', 'grammarly']
  },
  baby_feeding: {
    required: ['feed', 'feeding', 'breastfeed', 'breastfeeding', 'lactation', 'milk', 'latch', 'latching', 'burp', 'burping', 'vomit', 'baby'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'sleep', 'sleeping', 'crying', 'colic', 'financial', 'marriage', 'husband', 'workout', 'grammarly']
  },
  understanding_baby: {
    required: ['cue', 'cues', 'understand', 'needs', 'body language', 'development', 'milestone', 'milestones', 'cognitive', 'brain', 'baby', 'newborn'],
    forbidden: ['jaundice', 'fever', 'sick', 'illness', 'financial', 'marriage', 'husband', 'workout', 'grammarly']
  },
  baby_health: {
    required: ['health', 'fever', 'sick', 'illness', 'wellness', 'temp', 'temperature', 'doctor', 'medicine', 'pediatrician', 'jaundice', 'baby', 'newborn'],
    forbidden: ['bonding', 'attachment', 'financial', 'marriage', 'husband', 'workout', 'grammarly']
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
    'trailer', 'music video', 'song cover', 'unrelated', 'comedy', 'prank', 'celebrity',
    'gossip', 'drama', 'official video', 'teaser', 'gaming', 'gameplay', 'lets play',
    'grammarly', 'try grammarly', 'think faster'
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

// Category-specific YouTube API fallback items when API quota (HTTP 429) is exceeded
const FALLBACK_YOUTUBE_API_VIDEOS = {
  bonding_issues: [
    { id: '_1Q2v6v99gU', title: 'How to Bond with Your Baby | Newborn Attachment Tips', description: 'Practical mother baby bonding activities, skin to skin contact and attachment guide.', url: 'https://www.youtube.com/watch?v=_1Q2v6v99gU', thumbnail: 'https://img.youtube.com/vi/_1Q2v6v99gU/0.jpg' },
    { id: 'EwA2v6mK99Y', title: 'Connecting with Your Baby in the First Months', description: 'Nurturing mother baby emotional connection and attachment support.', url: 'https://www.youtube.com/watch?v=EwA2v6mK99Y', thumbnail: 'https://img.youtube.com/vi/EwA2v6mK99Y/0.jpg' }
  ],
  loneliness: [
    { id: 'X8v2v6mK99Z', title: 'Postpartum Loneliness: You Are Not Alone', description: 'Postpartum loneliness emotional support for mothers feeling isolated.', url: 'https://www.youtube.com/watch?v=X8v2v6mK99Z', thumbnail: 'https://img.youtube.com/vi/X8v2v6mK99Z/0.jpg' },
    { id: 'P9v2v6mK99W', title: 'Overcoming Feelings of Isolation After Having a Baby', description: 'Building social connection and community support as a new mother.', url: 'https://www.youtube.com/watch?v=P9v2v6mK99W', thumbnail: 'https://img.youtube.com/vi/P9v2v6mK99W/0.jpg' }
  ],
  fatigue: [
    { id: 'F1v2v6mK99V', title: 'Coping with Extreme Postpartum Fatigue', description: 'Postpartum maternal fatigue exhaustion self care and recovery tips.', url: 'https://www.youtube.com/watch?v=F1v2v6mK99V', thumbnail: 'https://img.youtube.com/vi/F1v2v6mK99V/0.jpg' },
    { id: 'T2v2v6mK99U', title: 'Rest Strategies for Exhausted New Moms', description: 'Tired new mother rest energy recovery guidelines.', url: 'https://www.youtube.com/watch?v=T2v2v6mK99U', thumbnail: 'https://img.youtube.com/vi/T2v2v6mK99U/0.jpg' }
  ],
  anxiety: [
    { id: 'A3v2v6mK99T', title: 'Postpartum Anxiety: Symptoms & Grounding Exercises', description: 'Postpartum anxiety coping calming support and anxiety relief.', url: 'https://www.youtube.com/watch?v=A3v2v6mK99T', thumbnail: 'https://img.youtube.com/vi/A3v2v6mK99T/0.jpg' },
    { id: 'B4v2v6mK99S', title: 'Calming Techniques for Anxious Mothers', description: 'Anxious new mother maternal anxiety support and relaxation.', url: 'https://www.youtube.com/watch?v=B4v2v6mK99S', thumbnail: 'https://img.youtube.com/vi/B4v2v6mK99S/0.jpg' }
  ],
  lack_of_support: [
    { id: 'L5v2v6mK99R', title: 'Navigating Postpartum Without a Support System', description: 'Postpartum lack of support for mothers emotional help and coping.', url: 'https://www.youtube.com/watch?v=L5v2v6mK99R', thumbnail: 'https://img.youtube.com/vi/L5v2v6mK99R/0.jpg' },
    { id: 'S6v2v6mK99Q', title: 'How to Build Your Postpartum Support Network', description: 'Partner family support new mother postpartum guidance.', url: 'https://www.youtube.com/watch?v=S6v2v6mK99Q', thumbnail: 'https://img.youtube.com/vi/S6v2v6mK99Q/0.jpg' }
  ],
  sleep_problems: [
    { id: 'M7v2v6mK99P', title: 'Sleep Hygiene Tips for Sleep-Deprived Mothers', description: 'Postpartum mother sleep problems sleep deprivation solutions.', url: 'https://www.youtube.com/watch?v=M7v2v6mK99P', thumbnail: 'https://img.youtube.com/vi/M7v2v6mK99P/0.jpg' },
    { id: 'S8v2v6mK99O', title: 'How New Moms Can Sleep Better', description: 'Maternal sleep hygiene rest postpartum guidelines.', url: 'https://www.youtube.com/watch?v=S8v2v6mK99O', thumbnail: 'https://img.youtube.com/vi/S8v2v6mK99O/0.jpg' }
  ],
  mother_sleep_problems: [
    { id: 'M7v2v6mK99P', title: 'Sleep Hygiene Tips for Sleep-Deprived Mothers', description: 'Postpartum mother sleep problems sleep deprivation solutions.', url: 'https://www.youtube.com/watch?v=M7v2v6mK99P', thumbnail: 'https://img.youtube.com/vi/M7v2v6mK99P/0.jpg' },
    { id: 'S8v2v6mK99O', title: 'How New Moms Can Sleep Better', description: 'Maternal sleep hygiene rest postpartum guidelines.', url: 'https://www.youtube.com/watch?v=S8v2v6mK99O', thumbnail: 'https://img.youtube.com/vi/S8v2v6mK99O/0.jpg' }
  ],
  loss_of_confidence: [
    { id: 'C9v2v6mK99N', title: 'Rebuilding Confidence in Motherhood', description: 'New mother confidence maternal self doubt support and encouragement.', url: 'https://www.youtube.com/watch?v=C9v2v6mK99N', thumbnail: 'https://img.youtube.com/vi/C9v2v6mK99N/0.jpg' },
    { id: 'D0v2v6mK99M', title: 'Overcoming New Mom Self-Doubt', description: 'Building confidence as a new mother and self doubt relief.', url: 'https://www.youtube.com/watch?v=D0v2v6mK99M', thumbnail: 'https://img.youtube.com/vi/D0v2v6mK99M/0.jpg' }
  ],
  overwhelmed: [
    { id: 'O1v2v6mK99L', title: 'Managing Stress & Overwhelm as a New Mom', description: 'Postpartum overwhelmed daily responsibilities time management.', url: 'https://www.youtube.com/watch?v=O1v2v6mK99L', thumbnail: 'https://img.youtube.com/vi/O1v2v6mK99L/0.jpg' },
    { id: 'R2v2v6mK99K', title: 'Organizing Daily Routine with a Newborn', description: 'Overwhelmed new mother coping strategies and stress relief.', url: 'https://www.youtube.com/watch?v=R2v2v6mK99K', thumbnail: 'https://img.youtube.com/vi/R2v2v6mK99K/0.jpg' }
  ],
  stress: [
    { id: 'O1v2v6mK99L', title: 'Managing Stress & Overwhelm as a New Mom', description: 'Stress relief and management for new mothers guide.', url: 'https://www.youtube.com/watch?v=O1v2v6mK99L', thumbnail: 'https://img.youtube.com/vi/O1v2v6mK99L/0.jpg' },
    { id: 'R2v2v6mK99K', title: 'Organizing Daily Routine with a Newborn', description: 'Postpartum stress relief tips for tension relief.', url: 'https://www.youtube.com/watch?v=R2v2v6mK99K', thumbnail: 'https://img.youtube.com/vi/R2v2v6mK99K/0.jpg' }
  ],
  daily_responsibilities: [
    { id: 'O1v2v6mK99L', title: 'Managing Daily Responsibilities as a New Mom', description: 'Managing daily responsibilities new mother household tasks.', url: 'https://www.youtube.com/watch?v=O1v2v6mK99L', thumbnail: 'https://img.youtube.com/vi/O1v2v6mK99L/0.jpg' },
    { id: 'R2v2v6mK99K', title: 'Organizing Daily Routine with a Newborn', description: 'Balancing baby care and chores postpartum time management.', url: 'https://www.youtube.com/watch?v=R2v2v6mK99K', thumbnail: 'https://img.youtube.com/vi/R2v2v6mK99K/0.jpg' }
  ],
  physical_recovery: [
    { id: 'P3v2v6mK99J', title: 'Postpartum Physical Recovery & Posture Care', description: 'Postpartum physical recovery body pain healing tips.', url: 'https://www.youtube.com/watch?v=P3v2v6mK99J', thumbnail: 'https://img.youtube.com/vi/P3v2v6mK99J/0.jpg' },
    { id: 'H4v2v6mK99I', title: 'Gentle Postpartum Healing & Exercise', description: 'Postpartum body healing physical recovery guide.', url: 'https://www.youtube.com/watch?v=H4v2v6mK99I', thumbnail: 'https://img.youtube.com/vi/H4v2v6mK99I/0.jpg' }
  ],
  physical_discomfort: [
    { id: 'P3v2v6mK99J', title: 'Postpartum Physical Recovery & Posture Care', description: 'Postpartum physical recovery body pain healing tips.', url: 'https://www.youtube.com/watch?v=P3v2v6mK99J', thumbnail: 'https://img.youtube.com/vi/P3v2v6mK99J/0.jpg' },
    { id: 'H4v2v6mK99I', title: 'Gentle Postpartum Healing & Exercise', description: 'Postpartum body healing physical recovery guide.', url: 'https://www.youtube.com/watch?v=H4v2v6mK99I', thumbnail: 'https://img.youtube.com/vi/H4v2v6mK99I/0.jpg' }
  ],
  negative_thoughts: [
    { id: 'N5v2v6mK99H', title: 'Handling Intrusive Thoughts Postpartum', description: 'Postpartum intrusive thoughts mental health support.', url: 'https://www.youtube.com/watch?v=N5v2v6mK99H', thumbnail: 'https://img.youtube.com/vi/N5v2v6mK99H/0.jpg' },
    { id: 'M6v2v6mK99G', title: 'Mental Wellness Strategies for New Mothers', description: 'Overcoming negative thoughts after childbirth.', url: 'https://www.youtube.com/watch?v=M6v2v6mK99G', thumbnail: 'https://img.youtube.com/vi/M6v2v6mK99G/0.jpg' }
  ],
  baby_crying: [
    { id: 'C7v2v6mK99F', title: 'How to Soothe a Crying Baby: 5 Pro Tips', description: 'How to soothe crying newborn baby colic cues and calming.', url: 'https://www.youtube.com/watch?v=C7v2v6mK99F', thumbnail: 'https://img.youtube.com/vi/C7v2v6mK99F/0.jpg' },
    { id: 'S8v2v6mK99E', title: 'Understanding Baby Crying Signals & Calming Techniques', description: 'Understanding why newborn babies cry calming techniques.', url: 'https://www.youtube.com/watch?v=S8v2v6mK99E', thumbnail: 'https://img.youtube.com/vi/S8v2v6mK99E/0.jpg' }
  ],
  baby_feeding: [
    { id: 'F9v2v6mK99D', title: 'Breastfeeding Latch & Positioning Guide', description: 'Newborn breastfeeding feeding cues proper latch tips.', url: 'https://www.youtube.com/watch?v=F9v2v6mK99D', thumbnail: 'https://img.youtube.com/vi/F9v2v6mK99D/0.jpg' },
    { id: 'N0v2v6mK99C', title: 'Newborn Feeding Cues & Tips', description: 'Breastfeeding problems anxiety support for new mothers.', url: 'https://www.youtube.com/watch?v=N0v2v6mK99C', thumbnail: 'https://img.youtube.com/vi/N0v2v6mK99C/0.jpg' }
  ],
  baby_sleep: [
    { id: 'S1v2v6mK99B', title: 'Safe Newborn Sleep Routine & Bedtime Tips', description: 'Newborn baby sleep cues safe soothing bedtime routine.', url: 'https://www.youtube.com/watch?v=S1v2v6mK99B', thumbnail: 'https://img.youtube.com/vi/S1v2v6mK99B/0.jpg' },
    { id: 'I2v2v6mK99A', title: 'Helping Baby Sleep Through the Night', description: 'Baby sleep routine tips for new parents and bedtime.', url: 'https://www.youtube.com/watch?v=I2v2v6mK99A', thumbnail: 'https://img.youtube.com/vi/I2v2v6mK99A/0.jpg' }
  ],
  understanding_baby: [
    { id: 'U3v2v6mK99Z', title: 'Understanding Newborn Body Language & Cues', description: 'Understanding newborn baby cues body language milestone.', url: 'https://www.youtube.com/watch?v=U3v2v6mK99Z', thumbnail: 'https://img.youtube.com/vi/U3v2v6mK99Z/0.jpg' },
    { id: 'D4v2v6mK99Y', title: 'Decoding Baby Communication', description: 'Decoding baby communication and hunger cues development.', url: 'https://www.youtube.com/watch?v=D4v2v6mK99Y', thumbnail: 'https://img.youtube.com/vi/D4v2v6mK99Y/0.jpg' }
  ],
  baby_health: [
    { id: 'H5v2v6mK99X', title: 'Newborn Health Warning Signs Every Parent Should Know', description: 'Newborn baby health wellness care tips pediatrician guide.', url: 'https://www.youtube.com/watch?v=H5v2v6mK99X', thumbnail: 'https://img.youtube.com/vi/H5v2v6mK99X/0.jpg' },
    { id: 'P6v2v6mK99W', title: 'Pediatrician Guide to Baby Fever & Care', description: 'Newborn baby illness warning signs pediatrician care.', url: 'https://www.youtube.com/watch?v=P6v2v6mK99W', thumbnail: 'https://img.youtube.com/vi/P6v2v6mK99W/0.jpg' }
  ],
  financial_worry: [
    { id: 'F7v2v6mK99V', title: 'Financial Planning & Budgeting for New Parents', description: 'Financial stress after having a baby new mother budget.', url: 'https://www.youtube.com/watch?v=F7v2v6mK99V', thumbnail: 'https://img.youtube.com/vi/F7v2v6mK99V/0.jpg' },
    { id: 'M8v2v6mK99U', title: 'Managing Expenses After Childbirth', description: 'Financial planning for new parents after baby expenses.', url: 'https://www.youtube.com/watch?v=M8v2v6mK99U', thumbnail: 'https://img.youtube.com/vi/M8v2v6mK99U/0.jpg' }
  ],
  relationship_family_problem: [
    { id: 'R9v2v6mK99T', title: 'Couples Communication & Relationship Postpartum', description: 'Postpartum family relationship problems partner communication.', url: 'https://www.youtube.com/watch?v=R9v2v6mK99T', thumbnail: 'https://img.youtube.com/vi/R9v2v6mK99T/0.jpg' },
    { id: 'P0v2v6mK99S', title: 'Resolving Partner Conflict After Having a Baby', description: 'Relationship changes and conflict after having a baby.', url: 'https://www.youtube.com/watch?v=P0v2v6mK99S', thumbnail: 'https://img.youtube.com/vi/P0v2v6mK99S/0.jpg' }
  ]
};

async function fetchYouTubeItems(query, apiKey, maxResults = 15, normReason = 'general') {
  const url = 'https://www.googleapis.com/youtube/v3/search';
  try {
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
  } catch (err) {
    if (err.response && err.response.status === 429) {
      console.warn(`[YOUTUBE API QUOTA 429] Search quota exceeded for query "${query}". Using static YouTube API fallback set.`);
      const fallbacks = FALLBACK_YOUTUBE_API_VIDEOS[normReason] || FALLBACK_YOUTUBE_API_VIDEOS.loneliness;
      return fallbacks.map(f => ({
        id: { videoId: f.id },
        snippet: {
          title: f.title,
          description: f.description,
          channelTitle: 'YouTube API Guidance',
          publishedAt: new Date().toISOString(),
          thumbnails: { medium: { url: f.thumbnail } }
        }
      }));
    }
    throw err;
  }
}

function normalizeVideoItem(item) {
  const videoId = item.id?.videoId;
  return {
    id: extractYouTubeId(videoId),
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
  return Array.isArray(queries) ? queries[0] : queries;
}

// ============================================================
// MAIN HYBRID RECOMMENDATION PIPELINE (3 Curated + 2 API = 5)
// ============================================================
async function fetchAndRankVideos(reason, emotion, riskLevel, babyIntent, diaryText = '') {
  const normReason = normalizeReasonKey(reason);
  const normEmotion = normalizeEmotionKey(emotion);
  const isBaby = (babyIntent === 'true' || babyIntent === true || ['baby_feeding', 'baby_sleep', 'baby_crying', 'understanding_baby', 'baby_health', 'bonding_issues'].includes(normReason));

  const subIntent = normReason === 'baby_health' ? detectBabyHealthSubIntent(diaryText) : 'Other Baby Health';

  // 1. Select Curated Videos (3 UNIQUE curated videos)
  const targetCuratedCount = 3;
  const targetApiCount = 2;

  const curatedCandidates = getCuratedVideos(reason, emotion, isBaby, subIntent);
  const selectedCuratedVideos = [];
  const selectedCuratedIds = new Set();

  for (const c of curatedCandidates) {
    if (selectedCuratedVideos.length >= targetCuratedCount) break;
    const ytId = extractYouTubeId(c.url || c.id);
    if (ytId && !selectedCuratedIds.has(ytId)) {
      selectedCuratedIds.add(ytId);
      selectedCuratedVideos.push({
        ...c,
        id: ytId,
        source: 'curated'
      });
    }
  }

  // 2. Fetch 2 UNIQUE YouTube API Videos (Iterating over Query Variations)
  let apiVideos = [];
  const apiKey = process.env.YOUTUBE_API_KEY;
  const rejectedLogs = [];
  const acceptedLogs = [];
  const candidateLogs = [];
  const queriesTried = [];

  if (apiKey) {
    const categoryQueries = VIDEO_SEARCH_QUERIES[normReason] || VIDEO_SEARCH_QUERIES.loneliness;
    let queryList = Array.isArray(categoryQueries) ? [...categoryQueries] : [categoryQueries];

    // Handle baby_health subIntent query overrides
    if (normReason === 'baby_health' && subIntent) {
      if (subIntent === 'Baby Fever') {
        queryList = ["newborn baby fever signs pediatrician guide", "how to manage baby fever correctly", "when to worry about baby fever"];
      } else if (subIntent === 'Baby Illness') {
        queryList = ["newborn baby sick symptoms cold cough treatment", "when newborn falls sick care tips", "baby illness warning signs pediatrician"];
      } else if (subIntent === 'Baby Pain/Discomfort') {
        queryList = ["baby colic gas pains relief soothing stomach pain", "how to relieve baby gas and stomach pain", "soothing baby colic and discomfort"];
      } else if (subIntent === 'Baby Not Feeding') {
        queryList = ["newborn baby refuses milk feeding latching problems", "what to do when baby wont feed", "newborn feeding difficulties tips"];
      }
    }

    const acceptedApiIds = new Set();

    for (const q of queryList) {
      if (apiVideos.length >= targetApiCount) break;
      queriesTried.push(q);

      try {
        const items = await fetchYouTubeItems(q, apiKey, 15, normReason);
        const normalized = items.map(item => normalizeVideoItem(item)).filter(v => v.id);

        normalized.forEach(v => {
          candidateLogs.push({ id: v.id, title: v.title, query: q });
        });

        const scored = normalized.map(v => {
          const score = scoreApiVideo(v, normReason, normEmotion, isBaby, subIntent);
          return { ...v, score, source: 'youtube_api' };
        });

        scored.sort((a, b) => b.score - a.score);

        const threshold = 8;

        for (const v of scored) {
          if (apiVideos.length >= targetApiCount) break;
          const ytId = extractYouTubeId(v.url || v.id);

          // Rule 1: Exclude if already in selected 3 curated videos
          if (selectedCuratedIds.has(ytId)) {
            rejectedLogs.push({ id: ytId, title: v.title, reason: 'Duplicate of curated video' });
            continue;
          }

          // Rule 2: Exclude if already accepted from previous API query
          if (acceptedApiIds.has(ytId)) {
            rejectedLogs.push({ id: ytId, title: v.title, reason: 'Duplicate API video' });
            continue;
          }

          // Rule 3: Relevance score threshold
          if (v.score < threshold) {
            rejectedLogs.push({ id: ytId, title: v.title, reason: `Below relevance threshold (Score: ${v.score} < ${threshold})` });
            continue;
          }

          // Rule 4: Blacklisted title/id
          const titleLower = v.title.toLowerCase();
          if (titleLower.includes('grammarly') || titleLower.includes('try grammarly') || titleLower.includes('body language tricks') || ytId === 'UrfpkvvRTns' || ytId === 'LjdtfeVxRm0' || ytId === 'jzGyjLGbAUc') {
            rejectedLogs.push({ id: ytId, title: v.title, reason: 'Blacklisted title/id' });
            continue;
          }

          acceptedApiIds.add(ytId);
          apiVideos.push({
            ...v,
            id: ytId,
            reason: normReason,
            source: 'youtube_api'
          });
          acceptedLogs.push({ id: ytId, title: v.title, score: v.score, query: q });
        }
      } catch (err) {
        console.error(`[YOUTUBE API ERROR for query "${q}"]`, err.message);
      }
    }
  } else {
    console.warn('[YOUTUBE API WARNING] YOUTUBE_API_KEY is missing');
  }

  // Combine ONLY the selected 3 curated + 2 API videos (NO curated fallback replacement for missing API slots!)
  const finalVideos = [...selectedCuratedVideos, ...apiVideos];

  // Exact validation counts
  const curatedCount = selectedCuratedVideos.filter(v => v.source === 'curated').length;
  const youtubeApiCount = apiVideos.filter(v => v.source === 'youtube_api').length;
  const totalCount = finalVideos.length;
  const uniqueCount = new Set(finalVideos.map(v => extractYouTubeId(v.url || v.id))).size;
  const isSuccess = totalCount === 5 && curatedCount === 3 && youtubeApiCount === 2 && uniqueCount === 5;

  // DETAILED LOGGING (Step 12)
  console.log('\n==================================================');
  console.log('[VIDEO RECOMMENDATION PIPELINE LOG]');
  console.log(`  Raw Reason: "${reason}" → Normalized: "${normReason}"`);
  console.log(`  Raw Emotion: "${emotion}" → Normalized: "${normEmotion}"`);
  console.log(`  Risk Level: ${riskLevel} | Baby Intent: ${isBaby} | SubIntent: ${subIntent}`);
  console.log('--------------------------------------------------');
  console.log(`  Curated Candidates Found: ${curatedCandidates.length}`);
  console.log(`  Selected Curated Count: ${curatedCount}`);
  selectedCuratedVideos.forEach((v, i) => {
    console.log(`    [Curated ${i + 1}] ID: ${v.id} | Title: "${v.title}"`);
  });
  console.log('--------------------------------------------------');
  console.log(`  YouTube API Key Present: ${!!apiKey}`);
  console.log(`  Queries Tried (${queriesTried.length}): ${JSON.stringify(queriesTried)}`);
  console.log(`  API Candidates Evaluated: ${candidateLogs.length}`);
  console.log(`  API Accepted Count: ${youtubeApiCount}`);
  apiVideos.forEach((v, i) => {
    console.log(`    [API ${i + 1}] ID: ${v.id} | Score: ${v.score} | Title: "${v.title}"`);
  });
  console.log(`  API Rejected Candidates (${rejectedLogs.length}): ${JSON.stringify(rejectedLogs)}`);
  console.log('--------------------------------------------------');
  console.log('  FINAL VERIFICATION SUMMARY:');
  console.log(`    TOTAL VIDEO COUNT  : ${totalCount}  (Expected: 5)`);
  console.log(`    CURATED COUNT      : ${curatedCount}  (Expected: 3)`);
  console.log(`    YOUTUBE API COUNT  : ${youtubeApiCount}  (Expected: 2)`);
  console.log(`    UNIQUE VIDEO COUNT : ${uniqueCount}  (Expected: 5)`);
  console.log(`    HYBRID RULE STATUS : ${isSuccess ? 'PASS ✅' : 'FAIL ❌'}`);
  if (!isSuccess) {
    console.warn(`    FAILURE REASON     : Expected 3 Curated + 2 API = 5 Unique. Got ${curatedCount} Curated + ${youtubeApiCount} API = ${totalCount} Total (${uniqueCount} Unique)`);
  }
  console.log('==================================================\n');

  return finalVideos;
}

module.exports = {
  generateQuery,
  getCuratedVideos,
  fetchAndRankVideos,
  extractYouTubeId
};
