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

const labelCn =
  'mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground';
const inputCn =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

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
      <div className="mx-auto max-w-2xl">
        <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/admin/residents" className="font-medium text-primary hover:underline">
            Caseload
          </Link>
          <span className="mx-1.5 text-muted-foreground/80">/</span>
          <span className="text-foreground">New resident</span>
        </nav>
        <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">Add resident</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter core case fields. You can add counseling notes and visitations from the resident profile.
        </p>

        {error && (
          <div className="mt-4 rounded-md border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-[var(--card-shadow)]"
        >
          <div>
            <label className={labelCn}>Safehouse *</label>
            <select value={safehouseId} onChange={(e) => setSafehouseId(e.target.value)} required className={inputCn}>
              <option value="">Select safehouse…</option>
              {safehouses.map((s) => (
                <option key={s.safehouseId} value={s.safehouseId}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCn}>Case control no. *</label>
              <input value={caseControlNo} onChange={(e) => setCaseControlNo(e.target.value)} required className={inputCn} placeholder="e.g. RSCU-X-2026-0001" />
            </div>
            <div>
              <label className={labelCn}>Internal code *</label>
              <input value={internalCode} onChange={(e) => setInternalCode(e.target.value)} required className={inputCn} placeholder="e.g. HL-001" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className={labelCn}>Case status</label>
              <select value={caseStatus} onChange={(e) => setCaseStatus(e.target.value)} className={inputCn}>
                {STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCn}>Category</label>
              <select value={caseCategory} onChange={(e) => setCaseCategory(e.target.value)} className={inputCn}>
                {CATEGORY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCn}>Sex</label>
              <select value={sex} onChange={(e) => setSex(e.target.value)} className={inputCn}>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className={labelCn}>Date of birth</label>
              <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={inputCn} />
            </div>
            <div>
              <label className={labelCn}>Date of admission</label>
              <input type="date" value={dateOfAdmission} onChange={(e) => setDateOfAdmission(e.target.value)} className={inputCn} />
            </div>
            <div>
              <label className={labelCn}>Date enrolled</label>
              <input type="date" value={dateEnrolled} onChange={(e) => setDateEnrolled(e.target.value)} className={inputCn} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCn}>Birth status</label>
              <input value={birthStatus} onChange={(e) => setBirthStatus(e.target.value)} className={inputCn} />
            </div>
            <div>
              <label className={labelCn}>Place of birth</label>
              <input value={placeOfBirth} onChange={(e) => setPlaceOfBirth(e.target.value)} className={inputCn} placeholder="Optional" />
            </div>
          </div>
          <div>
            <label className={labelCn}>Religion</label>
            <input value={religion} onChange={(e) => setReligion(e.target.value)} className={inputCn} placeholder="Optional" />
          </div>
          <div>
            <label className={labelCn}>Referral source</label>
            <input value={referralSource} onChange={(e) => setReferralSource(e.target.value)} className={inputCn} />
          </div>
          <div>
            <label className={labelCn}>Assigned social worker *</label>
            <input value={assignedSocialWorker} onChange={(e) => setAssignedSocialWorker(e.target.value)} required className={inputCn} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCn}>Initial risk</label>
              <select value={initialRiskLevel} onChange={(e) => setInitialRiskLevel(e.target.value)} className={inputCn}>
                {RISK_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCn}>Current risk</label>
              <select value={currentRiskLevel} onChange={(e) => setCurrentRiskLevel(e.target.value)} className={inputCn}>
                {RISK_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCn}>Age upon admission</label>
              <input value={ageUponAdmission} onChange={(e) => setAgeUponAdmission(e.target.value)} className={inputCn} placeholder="e.g. 14" />
            </div>
            <div>
              <label className={labelCn}>Present age</label>
              <input value={presentAge} onChange={(e) => setPresentAge(e.target.value)} className={inputCn} placeholder="e.g. 15" />
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Saving…' : 'Create resident'}
            </button>
            <Link
              to="/admin/residents"
              className="inline-flex items-center justify-center rounded-md border border-border bg-background px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
