# `@oxide/api`

TypeScript SDK for the [Oxide](https://oxide.computer/) API.

* Generated from OpenAPI with
[`@oxide/openapi-gen-ts`](https://github.com/oxidecomputer/oxide.ts/tree/main/oxide-openapi-gen-ts)
* No dependencies; built on the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
* Works in the browser, Node.js, Deno, Bun, or any other JS runtime that supports Fetch
* Used by the Oxide [web console](https://github.com/oxidecomputer/console)

Read the API docs at https://docs.oxide.computer.

## Versions

Make sure to use the SDK compatible with your Oxide system version.

| System version | `@oxide/api` version | npm tag |
| --- | --- | --- |
| [18](https://docs.oxide.computer/release-notes/system/18) | 0.5.1 | `rel18` |

## Usage

### Installation

```
npm install @oxide/api
```

### Getting an API token

The easiest way to get a device token is to use the CLI.

```
oxide auth login --host https://my-oxide-rack.com
```

You can find the generated token in `~/.config/oxide/credentials.toml`
(`%USERPROFILE%\.config\oxide\credentials.toml` on Windows).

In the following example, the token is passed to the script through the
`OXIDE_TOKEN` environment variable on the assumption that you don't want to
hard-code a token into a script, but this can of course be done however you
want. `OXIDE_TOKEN` is not a special variable for the TypeScript SDK — it must
be read explicitly by your code.

### Example

```ts
import Oxide from "@oxide/api"

const oxide = new Oxide({
  host: "https://my-oxide-rack.com",
  token: process.env.OXIDE_TOKEN,
})

const result = await oxide.methods.projectList({})

if (result.type === "success") {
  console.log(result.data.items.map((p) => p.name))
}
```

### Methods

All API endpoints are available on `oxide.methods`. Each method takes an object
with `path`, `query`, and `body` fields as appropriate, plus an optional second
argument for extra `fetch` options (headers, signal, etc.). Method names are
camelCase versions of the operation IDs in the OpenAPI spec. Note that the first
argument is always required, even for endpoints with no parameters — pass `{}`.

### Request bodies

Field names in request bodies and query params are written in camelCase in your
code and automatically converted by the client to the snake_case expected by the
API. `Date` objects are serialized to ISO 8601 strings.

### Responses: `ApiResult<T>`

Every API method returns `Promise<ApiResult<T>>`, a discriminated union you can
narrow on `type`:

- `"success"` — `{ data: T, response: Response }`
- `"error"` — `{ data: ErrorBody, response: Response }` for 4xx/5xx responses
- `"client_error"` — `{ error: Error, response: Response, text: string }` for
  rare JSON parsing failures or other client-side issues

### Types

All request and response types from the API are exported at top level:

```ts
import type { Instance, ProjectCreate } from "@oxide/api"
```

### Specifying resources by name or ID

IDs are globally unique, so they can specify a resource on their own. When using
a name, however, you must specify the parent resource if there is one. For
example, projects are a top-level resource within the user silo, so they can be
selected by name alone. Instances and other project-level resources only have
unique names within the project, so you can either select directly by ID or by
the combination of instance name and project name/ID.

```ts
// Project: name is sufficient
// Path: /v1/projects/my-project
oxide.methods.projectView({
  path: { project: "my-project" },
})

// Instance by name: project is needed
// Path: /v1/instances/my-instance?project=my-project
oxide.methods.instanceView({
  path: { instance: "my-instance" },
  query: { project: "my-project" },
})

// Instance by ID: no project needed
// Path: /v1/instances/9c80740f-cba6-4ca2-8d96-ef5c78006499
oxide.methods.instanceView({
  path: { instance: "9c80740f-cba6-4ca2-8d96-ef5c78006499" },
})
```

API methods accept the identifier of the target resource in a path param, but
the parent specifiers go in query params. This corresponds to the way the URL
paths are constructed.

Read more about [Resource
Identifiers](https://docs.oxide.computer/api/guides/resource-identifiers) in the
docs.

### Pagination

List endpoints accept `limit` and `pageToken` query params. All list responses
have the same shape: `{ items: T[], nextPage?: string }`. If `nextPage` is
present, there are more results. 100 is the default page size when no `limit` is
passed.

```ts
const page1 = await oxide.methods.instanceList({
  query: { project: "my-project", limit: 10 },
})
if (page1.type === "success" && page1.data.nextPage) {
  const page2 = await oxide.methods.instanceList({
    query: { project: "my-project", limit: 10, pageToken: page1.data.nextPage },
  })
}
```

