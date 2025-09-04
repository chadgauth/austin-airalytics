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

export const router = t.router;
export const publicProcedure = t.procedure;
