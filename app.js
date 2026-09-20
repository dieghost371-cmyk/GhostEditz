const $ = (s) => document.querySelector(s);
const code = $("#code");
const status = $("#status");

async function loadCommands(){
  const r = await fetch("/api/commands");
  const data = await r.json();
  $("#commandList").innerHTML = data.commands.map(([c,d]) =>
    `<div class="cmd"><b>${c}</b><span>${d}</span></div>`
  ).join("");
}
async function refresh(){
  try{
    const r=await fetch("/api/status"); const d=await r.json();
    status.textContent=(d.state.status||"unknown").toUpperCase();
  }catch{status.textContent="OFFLINE"}
}
$("#pair").onclick = async () => {
  const phone=$("#phone").value.trim();
  code.textContent="GENERATING…";
  try{
    const r=await fetch("/api/pair",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({phone})});
    const d=await r.json();
    if(!d.ok) throw new Error(d.error);
    code.textContent=d.code;
  }catch(e){code.textContent="ERROR"; alert(e.message)}
};
loadCommands(); refresh(); setInterval(refresh,5000);
