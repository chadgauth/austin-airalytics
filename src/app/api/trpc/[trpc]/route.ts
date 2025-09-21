import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "@/lib/trpc/init";
import { appRouter } from "@/lib/trpc/root";

const handler = async (request: Request) => {
  const start = Date.now();
  console.log(`API Request: ${request.method} ${request.url}`);

  try {
    const result = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: request,
      router: appRouter,
      createContext: createTRPCContext,
    });

    const duration = Date.now() - start;
    console.log(`API Response: ${request.method} ${request.url} - ${result.status} (${duration}ms)`);

    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`API Error: ${request.method} ${request.url} (${duration}ms)`, error);
    throw error;
  }
};

export { handler as GET, handler as POST };
