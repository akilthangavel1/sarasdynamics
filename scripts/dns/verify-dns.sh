#!/usr/bin/env bash
set -euo pipefail

DOMAIN="sarasdynamics.com"
AUTH_NS="ns-717.awsdns-25.net"

echo "=========================================================="
echo " DNS Verification for ${DOMAIN} (GoDaddy Business Email)"
echo " Authoritative NS: ${AUTH_NS}"
echo "=========================================================="

echo ""
echo "--- 1. Root Domain A Record (Safety Verification) ---"
dig @"${AUTH_NS}" +short A "${DOMAIN}"

echo ""
echo "--- 2. Subdomain A Records (Safety Verification) ---"
echo "www.${DOMAIN} -> $(dig @"${AUTH_NS}" +short A "www.${DOMAIN}")"
echo "lms.${DOMAIN} -> $(dig @"${AUTH_NS}" +short A "lms.${DOMAIN}")"
echo "work.${DOMAIN} -> $(dig @"${AUTH_NS}" +short A "work.${DOMAIN}")"

echo ""
echo "--- 3. MX Records ---"
dig @"${AUTH_NS}" +short MX "${DOMAIN}"

echo ""
echo "--- 4. TXT Records (Domain Verification & SPF) ---"
dig @"${AUTH_NS}" +short TXT "${DOMAIN}"

echo ""
echo "--- 5. DMARC TXT Record ---"
dig @"${AUTH_NS}" +short TXT "_dmarc.${DOMAIN}"

echo ""
echo "--- 6. CNAME Records ---"
echo "email.${DOMAIN} -> $(dig @"${AUTH_NS}" +short CNAME "email.${DOMAIN}")"
echo "secureserver1._domainkey.${DOMAIN} -> $(dig @"${AUTH_NS}" +short CNAME "secureserver1._domainkey.${DOMAIN}")"
echo "secureserver2._domainkey.${DOMAIN} -> $(dig @"${AUTH_NS}" +short CNAME "secureserver2._domainkey.${DOMAIN}")"

echo ""
echo "--- 7. SRV Record (Autodiscover) ---"
dig @"${AUTH_NS}" +short SRV "_autodiscover._tcp.${DOMAIN}"

echo ""
echo "=========================================================="
echo " Verification Complete."
echo "=========================================================="

