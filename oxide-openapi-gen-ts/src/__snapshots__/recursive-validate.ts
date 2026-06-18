/* eslint-disable */

  import { z, ZodType } from 'zod/v4';
  import { processResponseBody, uniqueItems } from './util';

  /**
   * Zod only supports string enums at the moment. A previous issue was opened
   * and closed as stale but it provided a hint on how to implement it.
   *
   * @see https://github.com/colinhacks/zod/issues/1118
   * TODO: PR an update for zod to support other native enum types
   */
  const IntEnum = <T extends readonly number[]>(values: T) => 
      z.number().refine((v) => values.includes(v)) as ZodType<T[number]>;

  /** Helper to ensure booleans provided as strings end up with the correct value */
  const SafeBoolean = z.preprocess(v => v === "false" ? false : v, z.coerce.boolean())
  
import type * as Api from './Api';

export const TreeNode: ZodType<Api.TreeNode> = z.preprocess(processResponseBody,z.object({"value": z.string(),
"childNodes": z.lazy(() => TreeNode).array().optional(),
}))

export const TypeB: ZodType<Api.TypeB> = z.preprocess(processResponseBody,z.object({"label": z.string(),
"a": z.lazy(() => TypeA).optional(),
}))

export const TypeA: ZodType<Api.TypeA> = z.preprocess(processResponseBody,z.object({"name": z.string(),
"b": z.lazy(() => TypeB).optional(),
}))

export const Filter: ZodType<Api.Filter> = z.preprocess(processResponseBody,z.union([
z.object({"type": z.enum(["value"]),
"value": z.string(),
}),
z.object({"type": z.enum(["and"]),
"operands": z.lazy(() => Filter).array(),
}),
])
)

export const ExtTagged: ZodType<Api.ExtTagged> = z.preprocess(processResponseBody,z.union([
z.object({"literal": z.string(),
}),
z.object({"allOf": z.lazy(() => ExtTagged).array(),
}),
])
)

export const LinkedNode: ZodType<Api.LinkedNode> = z.preprocess(processResponseBody,z.object({"id": z.uuid(),
"timeCreated": z.coerce.date(),
"version": IntEnum([1,2] as const),
"next": z.lazy(() => LinkedNode).nullable().optional(),
}))

export const Tree: ZodType<Api.Tree> = z.preprocess(processResponseBody,z.object({"value": z.string(),
"forest": z.lazy(() => Forest).optional(),
}))

export const Forest: ZodType<Api.Forest> = z.preprocess(processResponseBody,z.lazy(() => Tree).array())

export const NodeMap: ZodType<Api.NodeMap> = z.preprocess(processResponseBody,z.object({"children": z.record(z.string(),z.lazy(() => NodeMap)).optional(),
}))

export const Plain = z.preprocess(processResponseBody,z.object({"id": z.number(),
}))

