const spots = [
  ['attic', 54, 20], ['roof', 69, 13], ['ceiling', 59, 30], ['balcony', 80, 44],
  ['fence', 95, 69], ['living room', 78, 66], ['dining room', 54, 65],
  ['basement', 48, 87], ['study', 35, 66], ['garage', 15, 65],
  ['hedge', 4, 68], ['chimney', 28, 17]
];
const verbs = [
  ['They bought an old house and ___ it ___. Now it looks amazing!', 'did / up'],
  ['When my cousin moved to a new city, it took her a long time to make friends and ___.', 'settle in'],
  ['My brother ___ last year when he went to university. My parents miss him!', 'moved out'],
  ['Tom ___ his room when he found his old schoolbooks.', 'was tidying up'],
  ['They didn’t like the house when they first ___, but now they love it.', 'moved in'],
  ['I’m staying with friends in London. They’re ___ me ___ in the spare room.', 'putting / up'],
  ['My parents sometimes ___ our house to earn money while we’re away on holiday.', 'rent out'],
  ['They ___ the house I was born in. Now it’s gone for ever!', 'pulled down']
];
const patterns = [
  ['How keen are you ___ the idea of decorating your bedroom?', 'on', 'for'],
  ['Is it worth ___ house if you don’t like your neighbours? Why / Why not?', 'moving', 'to move'],
  ['How often do you stop yourself ___ saying what you think?', 'from', 'with'],
  ['Does your teacher make you ___ homework every night?', 'do', 'to do'],
  ['Do you agree that happiness depends ___ where you live?', 'on', 'from'],
  ['How often does someone at home tell you ___ your room?', 'to tidy', 'tidying']
];
const postAnswers = ['moved out', 'settled in', 'do / up', 'put / up'];
const keys = {house:spots.map(([word])=>word), verbs:verbs.map(([,answer])=>answer), post:postAnswers, patterns:patterns.map(([,answer])=>answer)};
const labels = {verbs:'Phrasal verbs',post:'A social media post',patterns:'Word patterns',talk:'Ask and answer'};
const lesson = document.querySelector('#lesson');
const xp = document.querySelector('#xp');
let state = {};
try { state = JSON.parse(localStorage.getItem('home-quest-v1')) || {}; } catch {}
let tab = 'house';
let active = 0;
let checked = false;
let speaking = 0;
const bucket = () => state[tab] ??= {};
const total = Object.values(keys).flat().length;
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function updateXP() {
  const count = Object.entries(keys).reduce((sum,[section, answers]) => sum + answers.filter((answer,i)=>state[section]?.[i]===answer).length,0);
  xp.textContent = count + ' / ' + total;
  try { localStorage.setItem('home-quest-v1', JSON.stringify(state)); } catch {}
}
function dropdown(index, options) {
  const value = bucket()[index];
  const mark = checked && value ? (value === keys[tab][index] ? 'right' : 'incorrect') : '';
  return '<select class="'+mark+'" data-index="'+index+'" aria-label="Answer '+(index+1)+'"><option value="">Choose an answer</option>'+[...options].sort().map(word=>'<option'+(value===word?' selected':'')+'>'+escape(word)+'</option>').join('')+'</select>';
}
function house() {
  const words = keys.house;
  return '<div class="layout"><figure class="frame"><div class="scene"><img src="house.jpg" width="1536" height="1024" alt="A pixel-art house cutaway with rooms, a garden and a basement">'+spots.map(([word,x,y],index)=>{
    const value=bucket()[index];
    const mark=checked&&value ? (word===value?' correct':' wrong') : '';
    return '<button class="pin'+(active===index?' active':'')+mark+'" data-pin="'+index+'" style="left:'+x+'%;top:'+y+'%" aria-pressed="'+(active===index)+'" aria-label="Marker '+(index+1)+(value?', '+escape(value):'')+'">'+(index+1)+'</button>';
  }).join('')+'</div><figcaption><span>HOUSE MAP</span><span>12 MARKERS</span></figcaption></figure><div class="card"><h2>Explore the house</h2><p class="hint">Click a marker on the map and choose the matching word.</p><p class="selection">Marker '+(active+1)+' · '+escape(bucket()[active]||'choose a word')+'</p><div class="bank">'+[...words].sort().map(word=>'<button data-word="'+word+'" aria-pressed="'+(bucket()[active]===word)+'" class="'+(Object.values(bucket()).includes(word)?'used':'')+'">'+word+'</button>').join('')+'</div>'+actions()+'</div></div>';
}
function actions() {
  const answers=keys[tab];
  const count=answers.filter((answer,index)=>bucket()[index]===answer).length;
  const complete=Object.values(bucket()).filter(Boolean).length;
  const message=checked ? (count===answers.length?'All answers are correct!':('Correct: '+count+' of '+answers.length+'. '+(complete<answers.length?'Fill in the blanks and check again.':'Try correcting the highlighted answers.'))) : '';
  return '<div class="actions"><button class="primary" data-action="check">Check answers</button><button data-action="listen">Listen</button><button data-action="reset">Reset</button></div><p class="status" role="status">'+message+'</p>';
}
function sentence(text,index,options) {
  const parts=text.split('___');
  return parts.map((part,i)=>escape(part)+(i===0?dropdown(index,options):i<parts.length-1?' <b>…</b> ':'')).join('');
}
function worksheet() {
  const intro={verbs:'Choose the correct form of the phrasal verb. A slash separates the two parts of a split answer.',post:'Complete the post with phrasal verbs from the previous exercise.',patterns:'Choose the word or phrase that completes each sentence.',talk:'Take turns asking and answering the questions in English.'};
  let body;
  if(tab==='post') {
    const fields=postAnswers.map((_,i)=>dropdown(i,[...postAnswers,'move in','rent out','pull down','tidy up']));
    body='<div class="post"><strong>ZigZagMilo_14</strong><p>Hey, everyone! We finally '+fields[0]+' of our old house, so I’ve got a new address. My sister '+fields[1]+' at our new school quickly and has made some friends, but I’m still finding it a bit strange. Our house is old, so my parents want to '+fields[2]+' it … with a new kitchen and bathroom. It will look great when it’s finished. We’ve got a spare room, so we can '+fields[3]+' you … if you fancy a holiday by the sea!</p></div>';
  } else if(tab==='talk') {
    body='<div class="post" aria-live="polite"><strong>Question '+(speaking+1)+' of '+patterns.length+'</strong><p lang="en">'+patterns[speaking][0].replace('___',patterns[speaking][1])+'</p></div><div class="actions"><button class="primary" data-action="next">Next question</button><button data-action="listen">Listen</button></div><p class="status" role="status"></p>';
  } else {
    const items=tab==='verbs'?verbs:patterns;
    body='<ol class="questions" lang="en">'+items.map(([text,answer,other],i)=>'<li>'+sentence(text,i,other?[answer,other]:keys.verbs)+'</li>').join('')+'</ol>';
  }
  return '<div class="card"><h2>'+labels[tab]+'</h2><p class="hint">'+intro[tab]+'</p>'+body+(tab==='talk'?'':actions())+'</div>';
}
function render(focus) {
  document.querySelectorAll('[data-tab]').forEach(button=>button.setAttribute('aria-current',button.dataset.tab===tab));
  lesson.innerHTML=tab==='house'?house():worksheet();
  if(focus) lesson.querySelector(focus)?.focus({preventScroll:true});
  updateXP();
}
function listen() {
  const status=lesson.querySelector('.status');
  if(!('speechSynthesis' in window)) {
    status.textContent='Audio is unavailable in this browser.';
    return;
  }
  const substitute=(text,index)=>text.replaceAll('___','…').replace('…',bucket()[index]?.split(' / ')[0]||'blank').replace('…',bucket()[index]?.split(' / ')[1]||'blank');
  const spoken={house:()=>[...keys.house].sort().join('. '),verbs:()=>verbs.map(([text],i)=>substitute(text,i)).join(' '),patterns:()=>patterns.map(([text],i)=>substitute(text,i)).join(' '),talk:()=>patterns[speaking][0].replace('___',patterns[speaking][1]),post:()=>''};
  if(tab==='post') {
    const copy=lesson.querySelector('.post p').cloneNode(true);
    copy.querySelectorAll('select').forEach(select=>select.replaceWith(bucket()[Number(select.dataset.index)]?.replace(' / ',' … ')||'blank'));
    spoken.post=()=>copy.textContent;
  }
  speechSynthesis.cancel();
  const voice=new SpeechSynthesisUtterance(spoken[tab]());
  voice.lang='en-GB';
  voice.rate=.86;
  voice.onerror=event=>{
    if(!['interrupted','canceled'].includes(event.error)) status.textContent='Audio is unavailable. Check your browser’s voice settings.';
  };
  speechSynthesis.speak(voice);
}
document.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(!button)return;
  const {tab:section,pin,word,action}=button.dataset;
  if(section) {
    if(tab===section)return;
    window.speechSynthesis?.cancel();
    tab=section;
    checked=false;
    render();
  }
  if(pin!==undefined) {
    active=Number(pin);
    render('[data-pin="'+pin+'"]');
  }
  if(word) {
    bucket()[active]=word;
    render('[data-word="'+word+'"]');
  }
  if(action==='check') {
    checked=true;
    render('[data-action="check"]');
  }
  if(action==='reset') {
    state[tab]={};
    checked=false;
    if(tab==='house')active=0;
    render('[data-action="reset"]');
  }
  if(action==='listen')listen();
  if(action==='next') {
    speaking=(speaking+1)%patterns.length;
    render('[data-action="next"]');
  }
});
lesson.addEventListener('change',event=>{
  const select=event.target;
  if(!select.matches('select[data-index]'))return;
  const index=Number(select.dataset.index);
  bucket()[index]=select.value;
  render('[data-index="'+index+'"]');
});
render();
