"use client";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { lessons } from "@/lib/course";

type Row={module_id:string;best_score:number;attempts:number;completed:number;mistakes:string;updated_at:string};
export default function TeacherPage(){
 const [rows,setRows]=useState<Row[]|null>(null); const [error,setError]=useState(false);
 useEffect(()=>{const key=new URLSearchParams(location.search).get("key")||"";fetch(`/api/report?key=${encodeURIComponent(key)}`).then(r=>r.ok?r.json():Promise.reject()).then(d=>setRows(d.rows)).catch(()=>setError(true));},[]);
 const completed=rows?.filter(r=>r.completed).length||0; const average=rows?.length?Math.round(rows.reduce((s,r)=>s+r.best_score,0)/rows.length):0; const attempts=rows?.reduce((s,r)=>s+r.attempts,0)||0;
 return <main className="teacher-shell"><header className="teacher-header"><div><p className="eyebrow">Отчёт преподавателя</p><h1>Прогресс Марты</h1></div><div className="brand-mark small">M</div></header>{error?<section className="report-card report-empty">Ссылка отчёта недействительна.</section>:rows===null?<section className="report-card report-empty">Загружаю результаты…</section>:<><section className="summary-grid"><div className="summary-card"><span>Пройдено модулей</span><strong>{completed} / {lessons.length}</strong></div><div className="summary-card"><span>Средний лучший балл</span><strong>{average}%</strong></div><div className="summary-card"><span>Всего попыток</span><strong>{attempts}</strong></div></section><section className="report-card"><div className="report-list">{lessons.map(l=>{const r=rows.find(x=>x.module_id===l.id);const mistakes=r?JSON.parse(r.mistakes) as string[]:[];return <div className="report-row" key={l.id}><div><strong>{l.unit}</strong><small>{l.title}</small></div><div><strong>{r?.best_score??0}%</strong><Progress value={r?.best_score??0}/></div><div><small>Попыток</small><strong>{r?.attempts??0}</strong></div><div><small>Над чем поработать</small><div>{mistakes.length?[...new Set(mistakes)].join(", "):r?.completed?"Ошибок нет":"Ещё не начато"}</div></div></div>})}</div></section></>}</main>
}
