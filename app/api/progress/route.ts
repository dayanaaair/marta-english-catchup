import { env } from "cloudflare:workers";

type Row = { module_id: string; best_score: number; attempts: number; completed: number; mistakes: string; updated_at: string };

function validStudent(token: string | null) { return Boolean(token && token === env.STUDENT_TOKEN); }
function validTeacher(token: string | null) { return Boolean(token && token === env.TEACHER_TOKEN); }
async function readProgress() {
  const result = await env.DB.prepare("SELECT module_id, best_score, attempts, completed, mistakes, updated_at FROM course_progress WHERE student_id = ? ORDER BY id").bind("marta").all<Row>();
  return Object.fromEntries(result.results.map((row) => [row.module_id, { score: row.best_score, attempts: row.attempts, completed: Boolean(row.completed), mistakes: JSON.parse(row.mistakes), updatedAt: row.updated_at }]));
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("student");
  if (!validStudent(token)) return Response.json({ error: "invalid student link" }, { status: 401 });
  return Response.json({ progress: await readProgress() });
}

export async function POST(request: Request) {
  const body = await request.json() as { student?: string; moduleId?: string; score?: number; mistakes?: string[] };
  if (!validStudent(body.student || null)) return Response.json({ error: "invalid student link" }, { status: 401 });
  if (!body.moduleId || !Number.isFinite(body.score)) return Response.json({ error: "invalid result" }, { status: 400 });
  const score = Math.max(0, Math.min(100, Math.round(body.score!)));
  const mistakes = JSON.stringify((body.mistakes || []).slice(0, 20));
  const now = new Date().toISOString();
  await env.DB.prepare(`INSERT INTO course_progress (student_id,module_id,best_score,attempts,completed,mistakes,updated_at)
    VALUES (?,?,?,?,?,?,?) ON CONFLICT(student_id,module_id) DO UPDATE SET
    best_score=MAX(best_score,excluded.best_score), attempts=attempts+1,
    completed=MAX(completed,excluded.completed), mistakes=excluded.mistakes, updated_at=excluded.updated_at`)
    .bind("marta", body.moduleId, score, 1, score >= 80 ? 1 : 0, mistakes, now).run();
  return Response.json({ progress: await readProgress() });
}

export async function DELETE(request: Request) {
  const body = await request.json() as { teacher?: string; studentId?: string };
  if (!validTeacher(body.teacher || null)) return Response.json({ error: "invalid teacher key" }, { status: 401 });
  const studentId = body.studentId || "marta";
  await env.DB.prepare("DELETE FROM course_progress WHERE student_id = ?").bind(studentId).run();
  return Response.json({ ok: true, studentId, progress: await readProgress() });
}
