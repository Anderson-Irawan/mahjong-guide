function initPresentation(){
  const deck=document.getElementById('deck');
  const slides=Array.from(deck.querySelectorAll('.slide'));
  const counter=document.getElementById('counter');
  const notesPanel=document.getElementById('notes');
  const noteContent=document.getElementById('noteContent');
  let cur=0;
  function update(){
    slides.forEach((s,i)=>{s.classList.remove('prev','active','next');if(i===cur)s.classList.add('active');else if(i===cur-1)s.classList.add('prev');else if(i===cur+1)s.classList.add('next');});
    counter.textContent=`${cur+1} / ${slides.length}`;
    history.replaceState(null,null,'#'+(cur+1));
    const note=slides[cur].dataset.notes||'';noteContent.innerHTML=note.replace(/\n/g,'<br>');
  }
  function go(n){if(n<0||n>=slides.length)return;cur=n;update();}
  function next(){if(cur<slides.length-1)go(cur+1);}
  function prev(){if(cur>0)go(cur-1);}
  document.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'||e.target.isContentEditable) return;switch(e.key){case 'ArrowRight':case ' ':next();break;case 'ArrowLeft':prev();break;case 'f':document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();break;case 'n':notesPanel.classList.toggle('show');break;}});
  deck.addEventListener('click',e=>{const rect=deck.getBoundingClientRect();const x=e.clientX-rect.left;(x>rect.width/2?next():prev());});
  let startX=0;deck.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;});deck.addEventListener('touchend',e=>{const diff=e.changedTouches[0].clientX-startX;if(Math.abs(diff)>50){diff<0?next():prev();}});
  const m=location.hash.match(/#(\d+)/);if(m){let idx=parseInt(m[1],10)-1;if(idx>=0&&idx<slides.length)cur=idx;}
  update();
}
