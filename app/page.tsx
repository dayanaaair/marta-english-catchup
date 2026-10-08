"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Check, ChevronRight, LockKeyhole, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { lessons, type Question } from "@/lib/course";

type StoredProgress = Record<string, { score: number; attempts: number; completed: boolean }>;

function normalize(value: string) {
  return value.toLowerCase().trim().replace(/[.!?]/g, "").replace(/\s+/g, " ");
}

export default function Home() {
  const [studentToken, setStudentToken] = useState("");
  const [progress, setProgress] = useState<StoredProgress>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("student") || "";
    setStudentToken(token);
    if (!token) return;
    fetch(`/api/progress?student=${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setProgress(data.progress || {}))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool?: (tool: unknown, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: "read_marta_course_progress", title: "Показать прогресс курса",
      description: "Возвращает завершённые модули и лучшие результаты Марты.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: () => ({ completed: lessons.filter((item) => progress[item.id]?.completed).map((item) => item.unit), scores: Object.fromEntries(lessons.map((item) => [item.id, progress[item.id]?.score ?? 0])) }),
    }, { signal: lifecycle.signal })).catch(() => undefined);
    void Promise.resolve(context.registerTool({
      name: "open_marta_course_module", title: "Открыть модуль курса",
      description: "Открывает один из модулей 4C, 5A, 5B, 5C или Practical English, если он доступен.",
      inputSchema: { type: "object", properties: { moduleId: { type: "string", enum: lessons.map((item) => item.id) } }, required: ["moduleId"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: (input: { moduleId?: string }) => { const index = lessons.findIndex((item) => item.id === input?.moduleId); const unlocked = index === 0 || Boolean(progress[lessons[index - 1]?.id]?.completed); if (index < 0 || !unlocked) throw new Error("Module is locked or unknown"); setActiveIndex(index); setAnswers({}); setChecked(false); window.scrollTo(0, 0); return { opened: lessons[index].id }; },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, [progress]);

  const lesson = lessons[activeIndex];
  const score = useMemo(() => checked ? lesson.questions.filter((q) => q.answers.some((a) => normalize(a) === normalize(answers[q.id] || ""))).length : 0, [answers, checked, lesson]);
  const percent = Math.round((score / lesson.questions.length) * 100);
  const completeCount = lessons.filter((l) => progress[l.id]?.completed).length;
  const coursePercent = Math.round((completeCount / lessons.length) * 100);

  function isCorrect(q: Question) {
    return q.answers.some((a) => normalize(a) === normalize(answers[q.id] || ""));
  }

  async function submitLesson() {
    setChecked(true);
    if (!studentToken) return;
    const correct = lesson.questions.filter(isCorrect).length;
    const resultPercent = Math.round((correct / lesson.questions.length) * 100);
    const mistakes = lesson.questions.filter((q) => !isCorrect(q)).map((q) => q.topic);
    setSaving(true);
    try {
      const response = await fetch("/api/progress", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ student: studentToken, moduleId: lesson.id, score: resultPercent, mistakes }) });
      if (response.ok) setProgress((await response.json()).progress);
    } finally { setSaving(false); }
  }

  function retry() {
    setChecked(false);
    setAnswers((current) => Object.fromEntries(Object.entries(current).filter(([id]) => {
      const q = lesson.questions.find((item) => item.id === id);
      return q && isCorrect(q);
    })));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!studentToken) return <main className="gate-shell"><section className="gate-card"><div className="brand-mark">M</div><p className="eyebrow">Marta’s English</p><h1>Нужна персональная ссылка</h1><p>Откройте ссылку ученицы, которую прислал преподаватель. Она сохраняет прогресс между занятиями.</p></section></main>;

  return (
    <main className="course-shell">
      <aside className="course-nav">
        <div className="brand-row"><div className="brand-mark small">M</div><div><strong>Marta’s English</strong><span>Elementary catch-up</span></div></div>
        <div className="overall-card"><div className="overall-top"><span>Общий прогресс</span><strong>{coursePercent}%</strong></div><Progress value={coursePercent} /><small>{completeCount} из {lessons.length} модулей</small></div>
        <nav aria-label="Модули курса">
          {lessons.map((item, index) => {
            const unlocked = index === 0 || progress[lessons[index - 1].id]?.completed;
            const done = progress[item.id]?.completed;
            return <button key={item.id} className={`lesson-link ${activeIndex === index ? "active" : ""}`} disabled={!unlocked} onClick={() => { setActiveIndex(index); setAnswers({}); setChecked(false); window.scrollTo(0, 0); }}><span className={`lesson-number ${done ? "done" : ""}`}>{done ? <Check size={16} /> : unlocked ? index + 1 : <LockKeyhole size={15} />}</span><span><strong>{item.unit}</strong><small>{item.title}</small></span></button>;
          })}
        </nav>
      </aside>

      <section className="lesson-pane">
        <header className="lesson-header"><div><div className="header-label"><Badge variant="secondary">{lesson.unit}</Badge><span>≈ {lesson.minutes} минут</span></div><h1>{lesson.title}</h1><p>{lesson.goal}</p></div><div className="header-score"><span>Лучший результат</span><strong>{progress[lesson.id]?.score ?? 0}%</strong></div></header>
        <section className="theory-card"><div className="theory-icon"><BookOpen size={22} /></div><div><p className="eyebrow">Коротко о главном</p><h2>{lesson.theoryTitle}</h2><div className="theory-grid">{lesson.theory.map((item) => <div key={item.rule}><strong>{item.rule}</strong><span>{item.example}</span></div>)}</div></div></section>
        <div className="exercise-heading"><div><p className="eyebrow">Практика</p><h2>{lesson.questions.length} заданий</h2></div><span>Нужно 80%</span></div>
        <div className="questions">
          {lesson.questions.map((q, index) => {
            const correct = checked && isCorrect(q); const wrong = checked && !correct;
            return <article key={q.id} className={`question-card ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`}><div className="question-top"><span>{String(index + 1).padStart(2, "0")}</span><Badge variant="outline">{q.topic}</Badge></div><h3>{q.prompt}</h3>{q.type === "choice" ? <div className="options">{q.options?.map((option) => <button key={option} className={answers[q.id] === option ? "selected" : ""} disabled={checked} onClick={() => setAnswers({ ...answers, [q.id]: option })}>{option}</button>)}</div> : <input aria-label={`Ответ на вопрос ${index + 1}`} value={answers[q.id] || ""} disabled={checked} placeholder="Введите ответ по-английски" onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />}{checked && <div className={`feedback ${correct ? "ok" : "error"}`}><strong>{correct ? "Верно" : `Правильный ответ: ${q.answers[0]}`}</strong><span>{q.explanation}</span></div>}</article>;
          })}
        </div>
        <section className={`result-card ${checked ? "visible" : ""}`}>
          {!checked ? <Button size="lg" onClick={submitLesson} disabled={Object.keys(answers).filter((id) => lesson.questions.some((q) => q.id === id)).length < lesson.questions.length || saving}>Проверить урок <ChevronRight /></Button> : percent >= 80 ? <><div><Sparkles /><span><strong>{percent}% — модуль пройден</strong><small>Отлично! Результат сохранён.</small></span></div><Button size="lg" onClick={() => { if (activeIndex < lessons.length - 1) { setActiveIndex(activeIndex + 1); setAnswers({}); setChecked(false); window.scrollTo(0, 0); } }}>Следующий модуль <ChevronRight /></Button></> : <><div><RotateCcw /><span><strong>{percent}% — ещё немного практики</strong><small>Исправьте ошибки и попробуйте снова.</small></span></div><Button size="lg" onClick={retry}>Повторить ошибки</Button></>}
        </section>
      </section>
    </main>
  );
}
