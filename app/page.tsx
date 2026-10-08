"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, BookOpen, Check, ChevronRight, Eye, Lightbulb, LockKeyhole, PenLine, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { lessons, type ProductionKind, type Question } from "@/lib/course";

type StoredProgress = Record<string, { score: number; attempts: number; completed: boolean }>;
const normalize = (value: string) => value.toLowerCase().trim().replace(/[.!?]/g, "").replace(/\s+/g, " ");
const sentenceCount = (text: string) => text.split(/[.!?\n]+/).filter((part) => part.trim().length > 3).length;

function productionResults(kind: ProductionKind, text: string): boolean[] {
  const t = text.toLowerCase();
  if (kind === "frequency") return [sentenceCount(text) >= 3, /\b(always|usually|often|sometimes|hardly ever|never)\b/.test(t), /\b(every day|once|twice|times? a (week|month)|a week|a month)\b/.test(t)];
  if (kind === "can") return [sentenceCount(text) >= 4, /\bcan\b/.test(t) && /\b(can't|cannot|can’t)\b/.test(t), /can (i|you)\b[^?]*\?/.test(t)];
  if (kind === "continuous") { const forms = t.match(/\b(am|is|are|'m|'s|'re)\s+\w+ing\b/g) || []; const subjects = new Set((t.match(/\b(i|he|she|it|we|they|you|a woman|a man|children)\b/g) || [])); return [sentenceCount(text) >= 3, forms.length >= 3, subjects.size >= 2]; }
  if (kind === "contrast") return [/\b(usually|often|every day|sometimes|never)\b/.test(t), /\b(am|is|are|'m|'s|'re)\s+\w+ing\b/.test(t), /\b(sunny|cloudy|windy|foggy|hot|cold|raining|snowing)\b/.test(t)];
  return [text.split(/\n|(?=assistant:|customer:|you:)/i).filter((part) => part.trim().length > 4).length >= 4, [/(looking for|can i help|try .* on|what size|how much|changing rooms)/g].some((r) => (t.match(r) || []).length >= 2), /\b(jacket|shirt|sweater|skirt|jeans|trousers|shoes|t-shirt)\b/.test(t) && /\b(this|these|it|them)\b/.test(t)];
}

function QuestionCard({ q, index, answer, checked, onAnswer }: { q: Question; index: number; answer: string; checked: boolean; onAnswer: (value: string) => void }) {
  const correct = checked && q.answers.some((a) => normalize(a) === normalize(answer || ""));
  const wrong = checked && !correct;
  return <article className={`question-card ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`}><div className="question-top"><span>{String(index + 1).padStart(2, "0")}</span><Badge variant="outline">{q.topic}</Badge></div><h3>{q.prompt}</h3>{q.type === "choice" ? <div className="options">{q.options?.map((option) => <button key={option} className={answer === option ? "selected" : ""} disabled={checked} onClick={() => onAnswer(option)}>{option}</button>)}</div> : <input aria-label={`Ответ на вопрос ${index + 1}`} value={answer || ""} disabled={checked} placeholder="Введите ответ по-английски" onChange={(e) => onAnswer(e.target.value)} />}{checked && <div className={`feedback ${correct ? "ok" : "error"}`}><strong>{correct ? "Верно" : `Правильный ответ: ${q.answers[0]}`}</strong><span>{q.explanation}</span></div>}</article>;
}

export default function Home() {
  const [studentToken, setStudentToken] = useState("");
  const [progress, setProgress] = useState<StoredProgress>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [production, setProduction] = useState("");
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => { const token = new URLSearchParams(window.location.search).get("student") || ""; setStudentToken(token); if (token) fetch(`/api/progress?student=${encodeURIComponent(token)}`).then((r) => r.ok ? r.json() : Promise.reject()).then((data) => setProgress(data.progress || {})).catch(() => undefined); }, []);
  useEffect(() => { const context = (document as Document & { modelContext?: { registerTool?: (tool: unknown, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext; if (!context?.registerTool) return; const lifecycle = new AbortController(); void Promise.resolve(context.registerTool({ name:"read_marta_course_progress", title:"Показать прогресс курса", description:"Возвращает завершённые модули и лучшие результаты Марты.", inputSchema:{type:"object",properties:{},additionalProperties:false}, annotations:{readOnlyHint:true,untrustedContentHint:false}, execute:()=>({completed:lessons.filter((item)=>progress[item.id]?.completed).map((item)=>item.unit),scores:Object.fromEntries(lessons.map((item)=>[item.id,progress[item.id]?.score??0]))}) },{signal:lifecycle.signal})).catch(()=>undefined); return()=>lifecycle.abort(); }, [progress]);

  const lesson = lessons[activeIndex];
  const matchingItems = lesson.matching.flatMap((set) => set.items.map((item) => ({...item,setId:set.id,setTitle:set.title})));
  const score = useMemo(() => checked ? lesson.questions.filter((q) => q.answers.some((a) => normalize(a) === normalize(answers[q.id] || ""))).length + matchingItems.filter((item) => normalize(matches[`${item.setId}:${item.id}`] || "") === normalize(item.right)).length : 0, [answers, checked, lesson, matches]);
  const totalChecks = lesson.questions.length + matchingItems.length;
  const percent = Math.round((score / totalChecks) * 100);
  const completeCount = lessons.filter((l) => progress[l.id]?.completed).length;
  const coursePercent = Math.round((completeCount / lessons.length) * 100);
  const courseFinished = lessons.every((l) => progress[l.id]?.completed);
  const averageScore = Math.round(lessons.reduce((sum, item) => sum + (progress[item.id]?.score || 0), 0) / lessons.length);
  const prodChecks = productionResults(lesson.production.kind, production);
  const productionReady = prodChecks.every(Boolean);
  const allAnswered = lesson.questions.every((q) => Boolean(answers[q.id]?.trim())) && matchingItems.every((item) => Boolean(matches[`${item.setId}:${item.id}`]?.trim()));
  const isCorrect = (q: Question) => q.answers.some((a) => normalize(a) === normalize(answers[q.id] || ""));
  const changeLesson = (index: number) => { setActiveIndex(index); setAnswers({}); setMatches({}); setProduction(""); setChecked(false); setShowCompletion(false); window.scrollTo(0, 0); };

  async function submitLesson() { setChecked(true); if (!studentToken) return; const correctQuestions = lesson.questions.filter(isCorrect).length; const correctMatches = matchingItems.filter((item) => normalize(matches[`${item.setId}:${item.id}`] || "") === normalize(item.right)).length; const resultPercent = Math.round(((correctQuestions + correctMatches) / totalChecks) * 100); const mistakes = [...lesson.questions.filter((q) => !isCorrect(q)).map((q) => q.topic), ...new Set(matchingItems.filter((item) => normalize(matches[`${item.setId}:${item.id}`] || "") !== normalize(item.right)).map((item) => item.setTitle))]; setSaving(true); try { const response = await fetch("/api/progress", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({student:studentToken,moduleId:lesson.id,score:resultPercent,mistakes}) }); if (response.ok) setProgress((await response.json()).progress); } finally { setSaving(false); } }
  function retry() { setChecked(false); setAnswers((current) => Object.fromEntries(Object.entries(current).filter(([id]) => { const q = lesson.questions.find((item) => item.id === id); return q && isCorrect(q); }))); setMatches((current) => Object.fromEntries(Object.entries(current).filter(([key,value]) => { const item = matchingItems.find((entry) => `${entry.setId}:${entry.id}` === key); return item && normalize(value) === normalize(item.right); }))); window.scrollTo({top:0,behavior:"smooth"}); }

  if (!studentToken) return <main className="gate-shell"><section className="gate-card"><div className="brand-mark">M</div><p className="eyebrow">Marta’s English</p><h1>Нужна персональная ссылка</h1><p>Откройте ссылку ученицы, которую прислал преподаватель. Она сохраняет прогресс между занятиями.</p></section></main>;

  if (showCompletion) return <main className="completion-shell"><section className="completion-card"><div className="completion-icon"><Award size={38}/></div><p className="eyebrow">Курс завершён</p><h1>Марта, ты умничка!</h1><p className="completion-lead">Ты прошла весь маршрут Unit 4C–5C и теперь можешь использовать изученный английский в реальных ситуациях.</p><div className="completion-score"><span>Итоговый средний результат</span><strong>{averageScore}%</strong></div><div className="skills-list"><div><Check/>Рассказывать о привычках и частоте действий</div><div><Check/>Говорить об умениях, просить и спрашивать разрешение с can</div><div><Check/>Описывать действия, которые происходят прямо сейчас</div><div><Check/>Различать Present Simple и Present Continuous</div><div><Check/>Говорить о погоде и временах года</div><div><Check/>Выбирать одежду, понимать цены и общаться в магазине</div></div><p className="completion-note">Ты не просто повторила правила — ты читала, сопоставляла, выбирала формы и писала собственные ответы. Отличная работа!</p><Button size="lg" onClick={()=>changeLesson(0)}>Вернуться к урокам</Button></section></main>;

  const renderQuestions = (items: Question[]) => <div className="questions">{items.map((q) => <QuestionCard key={q.id} q={q} index={lesson.questions.indexOf(q)} answer={answers[q.id] || ""} checked={checked} onAnswer={(value) => setAnswers({...answers,[q.id]:value})} />)}</div>;
  const renderMatching = () => lesson.matching.map((set) => { const options = set.items.map((item) => item.right).sort((a,b)=>a.localeCompare(b)); return <section className="matching-card" key={set.id}><div className="matching-heading"><div><p className="stage-label">Этап 3 · Сопоставление</p><h2>{set.title}</h2><p>{set.instruction}</p></div><span>{set.items.length} пар</span></div><div className={`matching-grid ${set.items.some((item)=>item.image)?"visual-matching":""}`}>{set.items.map((item,index)=>{const key=`${set.id}:${item.id}`;const answer=matches[key]||"";const correct=checked&&normalize(answer)===normalize(item.right);const wrong=checked&&!correct;return <div className={`match-row ${correct?"correct":""} ${wrong?"wrong":""}`} key={key}>{item.image?<><div className="match-image" role="img" aria-label={item.left} style={{backgroundImage:`url(${item.image.src})`,backgroundPosition:item.image.position,backgroundSize:set.id==="5c-weather"?"300% 200%":"200% 200%"}}/><span className="picture-number">{index+1}</span></>:<strong>{item.left}</strong>}<select aria-label={`Пара для ${item.left}`} disabled={checked} value={answer} onChange={(e)=>setMatches({...matches,[key]:e.target.value})}><option value="">Выберите пару</option>{options.map((option)=><option value={option} key={option}>{option}</option>)}</select>{checked&&<small>{correct?"Верно":`Правильно: ${item.right}`}</small>}</div>})}</div></section>});

  return <main className="course-shell">
    <aside className="course-nav"><div className="brand-row"><div className="brand-mark small">M</div><div><strong>Marta’s English</strong><span>Elementary catch-up</span></div></div><div className="overall-card"><div className="overall-top"><span>Общий прогресс</span><strong>{coursePercent}%</strong></div><Progress value={coursePercent}/><small>{completeCount} из {lessons.length} модулей</small></div><nav aria-label="Модули курса">{lessons.map((item,index)=>{const unlocked=index===0||progress[lessons[index-1].id]?.completed;const done=progress[item.id]?.completed;return <button key={item.id} className={`lesson-link ${activeIndex===index?"active":""}`} disabled={!unlocked} onClick={()=>changeLesson(index)}><span className={`lesson-number ${done?"done":""}`}>{done?<Check size={16}/>:unlocked?index+1:<LockKeyhole size={15}/>}</span><span><strong>{item.unit}</strong><small>{item.title}</small></span></button>})}</nav>{courseFinished&&<button className="finish-link" onClick={()=>setShowCompletion(true)}><Award size={18}/>Итоги курса</button>}</aside>
    <section className="lesson-pane">
      <header className="lesson-header"><div><div className="header-label"><Badge variant="secondary">{lesson.unit}</Badge><span>≈ {lesson.minutes} минут</span></div><h1>{lesson.title}</h1><p>{lesson.goal}</p></div><div className="header-score"><span>Лучший результат</span><strong>{progress[lesson.id]?.score??0}%</strong></div></header>
      <div className="learning-path"><span><b>1</b>Понять</span><span><b>2</b>Разобрать</span><span><b>3</b>Потренировать</span><span><b>4</b>Использовать</span></div>
      <section className={`context-card ${lesson.id==="practical"?"comic-context":""}`}><div className="stage-icon"><Eye size={22}/></div><div><p className="stage-label">Этап 1 · Рецепция</p><h2>{lesson.contextTitle}</h2>{lesson.id==="practical"?<><img className="shopping-comic" src="/course/shopping-comic.webp" alt="Четыре кадра: покупательница заходит в магазин, выбирает синий свитер, примеряет его и смотрит на ценник"/><div className="comic-lines"><span><b>1</b>Can I help you?</span><span><b>2</b>I’m looking for a sweater. Medium, please.</span><span><b>3</b>Can I try it on?</span><span><b>4</b>How much is it?</span></div><p className="context-text compact">{lesson.context}</p></>:<p className="context-text">{lesson.context}</p>}<div className="notice"><Lightbulb size={17}/><span>{lesson.notice}</span></div></div></section>
      <div className="exercise-heading"><div><p className="eyebrow">Проверка понимания</p><h2>Сначала — смысл</h2></div><span>2 задания</span></div>{renderQuestions(lesson.questions.slice(0,2))}
      <section className="theory-card"><div className="theory-icon"><BookOpen size={22}/></div><div><p className="stage-label">Этап 2 · Осмысление правила</p><h2>{lesson.theoryTitle}</h2><div className="theory-grid">{lesson.theory.map((item)=><div key={item.rule}><strong>{item.rule}</strong><span>{item.example}</span></div>)}</div></div></section>
      <div className="exercise-heading"><div><p className="eyebrow">Контролируемая практика</p><h2>Собираем форму правильно</h2></div><span>4 задания</span></div>{renderQuestions(lesson.questions.slice(2,6))}
      <section className="coach-card"><p className="stage-label">Остановитесь и проверьте правило</p><div className="coach-grid">{lesson.midTheory.map((item)=><div key={item.title}><h3>{item.title}</h3><p>{item.text}</p><code>{item.example}</code></div>)}</div></section>
      {renderMatching()}
      {lesson.id === "practical" ? <>
        <div className="exercise-heading"><div><p className="eyebrow">Перенос в ситуацию</p><h2>Язык в магазине и в общении</h2></div><span>2 задания</span></div>
        {renderQuestions(lesson.questions.slice(6,8))}
        <section className="coach-card"><p className="stage-label">Итоговое повторение · Перед финальной проверкой</p><div className="coach-grid">
          <div><h3>Частотность</h3><p>С обычным глаголом наречие ставим перед ним, а с be — после него.</p><code>I often walk. · I am often tired.</code></div>
          <div><h3>Can / can’t</h3><p>После can используем начальную форму глагола. Can I…? помогает спросить разрешение.</p><code>Can I pay by card?</code></div>
          <div><h3>Действие сейчас</h3><p>Для действия в момент речи нужны am/is/are и форма с -ing.</p><code>The assistant is helping a customer now.</code></div>
          <div><h3>Обычно и сегодня</h3><p>Привычка — Present Simple; временная ситуация сейчас — Present Continuous.</p><code>I usually wear jeans, but today I’m wearing a skirt.</code></div>
        </div></section>
        <div className="exercise-heading"><div><p className="eyebrow">Финальная проверка</p><h2>Соединяем темы курса</h2></div><span>4 задания</span></div>
        {renderQuestions(lesson.questions.slice(8))}
      </> : <>
        <div className="exercise-heading"><div><p className="eyebrow">Перенос в ситуацию</p><h2>Выбираем язык по смыслу</h2></div><span>{lesson.questions.length-6} заданий</span></div>
        {renderQuestions(lesson.questions.slice(6))}
      </>}
      <section className="production-card"><div className="stage-icon"><PenLine size={22}/></div><div className="production-main"><p className="stage-label">Этап 4 · Продукция</p><h2>{lesson.production.prompt}</h2><p>{lesson.production.scaffold}</p><textarea value={production} disabled={checked} placeholder={lesson.production.placeholder} onChange={(e)=>setProduction(e.target.value)} rows={6}/><div className="auto-check"><strong>Автопроверка</strong>{lesson.production.checks.map((label,index)=><span className={prodChecks[index]?"passed":""} key={label}><i>{prodChecks[index]?<Check size={14}/>:index+1}</i>{label}</span>)}</div>{productionReady&&<details><summary>Показать пример после своей попытки</summary><p>{lesson.production.sample}</p></details>}</div></section>
      <section className={`result-card ${checked?"visible":""}`}>{!checked?<div className="submit-wrap"><small>{!allAnswered?"Ответьте на все задания и соберите все пары":!productionReady?"Завершите итоговое задание":"Всё готово к проверке"}</small><Button size="lg" onClick={submitLesson} disabled={!allAnswered||!productionReady||saving}>Проверить урок <ChevronRight/></Button></div>:percent>=80?<><div><Sparkles/><span><strong>{percent}% — модуль пройден</strong><small>Теория, сопоставление, практика и продукция завершены.</small></span></div><Button size="lg" onClick={()=>activeIndex<lessons.length-1?changeLesson(activeIndex+1):setShowCompletion(true)}>{activeIndex<lessons.length-1?"Следующий модуль":"Завершить курс"} <ChevronRight/></Button></>:<><div><RotateCcw/><span><strong>{percent}% — ещё немного практики</strong><small>Исправьте ошибки и попробуйте снова.</small></span></div><Button size="lg" onClick={retry}>Повторить ошибки</Button></>}</section>
    </section>
  </main>;
}
