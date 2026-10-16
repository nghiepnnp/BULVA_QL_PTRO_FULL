import { backendWithSession, forwardResponse } from "@/lib/server/backend";
import { nestRoutes } from "@package/shared";
export async function GET() { return forwardResponse(await backendWithSession(nestRoutes.me)); }
