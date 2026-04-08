"""
Execute all ML Jupyter notebooks (nbconvert), then refresh frontend TypeScript from ml-outputs.
Run from repository root:  python ml-pipelines/run_all.py

In GitHub Actions (GITHUB_ACTIONS=true), executed notebooks are written under RUNNER_TEMP so
repo .ipynb files are not modified; CSVs still go to ml-outputs/ (paths relative to ml-pipelines).
"""
from __future__ import annotations

import os
import subprocess
import sys
import tempfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
ML_PIPELINES = REPO_ROOT / "ml-pipelines"
EXPORT_SCRIPT = ML_PIPELINES / "scripts" / "export_frontend_ml.py"

NOTEBOOKS = [
    "donor-churn-prediction.ipynb",
    "reintegration-readiness.ipynb",
    "social-donation-lift.ipynb",
    "social-engagement-prediction.ipynb",
    "supporter-next-donation.ipynb",
    "safehouse-incident-forecast.ipynb",
]

# Per-notebook cap; full run is ~few minutes on a typical laptop
EXECUTE_TIMEOUT_SEC = 1200


def main() -> None:
    if not ML_PIPELINES.is_dir():
        print("Expected ml-pipelines next to repo root.", file=sys.stderr)
        sys.exit(1)
    ci = os.environ.get("GITHUB_ACTIONS") == "true"
    nb_out_dir: Path | None = None
    if ci:
        tmp = os.environ.get("RUNNER_TEMP") or tempfile.mkdtemp()
        nb_out_dir = Path(tmp) / "ml-notebook-runs"
        nb_out_dir.mkdir(parents=True, exist_ok=True)
        print(f"CI mode: notebook outputs -> {nb_out_dir}", flush=True)
    for nb in NOTEBOOKS:
        nb_path = ML_PIPELINES / nb
        if not nb_path.is_file():
            print(f"Missing notebook: {nb_path}", file=sys.stderr)
            sys.exit(1)
        print(f"Executing {nb} ...", flush=True)
        cmd = [
            sys.executable,
            "-m",
            "nbconvert",
            "--to",
            "notebook",
            "--execute",
        ]
        if ci and nb_out_dir is not None:
            cmd.extend(["--output-dir", str(nb_out_dir)])
        else:
            cmd.append("--inplace")
        cmd.append(nb)
        subprocess.run(
            cmd,
            cwd=ML_PIPELINES,
            check=True,
            timeout=EXECUTE_TIMEOUT_SEC,
        )
    print("Exporting frontend data modules ...", flush=True)
    subprocess.run([sys.executable, str(EXPORT_SCRIPT)], cwd=REPO_ROOT, check=True)
    print("Done.", flush=True)


if __name__ == "__main__":
    main()
