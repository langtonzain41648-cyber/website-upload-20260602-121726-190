(function(){
const menu=document.querySelector('.menu-button');
const panel=document.querySelector('.mobile-panel');
if(menu&&panel){menu.addEventListener('click',()=>panel.classList.toggle('open'))}
const slides=[...document.querySelectorAll('.hero-slide')];
const dots=[...document.querySelectorAll('.hero-dot')];
let active=0;
function showHero(i){if(!slides.length)return;active=(i+slides.length)%slides.length;slides.forEach((s,n)=>s.classList.toggle('active',n===active));dots.forEach((d,n)=>d.classList.toggle('active',n===active))}
dots.forEach((d,i)=>d.addEventListener('click',()=>showHero(i)));
if(slides.length>1){setInterval(()=>showHero(active+1),5200)}
const forms=[...document.querySelectorAll('[data-search-form]')];
forms.forEach(form=>{const input=form.querySelector('input');const scope=document.querySelector(form.getAttribute('data-search-form'))||document;const cards=[...scope.querySelectorAll('[data-search]')];const empty=document.querySelector(form.getAttribute('data-empty')||'');const run=()=>{const q=(input.value||'').trim().toLowerCase();let visible=0;cards.forEach(card=>{const ok=!q||(card.getAttribute('data-search')||'').toLowerCase().includes(q);card.style.display=ok?'':'none';if(ok)visible++});if(empty)empty.classList.toggle('show',visible===0)};input.addEventListener('input',run);form.addEventListener('submit',e=>{e.preventDefault();run()})});
})();