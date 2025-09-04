import { router } from "./init";
import { listingsRouter } from "./listings";

export const appRouter = router({
  listings: listingsRouter,
});

export type AppRouter = typeof appRouter;