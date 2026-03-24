import { z } from 'zod'

const envSchema = z.object({
  TURSO_DATABASE_URL: z.string().min(1),
  TURSO_AUTH_TOKEN: z.string().min(1),
  ADMIN_PASSWORD: z.string().min(1),
  ADMIN_JWT_SECRET: z.string().min(1),
  PIXIV_COOKIE: z.string().optional(),
  B2_APPLICATION_KEY_ID: z.string().optional(),
  B2_APPLICATION_KEY: z.string().optional(),
  B2_BUCKET_NAME: z.string().optional(),
  B2_BUCKET_ID: z.string().optional(),
  B2_ENDPOINT: z.string().url().optional(),
  NEXT_PUBLIC_B2_BUCKET_URL: z.string().url().optional(),
  NEXT_PUBLIC_PROXY_SERVER: z.string().url().optional(),
  SAUCENAO_API_KEY: z.string().optional(),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error('Invalid environment configuration', parsedEnv.error.flatten().fieldErrors)
  throw new Error('Invalid environment configuration')
}

export const env = parsedEnv.data
