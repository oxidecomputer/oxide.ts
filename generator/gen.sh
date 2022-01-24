#!/usr/bin/env bash

set -o errexit
set -o pipefail

HELP="$(cat <<EOF
usage: ./gen.sh [spec-file]
EOF
)"

if [[ $# != 1 ]]; then
	echo "$HELP"
	exit 2
fi

npm run --silent tsc
OUTPUT=$(node index.js $1)
rm index.js
echo "$OUTPUT" | sed 's/organizationName/orgName/g'