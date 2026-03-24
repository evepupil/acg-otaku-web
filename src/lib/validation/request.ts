import { z } from 'zod'

export function parseSearchParams<TSchema extends z.ZodTypeAny>(
  searchParams: URLSearchParams,
  schema: TSchema
): z.infer<TSchema> {
  const data = Object.fromEntries(searchParams.entries())
  return schema.parse(data)
}

export async function parseJsonBody<TSchema extends z.ZodTypeAny>(
  request: Request,
  schema: TSchema
): Promise<z.infer<TSchema>> {
  const body = await request.json()
  return schema.parse(body)
}
