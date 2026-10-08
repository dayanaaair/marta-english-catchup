export type Question = { id: string; type: "choice" | "input"; topic: string; prompt: string; options?: string[]; answers: string[]; explanation: string };
export type Lesson = { id: string; unit: string; title: string; minutes: number; goal: string; theoryTitle: string; theory: { rule: string; example: string }[]; questions: Question[] };
const c=(id:string,topic:string,prompt:string,options:string[],answer:string,explanation:string):Question=>({id,type:"choice",topic,prompt,options,answers:[answer],explanation});
const i=(id:string,topic:string,prompt:string,answers:string[],explanation:string):Question=>({id,type:"input",topic,prompt,answers,explanation});

export const lessons: Lesson[] = [
  { id:"4c",unit:"Unit 4C",title:"Habits that last",minutes:28,goal:"Рассказывать о привычках, частоте действий и распорядке дня.",theoryTitle:"Adverbs & expressions of frequency",theory:[
    {rule:"Перед обычным глаголом",example:"I usually walk to work."},{rule:"После глагола be",example:"She is never late."},{rule:"Конкретная частота — в конце",example:"We exercise twice a week."},{rule:"От 100% к 0%",example:"always → usually → often → sometimes → hardly ever → never"}],questions:[
    c("4c1","Frequency","Choose the correct sentence.",["I go usually to bed early.","I usually go to bed early."],"I usually go to bed early.","Наречие частотности ставим перед обычным глаголом."),
    c("4c2","Frequency","Choose the correct sentence.",["Marta is never late.","Marta never is late."],"Marta is never late.","С глаголом be наречие ставится после am/is/are."),
    i("4c3","Word order","Put the words in order: often / we / dinner / cook / at home",["We often cook dinner at home"],"Often стоит перед смысловым глаголом cook."),
    c("4c4","Expressions","I call my parents ___ (два раза в неделю).",["two week","twice a week","twice week","two times week"],"twice a week","Устойчивая форма: once/twice/three times a week."),
    c("4c5","Months","Which month comes after September?",["August","October","November","December"],"October","Порядок: August, September, October, November."),
    c("4c6","Habits","100% of the time means…",["sometimes","usually","always","hardly ever"],"always","Always обозначает действие, которое происходит всегда."),
    i("4c7","Word order","Correct the sentence: He goes hardly ever to the gym.",["He hardly ever goes to the gym"],"Hardly ever ставим перед обычным глаголом goes."),
    c("4c8","Meaning","Which sentence means примерно один раз в месяц?",["I travel every month.","I travel once a month.","I never travel.","I travel twice a month."],"I travel once a month.","Once a month = один раз в месяц."),
    c("4c9","Routine","Choose the natural answer: How often do you work from home?",["At Monday.","Two a week.","Twice a week.","I am work."],"Twice a week.","How often? требует ответа о частоте."),
    c("4c10","Reading","People in “Blue Zones” often live longer. Which habit is the healthiest?",["Sleeping four hours","Walking every day","Eating fast food daily","Never meeting friends"],"Walking every day","Регулярная активность — полезная повседневная привычка.") ]},
  { id:"5a",unit:"Unit 5A",title:"What can you do?",minutes:27,goal:"Говорить об умениях, возможностях, разрешении и просьбах.",theoryTitle:"Can / can’t",theory:[
    {rule:"Умение",example:"I can swim. / I can’t drive."},{rule:"Вопрос",example:"Can you play the guitar?"},{rule:"Краткий ответ",example:"Yes, I can. / No, I can’t."},{rule:"Просьба и разрешение",example:"Can you help me? Can I sit here?"}],questions:[
    c("5a1","Ability","She ___ speak three languages.",["can","cans","can to","is can"],"can","После can используем глагол без to и без -s."),
    i("5a2","Negative","Complete: I ___ drive, but I can ride a bike.",["can't","cannot","can not"],"Can’t / cannot выражает отсутствие умения."),
    c("5a3","Question","Choose the correct question.",["Do you can cook?","Can you cook?","Can cook you?","Are you can cook?"],"Can you cook?","Вопрос: Can + subject + verb?"),
    c("5a4","Short answer","Can Marta sing? — Yes, ___.",["she does","she is","she can","she sings"],"she can","Краткий ответ повторяет can."),
    c("5a5","Request","You need help with a bag. What do you say?",["Can you help me?","You can help?","Do help me can?","Can I helping?"],"Can you help me?","Can you…? — вежливая простая просьба."),
    c("5a6","Permission","Ask for permission to open the window.",["Can you open the window?","Can I open the window?","I can open window?","Do I can open it?"],"Can I open the window?","Can I…? спрашивает разрешение для себя."),
    c("5a7","Verb phrases","Choose the natural phrase.",["do a photo","make tennis","play the guitar","go TV"],"play the guitar","С музыкальными инструментами используем play."),
    c("5a8","Verb phrases","Choose the natural phrase.",["listen music","listen to music","hear to music","play music to"],"listen to music","После listen нужен предлог to."),
    i("5a9","Word order","Put in order: well / can / very / dance / she",["She can dance very well"],"Наречие very well обычно ставится после основного глагола."),
    c("5a10","Meaning","Which sentence is a prohibition?",["You can park here.","You can’t park here.","Can you park here?","I can park well."],"You can’t park here.","Can’t также означает, что действие не разрешено.") ]},
  { id:"5b",unit:"Unit 5B",title:"What’s happening now?",minutes:30,goal:"Описывать действия, которые происходят прямо сейчас, и говорить о шуме.",theoryTitle:"Present Continuous",theory:[
    {rule:"Форма",example:"am / is / are + verb-ing"},{rule:"Сейчас",example:"They’re having a party now."},{rule:"Отрицание",example:"He isn’t sleeping."},{rule:"Вопрос",example:"Are the neighbours arguing?"}],questions:[
    c("5b1","Form","The baby ___ crying.",["is","are","does","can"],"is","С единственным числом используем is + verb-ing."),
    i("5b2","-ing form","Complete: They are ___ (have) a party.",["having"],"Перед -ing конечная e исчезает: have → having."),
    c("5b3","Negative","Choose the correct sentence.",["He not sleeping.","He isn’t sleeping.","He doesn’t sleeping.","He no sleep."],"He isn’t sleeping.","Отрицание образует be + not + verb-ing."),
    c("5b4","Question","___ you watching TV?",["Do","Can","Are","Is"],"Are","Вопрос начинается с формы be: Are you…?"),
    i("5b5","Short answer","Is she working? — No, ___.",["she isn't","she is not"],"В кратком ответе используем ту же форму be."),
    c("5b6","Noise","Which sound does a dog make?",["It argues.","It barks.","It practises.","It pings."],"It barks.","A dog barks; a phone pings."),
    c("5b7","Noise","Your neighbours’ music is very loud. They are…",["making a lot of noise","doing a lot of noise","having a noise","barking music"],"making a lot of noise","Устойчивая фраза: make a lot of noise."),
    i("5b8","-ing form","Complete: I am ___ (write) an email now.",["writing"],"Write → writing: конечная e исчезает."),
    c("5b9","Situation","Listen! Someone ___ the piano.",["practises","is practising","can practises","practise"],"is practising","Listen! показывает, что действие происходит сейчас."),
    c("5b10","Conversation","What are you doing? — ___",["I work every day.","I’m cooking dinner.","Yes, I do.","At seven."],"I’m cooking dinner.","Вопрос о текущем действии требует Present Continuous.") ]},
  { id:"5c",unit:"Unit 5C",title:"Every day or right now?",minutes:34,goal:"Различать привычки и действия сейчас, говорить о погоде и писать короткий пост.",theoryTitle:"Present Simple vs Present Continuous",theory:[
    {rule:"Обычно / регулярно",example:"I take the bus every day."},{rule:"Прямо сейчас",example:"I’m walking today."},{rule:"Маркеры Simple",example:"usually, every day, on Mondays"},{rule:"Маркеры Continuous",example:"now, today, at the moment"}],questions:[
    c("5c1","Tenses","She usually ___ from home.",["works","is working","work","working"],"works","Usually указывает на Present Simple; she требует -s."),
    c("5c2","Tenses","Today she ___ in the office.",["works","working","is working","work"],"is working","Today здесь описывает временную ситуацию."),
    c("5c3","Tenses","Look! It ___.",["snows","is snowing","snow","snowing"],"is snowing","Look! указывает на действие прямо сейчас."),
    c("5c4","Tenses","We ___ this café every Saturday.",["are visiting","visits","visit","visiting"],"visit","Every Saturday — регулярное действие."),
    i("5c5","Form","Complete: What ___ you doing at the moment?",["are"],"В Present Continuous вопрос строится с am/is/are."),
    c("5c6","Weather","The sun is shining. It’s ___.",["foggy","sunny","snowy","windy"],"sunny","Sunny описывает солнечную погоду."),
    c("5c7","Weather","You can’t see far because it’s ___.",["foggy","hot","dry","sunny"],"foggy","Foggy = туманно."),
    c("5c8","Seasons","In Britain, December is in ___.",["spring","summer","autumn","winter"],"winter","December, January and February are winter months."),
    i("5c9","Writing","Complete the holiday post: We ___ (stay) in London this week.",["are staying","'re staying","re staying"],"Временная ситуация this week — Present Continuous."),
    c("5c10","Writing","Choose the best holiday update.",["I usually visit a museum now.","I’m sitting in a café now. It’s raining outside.","I am go to London every today.","Now I sit usually outside."],"I’m sitting in a café now. It’s raining outside.","Оба действия происходят сейчас, поэтому нужен Present Continuous.") ]},
  { id:"practical",unit:"Practical English",title:"Shopping in London",minutes:35,goal:"Покупать одежду, понимать цены и уверенно использовать ключевые темы курса.",theoryTitle:"Useful language in a clothes shop",theory:[
    {rule:"Предложить помощь",example:"Can I help you?"},{rule:"Примерить",example:"Can I try it on?"},{rule:"Уточнить размер",example:"What size is this?"},{rule:"This / these",example:"this jacket · these trousers"}],questions:[
    c("pe1","Clothes","Which word is plural?",["jacket","shirt","sweater","trousers"],"trousers","Trousers употребляется во множественном числе."),
    c("pe2","This / these","How much are ___ shoes?",["this","these","it","that"],"these","С shoes во множественном числе используем these."),
    c("pe3","This / these","Can I try ___ jacket on?",["these","those","this","they"],"this","Jacket — единственное число, поэтому this."),
    c("pe4","Shopping","Shop assistant: Can I help you? Customer: ___",["Yes, I’m looking for a sweater.","I help you.","Yes, I am look.","No, I can sweater."],"Yes, I’m looking for a sweater.","Это естественный ответ покупателя."),
    c("pe5","Shopping","Ask where you can try clothes on.",["Where are the changing rooms?","How are the rooms changing?","Where I change?","Can rooms?"],"Where are the changing rooms?","Changing rooms — примерочные."),
    c("pe6","Shopping","The sweater is too small. What do you ask?",["Do you have it in a larger size?","Is it more small?","Can it large?","Have you size big?"],"Do you have it in a larger size?","Так вежливо спрашивают другой размер."),
    c("pe7","Price","£29.99 is…",["twenty-nine pounds ninety-nine","two nine pounds","twenty-nine pence","ninety-nine pounds twenty-nine"],"twenty-nine pounds ninety-nine","Сначала называем фунты, затем пенсы."),
    c("pe8","Social English","You look great! — ___",["Thanks!","Yes, I look.","Great you.","I can great."],"Thanks!","На комплимент естественно ответить Thanks."),
    c("pe9","Final: frequency","Choose the correct sentence.",["I am often tired after work.","I often am tired after work."],"I am often tired after work.","С be наречие частотности ставим после глагола."),
    c("pe10","Final: can","___ I pay by card?",["Do","Am","Can","Have"],"Can","Can I…? — просьба о разрешении/возможности."),
    c("pe11","Final: now","The assistant ___ another customer now.",["helps","is helping","help","can helping"],"is helping","Now указывает на Present Continuous."),
    c("pe12","Final: contrast","I usually ___ jeans, but today I ___ a skirt.",["wear / am wearing","am wearing / wear","wears / wearing","wear / wear"],"wear / am wearing","Привычка — Present Simple; сегодня — Present Continuous.") ]}
];
