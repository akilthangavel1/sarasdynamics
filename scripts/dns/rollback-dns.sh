#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOMAIN="sarasdynamics.com"
CHANGE_FILE="${SCRIPT_DIR}/godaddy-change-batch.json"

echo "=========================================================="
echo " AWS Route 53 - Rollback GoDaddy Email DNS Records"
echo " Domain: ${DOMAIN}"
echo "=========================================================="

if [ ! -f "${CHANGE_FILE}" ]; then
  echo "[-] ERROR: Source change batch JSON not found at ${CHANGE_FILE}"
  exit 1
fi

ROLLBACK_BATCH=$(python3 -c "
import json
data = json.load(open('${CHANGE_FILE}'))
for change in data.get('Changes', []):
    change['Action'] = 'DELETE'
data['Comment'] = 'Rollback GoDaddy Business Email DNS records'
print(json.dumps(data, indent=2))
")

ROLLBACK_FILE="${SCRIPT_DIR}/godaddy-rollback-batch.json"
echo "${ROLLBACK_BATCH}" > "${ROLLBACK_FILE}"

echo "[1/3] Generated Rollback ChangeBatch at ${ROLLBACK_FILE}"

HOSTED_ZONE_JSON=$(aws route53 list-hosted-zones-by-name --dns-name "${DOMAIN}" --max-items 1 --output json)
ZONE_ID=$(echo "$HOSTED_ZONE_JSON" | grep -o '"Id": "/hostedzone/[^"]*' | head -n 1 | cut -d'/' -f3)

echo "[2/3] Submitting Rollback to Route 53 (Hosted Zone: ${ZONE_ID})..."
CHANGE_OUTPUT=$(aws route53 change-resource-record-sets \
  --hosted-zone-id "${ZONE_ID}" \
  --change-batch "file://${ROLLBACK_FILE}" \
  --output json)

CHANGE_ID=$(echo "$CHANGE_OUTPUT" | grep -o '"Id": "/change/[^"]*' | head -n 1 | cut -d'/' -f3)
echo "[+] Rollback submitted. Change ID: /change/${CHANGE_ID}"

echo "[3/3] Waiting for Rollback to become INSYNC..."
aws route53 wait resource-record-sets-changed --id "/change/${CHANGE_ID}"

echo "[+] Rollback successfully completed and INSYNC across AWS nameservers."
echo "=========================================================="

