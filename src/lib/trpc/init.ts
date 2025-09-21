import { initTRPC } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { treeifyError, ZodError } from "zod";

export const createTRPCContext = (opts: FetchCreateContextFnOptions) => {
  return {
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError
            ? treeifyError(error.cause)
            : null,
      },
    };
  },
});

// Logger middleware
const loggerMiddleware = t.middleware(async ({ path, type, next, input }) => {
  const start = Date.now();
  console.log(`tRPC ${type} ${path} started`, { input });

  const result = await next();

  const duration = Date.now() - start;
  if (result.ok) {
    console.log(`tRPC ${type} ${path} success`, { duration });
  } else {
    console.error(`tRPC ${type} ${path} error`, {
      duration,
      error: result.error.message,
      code: result.error.code,
    });
  }

  return result;
});

export const router = t.router;
export const publicProcedure = t.procedure.use(loggerMiddleware);

