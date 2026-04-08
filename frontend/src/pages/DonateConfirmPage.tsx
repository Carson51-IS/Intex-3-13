import { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function parseAmount(raw: string | null): number {
  if (raw == null || raw === '') return 1000;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1000;
  return n;
}

export default function DonateConfirmPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const amount = useMemo(() => parseAmount(searchParams.get('amount')), [searchParams]);

  const confirm = () => {
    navigate(`/donate/thank-you?amount=${amount}`);
  };

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-12">
      <div className="rounded-xl border bg-card p-8 card-shadow">
        <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">Confirm your donation</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{user?.email}</span>
        </p>
        <p className="mt-6 text-foreground">
          You are about to donate{' '}
          <span className="font-heading text-2xl font-bold text-primary">₱{amount.toLocaleString()}</span> to Haven
          Light Philippines. This gift helps fund safe housing, meals, therapy, and education for girls in our care.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Please confirm to complete this step. You will see a thank-you message with more about your impact next.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link
            to={{ pathname: '/', hash: 'donate' }}
            className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2.5 text-center text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Change amount
          </Link>
          <button
            type="button"
            onClick={confirm}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Confirm donation
          </button>
        </div>
      </div>
    </div>
  );
}
