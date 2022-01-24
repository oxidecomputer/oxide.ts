#!/usr/bin/env bash

set -o errexit
set -o pipefail

HELP="$(cat <<EOF
usage: ./update-spec.sh [omicron-sha]
EOF
)"

if [[ $# != 1 ]]; then
	echo "$HELP"
	exit 2
fi

# Nexus will eventually have proper version numbers, but for now we are keyed to
# a SHA in the omicron repo
OMICRON_VERSION="$1"
SPEC_URL="https://raw.githubusercontent.com/oxidecomputer/omicron/$OMICRON_VERSION/openapi/nexus.json"

curl --fail "$SPEC_URL" -o ../spec.json
