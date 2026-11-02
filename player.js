const socket=io();const $=id=>document.getElementById(id);
let joined=false, myName="",myState=null,selected=false;
$("joinBtn").onclick=()=>{socket.emit("join",$("name").value);};
socket.on("joinError",m=>$("err").textContent=m);
socket.on("joined",d=>{joined=true;myName=d.name;$("joinBox").classList.add("hidden");$("waitBox").classList.remove("hidden");$("welcome").textContent=`Қош келдің, ${myName}!`;});
socket.on("state",s=>{
 myState=s;
 if(!joined)return;
 const me=s.players.find(p=>p.name===myName);
 if(me&&me.team){$("teamInfo").textContent=`${me.team} • ${me.leader?"СЕН — КОМАНДА ЛИДЕРІСІҢ!":"Команда мүшесі"}`;$("leaderBadge").textContent=me.leader?"👑 Лидер жауап береді.":"Сұрақтарды телефоныңнан көріп отыр."; }
 if(s.game.finished){$("waitBox").classList.add("hidden");$("questionBox").classList.add("hidden");$("finishBox").classList.remove("hidden");return;}
 if(s.game.phase==="question"&&s.game.current){
  selected=false;
  $("waitBox").classList.add("hidden");$("questionBox").classList.remove("hidden");
  $("roundLabel").textContent=`${s.game.round+1}-РАУНД • ${s.game.questionIndex+1}/5`;
  $("timer").textContent=s.game.seconds;$("topic").textContent=s.game.current.topic;$("question").textContent=s.game.current.q;
  const team=me&&s.teams.find(t=>t.name===me.team);
  const locked=!me||!me.leader||!team||team.answered;
  $("choices").innerHTML="";
  s.game.current.a.forEach((a,i)=>{const b=document.createElement("button");b.className="choice";b.textContent=`${String.fromCharCode(65+i)}. ${a}`;b.disabled=locked||selected;b.onclick=()=>{selected=true;socket.emit("answer",i);[...$("choices").children].forEach(x=>x.disabled=true);};$("choices").appendChild(b);});
  if(!me?.leader)$("answerMsg").textContent="Лидеріңіздің жауабын күтіңіз.";
  else if(team?.answered)$("answerMsg").textContent="Жауабыңыз қабылданды.";
  else $("answerMsg").textContent="Дұрыс жауапты таңдаңыз!";
 }else if(s.game.phase==="reveal"){$("timer").textContent="0";$("answerMsg").textContent="Уақыт аяқталды. Келесі сұрақты күтіңіз.";}
 else if(s.game.phase==="ready"){$("waitBox").classList.remove("hidden");$("questionBox").classList.add("hidden");}
});
socket.on("answerResult",r=>{$("answerMsg").textContent=r.message;});
