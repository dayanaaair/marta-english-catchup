declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    BUCKET?: R2Bucket;
    STUDENT_TOKEN: string;
    TEACHER_TOKEN: string;
  }
}
