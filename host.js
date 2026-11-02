const socket=io();const $=id=>document.getElementById(id);
let lastPhase="",lastRound=-1,lastQ=-1,shownLeaders=false,shownWinner=false;
socket.emit("hostConnect");
fetch("/api/info").then(r=>r.json()).then(d=>{$("qr").src=d.qr;$("url").textContent=d.url;});
$("shuffle").onclick=()=>socket.emit("shuffleTeams");
$("start").onclick=()=>socket.emit("startGame");
$("next").onclick=()=>socket.emit("nextQuestion");
$("reset").onclick=()=>{if(confirm("Ойынды толық қайта бастайсыз ба? Барлық қатысушы қайта қосылуы керек."))socket.emit("resetGame");};
$("closeOverlay").onclick=()=>$("leaderOverlay").classList.add("hidden");
$("closeWinner").onclick=()=>$("winnerOverlay").classList.add("hidden");
socket.on("hostError",m=>alert(m));
socket.on("state",s=>{
 $("count").textContent=`${s.players.length}/20`;$("playerCount").textContent=`${s.players.length} адам`;
 $("players").innerHTML=s.players.map(p=>`<span class="player-pill">${esc(p.name)}</span>`).join("");
 $("teams").innerHTML=s.teams.length?s.teams.map(t=>`<div class="team-card"><h3>${t.name} · ${t.score} ұпай</h3><div class="leader">👑 ${esc(t.leaderName)}</div><ul>${t.members.map(n=>`<li>${esc(n)}</li>`).join("")}</ul><small class="muted">${t.answered?"Жауап берді":"Күтуде"}</small></div>`).join(""):"<div class='muted'>Командалар әлі құрылған жоқ.</div>";
 $("shuffle").disabled=s.players.length!==20||s.teams.length>0;
 $("start").disabled=s.teams.length!==5||s.game.phase!=="ready";
 $("next").disabled=s.game.phase!=="reveal";
 $("round").textContent=s.game.phase==="finished"?"5/5":s.game.round?`${Math.min(s.game.round+1,5)}/5`:"—";
 $("qnum").textContent=s.game.current?`${s.game.questionIndex+1}/5`:"—";
 $("time").textContent=s.game.current?s.game.seconds+"с":"—";
 $("phase").textContent=s.game.phase.toUpperCase();
 if(s.game.current){$("topic").textContent=s.game.current.topic;$("question").textContent=s.game.current.q;$("answers").innerHTML=s.game.current.a.map((a,i)=>`<div class="answer">${String.fromCharCode(65+i)}. ${esc(a)}</div>`).join("");}
 else if(s.game.finished){$("topic").textContent="ОЙЫН АЯҚТАЛДЫ";$("question").textContent="Барлық раунд аяқталды. Жеңімпаз анықталды!";$("answers").innerHTML="";}
 else{$("topic").textContent="ОЙЫНҒА ДАЙЫНДЫҚ";$("question").textContent=s.teams.length?"Командалар дайын. Ойынды бастауға болады.":"Қатысушылар қосылғаннан кейін командаларды бөліңіз.";$("answers").innerHTML="";}
 $("status").textContent=s.players.length===20?"Барлық 20 қатысушы қосылды. Командаларды бөлуге болады.":`Қосылғаны: ${s.players.length}/20`;
 if(s.teams.length===5&&!shownLeaders){shownLeaders=true;$("leaders").innerHTML=s.teams.map(t=>`<div class="leader-row"><b>${t.name}</b> — 👑 ${esc(t.leaderName)}</div>`).join("");$("leaderOverlay").classList.remove("hidden");}
 if(s.game.finished&&!shownWinner){shownWinner=true;const sorted=[...s.teams].sort((a,b)=>b.score-a.score);$("winners").innerHTML=sorted.map((t,i)=>`<div class="winner-row">${i+1}. ${t.name} — ${t.score} ұпай</div>`).join("");$("winnerOverlay").classList.remove("hidden");}
 if(s.game.phase==="lobby"){shownLeaders=false;shownWinner=false;}
});
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
