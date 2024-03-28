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

OMICRON_SHA="$1"
DEST_DIR="$2"

SPEC_URL="https://raw.githubusercontent.com/oxidecomputer/omicron/$OMICRON_SHA/openapi/nexus.json"
SPEC_FILE="./spec.json"

# TODO: we could get rid of this DL if a test didn't rely on it
curl --fail "$SPEC_URL" -o $SPEC_FILE

node -r esbuild-register generator/index.ts $SPEC_FILE $DEST_DIR
