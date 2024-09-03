# Releasing this library

This is a spot for documentation not useful to the end user.

## Publishing to npm

This will change when we figure out automatic publishing from GH actions.

```
npm version <bump-type>

# now commit and push that because we don't want to publish things that aren't
# on github

# now build and publish (prepublish step runs build)
npm publish

# (optional) add a tag representing the release. 
# note v10 is not allowed by npm because it parses as semver
npm dist-tag add @oxide/api@0.4.0 rel10
```

## Generating the client in this repo

```bash
# optional: update omicron sha in OMICRON_VERSION
./tools/gen.sh
```
