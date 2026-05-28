#!/usr/bin/env python3
"""
Upload local images to GitHub PR content (user-attachments CDN).

GitHub has no public API for this; uploads use the same internal flow as the
web UI (drag-and-drop in PR description / issue comment). A browser session
cookie is required.

Usage:
  export GITHUB_USER_SESSION="<user_session cookie value from github.com>"
  python3 .github/scripts/upload-pr-content-images.py image1.png image2.png

Or authenticate gh CLI as a user with repo write access and export the cookie:
  GITHUB_USER_SESSION=$(python3 -c "import browser_cookie3; ...")

Prints markdown lines to stdout: ![filename](https://github.com/user-attachments/assets/...)
"""

from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

import requests

OWNER = "logto-io"
REPO = "logto"


def get_user_session() -> str:
    session = os.environ.get("GITHUB_USER_SESSION") or os.environ.get("GH_USER_SESSION")
    if not session:
        raise SystemExit(
            "GITHUB_USER_SESSION is required (github.com cookie: user_session).\n"
            "GitHub App / ghs_ tokens cannot upload PR content images."
        )
    return session.strip()


def make_session(user_session: str) -> requests.Session:
    client = requests.Session()
    client.headers.update(
        {
            "User-Agent": "logto-upload-pr-content-images",
            "Accept": "text/html,application/json",
        }
    )
    client.cookies.set("user_session", user_session, domain=".github.com")
    client.cookies.set(
        "__Host-user_session_same_site",
        user_session,
        domain="github.com",
    )
    return client


def get_upload_token(client: requests.Session) -> str:
    page = client.get(f"https://github.com/{OWNER}/{REPO}")
    page.raise_for_status()
    match = re.search(r'"uploadToken":"([^"]+)"', page.text)
    if not match:
        raise RuntimeError(
            f"uploadToken not found — does this session have write access to {OWNER}/{REPO}?"
        )
    return match.group(1)


def get_repository_id() -> str:
    token = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    headers = {"Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    response = requests.get(
        f"https://api.github.com/repos/{OWNER}/{REPO}",
        headers=headers,
        timeout=30,
    )
    response.raise_for_status()
    return str(response.json()["id"])


def upload_image(
    client: requests.Session,
    *,
    upload_token: str,
    repo_id: str,
    file_path: Path,
) -> str:
    referer = f"https://github.com/{OWNER}/{REPO}"
    headers = {
        "accept": "application/json",
        "origin": "https://github.com",
        "referer": referer,
        "x-requested-with": "XMLHttpRequest",
    }

    size = file_path.stat().st_size
    content_type = "image/png" if file_path.suffix.lower() == ".png" else "image/jpeg"

    policy_resp = client.post(
        "https://github.com/upload/policies/assets",
        headers=headers,
        data={
            "name": file_path.name,
            "size": str(size),
            "content_type": content_type,
            "authenticity_token": upload_token,
            "repository_id": repo_id,
        },
        timeout=60,
    )
    if policy_resp.status_code != 201:
        raise RuntimeError(
            f"upload policy failed ({policy_resp.status_code}): {policy_resp.text[:300]}"
        )

    policy = policy_resp.json()
    s3_form = policy["form"]
    s3_files = [(key, (None, value)) for key, value in s3_form.items()]
    s3_files.append(
        ("file", (file_path.name, file_path.read_bytes(), content_type)),
    )

    s3_resp = requests.post(
        policy["upload_url"],
        headers={"origin": "https://github.com"},
        files=s3_files,
        timeout=120,
    )
    if s3_resp.status_code not in (200, 204):
        raise RuntimeError(f"S3 upload failed ({s3_resp.status_code}): {s3_resp.text[:300]}")

    asset_id = policy["asset"]["id"]
    finalize_resp = client.put(
        f"https://github.com/upload/assets/{asset_id}",
        headers=headers,
        data={"authenticity_token": policy["asset_upload_authenticity_token"]},
        timeout=60,
    )
    if finalize_resp.status_code != 200:
        raise RuntimeError(
            f"finalize failed ({finalize_resp.status_code}): {finalize_resp.text[:300]}"
        )

    return finalize_resp.json()["href"]


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit(f"usage: {sys.argv[0]} <image>...")

    user_session = get_user_session()
    client = make_session(user_session)
    upload_token = get_upload_token(client)
    repo_id = get_repository_id()

    results: dict[str, str] = {}
    for arg in sys.argv[1:]:
        path = Path(arg)
        href = upload_image(
            client,
            upload_token=upload_token,
            repo_id=repo_id,
            file_path=path,
        )
        results[path.name] = href
        alt = path.stem.replace("-", " ")
        print(f"![{alt}]({href})")

    if os.environ.get("JSON_OUT"):
        print(json.dumps(results, indent=2), file=sys.stderr)


if __name__ == "__main__":
    main()
