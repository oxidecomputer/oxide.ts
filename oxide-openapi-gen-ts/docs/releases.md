# Releasing this library

This is a spot for documentation not useful to the end user.

## Publishing to npm

This will change when we figure out automatic publishing from GH actions.

```
npm version <bump-type>

# now commit and push that because we don't want to publish things that aren't
# on github

# now build and publish
npm run build # runs tsup and outputs in dist
npm publish
```

## Generating the client in this repo

```bash
# optional: update omicron sha in OMICRON_VERSION
./tools/gen.sh
```
