#!/usr/bin/env bash

set -o errexit
set -o pipefail

HELP="$(cat <<EOF
usage: ./gen.sh [spec-file] [out-file]
EOF
)"

if [[ $# != 2 ]]; then
	echo "$HELP"
	exit 2
fi

API_SOURCE="https://raw.githubusercontent.com/oxidecomputer/omicron/OMICRON_VERSION/openapi/nexus.json"
SPEC_SOURCE=$(echo $API_SOURCE | sed "s/OMICRON_VERSION/$1/g")
SPEC_DESTINATION="./spec.json"

curl --fail "$SPEC_SOURCE" -o $SPEC_DESTINATION

node -r esbuild-register lib/index.ts $SPEC_DESTINATION $2