import { OpenAPIV3 } from "openapi-types";
import { topologicalSort } from "../util";
import { IO } from "../io";
import { Schema } from "../schema/base";

/**
 * Returns a list of schema names sorted by dependency order.
 */
export const getSortedSchemas = (spec: OpenAPIV3.Document) => {
  return topologicalSort(
    Object.keys(spec.components?.schemas || {}).map((name) => [
      name,
      JSON.stringify(spec.components!.schemas![name])
        .match(/#\/components\/schemas\/[A-Za-z0-9]+/g)
        ?.map((s) => s.replace("#/components/schemas/", "")),
    ])
  );
};
/**
 * Convert ``[`Vpc`](crate::external_api::views::Vpc)`` or plain ``[`Vpc`]`` to
 * `{` `@link Vpc}`, but only if that name exists in the list of schemas.
 */
export const jsdocLinkify = (s: string, schemaNames: string[]) =>
  s.replace(/\[`([^`]+)`](\([^)]+\))?/g, (_, label) =>
    schemaNames.includes(label) ? `{@link ${label}}` : "`" + label + "`"
  );

export function contentRef(
  o: Schema | OpenAPIV3.RequestBodyObject | undefined
) {
  return o &&
    "content" in o &&
    o.content?.["application/json"]?.schema &&
    "$ref" in o.content["application/json"].schema
    ? o.content["application/json"].schema.$ref
    : null;
}

/**
 * Turn a description into a block comment. We use the list of `schemaNames` to
 * decide whether to turn a given crate references into an `@link`.
 */
export function docComment(
  s: string | undefined,
  schemaNames: string[],
  { w }: IO
) {
  if (s) {
    const processed = jsdocLinkify(s, schemaNames);
    w("/**");
    for (const line of processed.split("\n")) {
      w("* " + line);
    }
    w(" */");
  }
}
