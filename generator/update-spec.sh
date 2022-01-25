#!/usr/bin/env bash

set -o errexit
set -o pipefail

# Nexus will eventually have proper version numbers, but for now we are keyed to
# a SHA in the omicron repo
OMICRON_VERSION=$(cat ../OMICRON_VERSION)
SPEC_URL="https://raw.githubusercontent.com/oxidecomputer/omicron/$OMICRON_VERSION/openapi/nexus.json"

curl --fail "$SPEC_URL" -o ../spec.json
