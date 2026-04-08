import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { api, getApiBase } from '../../api/client';
import AdminLayout from '../../components/AdminLayout';

interface Resident {
  residentId: number;
  caseControlNo: string;
  internalCode: string;
  safehouseId: number;
  caseStatus: string;
  sex: string;
  dateOfBirth: string;
  birthStatus: string;
  placeOfBirth: string;
  religion: string;
  caseCategory: string;
  subCatOrphaned: boolean;
  subCatTrafficked: boolean;
  subCatChildLabor: boolean;
  subCatPhysicalAbuse: boolean;
  subCatSexualAbuse: boolean;
  subCatOsaec: boolean;
  subCatCicl: boolean;
  subCatAtRisk: boolean;
  subCatStreetChild: boolean;
  subCatChildWithHiv: boolean;
  isPwd: boolean;
  pwdType: string | null;
  hasSpecialNeeds: boolean;
  specialNeedsDiagnosis: string | null;
  familyIs4Ps: boolean;
  familySoloParent: boolean;
  familyIndigenous: boolean;
  familyParentPwd: boolean;
  familyInformalSettler: boolean;
  dateOfAdmission: string;
  ageUponAdmission: string | null;
  presentAge: string | null;
  lengthOfStay: string | null;
  referralSource: string;
  referringAgencyPerson: string | null;
  assignedSocialWorker: string;
  initialCaseAssessment: string | null;
  reintegrationType: string | null;
  reintegrationStatus: string | null;
  initialRiskLevel: string;
  currentRiskLevel: string;
  dateEnrolled: string;
  dateClosed: string | null;
  safehouse?: { name: string; city: string; province: string };
}

const riskColor: Record<string, string> = {
  Critical: '#c53030',
  High: '#dd6b20',
  Medium: '#d69e2e',
  Low: '#38a169',
};

const statusColor: Record<string, string> = {
  Active: '#2b6cb0',
  Closed: '#718096',
  Transferred: '#805ad5',
  Discharged: '#38a169',
};

type Tab = 'overview' | 'recordings' | 'visitations' | 'conferences';

export default function ResidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [resident, setResident] = useState<Resident | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id || id === 'new') {
      setIsLoading(false);
      setResident(null);
      setError('');
      return;
    }
    setIsLoading(true);
    api.get<Resident>(`/residents/${id}`)
      .then(setResident)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (id === 'new') {
    return <Navigate to="/admin/residents/new" replace />;
  }

  if (isLoading) return <AdminLayout><LoadingState /></AdminLayout>;
  if (error) return <AdminLayout><ErrorState message={error} /></AdminLayout>;
  if (!resident) return <AdminLayout><ErrorState message="Resident not found." /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-5xl overflow-x-hidden break-words">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-muted-foreground">
          <Link to="/admin/residents" className="font-medium text-primary no-underline hover:underline">Caseload</Link>
          <span className="mx-1.5 text-muted-foreground/80">/</span>
          <span className="text-foreground">{resident.internalCode}</span>
        </div>

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="mb-2 font-heading text-2xl font-bold text-foreground md:text-3xl">
              {resident.internalCode}
            </h1>
            <div className="flex flex-wrap gap-2">
              <Badge text={resident.caseStatus} color={statusColor[resident.caseStatus] ?? '#718096'} />
              <Badge text={`Risk: ${resident.currentRiskLevel}`} color={riskColor[resident.currentRiskLevel] ?? '#718096'} />
              {resident.safehouse && (
                <span className="self-center text-xs text-muted-foreground">
                  📍 {resident.safehouse.name}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/residents"
              className="shrink-0 text-sm font-semibold text-primary no-underline hover:underline"
            >
              ← Back to Caseload Inventory
            </Link>
            <Link
              to={`/admin/residents/${id}/edit`}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground no-underline shadow-sm transition-opacity hover:opacity-90"
            >
              Edit Record
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap border-b border-border">
          {([
            { key: 'overview', label: 'Case Overview' },
            { key: 'recordings', label: 'Process Recordings' },
            { key: 'visitations', label: 'Home Visitations' },
            { key: 'conferences', label: 'Case Conferences' },
          ] as { key: Tab; label: string }[]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`-mb-px rounded-t-md border-b-2 px-4 py-2 text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-primary font-semibold text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab resident={resident} />}
        {activeTab === 'recordings' && <ProcessRecordingsTab residentId={resident.residentId} />}
        {activeTab === 'visitations' && <HomeVisitationsTab residentId={resident.residentId} />}
        {activeTab === 'conferences' && <CaseConferencesTab residentId={resident.residentId} />}
      </div>
    </AdminLayout>
  );
}

function OverviewTab({ resident }: { resident: Resident }) {
  const boolList = (items: [boolean, string][]) =>
    items.filter(([v]) => v).map(([, l]) => l).join(', ') || 'None';

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Section title="Demographics">
        <Field label="Sex" value={resident.sex} />
        <Field label="Date of Birth" value={resident.dateOfBirth ? new Date(resident.dateOfBirth).toLocaleDateString() : '—'} />
        <Field label="Birth Status" value={resident.birthStatus} />
        <Field label="Place of Birth" value={resident.placeOfBirth} />
        <Field label="Religion" value={resident.religion} />
        <Field label="Age upon Admission" value={resident.ageUponAdmission ?? '—'} />
        <Field label="Present Age" value={resident.presentAge ?? '—'} />
        <Field label="Length of Stay" value={resident.lengthOfStay ?? '—'} />
      </Section>

      <Section title="Case Information">
        <Field label="Case Control No." value={resident.caseControlNo || '—'} />
        <Field label="Case Category" value={resident.caseCategory} />
        <Field label="Initial Risk Level" value={resident.initialRiskLevel} />
        <Field label="Current Risk Level" value={resident.currentRiskLevel} />
        <Field label="Date of Admission" value={resident.dateOfAdmission ? new Date(resident.dateOfAdmission).toLocaleDateString() : '—'} />
        <Field label="Date Enrolled" value={resident.dateEnrolled ? new Date(resident.dateEnrolled).toLocaleDateString() : '—'} />
        {resident.dateClosed && <Field label="Date Closed" value={new Date(resident.dateClosed).toLocaleDateString()} />}
      </Section>

      <Section title="Sub-Categories">
        <div style={{ fontSize: '0.875rem', color: '#4a5568', lineHeight: 1.7 }}>
          {boolList([
            [resident.subCatOrphaned, 'Orphaned'],
            [resident.subCatTrafficked, 'Trafficked'],
            [resident.subCatChildLabor, 'Child Labor'],
            [resident.subCatPhysicalAbuse, 'Physical Abuse'],
            [resident.subCatSexualAbuse, 'Sexual Abuse'],
            [resident.subCatOsaec, 'OSAEC'],
            [resident.subCatCicl, 'CICL'],
            [resident.subCatAtRisk, 'At-Risk'],
            [resident.subCatStreetChild, 'Street Child'],
            [resident.subCatChildWithHiv, 'Child with HIV'],
          ])}
        </div>
      </Section>

      <Section title="Family Socio-Demographic Profile">
        <div style={{ fontSize: '0.875rem', color: '#4a5568', lineHeight: 1.7 }}>
          {boolList([
            [resident.familyIs4Ps, '4Ps Beneficiary'],
            [resident.familySoloParent, 'Solo Parent'],
            [resident.familyIndigenous, 'Indigenous Group'],
            [resident.familyParentPwd, 'Parent with PWD'],
            [resident.familyInformalSettler, 'Informal Settler'],
          ])}
        </div>
      </Section>

      <Section title="Special Needs & Disability">
        <Field label="PWD" value={resident.isPwd ? (resident.pwdType ?? 'Yes') : 'No'} />
        <Field label="Special Needs" value={resident.hasSpecialNeeds ? (resident.specialNeedsDiagnosis ?? 'Yes') : 'No'} />
      </Section>

      <Section title="Referral & Assignment">
        <Field label="Referral Source" value={resident.referralSource} />
        <Field label="Referring Agency/Person" value={resident.referringAgencyPerson ?? '—'} />
        <Field label="Assigned Social Worker" value={resident.assignedSocialWorker} />
      </Section>

      <div className="lg:col-span-2">
        <Section title="Reintegration">
          <Field label="Type" value={resident.reintegrationType ?? '—'} />
          <Field label="Status" value={resident.reintegrationStatus ?? '—'} />
          {resident.initialCaseAssessment && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#718096', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Initial Case Assessment
              </div>
              <div style={{ fontSize: '0.875rem', color: '#4a5568', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {resident.initialCaseAssessment}
              </div>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

function ProcessRecordingsTab({ residentId }: { residentId: number }) {
  const [recordings, setRecordings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  const fetchRecordings = async (p = 1) => {
    setIsLoading(true);
    try {
      const base = getApiBase();
      if (!base) throw new Error('API URL is not configured.');
      const response = await fetch(
        `${base}/processrecordings?residentId=${residentId}&page=${p}&pageSize=10`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const total = response.headers.get('X-Total-Count');
      setTotalCount(total ? parseInt(total, 10) : 0);
      if (!response.ok) {
        const t = await response.text();
        throw new Error(t || `Request failed: ${response.status}`);
      }
      const raw = await response.text();
      setRecordings(raw ? JSON.parse(raw) : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load process recordings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRecordings(page); }, [residentId, page]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#2d3748' }}>
          Process Recordings ({totalCount})
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#2b6cb0', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
        >
          {showForm ? 'Cancel' : '+ Add Recording'}
        </button>
      </div>

      {showForm && (
        <ProcessRecordingForm
          residentId={residentId}
          onSuccess={() => { setShowForm(false); fetchRecordings(1); setPage(1); }}
        />
      )}

      {error && <div style={{ color: '#c53030', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</div>}

      {isLoading ? (
        <div style={{ color: '#a0aec0', textAlign: 'center', padding: '2rem' }}>Loading…</div>
      ) : recordings.length === 0 ? (
        <div style={{ color: '#a0aec0', textAlign: 'center', padding: '2rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          No process recordings yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {recordings.map((r) => (
            <div key={r.recordingId} style={recordCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: '#1a365d', fontSize: '0.9rem' }}>
                    {new Date(r.sessionDate).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <Badge text={r.sessionType} color="#805ad5" />
                  {r.concernsFlagged && <Badge text="Concerns Flagged" color="#c53030" />}
                  {r.progressNoted && <Badge text="Progress Noted" color="#38a169" />}
                </div>
                <span style={{ fontSize: '0.8rem', color: '#718096' }}>by {r.socialWorker}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#4a5568', marginBottom: '0.4rem' }}>
                <strong>Emotional State:</strong> {r.emotionalStateObserved} → {r.emotionalStateEnd}
              </div>
              {r.sessionNarrative && (
                <div style={{ fontSize: '0.85rem', color: '#4a5568', lineHeight: 1.6 }}>
                  {r.sessionNarrative.length > 300 ? r.sessionNarrative.slice(0, 300) + '…' : r.sessionNarrative}
                </div>
              )}
              {r.followUpActions && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: '#718096' }}>
                  <strong>Follow-up:</strong> {r.followUpActions}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {Math.ceil(totalCount / 10) > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <PaginationBtn label="← Prev" disabled={page <= 1} onClick={() => setPage(p => p - 1)} />
          <span style={{ alignSelf: 'center', fontSize: '0.875rem', color: '#4a5568' }}>
            Page {page} of {Math.ceil(totalCount / 10)}
          </span>
          <PaginationBtn label="Next →" disabled={page >= Math.ceil(totalCount / 10)} onClick={() => setPage(p => p + 1)} />
        </div>
      )}
    </div>
  );
}

function HomeVisitationsTab({ residentId }: { residentId: number }) {
  const [visitations, setVisitations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  const fetchVisitations = async (p = 1) => {
    setIsLoading(true);
    try {
      const base = getApiBase();
      if (!base) throw new Error('API URL is not configured.');
      const response = await fetch(
        `${base}/homevisitations?residentId=${residentId}&page=${p}&pageSize=10`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const total = response.headers.get('X-Total-Count');
      setTotalCount(total ? parseInt(total, 10) : 0);
      if (!response.ok) {
        const t = await response.text();
        throw new Error(t || `Request failed: ${response.status}`);
      }
      const raw = await response.text();
      setVisitations(raw ? JSON.parse(raw) : []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchVisitations(page); }, [residentId, page]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#2d3748' }}>
          Home Visitations ({totalCount})
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#2b6cb0', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
        >
          {showForm ? 'Cancel' : '+ Log Visit'}
        </button>
      </div>

      {showForm && (
        <HomeVisitationForm
          residentId={residentId}
          onSuccess={() => { setShowForm(false); fetchVisitations(1); setPage(1); }}
        />
      )}

      {isLoading ? (
        <div style={{ color: '#a0aec0', textAlign: 'center', padding: '2rem' }}>Loading…</div>
      ) : visitations.length === 0 ? (
        <div style={{ color: '#a0aec0', textAlign: 'center', padding: '2rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          No home visitations logged yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {visitations.map((v) => (
            <div key={v.visitationId} style={recordCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: '#1a365d', fontSize: '0.9rem' }}>
                    {new Date(v.visitDate).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <Badge text={v.visitType} color="#2b6cb0" />
                  {v.safetyConcernsNoted && <Badge text="Safety Concern" color="#c53030" />}
                </div>
                <span style={{ fontSize: '0.8rem', color: '#718096' }}>by {v.socialWorker}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#4a5568', marginBottom: '0.4rem' }}>
                <strong>Location:</strong> {v.locationVisited} &nbsp;|&nbsp;
                <strong>Family Cooperation:</strong> {v.familyCooperationLevel}
              </div>
              {v.observations && (
                <div style={{ fontSize: '0.85rem', color: '#4a5568', lineHeight: 1.6 }}>
                  {v.observations.length > 300 ? v.observations.slice(0, 300) + '…' : v.observations}
                </div>
              )}
              <div style={{ marginTop: '0.4rem', fontSize: '0.82rem' }}>
                <strong>Outcome:</strong> <span style={{ color: '#4a5568' }}>{v.visitOutcome}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {Math.ceil(totalCount / 10) > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <PaginationBtn label="← Prev" disabled={page <= 1} onClick={() => setPage(p => p - 1)} />
          <span style={{ alignSelf: 'center', fontSize: '0.875rem', color: '#4a5568' }}>
            Page {page} of {Math.ceil(totalCount / 10)}
          </span>
          <PaginationBtn label="Next →" disabled={page >= Math.ceil(totalCount / 10)} onClick={() => setPage(p => p + 1)} />
        </div>
      )}
    </div>
  );
}

function CaseConferencesTab({ residentId }: { residentId: number }) {
  const [conferences, setConferences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  const fetchConferences = async (p = 1) => {
    setIsLoading(true);
    setError('');
    try {
      const base = getApiBase();
      if (!base) throw new Error('API URL is not configured.');
      const response = await fetch(
        `${base}/caseconferences?residentId=${residentId}&page=${p}&pageSize=10`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const total = response.headers.get('X-Total-Count');
      setTotalCount(total ? parseInt(total, 10) : 0);
      if (!response.ok) {
        const t = await response.text();
        throw new Error(t || `Request failed: ${response.status}`);
      }
      const raw = await response.text();
      setConferences(raw ? JSON.parse(raw) : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load case conferences.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchConferences(page); }, [residentId, page]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#2d3748' }}>
          Case Conferences ({totalCount})
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#2b6cb0', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
        >
          {showForm ? 'Cancel' : '+ Schedule Conference'}
        </button>
      </div>

      {showForm && (
        <CaseConferenceForm
          residentId={residentId}
          onSuccess={() => { setShowForm(false); fetchConferences(1); setPage(1); }}
        />
      )}

      {error && <div style={{ color: '#c53030', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</div>}

      {isLoading ? (
        <div style={{ color: '#a0aec0', textAlign: 'center', padding: '2rem' }}>Loading…</div>
      ) : conferences.length === 0 ? (
        <div style={{ color: '#a0aec0', textAlign: 'center', padding: '2rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          No case conferences logged yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {conferences.map((c) => (
            <div key={c.conferenceId} style={recordCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: '#1a365d', fontSize: '0.9rem' }}>
                    {new Date(c.conferenceDate).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <Badge text={c.conferenceType} color="#2b6cb0" />
                  <Badge text={c.status} color={c.status === 'Completed' ? '#38a169' : c.status === 'Cancelled' ? '#c53030' : '#805ad5'} />
                </div>
                <span style={{ fontSize: '0.8rem', color: '#718096' }}>Facilitator: {c.facilitator}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#4a5568', lineHeight: 1.6 }}>
                <strong>Agenda:</strong> {c.agenda}
              </div>
              {c.summaryNotes && (
                <div style={{ marginTop: '0.4rem', fontSize: '0.82rem', color: '#4a5568' }}>
                  <strong>Summary:</strong> {c.summaryNotes}
                </div>
              )}
              {c.followUpActions && (
                <div style={{ marginTop: '0.4rem', fontSize: '0.82rem', color: '#718096' }}>
                  <strong>Follow-up:</strong> {c.followUpActions}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {Math.ceil(totalCount / 10) > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <PaginationBtn label="← Prev" disabled={page <= 1} onClick={() => setPage(p => p - 1)} />
          <span style={{ alignSelf: 'center', fontSize: '0.875rem', color: '#4a5568' }}>
            Page {page} of {Math.ceil(totalCount / 10)}
          </span>
          <PaginationBtn label="Next →" disabled={page >= Math.ceil(totalCount / 10)} onClick={() => setPage(p => p + 1)} />
        </div>
      )}
    </div>
  );
}

function ProcessRecordingForm({ residentId, onSuccess }: { residentId: number; onSuccess: () => void }) {
  const [form, setForm] = useState({
    sessionDate: new Date().toISOString().split('T')[0],
    socialWorker: '',
    sessionType: 'Individual',
    sessionDurationMinutes: 60,
    emotionalStateObserved: '',
    emotionalStateEnd: '',
    sessionNarrative: '',
    interventionsApplied: '',
    followUpActions: '',
    progressNoted: false,
    concernsFlagged: false,
    referralMade: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.socialWorker.trim() || !form.emotionalStateObserved.trim() || !form.sessionNarrative.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/processrecordings', { ...form, residentId });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recording.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ ...formStyle, marginBottom: '1.5rem' }}>
      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a365d', marginBottom: '1rem' }}>New Process Recording</h4>
      {error && <div style={errorStyle}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <FormField label="Session Date*" type="date" value={form.sessionDate} onChange={(v) => setForm(f => ({ ...f, sessionDate: v }))} />
        <FormField label="Social Worker*" type="text" value={form.socialWorker} onChange={(v) => setForm(f => ({ ...f, socialWorker: v }))} placeholder="Name" />
        <div>
          <label style={labelStyle}>Session Type</label>
          <select value={form.sessionType} onChange={(e) => setForm(f => ({ ...f, sessionType: e.target.value }))} style={selectStyle}>
            <option>Individual</option>
            <option>Group</option>
            <option>Family</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <FormField label="Emotional State (Start)*" type="text" value={form.emotionalStateObserved} onChange={(v) => setForm(f => ({ ...f, emotionalStateObserved: v }))} placeholder="e.g. Anxious, withdrawn" />
        <FormField label="Emotional State (End)*" type="text" value={form.emotionalStateEnd} onChange={(v) => setForm(f => ({ ...f, emotionalStateEnd: v }))} placeholder="e.g. Calmer, more open" />
      </div>
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={labelStyle}>Session Narrative*</label>
        <textarea value={form.sessionNarrative} onChange={(e) => setForm(f => ({ ...f, sessionNarrative: e.target.value }))} rows={4} required style={{ ...inputStyle, resize: 'vertical' }} placeholder="Document session observations and interactions…" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <label style={labelStyle}>Interventions Applied</label>
          <textarea value={form.interventionsApplied} onChange={(e) => setForm(f => ({ ...f, interventionsApplied: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <div>
          <label style={labelStyle}>Follow-up Actions</label>
          <textarea value={form.followUpActions} onChange={(e) => setForm(f => ({ ...f, followUpActions: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <CheckField label="Progress Noted" checked={form.progressNoted} onChange={(v) => setForm(f => ({ ...f, progressNoted: v }))} />
        <CheckField label="Concerns Flagged" checked={form.concernsFlagged} onChange={(v) => setForm(f => ({ ...f, concernsFlagged: v }))} />
        <CheckField label="Referral Made" checked={form.referralMade} onChange={(v) => setForm(f => ({ ...f, referralMade: v }))} />
      </div>
      <button type="submit" disabled={submitting} style={submitBtnStyle(submitting)}>
        {submitting ? 'Saving…' : 'Save Recording'}
      </button>
    </form>
  );
}

function HomeVisitationForm({ residentId, onSuccess }: { residentId: number; onSuccess: () => void }) {
  const [form, setForm] = useState({
    visitDate: new Date().toISOString().split('T')[0],
    socialWorker: '',
    visitType: 'Routine Follow-Up',
    locationVisited: '',
    familyMembersPresent: '',
    purpose: '',
    observations: '',
    familyCooperationLevel: 'Cooperative',
    safetyConcernsNoted: false,
    followUpNeeded: false,
    followUpNotes: '',
    visitOutcome: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.socialWorker.trim() || !form.locationVisited.trim() || !form.purpose.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/homevisitations', { ...form, residentId });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save visit.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ ...formStyle, marginBottom: '1.5rem' }}>
      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a365d', marginBottom: '1rem' }}>Log Home Visit</h4>
      {error && <div style={errorStyle}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <FormField label="Visit Date*" type="date" value={form.visitDate} onChange={(v) => setForm(f => ({ ...f, visitDate: v }))} />
        <FormField label="Social Worker*" type="text" value={form.socialWorker} onChange={(v) => setForm(f => ({ ...f, socialWorker: v }))} placeholder="Name" />
        <div>
          <label style={labelStyle}>Visit Type</label>
          <select value={form.visitType} onChange={(e) => setForm(f => ({ ...f, visitType: e.target.value }))} style={selectStyle}>
            {['Initial Assessment', 'Routine Follow-Up', 'Reintegration Assessment', 'Post-Placement Monitoring', 'Emergency'].map(t => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <FormField label="Location Visited*" type="text" value={form.locationVisited} onChange={(v) => setForm(f => ({ ...f, locationVisited: v }))} />
        <FormField label="Family Members Present" type="text" value={form.familyMembersPresent} onChange={(v) => setForm(f => ({ ...f, familyMembersPresent: v }))} />
      </div>
      <div style={{ marginBottom: '0.75rem' }}>
        <FormField label="Purpose*" type="text" value={form.purpose} onChange={(v) => setForm(f => ({ ...f, purpose: v }))} />
      </div>
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={labelStyle}>Observations</label>
        <textarea value={form.observations} onChange={(e) => setForm(f => ({ ...f, observations: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <label style={labelStyle}>Family Cooperation Level</label>
          <select value={form.familyCooperationLevel} onChange={(e) => setForm(f => ({ ...f, familyCooperationLevel: e.target.value }))} style={selectStyle}>
            {['Cooperative', 'Partially Cooperative', 'Uncooperative', 'Not Present'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <FormField label="Visit Outcome" type="text" value={form.visitOutcome} onChange={(v) => setForm(f => ({ ...f, visitOutcome: v }))} />
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem' }}>
        <CheckField label="Safety Concerns Noted" checked={form.safetyConcernsNoted} onChange={(v) => setForm(f => ({ ...f, safetyConcernsNoted: v }))} />
        <CheckField label="Follow-up Needed" checked={form.followUpNeeded} onChange={(v) => setForm(f => ({ ...f, followUpNeeded: v }))} />
      </div>
      {form.followUpNeeded && (
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={labelStyle}>Follow-up Notes</label>
          <textarea value={form.followUpNotes} onChange={(e) => setForm(f => ({ ...f, followUpNotes: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
      )}
      <button type="submit" disabled={submitting} style={submitBtnStyle(submitting)}>
        {submitting ? 'Saving…' : 'Save Visit'}
      </button>
    </form>
  );
}

function CaseConferenceForm({ residentId, onSuccess }: { residentId: number; onSuccess: () => void }) {
  const [form, setForm] = useState({
    conferenceDate: new Date().toISOString().split('T')[0],
    conferenceType: 'Case Conference',
    status: 'Planned',
    facilitator: '',
    agenda: '',
    summaryNotes: '',
    followUpActions: '',
    nextConferenceDate: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.facilitator.trim() || !form.agenda.trim()) {
      setError('Facilitator and agenda are required.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/caseconferences', {
        residentId,
        conferenceDate: form.conferenceDate,
        conferenceType: form.conferenceType,
        status: form.status,
        facilitator: form.facilitator,
        agenda: form.agenda,
        summaryNotes: form.summaryNotes || null,
        followUpActions: form.followUpActions || null,
        nextConferenceDate: form.nextConferenceDate || null,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save conference.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ ...formStyle, marginBottom: '1.5rem' }}>
      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a365d', marginBottom: '1rem' }}>Schedule Case Conference</h4>
      {error && <div style={errorStyle}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <FormField label="Conference Date*" type="date" value={form.conferenceDate} onChange={(v) => setForm(f => ({ ...f, conferenceDate: v }))} />
        <div>
          <label style={labelStyle}>Type</label>
          <select value={form.conferenceType} onChange={(e) => setForm(f => ({ ...f, conferenceType: e.target.value }))} style={selectStyle}>
            <option>Case Conference</option>
            <option>Multidisciplinary Review</option>
            <option>Family Conference</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} style={selectStyle}>
            <option>Planned</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <FormField label="Facilitator*" type="text" value={form.facilitator} onChange={(v) => setForm(f => ({ ...f, facilitator: v }))} />
        <FormField label="Next Conference Date" type="date" value={form.nextConferenceDate} onChange={(v) => setForm(f => ({ ...f, nextConferenceDate: v }))} />
      </div>
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={labelStyle}>Agenda*</label>
        <textarea value={form.agenda} onChange={(e) => setForm(f => ({ ...f, agenda: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <label style={labelStyle}>Summary Notes</label>
          <textarea value={form.summaryNotes} onChange={(e) => setForm(f => ({ ...f, summaryNotes: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <div>
          <label style={labelStyle}>Follow-up Actions</label>
          <textarea value={form.followUpActions} onChange={(e) => setForm(f => ({ ...f, followUpActions: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
      </div>
      <button type="submit" disabled={submitting} style={submitBtnStyle(submitting)}>
        {submitting ? 'Saving…' : 'Save Conference'}
      </button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 card-shadow">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-1.5 flex flex-wrap gap-2 text-sm">
      <span className="min-w-[140px] shrink-0 text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.2rem 0.6rem',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: 600,
      backgroundColor: `${color}18`,
      color,
    }}>
      {text}
    </span>
  );
}

function FormField({ label, type, value, onChange, placeholder }: { label: string; type: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
    </div>
  );
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.875rem', color: '#4a5568' }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function PaginationBtn({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: '0.4rem 0.9rem', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: disabled ? '#f7fafc' : 'white', color: disabled ? '#a0aec0' : '#2b6cb0', cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 500, fontSize: '0.875rem' }}>
      {label}
    </button>
  );
}

function LoadingState() {
  return <div style={{ padding: '3rem', textAlign: 'center', color: '#a0aec0' }}>Loading…</div>;
}

function ErrorState({ message }: { message: string }) {
  return (
    <div style={{ padding: '2rem', color: '#c53030', backgroundColor: '#fff5f5', borderRadius: '8px', border: '1px solid #fed7d7' }}>
      {message}
    </div>
  );
}

const recordCardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '8px',
  padding: '1rem 1.25rem',
  border: '1px solid #e2e8f0',
};

const formStyle: React.CSSProperties = {
  backgroundColor: '#ebf8ff',
  borderRadius: '8px',
  padding: '1.25rem',
  border: '1px solid #bee3f8',
};

const errorStyle: React.CSSProperties = {
  padding: '0.6rem',
  backgroundColor: '#fff5f5',
  color: '#c53030',
  borderRadius: '4px',
  marginBottom: '0.75rem',
  fontSize: '0.875rem',
  border: '1px solid #fed7d7',
};

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
  backgroundColor: 'white',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
};

const submitBtnStyle = (disabled: boolean): React.CSSProperties => ({
  padding: '0.6rem 1.5rem',
  backgroundColor: disabled ? '#a0aec0' : '#2b6cb0',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontWeight: 600,
  fontSize: '0.875rem',
});
