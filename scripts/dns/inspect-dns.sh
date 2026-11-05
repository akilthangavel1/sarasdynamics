#!/usr/bin/env bash
set -euo pipefail

DOMAIN="sarasdynamics.com"
echo "=========================================================="
echo " AWS Route 53 DNS Inspection - ${DOMAIN}"
echo "=========================================================="

# 1. Verify AWS CLI
echo "[1/5] Checking AWS CLI installation..."
if ! command -v aws &>/dev/null; then
  echo "[-] ERROR: AWS CLI is not installed or not in PATH."
  exit 1
fi
echo "[+] AWS CLI found: $(aws --version)"

# 2. Check Caller Identity
echo ""
echo "[2/5] Verifying AWS Identity..."
IDENTITY=$(aws sts get-caller-identity --output json)
ACCOUNT=$(echo "$IDENTITY" | grep -o '"Account": "[^"]*' | cut -d'"' -f4)
ARN=$(echo "$IDENTITY" | grep -o '"Arn": "[^"]*' | cut -d'"' -f4)
echo "[+] Authenticated as Account: ${ACCOUNT}"
echo "[+] ARN: ${ARN}"

# 3. Retrieve Hosted Zone
echo ""
echo "[3/5] Locating Route 53 Hosted Zone for ${DOMAIN}..."
HOSTED_ZONE_JSON=$(aws route53 list-hosted-zones-by-name --dns-name "${DOMAIN}" --max-items 1 --output json)
ZONE_ID=$(echo "$HOSTED_ZONE_JSON" | grep -o '"Id": "/hostedzone/[^"]*' | head -n 1 | cut -d'/' -f3)

if [ -z "${ZONE_ID}" ]; then
  echo "[-] ERROR: Hosted Zone for ${DOMAIN} not found."
  exit 1
fi
echo "[+] Found Hosted Zone ID: ${ZONE_ID}"

# 4. List All Records
echo ""
echo "[4/5] Retrieving all existing DNS records..."
RECORDS_JSON=$(aws route53 list-resource-record-sets --hosted-zone-id "${ZONE_ID}" --output json)

echo "----------------------------------------------------------"
echo " Existing Route 53 Record Sets:"
echo "----------------------------------------------------------"
python3 -c "
import json, sys
data = json.loads('''${RECORDS_JSON}''')
for r in data.get('ResourceRecordSets', []):
    name = r.get('Name')
    rtype = r.get('Type')
    ttl = r.get('TTL', '-')
    vals = [v.get('Value') for v in r.get('ResourceRecords', [])]
    print(f' • {name:<32} {rtype:<6} TTL: {str(ttl):<6} Values: {vals}')
"

# 5. Conflict Analysis
echo ""
echo "[5/5] Checking for potential conflicts with GoDaddy records..."
python3 -c "
import json
data = json.loads('''${RECORDS_JSON}''')
existing_types = {}
for r in data.get('ResourceRecordSets', []):
    key = (r['Name'].rstrip('.'), r['Type'])
    existing_types[key] = [v['Value'] for v in r.get('ResourceRecords', [])]

godaddy_checks = [
    ('sarasdynamics.com', 'TXT'),
    ('_dmarc.sarasdynamics.com', 'TXT'),
    ('sarasdynamics.com', 'MX'),
    ('email.sarasdynamics.com', 'CNAME'),
    ('secureserver1._domainkey.sarasdynamics.com', 'CNAME'),
    ('secureserver2._domainkey.sarasdynamics.com', 'CNAME'),
    ('_autodiscover._tcp.sarasdynamics.com', 'SRV'),
]

has_conflict = False
for host, rtype in godaddy_checks:
    if (host, rtype) in existing_types:
        print(f' [!] ATTENTION: Record already exists: {host} [{rtype}] -> {existing_types[(host, rtype)]}')
        has_conflict = True
    else:
        print(f' [+] No conflict: {host} [{rtype}] does not currently exist.')

if not has_conflict:
    print('\n[+] ZERO CONFLICTS DETECTED. All GoDaddy records can be cleanly added.')
"

echo "=========================================================="
echo " Inspection Complete."
echo "=========================================================="

