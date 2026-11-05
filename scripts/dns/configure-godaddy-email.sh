#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOMAIN="sarasdynamics.com"
CHANGE_FILE="${SCRIPT_DIR}/godaddy-change-batch.json"

echo "=========================================================="
echo " AWS Route 53 - Deploy GoDaddy Email DNS Records"
echo " Domain: ${DOMAIN}"
echo "=========================================================="

if [ ! -f "${CHANGE_FILE}" ]; then
  echo "[-] ERROR: Change batch JSON not found at ${CHANGE_FILE}"
  exit 1
fi

echo "[1/4] Validating ChangeBatch JSON syntax..."
python3 -c "import json; json.load(open('${CHANGE_FILE}'))"
echo "[+] ChangeBatch JSON is valid."

echo ""
echo "[2/4] Locating Hosted Zone ID..."
HOSTED_ZONE_JSON=$(aws route53 list-hosted-zones-by-name --dns-name "${DOMAIN}" --max-items 1 --output json)
ZONE_ID=$(echo "$HOSTED_ZONE_JSON" | grep -o '"Id": "/hostedzone/[^"]*' | head -n 1 | cut -d'/' -f3)
echo "[+] Hosted Zone ID: ${ZONE_ID}"

echo ""
echo "[3/4] Applying Route 53 ChangeBatch..."
CHANGE_OUTPUT=$(aws route53 change-resource-record-sets \
  --hosted-zone-id "${ZONE_ID}" \
  --change-batch "file://${CHANGE_FILE}" \
  --output json)

CHANGE_ID=$(echo "$CHANGE_OUTPUT" | grep -o '"Id": "/change/[^"]*' | head -n 1 | cut -d'/' -f3)
STATUS=$(echo "$CHANGE_OUTPUT" | grep -o '"Status": "[^"]*' | head -n 1 | cut -d'"' -f4)

echo "[+] Change submitted successfully!"
echo "    Change ID: /change/${CHANGE_ID}"
echo "    Initial Status: ${STATUS}"

echo ""
echo "[4/4] Waiting for DNS changes to reach INSYNC status across AWS authoritative nameservers..."
aws route53 wait resource-record-sets-changed --id "/change/${CHANGE_ID}"

FINAL_CHECK=$(aws route53 get-change --id "/change/${CHANGE_ID}" --output json)
FINAL_STATUS=$(echo "$FINAL_CHECK" | grep -o '"Status": "[^"]*' | head -n 1 | cut -d'"' -f4)

echo "[+] Status is now: ${FINAL_STATUS}"
echo "=========================================================="
echo " Deployment Complete! Run ./verify-dns.sh to test resolution."
echo "=========================================================="

