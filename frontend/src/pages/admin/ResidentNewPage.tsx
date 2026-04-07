import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import AdminLayout from '../../components/AdminLayout';

interface Safehouse {
  safehouseId: number;
  name: string;
}

const STATUS_OPTIONS = ['Active', 'Closed', 'Transferred', 'Discharged'];
const CATEGORY_OPTIONS = [
  'Abused Child', 'Neglected Child', 'Abandoned Child',
  'Child in Conflict with the Law', 'Trafficked', 'Exploited', 'At-Risk',
];
const RISK_OPTIONS = ['Critical', 'High', 'Medium', 'Low'];

function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function ResidentNewPage() {
  const navigate = useNavigate();
  const [safehouses, setSafehouses] = useState<Safehouse[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [safehouseId, setSafehouseId] = useState('');
  const [caseControlNo, setCaseControlNo] = useState('');
  const [internalCode, setInternalCode] = useState('');
  const [caseStatus, setCaseStatus] = useState('Active');
  const [caseCategory, setCaseCategory] = useState('At-Risk');
  const [sex, setSex] = useState('Female');
  const [dateOfBirth, setDateOfBirth] = useState('2010-01-01');
  const [dateOfAdmission, setDateOfAdmission] = useState(todayDateOnly());
  const [dateEnrolled, setDateEnrolled] = useState(todayDateOnly());
  const [birthStatus, setBirthStatus] = useState('Live Birth');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [religion, setReligion] = useState('');
  const [referralSource, setReferralSource] = useState('DSWD / SWO referral');
  const [assignedSocialWorker, setAssignedSocialWorker] = useState('');
  const [initialRiskLevel, setInitialRiskLevel] = useState('Medium');
  const [currentRiskLevel, setCurrentRiskLevel] = useState('Medium');
  const [ageUponAdmission, setAgeUponAdmission] = useState('');
  const [presentAge, setPresentAge] = useState('');

  useEffect(() => {
    api.get<Safehouse[]>('/safehouses').then(setSafehouses).catch(() => setSafehouses([]));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const shId = parseInt(safehouseId, 10);
    if (!safehouseId || Number.isNaN(shId)) {
      setError('Please select a safehouse.');
      return;
    }
    if (!caseControlNo.trim() || !internalCode.trim()) {
      setError('Case control number and internal code are required.');
      return;
    }
    if (!assignedSocialWorker.trim()) {
      setError('Assigned social worker is required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        caseControlNo: caseControlNo.trim(),
        internalCode: internalCode.trim(),
        safehouseId: shId,
        caseStatus,
        sex,
        dateOfBirth,
        birthStatus,
        placeOfBirth: placeOfBirth || '—',
        religion: religion || '—',
        caseCategory,
        subCatOrphaned: false,
        subCatTrafficked: false,
        subCatChildLabor: false,
        subCatPhysicalAbuse: false,
        subCatSexualAbuse: false,
        subCatOsaec: false,
        subCatCicl: false,
        subCatAtRisk: false,
        subCatStreetChild: false,
        subCatChildWithHiv: false,
        isPwd: false,
        pwdType: null as string | null,
        hasSpecialNeeds: false,
        specialNeedsDiagnosis: null as string | null,
        familyIs4Ps: false,
        familySoloParent: false,
        familyIndigenous: false,
        familyParentPwd: false,
        familyInformalSettler: false,
        dateOfAdmission,
        ageUponAdmission: ageUponAdmission || null,
        presentAge: presentAge || null,
        lengthOfStay: null as string | null,
        referralSource,
        referringAgencyPerson: null as string | null,
        assignedSocialWorker: assignedSocialWorker.trim(),
        initialCaseAssessment: null as string | null,
        reintegrationType: null as string | null,
        reintegrationStatus: null as string | null,
        initialRiskLevel,
        currentRiskLevel,
        dateEnrolled,
        dateClosed: null as string | null,
        notesRestricted: null as string | null,
      };

      const created = await api.post<{ residentId?: number }>('/residents', payload);
      const rid = created?.residentId;
      if (rid == null) throw new Error('Create succeeded but the server did not return a resident id.');
      navigate(`/admin/residents/${rid}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create resident.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: '720px' }}>
        <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '1rem' }}>
          <Link to="/admin/residents" style={{ color: '#4299e1', textDecoration: 'none' }}>Caseload</Link>
          {' / '}
          <span>New resident</span>
        </div>
        <h1 style={{ fontSize: '1.5rem', color: '#1a365d', fontWeight: 700, marginBottom: '0.5rem' }}>Add resident</h1>
        <p style={{ color: '#718096', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Enter core case fields. You can add counseling notes and visitations from the resident profile.
        </p>

        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: '#fff5f5', color: '#c53030', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem', border: '1px solid #fed7d7' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Safehouse *</label>
            <select value={safehouseId} onChange={(e) => setSafehouseId(e.target.value)} required style={inputStyle}>
              <option value="">Select safehouse…</option>
              {safehouses.map((s) => (
                <option key={s.safehouseId} value={s.safehouseId}>{s.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Case control no. *</label>
              <input value={caseControlNo} onChange={(e) => setCaseControlNo(e.target.value)} required style={inputStyle} placeholder="e.g. RSCU-X-2026-0001" />
            </div>
            <div>
              <label style={labelStyle}>Internal code *</label>
              <input value={internalCode} onChange={(e) => setInternalCode(e.target.value)} required style={inputStyle} placeholder="e.g. HL-001" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Case status</label>
              <select value={caseStatus} onChange={(e) => setCaseStatus(e.target.value)} style={inputStyle}>
                {STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select value={caseCategory} onChange={(e) => setCaseCategory(e.target.value)} style={inputStyle}>
                {CATEGORY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Sex</label>
              <select value={sex} onChange={(e) => setSex(e.target.value)} style={inputStyle}>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Date of birth</label>
              <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Date of admission</label>
              <input type="date" value={dateOfAdmission} onChange={(e) => setDateOfAdmission(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Date enrolled</label>
              <input type="date" value={dateEnrolled} onChange={(e) => setDateEnrolled(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Birth status</label>
              <input value={birthStatus} onChange={(e) => setBirthStatus(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Place of birth</label>
              <input value={placeOfBirth} onChange={(e) => setPlaceOfBirth(e.target.value)} style={inputStyle} placeholder="Optional" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Religion</label>
            <input value={religion} onChange={(e) => setReligion(e.target.value)} style={inputStyle} placeholder="Optional" />
          </div>
          <div>
            <label style={labelStyle}>Referral source</label>
            <input value={referralSource} onChange={(e) => setReferralSource(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Assigned social worker *</label>
            <input value={assignedSocialWorker} onChange={(e) => setAssignedSocialWorker(e.target.value)} required style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Initial risk</label>
              <select value={initialRiskLevel} onChange={(e) => setInitialRiskLevel(e.target.value)} style={inputStyle}>
                {RISK_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Current risk</label>
              <select value={currentRiskLevel} onChange={(e) => setCurrentRiskLevel(e.target.value)} style={inputStyle}>
                {RISK_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Age upon admission</label>
              <input value={ageUponAdmission} onChange={(e) => setAgeUponAdmission(e.target.value)} style={inputStyle} placeholder="e.g. 14" />
            </div>
            <div>
              <label style={labelStyle}>Present age</label>
              <input value={presentAge} onChange={(e) => setPresentAge(e.target.value)} style={inputStyle} placeholder="e.g. 15" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="submit" disabled={submitting} style={{ padding: '0.65rem 1.25rem', backgroundColor: submitting ? '#a0aec0' : '#2b6cb0', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? 'Saving…' : 'Create resident'}
            </button>
            <Link to="/admin/residents" style={{ padding: '0.65rem 1.25rem', backgroundColor: 'white', color: '#718096', border: '1px solid #e2e8f0', borderRadius: '6px', textDecoration: 'none', fontSize: '0.875rem', alignSelf: 'center' }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#4a5568',
  marginBottom: '0.25rem',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.65rem',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  fontSize: '0.875rem',
  boxSizing: 'border-box',
};
