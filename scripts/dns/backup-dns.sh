#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOMAIN="sarasdynamics.com"

echo "=========================================================="
echo " AWS Route 53 DNS Backup - ${DOMAIN}"
echo "=========================================================="

HOSTED_ZONE_JSON=$(aws route53 list-hosted-zones-by-name --dns-name "${DOMAIN}" --max-items 1 --output json)
ZONE_ID=$(echo "$HOSTED_ZONE_JSON" | grep -o '"Id": "/hostedzone/[^"]*' | head -n 1 | cut -d'/' -f3)

if [ -z "${ZONE_ID}" ]; then
  echo "[-] ERROR: Hosted Zone for ${DOMAIN} not found."
  exit 1
fi

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${SCRIPT_DIR}/dns-backup-${TIMESTAMP}.json"
LATEST_FILE="${SCRIPT_DIR}/dns-backup-latest.json"

echo "[*] Exporting records from Hosted Zone: ${ZONE_ID}..."
aws route53 list-resource-record-sets --hosted-zone-id "${ZONE_ID}" --output json > "${BACKUP_FILE}"
cp "${BACKUP_FILE}" "${LATEST_FILE}"

COUNT=$(python3 -c "import json; data=json.load(open('${BACKUP_FILE}')); print(len(data.get('ResourceRecordSets', [])))")

echo "[+] Successfully saved ${COUNT} record sets to:"
echo "    ${BACKUP_FILE}"
echo "    ${LATEST_FILE}"
echo "=========================================================="

