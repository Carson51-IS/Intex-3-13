"""
Regenerate frontend/src/data/ml/*.ts from ml-outputs CSVs produced by the Jupyter pipelines.
Run from repo root or any cwd; paths are resolved from this file's location.
"""
from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
ML_OUT = REPO_ROOT / "ml-outputs"
FRONTEND_ML = REPO_ROOT / "frontend" / "src" / "data" / "ml"


def _require_columns(df: pd.DataFrame, path: Path, required: set[str]) -> None:
    missing = required - set(df.columns)
    if missing:
        sys.exit(f"{path}: missing columns {sorted(missing)}; have {list(df.columns)}")


def _snap_date(v) -> str:
    ts = pd.Timestamp(v)
    return ts.strftime("%Y-%m-%d")


def _month_ym(v) -> str:
    ts = pd.Timestamp(v)
    return ts.strftime("%Y-%m")


def _boolish(v) -> bool:
    return bool(int(v))


def _fmt_prob4(x: float) -> str:
    s = f"{float(x):.4f}".rstrip("0").rstrip(".")
    return s if s else "0"


def _fmt_float3(x: float) -> str:
    s = f"{float(x):.3f}".rstrip("0").rstrip(".")
    return s if s else "0"


def export_donor_churn() -> None:
    path = ML_OUT / "donor-churn-prediction" / "predictions.csv"
    req = {
        "supporter_id",
        "snapshot_date",
        "y_true_is_lapsed",
        "p_is_lapsed",
        "y_pred_is_lapsed",
    }
    df = pd.read_csv(path)
    _require_columns(df, path, req)
    lines = [
        "export interface DonorChurnPrediction {",
        "  supporterId: number;",
        "  snapshotDate: string;",
        "  isLapsed: boolean;",
        "  pIsLapsed: number;",
        "  predictedLapsed: boolean;",
        "}",
        "",
        "export const donorChurnPredictions: DonorChurnPrediction[] = [",
    ]
    for _, r in df.iterrows():
        lines.append(
            "  { "
            f"supporterId: {int(r['supporter_id'])}, "
            f"snapshotDate: '{_snap_date(r['snapshot_date'])}', "
            f"isLapsed: {str(_boolish(r['y_true_is_lapsed'])).lower()}, "
            f"pIsLapsed: {_fmt_prob4(r['p_is_lapsed'])}, "
            f"predictedLapsed: {str(_boolish(r['y_pred_is_lapsed'])).lower()} "
            "},"
        )
    lines.extend(
        [
            "];",
            "",
            "export function getChurnRiskLevel(p: number): 'High' | 'Medium' | 'Low' {",
            "  if (p >= 0.6) return 'High';",
            "  if (p >= 0.45) return 'Medium';",
            "  return 'Low';",
            "}",
            "",
        ]
    )
    (FRONTEND_ML / "donorChurn.ts").write_text("\n".join(lines), encoding="utf-8")


def export_supporter_donation() -> None:
    path = ML_OUT / "supporter-next-donation" / "predictions.csv"
    req = {"supporter_id", "snapshot_date", "y_true", "p_will_donate_90d", "y_pred"}
    df = pd.read_csv(path)
    _require_columns(df, path, req)
    lines = [
        "export interface SupporterDonationPrediction {",
        "  supporterId: number;",
        "  snapshotDate: string;",
        "  actualDonated: boolean;",
        "  pWillDonate90d: number;",
        "  predictedDonate: boolean;",
        "}",
        "",
        "export const supporterDonationPredictions: SupporterDonationPrediction[] = [",
    ]
    for _, r in df.iterrows():
        lines.append(
            "  { "
            f"supporterId: {int(r['supporter_id'])}, "
            f"snapshotDate: '{_snap_date(r['snapshot_date'])}', "
            f"actualDonated: {str(_boolish(r['y_true'])).lower()}, "
            f"pWillDonate90d: {_fmt_prob4(r['p_will_donate_90d'])}, "
            f"predictedDonate: {str(_boolish(r['y_pred'])).lower()} "
            "},"
        )
    lines.extend(
        [
            "];",
            "",
            "export function getDonationLikelihood(p: number): 'High' | 'Medium' | 'Low' {",
            "  if (p >= 0.5) return 'High';",
            "  if (p >= 0.2) return 'Medium';",
            "  return 'Low';",
            "}",
            "",
        ]
    )
    (FRONTEND_ML / "supporterDonation.ts").write_text("\n".join(lines), encoding="utf-8")


def export_reintegration() -> None:
    path = ML_OUT / "reintegration-readiness" / "predictions.csv"
    col_prog = "p_In Progress"
    col_ns = "p_Not Started"
    col_hold = "p_On Hold"
    req = {"resident_id", "y_true", "y_pred", "p_Completed", col_prog, col_ns, col_hold}
    df = pd.read_csv(path)
    _require_columns(df, path, req)
    lines = [
        "export interface ReintegrationPrediction {",
        "  residentId: number;",
        "  actualStatus: string;",
        "  predictedStatus: string;",
        "  pCompleted: number;",
        "  pInProgress: number;",
        "  pNotStarted: number;",
        "  pOnHold: number;",
        "}",
        "",
        "export const reintegrationPredictions: ReintegrationPrediction[] = [",
    ]
    for _, r in df.iterrows():
        yt = str(r["y_true"]).replace("'", "\\'")
        yp = str(r["y_pred"]).replace("'", "\\'")
        lines.append(
            "  { "
            f"residentId: {int(r['resident_id'])}, "
            f"actualStatus: '{yt}', "
            f"predictedStatus: '{yp}', "
            f"pCompleted: {_fmt_prob4(r['p_Completed'])}, "
            f"pInProgress: {_fmt_prob4(r[col_prog])}, "
            f"pNotStarted: {_fmt_prob4(r[col_ns])}, "
            f"pOnHold: {_fmt_prob4(r[col_hold])} "
            "},"
        )
    lines.extend(
        [
            "];",
            "",
            "export const statusColors: Record<string, string> = {",
            "  'Completed': '#38a169',",
            "  'In Progress': '#3182ce',",
            "  'Not Started': '#718096',",
            "  'On Hold': '#dd6b20',",
            "};",
            "",
        ]
    )
    (FRONTEND_ML / "reintegrationReadiness.ts").write_text("\n".join(lines), encoding="utf-8")


def export_safehouse() -> None:
    path = ML_OUT / "safehouse-incident-forecast" / "predictions.csv"
    req = {
        "safehouse_id",
        "month_start",
        "incident_count",
        "incident_count_lag1",
        "y_true_next_month",
        "y_pred_next_month",
        "abs_error",
    }
    df = pd.read_csv(path)
    _require_columns(df, path, req)
    lines = [
        "export interface SafehouseIncidentForecast {",
        "  safehouseId: number;",
        "  monthStart: string;",
        "  incidentCount: number;",
        "  incidentCountLag1: number;",
        "  actualNextMonth: number;",
        "  predictedNextMonth: number;",
        "  absError: number;",
        "}",
        "",
        "export const safehouseIncidentForecasts: SafehouseIncidentForecast[] = [",
    ]
    for _, r in df.iterrows():
        lines.append(
            "  { "
            f"safehouseId: {int(r['safehouse_id'])}, "
            f"monthStart: '{_month_ym(r['month_start'])}', "
            f"incidentCount: {int(float(r['incident_count']))}, "
            f"incidentCountLag1: {int(float(r['incident_count_lag1']))}, "
            f"actualNextMonth: {int(float(r['y_true_next_month']))}, "
            f"predictedNextMonth: {_fmt_float3(float(r['y_pred_next_month']))}, "
            f"absError: {_fmt_float3(float(r['abs_error']))} "
            "},"
        )
    lines.extend(
        [
            "];",
            "",
            "export function getLatestForecasts(): { safehouseId: number; maxPredicted: number; avgPredicted: number }[] {",
            "  const grouped = new Map<number, number[]>();",
            "  for (const f of safehouseIncidentForecasts) {",
            "    if (!grouped.has(f.safehouseId)) grouped.set(f.safehouseId, []);",
            "    grouped.get(f.safehouseId)!.push(f.predictedNextMonth);",
            "  }",
            "  return Array.from(grouped.entries()).map(([id, preds]) => ({",
            "    safehouseId: id,",
            "    maxPredicted: Math.max(...preds),",
            "    avgPredicted: preds.reduce((a, b) => a + b, 0) / preds.length,",
            "  }));",
            "}",
            "",
        ]
    )
    (FRONTEND_ML / "safehouseIncidents.ts").write_text("\n".join(lines), encoding="utf-8")


def export_social_engagement() -> None:
    path = ML_OUT / "social-engagement-prediction" / "recommended_windows.csv"
    req = {"platform", "day_of_week", "post_hour", "p_high_engagement"}
    df = pd.read_csv(path)
    _require_columns(df, path, req)
    lines = [
        "export interface EngagementWindow {",
        "  platform: string;",
        "  dayOfWeek: string;",
        "  postHour: number;",
        "  pHighEngagement: number;",
        "}",
        "",
        "export const engagementWindows: EngagementWindow[] = [",
    ]
    for _, r in df.iterrows():
        plat = str(r["platform"]).replace("'", "\\'")
        dow = str(r["day_of_week"]).replace("'", "\\'")
        lines.append(
            "  { "
            f"platform: '{plat}', "
            f"dayOfWeek: '{dow}', "
            f"postHour: {int(r['post_hour'])}, "
            f"pHighEngagement: {_fmt_prob4(r['p_high_engagement'])} "
            "},"
        )
    lines.extend(
        [
            "];",
            "",
            "export const platformColors: Record<string, string> = {",
            "  Facebook: '#1877F2',",
            "  Instagram: '#E4405F',",
            "  Twitter: '#1DA1F2',",
            "  TikTok: '#000000',",
            "  YouTube: '#FF0000',",
            "  LinkedIn: '#0A66C2',",
            "  WhatsApp: '#25D366',",
            "};",
            "",
        ]
    )
    (FRONTEND_ML / "socialEngagement.ts").write_text("\n".join(lines), encoding="utf-8")


def export_social_donation_lift() -> None:
    path = ML_OUT / "social-donation-lift" / "recommended_windows.csv"
    req = {"platform", "day_of_week", "post_hour", "pred"}
    df = pd.read_csv(path)
    _require_columns(df, path, req)
    lines = [
        "export interface DonationLiftWindow {",
        "  platform: string;",
        "  dayOfWeek: string;",
        "  postHour: number;",
        "  predictedDonationValue: number;",
        "}",
        "",
        "export const donationLiftWindows: DonationLiftWindow[] = [",
    ]
    for _, r in df.iterrows():
        plat = str(r["platform"]).replace("'", "\\'")
        dow = str(r["day_of_week"]).replace("'", "\\'")
        val = int(round(float(r["pred"])))
        lines.append(
            "  { "
            f"platform: '{plat}', "
            f"dayOfWeek: '{dow}', "
            f"postHour: {int(r['post_hour'])}, "
            f"predictedDonationValue: {val} "
            "},"
        )
    lines.extend(
        [
            "];",
            "",
            "export const platformColors: Record<string, string> = {",
            "  Facebook: '#1877F2',",
            "  Instagram: '#E4405F',",
            "  Twitter: '#1DA1F2',",
            "  TikTok: '#000000',",
            "  YouTube: '#FF0000',",
            "  LinkedIn: '#0A66C2',",
            "  WhatsApp: '#25D366',",
            "};",
            "",
        ]
    )
    (FRONTEND_ML / "socialDonationLift.ts").write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    export_donor_churn()
    export_supporter_donation()
    export_reintegration()
    export_safehouse()
    export_social_engagement()
    export_social_donation_lift()
    for name, rel in [
        ("donor churn", "donor-churn-prediction/predictions.csv"),
        ("supporter donation", "supporter-next-donation/predictions.csv"),
        ("reintegration", "reintegration-readiness/predictions.csv"),
        ("safehouse", "safehouse-incident-forecast/predictions.csv"),
        ("social engagement windows", "social-engagement-prediction/recommended_windows.csv"),
        ("social donation lift windows", "social-donation-lift/recommended_windows.csv"),
    ]:
        p = ML_OUT / rel
        df = pd.read_csv(p)
        print(f"{name}: {len(df)} rows <- {p.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
