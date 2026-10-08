import { env } from "cloudflare:workers";

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  if (!key || key !== env.TEACHER_TOKEN) return Response.json({ error: "unauthorized" }, { status: 401 });
  const result = await env.DB.prepare("SELECT module_id, best_score, attempts, completed, mistakes, updated_at FROM course_progress WHERE student_id = ? ORDER BY id").bind("marta").all();
  return Response.json({ rows: result.results });
}
