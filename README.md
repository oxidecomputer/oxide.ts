# oxide.ts

This repo contains a TypeScript OpenAPI client generator and a copy of the
client it generates from [Oxide's OpenAPI
spec](https://github.com/oxidecomputer/omicron/blob/main/openapi/nexus.json).
The generator is built specifically for use with specs generated by
[Dropshot](https://github.com/oxidecomputer/dropshot). It has not been tested on
any other specs and is unlikely to handle them well.

## Why a custom generator?

We tried many existing generators, and while most worked in a basic sense, we
found it hard to make customizations, whether through CLI flags, templates, or
patching with [patch-package](https://github.com/ds300/patch-package). We
decided to prototype our own TS generator after seeing other Oxide devs do the
same for Rust ([progenitor](https://github.com/oxidecomputer/progenitor) and
[oxide.rs](https://github.com/oxidecomputer/oxide.rs)) and Go
([oxide.go](https://github.com/oxidecomputer/oxide.go)). It quickly became clear
that a special-purpose generator could be dramatically simpler than a general
one, so writing one was easier than existing generators made it look.

## Repo guide

The source of the generator is in [`generator`](generator/). The core logic for
looping over the spec and creating the methods is in
[`generator/client/api.ts`](generator/client/api.ts) and the mapping from
OpenAPI schemas to TS types is in
[`generator/schema/types.ts`](generator/schema/types.ts). The mapping from
OpenAPI schemas to Zod schemas is in
[`generator/schema/zod.ts`](generator/schema/zod.ts).

The generated client can be found in [`client`](client/). The files in
[`static`](static/) are copied over to `client` as-is during generation. We
generate several distinct pieces:

| File                                        | Description                                                                                            |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [`Api.ts`](client/Api.ts)                   | A [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)-based TS client to the Oxide API |
| [`validate.ts`](client/validate.ts)         | [Zod](https://github.com/colinhacks/zod) validators for API request and response types                 |
| [`msw-handlers.ts`](client/msw-handlers.ts) | Helpers used to build a mock API with [Mock Service Worker](https://mswjs.io/) in the console repo     |

## Using the API client

We intend to publish the generated code on npm, but have not done so yet. In the
Oxide web console (the primary consumer of the TS client, not yet open source)
we use the library by generating it from a given spec version with `npm run gen-from` and versioning a full copy of the generated code in that repo.

The generated client uses the Fetch API, so in order to be used in Node.js, it
requires either Node.js v18 or a polyfill.

## Generating the client

```bash
# optional: update omicron sha in OMICRON_VERSION
npm i
npm run gen
```

The TypeScript client code will be written to [`client`](client/). Browser ready
code will be added to [`dist`](dist/).

## Contributing

We prefer to keep the generator as simple as possible and narrowly scoped to our
use case, so we can't spend much time reviewing PRs intended to expand
functionality beyond what we need. If you like this generator and want to use it
on your own specs, we recommend forking.
