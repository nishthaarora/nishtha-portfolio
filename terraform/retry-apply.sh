#!/usr/bin/env bash
set -euo pipefail

MAX_ATTEMPTS=10
BASE_DELAY_SECONDS=30

cd "$(dirname "$0")"

attempt=1
while (( attempt <= MAX_ATTEMPTS )); do
  echo "Attempt ${attempt}/${MAX_ATTEMPTS}: running terraform apply..."

  if terraform apply -auto-approve -input=false 2>&1 | tee /tmp/tf-apply-output.log; then
    echo "terraform apply succeeded."
    exit 0
  fi

  if grep -qi "out of host capacity\|outofcapacity" /tmp/tf-apply-output.log; then
    delay=$(( BASE_DELAY_SECONDS * attempt ))
    echo "Oracle reported insufficient capacity. Retrying in ${delay}s..."
    sleep "${delay}"
    attempt=$(( attempt + 1 ))
    continue
  fi

  echo "terraform apply failed for a reason other than capacity. Not retrying."
  exit 1
done

echo "Exhausted ${MAX_ATTEMPTS} attempts due to capacity errors. Try a different region or availability domain."
exit 1
