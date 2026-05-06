import { QuizAnswers, GuidanceResult } from './types';

export function generateGuidance(answers: QuizAnswers): GuidanceResult {
  const goal = answers.goal?.toLowerCase() || '';

  if (goal.includes('weight') || goal.includes('metabolic')) {
    return {
      category: 'Weight Management & Metabolic Health',
      headline: 'Metabolic health evaluation requires a qualified clinician.',
      summary:
        'Weight management and metabolic concerns involve complex physiology. A licensed physician or advanced practice clinician can evaluate your labs, medical history, contraindications, and discuss whether any prescription-based peptide therapy is appropriate for your situation. There is no one-size-fits-all approach.',
      discussTopics: [
        'Your current metabolic panel and fasting insulin levels',
        'BMI, body composition goals, and realistic timelines',
        'Any contraindications based on your health history',
        'Prescription vs. compounded options that may be available',
        'Diet, exercise, and lifestyle optimization alongside any therapy',
      ],
      warnings: [
        'Never use weight-loss peptides obtained without a valid prescription.',
        'FDA-approved medications exist in this category — ask your provider about regulatory status.',
        'Claims of guaranteed weight loss are not medically valid.',
      ],
    };
  }

  if (goal.includes('recovery') || goal.includes('injury') || goal.includes('muscle')) {
    return {
      category: 'Recovery & Injury Support',
      headline: 'Injury and recovery concerns should start with a proper diagnosis.',
      summary:
        'Recovery-focused peptide therapy is an area of active clinical interest, but outcomes depend heavily on an accurate underlying diagnosis. A qualified clinician — often in sports medicine, orthopedics, or physical medicine — should diagnose your condition and discuss whether any evidence-supported peptide therapy is an option in your case.',
      discussTopics: [
        'A proper imaging or clinical diagnosis of your injury or condition',
        'Standard-of-care treatments and whether they have been tried',
        'Any peer-reviewed evidence relevant to your specific situation',
        'Potential risks and how outcomes will be monitored',
        'Integration with physical therapy or rehabilitation',
      ],
      warnings: [
        'Anecdotal or social media reports about recovery peptides are not a substitute for medical evaluation.',
        'Only licensed clinicians can diagnose and treat injuries.',
      ],
    };
  }

  if (goal.includes('sleep') || goal.includes('wellness') || goal.includes('stress')) {
    return {
      category: 'Sleep & General Wellness',
      headline: 'Sleep and wellness concerns deserve a thorough primary care evaluation first.',
      summary:
        'Poor sleep and general wellness concerns often have identifiable root causes — including sleep apnea, thyroid dysfunction, mood disorders, or nutritional deficiencies — that should be evaluated before considering any peptide therapy. A licensed primary care provider or sleep specialist is the right starting point.',
      discussTopics: [
        'A full sleep history and possible referral to a sleep specialist',
        'Ruling out primary sleep disorders (apnea, insomnia disorder, RLS)',
        'Thyroid and hormonal evaluation',
        'Lifestyle, sleep hygiene, and stress management strategies',
        'Whether any peptide therapy has an evidence base for your specific concern',
      ],
      warnings: [
        'Peptide therapy is not a first-line treatment for insomnia or general fatigue.',
        'Self-diagnosing and self-treating sleep issues can be dangerous.',
      ],
    };
  }

  if (goal.includes('hormone') || goal.includes('testosterone') || goal.includes('hgh') || goal.includes('growth')) {
    return {
      category: 'Hormone & Metabolic Concerns',
      headline: 'Hormone therapy requires labs and physician evaluation.',
      summary:
        'Hormonal optimization is a nuanced medical specialty. Peptides that affect growth hormone release or other hormonal pathways require baseline labs, ongoing monitoring, and a clinician experienced in endocrinology or hormone health. Untested and unmonitored hormone therapy carries significant risks.',
      discussTopics: [
        'Comprehensive hormone panel including IGF-1, testosterone, thyroid, and cortisol as appropriate',
        'Your symptoms and quality-of-life impact',
        'FDA-approved vs. compounded options',
        'Monitoring schedule and follow-up lab requirements',
        'Risks including suppression of natural hormone production',
      ],
      warnings: [
        'Growth hormone-related peptides are heavily regulated. Never use without a prescription.',
        'Claims of anti-aging benefits are not FDA-approved claims.',
        'Unsupervised hormone therapy can cause serious harm.',
      ],
    };
  }

  // Default: research/education
  return {
    category: 'Research & General Education',
    headline: 'Educating yourself is a great first step — always partner with a licensed clinician.',
    summary:
      'Whatever your wellness goals, peptide therapy is a medical treatment that should only be pursued under the supervision of a licensed clinician. This platform is here to help you find legitimate, verified medical providers who can evaluate your individual situation.',
    discussTopics: [
      'Your specific health goals and what the evidence shows',
      'Whether your goals have standard-of-care treatments to try first',
      'The regulatory and safety landscape of the peptides you are researching',
      'How to evaluate providers and ask the right questions',
    ],
    warnings: [
      'This website provides education only — it is not medical advice.',
      'Do not purchase injectable peptides without a valid prescription from a licensed provider.',
      'Consult a licensed clinician before starting any peptide therapy.',
    ],
  };
}
