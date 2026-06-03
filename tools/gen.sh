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
OMICRON_SHA=$(head -n 1 "$ROOT_DIR/OMICRON_VERSION")
DEST_DIR="$ROOT_DIR/oxide-api/src"

SPEC_BASE="https://raw.githubusercontent.com/oxidecomputer/omicron/$OMICRON_SHA/openapi/nexus"
SPEC_CACHE_DIR="/tmp/openapi-gen-ts-schemas"

# Create cache directory if it doesn't exist
mkdir -p "$SPEC_CACHE_DIR"

SPEC_FILE="$SPEC_CACHE_DIR/$OMICRON_SHA.json"

# Download spec only if not already cached
if [ ! -f "$SPEC_FILE" ]; then
  echo "Downloading spec for $OMICRON_SHA..."
  # nexus-latest.json is a symlink that contains the actual spec filename
  LATEST_SPEC=$(curl --fail "$SPEC_BASE/nexus-latest.json")
  curl --fail "$SPEC_BASE/$LATEST_SPEC" -o "$SPEC_FILE"
else
  echo "Using cached spec for $OMICRON_SHA"
fi

rm -f "$DEST_DIR/*" # remove after we add --clean flag to generator

# note no features, API client only
npx tsx "$ROOT_DIR/oxide-openapi-gen-ts/src/index.ts" $SPEC_FILE $DEST_DIR

# prepend HEADER to generated files that don't emit it themselves
for f in Api.ts date-parsers.ts; do
  FILE="$DEST_DIR/$f"
  (printf '%s\n\n' "$HEADER"; cat "$FILE") > "${FILE}.tmp"
  mv "${FILE}.tmp" "$FILE"
done

npx prettier@3.2.5 --write --log-level error "$DEST_DIR"
