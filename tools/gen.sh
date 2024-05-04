#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, you can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright Oxide Computer Company

set -o errexit
set -o pipefail

ROOT_DIR="$(dirname "$0")/.."
OMICRON_SHA=$(cat "$ROOT_DIR/OMICRON_VERSION")
DEST_DIR="$ROOT_DIR/oxide-api/src"

SPEC_URL="https://raw.githubusercontent.com/oxidecomputer/omicron/$OMICRON_SHA/openapi/nexus.json"
SPEC_FILE="./spec.json"

# TODO: we could get rid of this DL if a test didn't rely on it
curl --fail "$SPEC_URL" -o $SPEC_FILE

npx tsx "$ROOT_DIR/oxide-openapi-gen-ts/src/index.ts" $SPEC_FILE $DEST_DIR
npx prettier --write --log-level error "$DEST_DIR"
