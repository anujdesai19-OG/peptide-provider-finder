import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// WebSocket is required for Pool in Node.js serverless environments
neonConfig.webSocketConstructor = ws;

let _pool: Pool | null = null;

export function getPool(): Pool {
  if (!_pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    _pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return _pool;
}

// Module-level promise ensures init runs once per Lambda instance
let _initPromise: Promise<void> | null = null;

export function ensureDb(): Promise<void> {
  if (!_initPromise) _initPromise = _init();
  return _initPromise;
}

async function _init(): Promise<void> {
  const pool = getPool();

  // Create schema (idempotent)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS providers (
      id SERIAL PRIMARY KEY,
      business_name TEXT NOT NULL,
      clinician_name TEXT,
      provider_type TEXT NOT NULL,
      license_number TEXT,
      license_state TEXT,
      npi TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip TEXT,
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      phone TEXT,
      email TEXT,
      website TEXT,
      booking_url TEXT,
      telehealth_available INTEGER DEFAULT 0,
      states_served TEXT,
      services_offered TEXT,
      lab_requirement_summary TEXT,
      pharmacy_model TEXT,
      verification_status TEXT DEFAULT 'pending',
      verification_date TEXT,
      next_review_date TEXT,
      admin_notes TEXT,
      public_profile_description TEXT,
      report_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS provider_applications (
      id SERIAL PRIMARY KEY,
      business_name TEXT NOT NULL,
      clinician_name TEXT,
      provider_type TEXT NOT NULL,
      license_number TEXT NOT NULL,
      license_state TEXT NOT NULL,
      npi TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip TEXT,
      phone TEXT,
      email TEXT NOT NULL,
      website TEXT,
      booking_url TEXT,
      telehealth_available INTEGER DEFAULT 0,
      states_served TEXT,
      services_offered TEXT,
      lab_requirement_summary TEXT,
      pharmacy_model TEXT,
      public_profile_description TEXT,
      verification_docs TEXT,
      status TEXT DEFAULT 'pending',
      admin_notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reports (
      id SERIAL PRIMARY KEY,
      provider_id INTEGER REFERENCES providers(id),
      reporter_email TEXT,
      reason TEXT NOT NULL,
      details TEXT,
      status TEXT DEFAULT 'open',
      admin_notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      action TEXT NOT NULL,
      performed_by TEXT,
      details TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'reviewer',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS faq_items (
      id SERIAL PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      sort_order INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_providers_state ON providers(state)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_providers_status ON providers(verification_status)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_providers_zip ON providers(zip)`);

  // Seed only if empty
  const { rows } = await pool.query('SELECT COUNT(*) as c FROM admin_users');
  if (parseInt(rows[0].c) > 0) return;

  await pool.query(
    `INSERT INTO admin_users (email, password_hash, role) VALUES ($1, $2, $3)`,
    ['admin@peptideprovider.com', 'demo_hash_admin123', 'owner']
  );

  const faqs = [
    ['What is peptide therapy?', 'Peptide therapy involves the use of specific peptide compounds under medical supervision to support various health goals. Peptides are short chains of amino acids that act as signaling molecules in the body. Any use should be evaluated and prescribed by a licensed clinician.', 'basics', 0],
    ['Is peptide therapy legal?', 'The legal status of peptide therapy depends on the specific compound, its FDA status, and how it is obtained and used. Some peptides are FDA-approved medications, some are available as compounded preparations through licensed pharmacies, and others have limited or no regulatory approval. Always work with a licensed medical provider and a licensed compounding pharmacy.', 'legal', 1],
    ['Do I need a prescription?', 'Yes. Prescription peptides require a valid prescription from a licensed clinician who has evaluated you. Never obtain injectable medications without a prescription from a licensed U.S. pharmacy.', 'prescriptions', 2],
    ['What are compounded peptides?', 'Compounded peptides are preparations made by licensed compounding pharmacies, often to fill gaps when a commercially available medication does not exist or cannot meet patient needs. Compounding is legal and regulated but carries different considerations than FDA-approved manufactured medications. Discuss this thoroughly with your provider.', 'compounding', 3],
    ['What labs do I need before starting peptide therapy?', 'Lab requirements vary by the peptide and your health history. Common baseline labs may include a comprehensive metabolic panel, complete blood count, and hormone panels. Your clinician will determine what is appropriate for your situation.', 'labs', 4],
    ['Are there side effects?', 'All medical therapies carry potential risks and side effects. Common reported effects vary by peptide and individual. Only a qualified clinician who knows your full medical history can evaluate risks for you specifically.', 'safety', 5],
    ['How do I know if a provider is legitimate?', 'Look for providers listed in state medical boards, active licenses, board certifications, and affiliation with licensed pharmacies. Our directory only lists providers who have submitted license information for review. Always verify independently through your state medical board.', 'providers', 6],
    ['What is the difference between a clinic and a telehealth provider?', 'An in-person clinic requires a physical visit for evaluation and may offer on-site services. A telehealth provider conducts consultations remotely, which can increase access but may have different requirements depending on your state. Both must be licensed and comply with state laws.', 'providers', 7],
  ];

  for (const [q, a, cat, order] of faqs) {
    await pool.query(
      `INSERT INTO faq_items (question, answer, category, sort_order) VALUES ($1, $2, $3, $4)`,
      [q, a, cat, order]
    );
  }

  const providers = [
    {
      business_name: 'Apex Wellness Clinic', clinician_name: 'Dr. Sarah Chen, MD', provider_type: 'Medical Clinic',
      license_number: 'MD-123456', license_state: 'CA', npi: '1234567890',
      address: '123 Health Ave', city: 'Los Angeles', state: 'CA', zip: '90001',
      latitude: 34.0522, longitude: -118.2437, phone: '(310) 555-0101',
      email: 'info@apexwellness.example', website: 'https://apexwellness.example',
      booking_url: 'https://apexwellness.example/book', telehealth_available: 1,
      states_served: 'CA,NV,AZ', services_offered: 'Weight Management,Metabolic Health,Recovery,Hormone Optimization',
      lab_requirement_summary: 'Initial comprehensive metabolic panel and hormone panel required before therapy.',
      pharmacy_model: 'Licensed compounding pharmacy partner',
      verification_status: 'approved', verification_date: '2025-01-15', next_review_date: '2026-01-15',
      public_profile_description: 'Apex Wellness Clinic specializes in evidence-informed wellness protocols under physician supervision. Our board-certified physicians evaluate each patient individually.',
    },
    {
      business_name: 'TeleHealth Peptide Partners', clinician_name: 'Dr. Marcus Webb, DO', provider_type: 'Telehealth Provider',
      license_number: 'DO-789012', license_state: 'TX', npi: '0987654321',
      address: '456 Remote Care Blvd', city: 'Austin', state: 'TX', zip: '78701',
      latitude: 30.2672, longitude: -97.7431, phone: '(512) 555-0202',
      email: 'consult@thpp.example', website: 'https://thpp.example',
      booking_url: 'https://thpp.example/schedule', telehealth_available: 1,
      states_served: 'TX,FL,GA,TN,OK,CO', services_offered: 'Weight Management,Sleep Support,Wellness,Recovery',
      lab_requirement_summary: 'Lab work can be ordered through our partner lab network prior to first consult.',
      pharmacy_model: 'Patient uses local licensed compounding pharmacy with prescription provided.',
      verification_status: 'approved', verification_date: '2025-02-20', next_review_date: '2026-02-20',
      public_profile_description: 'Serving patients across multiple states via telehealth, with physician-led evaluation and ongoing monitoring.',
    },
    {
      business_name: 'Harbor Integrative Health', clinician_name: 'Dr. Lisa Park, MD', provider_type: 'Medical Clinic',
      license_number: 'MD-345678', license_state: 'NY', npi: '1122334455',
      address: '789 Wellness Way', city: 'New York', state: 'NY', zip: '10001',
      latitude: 40.7128, longitude: -74.0060, phone: '(212) 555-0303',
      email: 'hello@harborhealth.example', website: 'https://harborhealth.example',
      booking_url: '', telehealth_available: 0,
      states_served: 'NY,NJ,CT', services_offered: 'Metabolic Health,Hormone Optimization,Recovery',
      lab_requirement_summary: 'Full blood panel required before and during therapy. Labs ordered in-house.',
      pharmacy_model: 'Affiliated licensed compounding pharmacy.',
      verification_status: 'approved', verification_date: '2025-03-10', next_review_date: '2026-03-10',
      public_profile_description: 'Harbor Integrative Health offers comprehensive metabolic and wellness evaluations with physician oversight throughout your care journey.',
    },
    {
      business_name: 'Vitality Medical Group', clinician_name: 'Dr. James Okafor, MD', provider_type: 'Medical Clinic',
      license_number: 'MD-556677', license_state: 'FL', npi: '2233445566',
      address: '1200 Brickell Ave, Suite 400', city: 'Miami', state: 'FL', zip: '33131',
      latitude: 25.7617, longitude: -80.1918, phone: '(305) 555-0404',
      email: 'care@vitalitymed.example', website: 'https://vitalitymed.example',
      booking_url: 'https://vitalitymed.example/book', telehealth_available: 1,
      states_served: 'FL,GA,SC,NC,AL', services_offered: 'Weight Management,Hormone Optimization,Metabolic Health,Wellness',
      lab_requirement_summary: 'Baseline hormone panel, CBC, and CMP required. We partner with LabCorp and Quest nationwide.',
      pharmacy_model: 'Prescriptions sent to patient-selected licensed compounding pharmacy.',
      verification_status: 'approved', verification_date: '2025-04-01', next_review_date: '2026-04-01',
      public_profile_description: 'Vitality Medical Group is a physician-led practice offering personalized metabolic and hormone health evaluations for adults across the Southeast.',
    },
    {
      business_name: 'Cascade Functional Medicine', clinician_name: 'Dr. Angela Tran, ND, LAc', provider_type: 'Integrative Medicine',
      license_number: 'ND-887766', license_state: 'WA', npi: '3344556677',
      address: '4521 University Way NE', city: 'Seattle', state: 'WA', zip: '98105',
      latitude: 47.6062, longitude: -122.3321, phone: '(206) 555-0505',
      email: 'info@cascadefm.example', website: 'https://cascadefm.example',
      booking_url: '', telehealth_available: 1,
      states_served: 'WA,OR,ID', services_offered: 'Sleep Support,Wellness,Recovery,Metabolic Health',
      lab_requirement_summary: 'Functional lab panel including Dutch hormone test, comprehensive thyroid, and gut microbiome assessment recommended.',
      pharmacy_model: 'Works with multiple licensed compounding pharmacies; patient selects preferred vendor.',
      verification_status: 'approved', verification_date: '2025-02-14', next_review_date: '2026-02-14',
      public_profile_description: 'Cascade Functional Medicine integrates conventional diagnostics with evidence-informed functional approaches, with a focus on root-cause evaluation and clinician-supervised protocols.',
    },
    {
      business_name: 'Centurion Health & Longevity', clinician_name: 'Dr. Robert Finch, DO', provider_type: 'Anti-Aging Clinic',
      license_number: 'DO-112233', license_state: 'AZ', npi: '4455667788',
      address: '8900 E Pinnacle Peak Rd, Suite 105', city: 'Scottsdale', state: 'AZ', zip: '85255',
      latitude: 33.6846, longitude: -111.8657, phone: '(480) 555-0606',
      email: 'hello@centurionhealth.example', website: 'https://centurionhealth.example',
      booking_url: 'https://centurionhealth.example/schedule', telehealth_available: 1,
      states_served: 'AZ,CA,NV,CO,UT', services_offered: 'Hormone Optimization,Weight Management,Performance,Metabolic Health,Recovery',
      lab_requirement_summary: 'Comprehensive longevity panel including IGF-1, full hormones, inflammatory markers, and metabolic biomarkers required before initiating any protocol.',
      pharmacy_model: 'In-house coordination with two licensed 503A compounding pharmacy partners.',
      verification_status: 'approved', verification_date: '2025-01-28', next_review_date: '2026-01-28',
      public_profile_description: 'Centurion Health & Longevity is a physician-operated clinic focusing on healthspan optimization through evidence-based clinical evaluation and monitored protocols.',
    },
    {
      business_name: 'NorthStar Telehealth MD', clinician_name: 'Dr. Patricia Nguyen, MD', provider_type: 'Telehealth Provider',
      license_number: 'MD-667788', license_state: 'MN', npi: '5566778899',
      address: '100 Washington Ave S, Suite 1000', city: 'Minneapolis', state: 'MN', zip: '55401',
      latitude: 44.9778, longitude: -93.2650, phone: '(612) 555-0707',
      email: 'consult@northstarmd.example', website: 'https://northstarmd.example',
      booking_url: 'https://northstarmd.example/new-patient', telehealth_available: 1,
      states_served: 'MN,WI,IA,ND,SD,NE,KS,MO', services_offered: 'Weight Management,Metabolic Health,Sleep Support,Wellness',
      lab_requirement_summary: 'We order labs through our affiliated lab network. Patient completes bloodwork at a local draw site prior to first consultation.',
      pharmacy_model: 'Prescriptions coordinated with patient-preferred licensed pharmacy.',
      verification_status: 'approved', verification_date: '2025-03-22', next_review_date: '2026-03-22',
      public_profile_description: 'NorthStar Telehealth MD brings board-certified physician consultations to patients across the Midwest without requiring travel to a specialty clinic.',
    },
    {
      business_name: 'Premier Wellness Institute', clinician_name: 'Dr. David Santos, MD, FACP', provider_type: 'Medical Clinic',
      license_number: 'MD-334455', license_state: 'IL', npi: '6677889900',
      address: '676 N Michigan Ave, Suite 2800', city: 'Chicago', state: 'IL', zip: '60611',
      latitude: 41.8781, longitude: -87.6298, phone: '(312) 555-0808',
      email: 'office@premierwellness.example', website: 'https://premierwellness.example',
      booking_url: 'https://premierwellness.example/appointments', telehealth_available: 0,
      states_served: 'IL,IN,WI', services_offered: 'Metabolic Health,Hormone Optimization,Recovery,Weight Management',
      lab_requirement_summary: 'All labs drawn in-office during initial evaluation. Full metabolic, hormone, and cardiovascular panel included in new patient workup.',
      pharmacy_model: 'Affiliated with two local licensed compounding pharmacies for prescription fulfillment.',
      verification_status: 'approved', verification_date: '2025-04-10', next_review_date: '2026-04-10',
      public_profile_description: 'Premier Wellness Institute is a board-certified internal medicine practice with a dedicated wellness division offering comprehensive metabolic and hormone health evaluations.',
    },
    {
      business_name: 'Rocky Mountain Regenerative Medicine', clinician_name: 'Dr. Elena Vasquez, MD', provider_type: 'Medical Clinic',
      license_number: 'MD-990011', license_state: 'CO', npi: '7788990011',
      address: '1700 Lincoln St, Suite 3000', city: 'Denver', state: 'CO', zip: '80203',
      latitude: 39.7392, longitude: -104.9903, phone: '(720) 555-0909',
      email: 'info@rockymtnregen.example', website: 'https://rockymtnregen.example',
      booking_url: 'https://rockymtnregen.example/book', telehealth_available: 1,
      states_served: 'CO,WY,MT,NM,UT', services_offered: 'Recovery,Performance,Metabolic Health,Wellness',
      lab_requirement_summary: 'Baseline CMP, CBC, and injury-specific labs required. Sports medicine evaluation recommended for injury-related consultations.',
      pharmacy_model: 'Prescriptions sent to licensed compounding pharmacies; multiple options provided to patient.',
      verification_status: 'approved', verification_date: '2025-02-05', next_review_date: '2026-02-05',
      public_profile_description: 'Rocky Mountain Regenerative Medicine specializes in physician-supervised recovery and performance health for active adults, with comprehensive diagnostic evaluation before any protocol.',
    },
    {
      business_name: 'Southeastern Longevity Clinic', clinician_name: 'Dr. Michael Dupree, MD', provider_type: 'Anti-Aging Clinic',
      license_number: 'MD-223344', license_state: 'GA', npi: '8899001122',
      address: '3500 Piedmont Rd NE, Suite 720', city: 'Atlanta', state: 'GA', zip: '30305',
      latitude: 33.7490, longitude: -84.3880, phone: '(404) 555-1010',
      email: 'info@selongevity.example', website: 'https://selongevity.example',
      booking_url: 'https://selongevity.example/consult', telehealth_available: 1,
      states_served: 'GA,FL,AL,SC,TN', services_offered: 'Hormone Optimization,Weight Management,Metabolic Health,Performance',
      lab_requirement_summary: 'Comprehensive longevity panel required. We partner with LabCorp for convenient patient access to lab draws.',
      pharmacy_model: 'Prescriptions coordinated through our affiliated licensed 503A compounding pharmacy.',
      verification_status: 'approved', verification_date: '2025-03-18', next_review_date: '2026-03-18',
      public_profile_description: 'Southeastern Longevity Clinic offers physician-led evaluations for adults seeking evidence-informed approaches to metabolic and hormonal health optimization.',
    },
    {
      business_name: 'BioBalance Medical Center', clinician_name: 'Dr. Karen Holloway, DO', provider_type: 'Integrative Medicine',
      license_number: 'DO-445566', license_state: 'OH', npi: '9900112233',
      address: '28 W Fifth St, Suite 1500', city: 'Cincinnati', state: 'OH', zip: '45202',
      latitude: 39.1031, longitude: -84.5120, phone: '(513) 555-1111',
      email: 'appointments@biobalance.example', website: 'https://biobalance.example',
      booking_url: '', telehealth_available: 0,
      states_served: 'OH,KY,IN', services_offered: 'Sleep Support,Wellness,Metabolic Health,Hormone Optimization',
      lab_requirement_summary: 'In-office labs at initial visit. Panel includes thyroid, sex hormones, adrenal, metabolic, and inflammatory markers.',
      pharmacy_model: 'Works with licensed compounding pharmacies in the tri-state area.',
      verification_status: 'approved', verification_date: '2025-01-20', next_review_date: '2026-01-20',
      public_profile_description: 'BioBalance Medical Center is an integrative medicine practice offering thorough diagnostic evaluation and individualized care plans under physician supervision.',
    },
    {
      business_name: 'Lone Star Wellness MD', clinician_name: 'Dr. Todd Harrington, MD', provider_type: 'Telehealth Provider',
      license_number: 'MD-778899', license_state: 'TX', npi: '1100223344',
      address: '500 N Akard St, Suite 2750', city: 'Dallas', state: 'TX', zip: '75201',
      latitude: 32.7767, longitude: -96.7970, phone: '(214) 555-1212',
      email: 'hello@lonestarwellmd.example', website: 'https://lonestarwellmd.example',
      booking_url: 'https://lonestarwellmd.example/start', telehealth_available: 1,
      states_served: 'TX,LA,AR,OK,NM', services_offered: 'Weight Management,Metabolic Health,Hormone Optimization,Wellness',
      lab_requirement_summary: 'Labs ordered remotely through national draw network. Results reviewed at telehealth consultation.',
      pharmacy_model: 'Prescriptions sent electronically to patient-selected licensed pharmacy.',
      verification_status: 'approved', verification_date: '2025-04-15', next_review_date: '2026-04-15',
      public_profile_description: 'Lone Star Wellness MD delivers physician-supervised consultations statewide and across the South via secure telehealth, with convenient remote lab ordering.',
    },
    {
      business_name: 'Keystone Functional Health', clinician_name: 'Dr. Sandra Brennan, MD', provider_type: 'Medical Clinic',
      license_number: 'MD-556644', license_state: 'PA', npi: '2211334455',
      address: '1600 Market St, Suite 3600', city: 'Philadelphia', state: 'PA', zip: '19103',
      latitude: 39.9526, longitude: -75.1652, phone: '(215) 555-1313',
      email: 'info@keystonefh.example', website: 'https://keystonefh.example',
      booking_url: 'https://keystonefh.example/book', telehealth_available: 1,
      states_served: 'PA,NJ,DE,MD,VA', services_offered: 'Metabolic Health,Weight Management,Recovery,Sleep Support',
      lab_requirement_summary: 'New patients complete a comprehensive panel before first appointment. We offer in-office blood draw or referral to a nearby lab.',
      pharmacy_model: 'Affiliated with a licensed 503A compounding pharmacy for all prescriptions.',
      verification_status: 'approved', verification_date: '2025-03-05', next_review_date: '2026-03-05',
      public_profile_description: 'Keystone Functional Health is a physician-led practice offering in-depth metabolic and wellness evaluations for adults in the greater Philadelphia region and Mid-Atlantic.',
    },
  ];

  for (const p of providers) {
    await pool.query(`
      INSERT INTO providers (
        business_name, clinician_name, provider_type, license_number, license_state, npi,
        address, city, state, zip, latitude, longitude, phone, email, website, booking_url,
        telehealth_available, states_served, services_offered, lab_requirement_summary,
        pharmacy_model, verification_status, verification_date, next_review_date,
        public_profile_description
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
        $17,$18,$19,$20,$21,$22,$23,$24,$25
      )
    `, [
      p.business_name, p.clinician_name, p.provider_type, p.license_number, p.license_state, p.npi,
      p.address, p.city, p.state, p.zip, p.latitude, p.longitude, p.phone, p.email, p.website, p.booking_url,
      p.telehealth_available, p.states_served, p.services_offered, p.lab_requirement_summary,
      p.pharmacy_model, p.verification_status, p.verification_date, p.next_review_date,
      p.public_profile_description,
    ]);
  }
}
