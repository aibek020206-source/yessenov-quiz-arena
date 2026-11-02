const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const os = require("os");
const QRCode = require("qrcode");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static("public"));

const PORT = 3000;
const MAX_PLAYERS = 20;
const questions = [
  {topic:"Халықаралық құқық", q:"Халықаралық құқықтың негізгі субъектілерінің бірі қайсы?", a:["Мемлекеттер","Жеке дүкендер","Спорт клубтары","Мектеп сыныптары"], c:0},
  {topic:"Халықаралық құқық", q:"БҰҰ қай жылы құрылды?", a:["1919","1945","1955","1965"], c:1},
  {topic:"Халықаралық құқық", q:"Халықаралық шарт дегеніміз не?", a:["Мемлекеттер арасындағы жазбаша келісім","Жеке адамның өтініші","Соттың күнделікті шешімі","Мектеп ережесі"], c:0},
  {topic:"Халықаралық құқық", q:"БҰҰ Қауіпсіздік Кеңесінің басты міндеттерінің бірі қандай?", a:["Әлемдік бейбітшілік пен қауіпсіздікті сақтау","Спорт жарысын өткізу","Салық жинау","Университеттерді басқару"], c:0},
  {topic:"Халықаралық құқық", q:"Дипломатиялық иммунитет нені білдіреді?", a:["Дипломатқа халықаралық құқықпен берілетін арнайы қорғаныс","Барлық заңнан толық босату","Салық төлемеу құқығы ғана","Азаматтықтан бас тарту"], c:0},
  {topic:"Қылмыстық құқық", q:"Қылмыстық құқықтың негізгі міндеті қандай?", a:["Қылмыстық құқық бұзушылықпен күресу және қоғамды қорғау","Тек азаматтық дауларды шешу","Сауда бағасын белгілеу","Спорт ережесін бекіту"], c:0},
  {topic:"Қылмыстық құқық", q:"Қылмыс құрамының негізгі элементтері нешеу?", a:["2","3","4","5"], c:2},
  {topic:"Қылмыстық құқық", q:"Қылмыс құрамының субъективтік жағы нені сипаттайды?", a:["Адамның кінәсі мен психикалық қатынасын","Қылмыс болған орынды ғана","Заттың құнын","Жәбірленушінің жасын ғана"], c:0},
  {topic:"Қылмыстық құқық", q:"Қылмыстық жауаптылықтың негізі не?", a:["Қылмыс құрамының барлық белгілері бар іс-әрекет","Кез келген қателік","Адамның пікірі","Кездейсоқ оқиға"], c:0},
  {topic:"Қылмыстық құқық", q:"Жаза тағайындаудың мақсатының бірі қандай?", a:["Әлеуметтік әділеттілікті қалпына келтіру","Кек алу","Адамды қорлау","Мүлікті міндетті түрде тәркілеу"], c:0},
  {topic:"Адам құқықтары", q:"Адам құқықтарының жалпыға бірдей декларациясы қай жылы қабылданды?", a:["1945","1948","1950","1966"], c:1},
  {topic:"Адам құқықтары", q:"Қазақстан Республикасының Конституциясы қашан қабылданды?", a:["1991 жылғы 16 желтоқсан","1993 жылғы 28 қаңтар","1995 жылғы 30 тамыз","1998 жылғы 1 қаңтар"], c:2},
  {topic:"Адам құқықтары", q:"Адамның негізгі жеке құқықтарының бірі қайсы?", a:["Өмір сүру құқығы","Міндетті түрде жұмыс істеу","Кез келген заңды бұзу","Салықтан толық босау"], c:0},
  {topic:"Адам құқықтары", q:"Сөз бостандығы нені білдіреді?", a:["Өз пікірін заң шеңберінде еркін білдіру","Басқаларды қорлау құқығы","Жалған ақпарат тарату міндеті","Заңды орындамау"], c:0},
  {topic:"Адам құқықтары", q:"Заң алдында теңдік қағидасы нені білдіреді?", a:["Барлығының заң алдында тең болуы","Тек лауазымды адамдардың артықшылығы","Әр адамға бөлек заң қолдану","Құқықтардың тек ересектерге берілуі"], c:0},
  {topic:"Халықаралық құқық", q:"Халықаралық сот қай қалада орналасқан?", a:["Женева","Гаага","Париж","Рим"], c:1},
  {topic:"Халықаралық құқық", q:"Халықаралық ұйымдардың құрылуының негізгі мақсаты қандай?", a:["Мемлекеттердің ынтымақтастығын дамыту","Шекараларды жою міндеті","Барлық елге бір үкімет орнату","Ұлттық заңдарды толық жою"], c:0},
  {topic:"Қылмыстық құқық", q:"Қылмыстың объективтік жағына не жатады?", a:["Іс-әрекет, зардап және себепті байланыс","Кінә мен ниет қана","Адамның мінезі","Жеке көзқарас"], c:0},
  {topic:"Қылмыстық құқық", q:"Қылмыс субъектісі дегеніміз кім?", a:["Қылмыстық заңда көзделген жасқа жеткен, есі дұрыс жеке тұлға","Кез келген ұйым","Тек жәбірленуші","Кез келген куәгер"], c:0},
  {topic:"Қылмыстық құқық", q:"Қылмыстық құқық бұзушылықтың кінә нысандарының бірі қайсы?", a:["Қасақаналық","Кездейсоқтық қана","Міндеттілік","Келісім"], c:0},
  {topic:"Адам құқықтары", q:"Конституцияның заңдық күші қандай?", a:["Ең жоғары заңдық күшке ие","Тек ұсыныс сипатында","Жергілікті ережеден төмен","Тек сотқа қатысты"], c:0},
  {topic:"Адам құқықтары", q:"Әркімнің білім алу құқығы қай құқықтар тобына жатады?", a:["Әлеуметтік-экономикалық және мәдени құқықтар","Тек саяси құқықтар","Тек жеке құқықтар","Міндеттер тобы"], c:0},
  {topic:"Адам құқықтары", q:"Адам құқықтарын қорғаудың ұлттық тетіктерінің бірі қайсы?", a:["Сотқа жүгіну","Заңды елемеу","Өз бетінше жаза қолдану","Ақпаратты жасыру"], c:0},
  {topic:"Халықаралық құқық", q:"БҰҰ-ның басты органдарының бірі қайсы?", a:["Бас Ассамблея","ФИФА","Халықаралық Олимпиада комитеті","Дүниежүзілік сауда орталығы"], c:0},
  {topic:"Халықаралық құқық", q:"Халықаралық гуманитарлық құқық негізінен нені реттейді?", a:["Қарулы қақтығыс кезіндегі гуманитарлық қорғауды","Халықаралық сауданың бағасын","Туризм ережелерін","Спорттық жарыстарды"], c:0}
];

let players = [];
let teams = [];
let hostConnected = false;
let game = {phase:"lobby", round:0, questionIndex:0, current:null, seconds:30, deadline:null, answered:[], finished:false};
let timer = null;

function getIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "localhost";
}
function publicState() {
  return {
    players: players.map(p => ({id:p.id,name:p.name,team:p.team,leader:p.leader})),
    teams: teams.map(t => ({id:t.id,name:t.name,score:t.score,leaderName:t.leaderName,members:t.members.map(m=>m.name),answered:t.answered})),
    game: {...game, current: game.current ? {topic:game.current.topic,q:game.current.q,a:game.current.a} : null, answered: [...game.answered]}
  };
}
function broadcast() { io.emit("state", publicState()); }
function stopTimer(){ if(timer){clearInterval(timer);timer=null;} }
function beginQuestion(){
  stopTimer();
  if(game.round >= 5){ game.phase="finished"; game.finished=true; game.current=null; broadcast(); return; }
  const idx = game.round*5 + game.questionIndex;
  game.current = questions[idx];
  game.phase="question";
  game.seconds=30;
  game.deadline=Date.now()+30000;
  game.answered=[];
  teams.forEach(t=>t.answered=false);
  timer=setInterval(()=>{
    game.seconds=Math.max(0,Math.ceil((game.deadline-Date.now())/1000));
    if(game.seconds<=0){stopTimer();game.phase="reveal";}
    broadcast();
  },250);
  broadcast();
}
io.on("connection", socket=>{
  socket.on("join", name=>{
    name=String(name||"").trim().slice(0,30);
    if(!name) return socket.emit("joinError","Атыңызды енгізіңіз.");
    if(players.length>=MAX_PLAYERS) return socket.emit("joinError","Ойыншылар саны 20-ға жетті.");
    if(players.some(p=>p.name.toLowerCase()===name.toLowerCase())) return socket.emit("joinError","Бұл есім тіркелген. Басқа есім жазыңыз.");
    players.push({id:socket.id,name,team:null,leader:false});
    socket.emit("joined",{name});
    broadcast();
  });
  socket.on("hostConnect",()=>{hostConnected=true; socket.emit("hostReady"); broadcast();});
  socket.on("shuffleTeams",()=>{
    if(!hostConnected || players.length!==20) return socket.emit("hostError","Команда бөлу үшін дәл 20 қатысушы керек.");
    const shuffled=[...players].sort(()=>Math.random()-0.5);
    teams=[];
    for(let i=0;i<5;i++){
      const members=shuffled.slice(i*4,i*4+4);
      const leader=members[Math.floor(Math.random()*members.length)];
      const team={id:i,name:`${i+1}-топ`,score:0,members,leaderId:leader.id,leaderName:leader.name,answered:false};
      teams.push(team);
      members.forEach(m=>{m.team=team.name;m.leader=m.id===leader.id;});
    }
    game={phase:"ready",round:0,questionIndex:0,current:null,seconds:30,deadline:null,answered:[],finished:false};
    broadcast();
  });
  socket.on("startGame",()=>{if(teams.length===5){game.round=0;game.questionIndex=0;beginQuestion();}});
  socket.on("answer",(choice)=>{
    const p=players.find(x=>x.id===socket.id);
    if(!p || !p.leader || game.phase!=="question") return;
    const t=teams.find(x=>x.id===Number(p.team?.split("-")[0])-1);
    if(!t || t.answered) return;
    t.answered=true; game.answered.push(t.id);
    if(Number(choice)===game.current.c){t.score+=10; socket.emit("answerResult",{correct:true,message:"Дұрыс жауап! +10 ұпай"});}
    else socket.emit("answerResult",{correct:false,message:"Қате жауап. Келесі сұраққа сәттілік!"});
    if(teams.every(x=>x.answered)){stopTimer();game.phase="reveal";}
    broadcast();
  });
  socket.on("nextQuestion",()=>{
    if(game.phase!=="reveal") return;
    game.questionIndex++;
    if(game.questionIndex>=5){game.round++;game.questionIndex=0;}
    beginQuestion();
  });
  socket.on("resetGame",()=>{
    stopTimer();players=[];teams=[];game={phase:"lobby",round:0,questionIndex:0,current:null,seconds:30,deadline:null,answered:[],finished:false};broadcast();
  });
  socket.on("disconnect",()=>{
    const i=players.findIndex(p=>p.id===socket.id);
    if(i>=0 && game.phase==="lobby") players.splice(i,1);
    broadcast();
  });
});

app.get("/api/info",async(req,res)=>{
  const url=`http://${getIp()}:${PORT}`;
  const qr=await QRCode.toDataURL(url);
  res.json({url,qr,ip:getIp()});
});
app.get("/host",(req,res)=>res.sendFile(__dirname+"/public/host.html"));
app.get("/",(req,res)=>res.sendFile(__dirname+"/public/player.html"));
server.listen(PORT,"0.0.0.0",()=>console.log(`Game running: http://localhost:${PORT}/host`));
