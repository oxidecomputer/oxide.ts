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

# If input is a valid URL then temporarily copy file locally.
# Otherwise continue to use specified file.
URL_REGEX='^(https?|ftp|file)://[-A-Za-z0-9\+&@#/%?=~_|!:,.;]*[-A-Za-z0-9\+&@#/%=~_|]\.[-A-Za-z0-9\+&@#/%?=~_|!:,.;]*[-A-Za-z0-9\+&@#/%=~_|]$'
if [[ $1 =~ $URL_REGEX ]]
then 
	OMICRON_VERSION=$(cat ../OMICRON_VERSION)
	SPEC_SOURCE=$(echo $1 | sed "s/OMICRON_VERSION/$OMICRON_VERSION/g")
	SPEC_DESTINATION="../spec.json"
	curl --fail "$SPEC_SOURCE" -o $SPEC_DESTINATION
	node index.js $SPEC_DESTINATION
	rm $SPEC_DESTINATION
else
    node index.js $1
fi

rm index.js gen-client.js