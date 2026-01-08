#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, you can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright Oxide Computer Company

set -o errexit
set -o pipefail

HEADER=$(cat <<'EOF'
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

EOF
)

ROOT_DIR="$(dirname "$0")/.."
OMICRON_SHA=$(cat "$ROOT_DIR/OMICRON_VERSION")
DEST_DIR="$ROOT_DIR/oxide-api/src"

SPEC_LATEST_URL="https://raw.githubusercontent.com/oxidecomputer/omicron/$OMICRON_SHA/openapi/nexus/nexus-latest.json"
SPEC_CACHE_DIR="/tmp/openapi-gen-ts-schemas"

# Create cache directory if it doesn't exist
mkdir -p "$SPEC_CACHE_DIR"

# nexus-latest.json is a symlink that contains the actual spec filename
SPEC_FILENAME=$(curl --fail "$SPEC_LATEST_URL")
SPEC_FILE="$SPEC_CACHE_DIR/$OMICRON_SHA-$SPEC_FILENAME"
SPEC_URL="https://raw.githubusercontent.com/oxidecomputer/omicron/$OMICRON_SHA/openapi/nexus/$SPEC_FILENAME"

# Download spec only if not already cached
if [ ! -f "$SPEC_FILE" ]; then
  echo "Downloading spec for $OMICRON_SHA ($SPEC_FILENAME)..."
  curl --fail "$SPEC_URL" -o "$SPEC_FILE"
else
  echo "Using cached spec for $OMICRON_SHA ($SPEC_FILENAME)"
fi

rm -f "$DEST_DIR/*" # remove after we add --clean flag to generator

# note no features, API client only
npx tsx "$ROOT_DIR/oxide-openapi-gen-ts/src/index.ts" $SPEC_FILE $DEST_DIR

# prepend HEADER to Api.ts
API_FILE="$DEST_DIR/Api.ts"
(printf '%s\n\n' "$HEADER"; cat "$API_FILE") > "${API_FILE}.tmp"
mv "${API_FILE}.tmp" "$API_FILE"

npx prettier@3.2.5 --write --log-level error "$DEST_DIR"
