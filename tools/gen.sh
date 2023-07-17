#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, you can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright Oxide Computer Company

set -o errexit
set -o pipefail

HELP="$(
	cat <<EOF
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

node -r esbuild-register generator/index.ts $SPEC_DESTINATION $2
