# Oxide TypeScript SDK

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

Then print the token:

```
oxide auth status --show-token
```

In the following example it's passed to the script through the `OXIDE_TOKEN`
environment variable on the assumption that you don't want to hard-code a token
into a script, but this can of course be done however you want. `OXIDE_TOKEN` is
not a special variable for the TypeScript SDK (it is for the CLI).

### Example

```ts
import { Api } from "@oxide/api"

const api = new Api({
  host: "https://my-oxide-rack.com",
  token: process.env.OXIDE_TOKEN,
})

const result = await api.methods.projectList({})

if (result.type === "success") {
  console.log(result.data.items.map((p) => p.name))
}
```

## How does it all work?

### Methods

### Request bodies

### Responses: `ApiResult<T>`

## Other stuff in the package

Most likely nobody but us wants this, and we should take it out of the npm package.

### Mock Service Worker API skeleton

### Zod validators
