---
name: npm-release
description: Bump @oxide/api to a new omicron release tag, make the PR, merge it, publish to npm, and tag the repo.
user_invocable: true
---

# npm-release: Bump @oxide/api to a new omicron release

This skill handles the full release cycle for the `@oxide/api` npm package when
a new omicron release tag appears (e.g., `rel/v19/rc0`).

## Inputs

Ask the user for:

- **Omicron release tag** (e.g., `rel/v19/rc0`). If not provided, look up the
  latest `rel/` tag on oxidecomputer/omicron via
  `gh-api-read repos/oxidecomputer/omicron/tags --jq '.[].name'` and pick the
  newest one. Confirm with the user before proceeding.
- **New `@oxide/api` version**: Always a minor bump. Read the current version
  from `oxide-api/package.json` and bump minor (e.g., `0.5.1` → `0.6.0`).

## Steps

### Phase 1: Prepare the bump

1. **Resolve the omicron tag to a commit SHA.** Omicron release tags are
   annotated tags, so you need to dereference to the underlying commit:
   ```
   gh-api-read repos/oxidecomputer/omicron/git/ref/tags/<tag> --jq '.object.sha'
   ```
   That gives you the tag object SHA. Then:
   ```
   gh-api-read repos/oxidecomputer/omicron/git/tags/<tag-object-sha> --jq '.object.sha'
   ```
   That gives you the commit SHA. Write it to `OMICRON_VERSION`.

2. **Update `OMICRON_VERSION`** with the commit SHA (just the SHA, one line,
   trailing newline).

3. **Bump version in `oxide-api/package.json`** to the agreed version. Then
   run `cd oxide-api && npm install --package-lock-only` so `package-lock.json`
   is updated to match.

4. **Update the versions table in `oxide-api/README.md`.** Add a row for the
   new release at the top of the table with the system version, `@oxide/api`
   version, and npm dist-tag.

5. **Regenerate the API client** by running `./tools/gen.sh`. This downloads
   the OpenAPI spec from the omicron commit and regenerates `oxide-api/src/`.

6. **Update test snapshots.** In `oxide-openapi-gen-ts/`, run:
   ```
   npm ci && npm test run -- --update
   ```
   This regenerates the snapshots in
   `oxide-openapi-gen-ts/src/__snapshots__/`.

7. **Run CI checks locally** to make sure everything passes:
   - `cd oxide-api && npm ci && npm run tsc`
   - `cd oxide-openapi-gen-ts && npm run tsc && npm run lint && npm run fmt:check`

### Phase 2: PR

8. **Create a branch and PR.** Use jj to create a new commit, then push a
   branch and open a PR:
   ```
   jj desc -m 'Bump API to <tag> (<version>)'
   jj git push --change @
   ```
   Then create the PR with `gh pr create`. Use a title like
   `Bump API to rel/v19/rc0 (0.6.0)` and mention the omicron tag in the body.

9. **Wait for CI.** The `update-api-spec` workflow runs on push to non-main
   branches and may create an "Autogenerate config update" commit — this is
   expected. The `validate` workflow must pass.

10. **Merge the PR** once CI is green. Confirm with the user before merging.
    ```
    gh pr merge <number> --squash
    ```

### Phase 3: Publish

11. **Publish to npm.** From `oxide-api/`:
    ```
    npm publish
    ```
    The `prepublishOnly` script runs `npm run build` (tsup) automatically.
    The user must be logged into npm with publish access to the `@oxide` scope.

12. **Add npm dist-tag.** Tag the published version with the release name so
    consumers can pin to it:
    ```
    npm dist-tag add @oxide/api@<version> rel<N>
    ```
    where `<N>` is the system release number (e.g., `19` for `rel/v19/rc0`).
    Note: bare version numbers like `v10` are not allowed by npm because they
    parse as semver — use the `rel` prefix.

13. **Tag the repo.** After the merge commit lands on main, pull and tag:
    ```
    jj git fetch
    jj tag create <tag-name> -r main
    jj git push --tag <tag-name>
    ```
    Use a tag name that matches the omicron release, e.g., `v19` for
    `rel/v19/rc0`, or ask the user what tag name they want.

### Notes

- The `@oxide/openapi-gen-ts` package version is bumped separately and less
  frequently — do not bump it as part of this flow unless the user asks.
- The version scheme for `@oxide/api` roughly follows omicron releases with
  minor bumps for new releases and patch bumps for fixes. See issue #245 for
  ongoing discussion.
- If the gen script fails to download the spec, verify the commit SHA is
  correct and that `openapi/nexus/nexus-latest.json` exists at that commit.
