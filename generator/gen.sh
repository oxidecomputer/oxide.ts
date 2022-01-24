#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -o xtrace

# Nexus will eventually have proper version numbers, but for now we are keyed to
# a SHA in the omicron repo
OMICRON_VERSION=$(cat ../OMICRON_VERSION)
SPEC_URL="https://raw.githubusercontent.com/oxidecomputer/omicron/$OMICRON_VERSION/openapi/nexus.json"

curl "$SPEC_URL" -o ../spec.json

npm run tsc && node index.js && rm index.js
sed -i '' 's/organizationName/orgName/g' ../Api.ts
npm run gen:fmt