# oxide.ts

This repo contains a TypeScript OpenAPI client generator and a copy of the
client it generates from [Oxide's OpenAPI
spec](https://github.com/oxidecomputer/omicron/blob/main/openapi/nexus.json).
The source of the generator is in [`generator`](generator/), and the generated client can be
found in [`client`](client/). We generate several distinct pieces:

| File                                        | Description                                                                                            |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [`Api.ts`](client/Api.ts)                   | A [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)-based TS client to the Oxide API |
| [`validate.ts`](client/validate.ts)         | [Zod](https://github.com/colinhacks/zod) validators for API request and response types                 |
| [`msw-handlers.ts`](client/msw-handlers.ts) | Helpers used to build a mock API with [Mock Service Workers](https://mswjs.io/) in the console repo    |

## Why a custom generator?

It's important to understand that the generator is built specifically for use
with our OpenAPI spec generated by
[Dropshot](https://github.com/oxidecomputer/dropshot). It has not been tested on
any other spec and is unlikely to work well. We would prefer to keep the
generator as simple as possible and narrowly scoped to our use case, which means
we are not likely to spend much time reviewing PRs intended to expand
functionality beyond what we need. If you like this generator and want to use it
on your own specs, we recommend forking it and maintaining your own copy. We've
found working with a custom generator much more pleasant than customizing
existing generators through their own APIs and templates.

## Using the API client

We intend to publish the generated code on npm, but have not done so yet. In the
Oxide web console (the primary consumer of the TS client, not yet open source)
we use the library by generating it from a given spec version with `npm run gen-from` and versioning a full copy of the generated code in that repo.

## Generating the client

```bash
# optional: update omicron sha in OMICRON_VERSION
npm i
npm run gen
```

The TypeScript client code will be written to [`client`](client/). Browser ready
code will be added to [`dist`](dist/).
