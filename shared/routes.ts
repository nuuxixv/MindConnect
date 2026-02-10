import { z } from 'zod';
import { insertProfileSchema, insertTestResultSchema, insertPostSchema, insertCommentSchema, profiles, tests, testResults, posts, comments, questions } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  profiles: {
    list: {
      method: 'GET' as const,
      path: '/api/profiles' as const,
      responses: {
        200: z.array(z.custom<typeof profiles.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/profiles' as const,
      input: insertProfileSchema,
      responses: {
        201: z.custom<typeof profiles.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/profiles/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
  tests: {
    list: {
      method: 'GET' as const,
      path: '/api/tests' as const,
      responses: {
        200: z.array(z.custom<typeof tests.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/tests/:id' as const,
      responses: {
        200: z.custom<typeof tests.$inferSelect & { questions: typeof questions.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    submit: {
      method: 'POST' as const,
      path: '/api/tests/:id/submit' as const,
      input: insertTestResultSchema.omit({ userId: true, testId: true }), // Backend infers userId, testId from URL
      responses: {
        201: z.custom<typeof testResults.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  results: {
    list: {
      method: 'GET' as const,
      path: '/api/results' as const,
      responses: {
        200: z.array(z.custom<typeof testResults.$inferSelect & { test: typeof tests.$inferSelect, profile: typeof profiles.$inferSelect }>()),
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/results/:id' as const,
      responses: {
        200: z.custom<typeof testResults.$inferSelect & { test: typeof tests.$inferSelect, profile: typeof profiles.$inferSelect }>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
  community: {
    list: {
      method: 'GET' as const,
      path: '/api/posts' as const,
      responses: {
        200: z.array(z.custom<typeof posts.$inferSelect & { user: { firstName: string | null } }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/posts' as const,
      input: insertPostSchema,
      responses: {
        201: z.custom<typeof posts.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/posts/:id' as const,
      responses: {
        200: z.custom<typeof posts.$inferSelect & { user: { firstName: string | null }, comments: (typeof comments.$inferSelect & { user: { firstName: string | null } })[] }>(),
        404: errorSchemas.notFound,
      },
    },
    comment: {
      method: 'POST' as const,
      path: '/api/posts/:id/comments' as const,
      input: insertCommentSchema.omit({ userId: true, postId: true }),
      responses: {
        201: z.custom<typeof comments.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
