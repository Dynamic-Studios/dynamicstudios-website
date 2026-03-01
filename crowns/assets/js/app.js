document.addEventListener('DOMContentLoaded', () => {

  // ═══════════════════════════════════════════
  // AUDIO
  // ═══════════════════════════════════════════
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;
  function getAC() { if (!audioCtx) audioCtx = new AudioCtx(); return audioCtx; }

  function playRoll() {
    const ctx = getAC();
    for (let i = 0; i < 10; i++) {
      const t = ctx.currentTime + i * 0.055;
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let s = 0; s < d.length; s++) d[s] = (Math.random()*2-1)*(1-s/d.length);
      const src = ctx.createBufferSource(); src.buffer = buf;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.18 - i*0.015, t);
      src.connect(g); g.connect(ctx.destination); src.start(t);
    }
  }
  function playCardSnd() {
    const ctx = getAC(), o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(620, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(310, ctx.currentTime + 0.14);
    g.gain.setValueAtTime(0.25, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.2);
  }
  function playDrawSnd() {
    const ctx = getAC(), o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle'; o.frequency.setValueAtTime(200, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.15);
    g.gain.setValueAtTime(0.18, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.22);
  }
  function playWin() {
    const ctx = getAC();
    [523,659,784,1047].forEach((f,i) => {
      const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + i*0.13;
      o.type = 'triangle'; o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.28, t); g.gain.exponentialRampToValueAtTime(0.001, t+0.35);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+0.35);
    });
  }
  function playBad() {
    const ctx = getAC(), o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(180, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.25);
    g.gain.setValueAtTime(0.18, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.3);
  }

  // ═══════════════════════════════════════════
  // CSS 3D DICE
  // ═══════════════════════════════════════════
  const FACE_ROTATIONS = {
    1: 'rotateX(0deg)   rotateY(0deg)',
    2: 'rotateX(-90deg) rotateY(0deg)',
    3: 'rotateX(0deg)   rotateY(-90deg)',
    4: 'rotateX(0deg)   rotateY(90deg)',
    5: 'rotateX(90deg)  rotateY(0deg)',
    6: 'rotateX(0deg)   rotateY(180deg)',
  };
  const diceCube = document.getElementById('diceCube');
  let diceRolling = false;

  function rollDie(biased = false) {
    const n = (biased && Math.random() < 0.30) ? 6 : Math.floor(Math.random()*6)+1;
    playRoll();
    if (!diceRolling && diceCube) {
      diceRolling = true;
      diceCube.style.setProperty('--dice-target', FACE_ROTATIONS[n]);
      diceCube.classList.remove('rolling');
      void diceCube.offsetWidth;
      diceCube.classList.add('rolling');
      setTimeout(() => {
        diceCube.classList.remove('rolling');
        diceCube.style.transform = FACE_ROTATIONS[n];
        diceRolling = false;
      }, 750);
    }
    return n;
  }

  // ═══════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════
  let deck=[], playerHand=[], botAHand=[], botBHand=[];
  let lastNumber=0, turn=0, gameOver=false, botBusy=false;
  let playerInEndgame=false, botAInEndgame=false, botBInEndgame=false;
  let playerSkip=false, botASkip=false, botBSkip=false;
  let canDraw=false, difficulty='medium';
  let nineActive=false, nineTurns=0;
  let playerCardPlayed=false, gameStarted=false;

  // ═══════════════════════════════════════════
  // DOM
  // ═══════════════════════════════════════════
  const rollBtn     = document.getElementById('rollBtn');
  const logBox      = document.getElementById('logBox');
  const handEl      = document.getElementById('hand');
  const centerCard  = document.getElementById('centerCard');
  const lastNumEl   = document.getElementById('lastNumber');
  const turnLbl     = document.getElementById('turnLabel');
  const deckCnt     = document.getElementById('deckCount');
  const deckBadge   = document.getElementById('deckCountBadge');
  const botARow     = document.getElementById('botARow');
  const botBRow     = document.getElementById('botBRow');
  const botACnt     = document.getElementById('botACount');
  const botBCnt     = document.getElementById('botBCount');
  const botABlock   = document.getElementById('botABlock');
  const botBBlock   = document.getElementById('botBBlock');
  const newGameBtn  = document.getElementById('newGameBtn');
  const pickupBtn   = document.getElementById('pickupBtn');
  const gambleBtn   = document.getElementById('gambleBtn');
  const drawCardBtn = document.getElementById('drawCardBtn');
  const turnBanner  = document.getElementById('turnBanner');
  const bannerTxt   = document.getElementById('turnBannerText');
  const hintEl      = document.getElementById('actionHint');
  const diffModal   = document.getElementById('diffModal');
  const diffLbl     = document.getElementById('diffLabel');
  const goModal     = document.getElementById('gameOverModal');
  const goIcon      = document.getElementById('gameOverIcon');
  const goTitle     = document.getElementById('gameOverTitle');
  const goSub       = document.getElementById('gameOverSub');
  const rulesModal  = document.getElementById('rulesModal');

  // Rules wiring
  document.getElementById('showRulesFromDiff').addEventListener('click', () => {
    diffModal.classList.add('hidden'); rulesModal.classList.remove('hidden');
  });
  document.getElementById('rulesBackBtn').addEventListener('click', () => {
    rulesModal.classList.add('hidden');
    if (!gameStarted) diffModal.classList.remove('hidden');
  });
  document.getElementById('rulesClose').addEventListener('click', () => rulesModal.classList.add('hidden'));
  document.getElementById('rulesInlineBtn').addEventListener('click', () => rulesModal.classList.remove('hidden'));

  // ═══════════════════════════════════════════
  // DECK — 6 event types
  // ═══════════════════════════════════════════
  function buildDeck() {
    const cards = [];
    [{n:1,r:'bronze'},{n:2,r:'bronze'},{n:3,r:'bronze'},
     {n:4,r:'silver'},{n:5,r:'silver'},{n:6,r:'silver'},
     {n:7,r:'gold'},  {n:8,r:'gold'},  {n:9,r:'gold'}
    ].forEach(c => {
      const count = c.n <= 6 ? 3 : 2;
      for (let i=0; i<count; i++)
        cards.push({n:c.n, r:c.r, img:`assets/img/${c.r}-${c.n}.png`, type:'number'});
    });
    ['Trade','Scout','Shield','Twist','Fate','Crownfall'].forEach(e =>
      cards.push({r:'event', label:e, img:`assets/img/event-${e.toLowerCase()}.png`, type:'event'})
    );
    return shuffle(cards);
  }
  function shuffle(a) {
    for (let i=a.length-1; i>0; i--) {
      const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }
  function deal(size, bias) {
    const h=[];
    if (bias) {
      const idx=deck.findIndex(c=>c.r==='silver'||c.r==='gold');
      if (idx!==-1) h.push(deck.splice(idx,1)[0]);
    }
    while (h.length<size && deck.length) h.push(deck.shift());
    return h;
  }
  function drawCard(hand) {
    // Build a fresh virtual deck if needed
    if (!deck || !deck.length) {
      deck = buildDeck();
    }

    // Pick a random card from the template deck (no shrinking)
    const idx = Math.floor(Math.random() * deck.length);
    const c = { ...deck[idx] }; // copy so hands don't share references

    hand.push(c);
    playDrawSnd();
    return c;
  }



  // ═══════════════════════════════════════════
  // GENERIC MODAL HELPER
  // ═══════════════════════════════════════════
  function showModal(title, subtitle, bodyHTML, buttons) {
    return new Promise(resolve => {
      const ov = document.createElement('div');
      ov.className = 'modal-overlay';
      const btnHTML = buttons.map((b,i) =>
        `<button class="big-btn${b.action?' action':''}" data-idx="${i}">${b.label}</button>`
      ).join('');
      ov.innerHTML = `<div class="modal" style="text-align:center;position:relative">
        <h2>${title}</h2>
        ${subtitle ? `<p class="modal-sub">${subtitle}</p>` : ''}
        ${bodyHTML}
        <div class="modal-btns">${btnHTML}</div>
      </div>`;
      document.body.appendChild(ov);
      ov.querySelectorAll('[data-idx]').forEach(btn => {
        btn.addEventListener('click', () => {
          ov.remove();
          resolve(parseInt(btn.dataset.idx));
        });
      });
    });
  }

  // ═══════════════════════════════════════════
  // GAME START
  // ═══════════════════════════════════════════
  window.startGame = function(diff) {
    getAC(); difficulty=diff; gameStarted=true;
    const sz = diff==='easy'?5 : diff==='medium'?4 : 3;
    deck=buildDeck();
    playerHand=deal(sz,true); botAHand=deal(sz,false); botBHand=deal(sz,false);
    lastNumber=0; turn=0; gameOver=false; botBusy=false;
    playerInEndgame=botAInEndgame=botBInEndgame=false;
    playerSkip=botASkip=botBSkip=false;
    nineActive=false; nineTurns=0;
    canDraw=false; playerCardPlayed=false;
    if (diceCube) diceCube.style.transform = FACE_ROTATIONS[1];
    hideForfeitBtns(); showCenter(null);
    goModal.classList.add('hidden'); diffModal.classList.add('hidden');
    diffLbl.textContent = diff.charAt(0).toUpperCase()+diff.slice(1);
    updateUI();
    log('🎮 Game started! Tap a card to play it.');
    setHint('👆 Tap a card in your hand to play it');
  };
  newGameBtn.addEventListener('click', () => diffModal.classList.remove('hidden'));

  // ═══════════════════════════════════════════
  // FORFEIT BUTTONS
  // ═══════════════════════════════════════════
  function showForfeitBtns() {
    pickupBtn.classList.remove('hidden');
    gambleBtn.classList.remove('hidden');
  }
  function hideForfeitBtns() {
    pickupBtn.classList.add('hidden');
    gambleBtn.classList.add('hidden');
  }

  pickupBtn.addEventListener('click', () => {
    if (turn!==0||gameOver) return;
    hideForfeitBtns();
    drawCard(playerHand);
    log('You picked up 1 card and passed.');
    setHint('🃏 Picked up 1 card — passing to next player','highlight');
    playerCardPlayed=false; updateUI();
    setTimeout(()=>nextTurn(), 700);
  });

  gambleBtn.addEventListener('click', () => {
    if (turn!==0||gameOver) return;
    hideForfeitBtns();
    rollBtn.disabled=true;
    const n=rollDie(true);
    log('🎲 Gamble roll...');
    setHint('🎲 Rolling the dice...','highlight');
    setTimeout(()=>{
      if (n===1) {
        lastNumber=0; lastNumEl.textContent='—';
        if (nineActive){nineActive=false;nineTurns=0;}
        log('🎯 Rolled 1 — number reset! Play any card.');
        setHint('🎯 Number reset! Play any card now','success');
        rollBtn.disabled=false; updateUI();
      } else if (n===6) {
        playBad();
        log('😬 Rolled 6 — you miss your next turn!');
        setHint('😬 Rolled 6 — you miss your next turn!','error');
        playerSkip=true; playerCardPlayed=false; updateUI();
        setTimeout(()=>nextTurn(),1100);
      } else {
        drawCard(playerHand); drawCard(playerHand);
        log(`😐 Rolled ${n} — drew 2 cards.`);
        setHint('😐 Drew 2 cards — passing to next player','highlight');
        playerCardPlayed=false; updateUI(); setTimeout(()=>nextTurn(),900);
      }
    },800);
  });

  // ═══════════════════════════════════════════
  // UI HELPERS
  // ═══════════════════════════════════════════
  function log(msg){ logBox.textContent=msg; }

  function setHint(msg, state='highlight'){
    hintEl.textContent=msg;
    hintEl.className='action-hint '+state;
  }

  function toast(msg){
    const old=document.querySelector('.event-toast'); if(old) old.remove();
    const el=document.createElement('div'); el.className='event-toast';
    el.textContent=msg; document.body.appendChild(el);
    setTimeout(()=>el.remove(),3200);
  }

  function setDraw(show){
    canDraw=show;
    if(show){drawCardBtn.classList.remove('hidden');drawCardBtn.classList.add('action');}
    else    {drawCardBtn.classList.add('hidden');   drawCardBtn.classList.remove('action');}
  }

  function updateBanner(){
    if(turn===0){
      turnBanner.className='turn-banner your-turn';
      bannerTxt.textContent=playerInEndgame?'👑 Endgame — Roll for CROWN!':'⭐ Your Turn';
    } else {
      turnBanner.className='turn-banner bot-turn';
      bannerTxt.textContent=(turn===1?'🤖 Bot A':'🤖 Bot B')+' is thinking...';
    }
    botABlock.classList.toggle('active',turn===1);
    botBBlock.classList.toggle('active',turn===2);
  }

  function makeCard(c, idx){
    const btn=document.createElement('button');
    btn.className='play-card'; btn.dataset.rarity=c.r; btn.type='button';
    const img=document.createElement('img');
    img.src=c.img; img.alt=c.type==='event'?c.label:String(c.n);
    img.addEventListener('error',()=>img.remove());
    btn.appendChild(img);
    const lbl=document.createElement('span'); lbl.className='card-label';
    lbl.textContent=c.type==='event'?c.label:c.n; btn.appendChild(lbl);
    const sub=document.createElement('span'); sub.className='card-sub';
    sub.textContent=c.type==='event'?'Event':c.r; btn.appendChild(sub);
    const tip=document.createElement('span'); tip.className='card-tip';
    tip.textContent=(c.type==='event'?c.label:`${c.r} ${c.n}`).toUpperCase(); btn.appendChild(tip);
    if(idx!==null) btn.addEventListener('click',()=>playerPlay(idx));
    return btn;
  }

  function renderHand(){
    handEl.innerHTML='';
    const myTurn=turn===0&&!gameOver;
    playerHand.forEach((c,i)=>{
      const btn=makeCard(c,i);
      if(!myTurn||playerCardPlayed||playerInEndgame){
        btn.disabled=true;
      } else if(canPlay(c)){
        btn.classList.add('playable');
      } else {
        btn.disabled=true; btn.classList.add('unplayable');
      }
      handEl.appendChild(btn);
    });
  }

  function renderBots(){
    botARow.innerHTML=''; botBRow.innerHTML='';
    botACnt.textContent=botAHand.length; botBCnt.textContent=botBHand.length;
    const mkBack=row=>{
      const d=document.createElement('div'); d.className='bot-card';
      const img=document.createElement('img'); img.src='assets/img/card-back.png';
      img.alt=''; img.draggable=false; img.addEventListener('error',()=>img.remove());
      d.appendChild(img); row.appendChild(d);
    };
    botAHand.forEach(()=>mkBack(botARow));
    botBHand.forEach(()=>mkBack(botBRow));
  }

  function showCenter(card){
    if(!card){
      centerCard.dataset.rarity='';
      centerCard.innerHTML='<span class="no-card-msg">No card<br>played yet</span>';
      centerCard.classList.remove('played'); return;
    }
    centerCard.dataset.rarity=card.r; centerCard.innerHTML='';
    const img=document.createElement('img');
    img.src=card.img; img.alt=card.type==='event'?card.label:String(card.n);
    img.addEventListener('error',()=>img.remove()); centerCard.appendChild(img);
    const face=document.createElement('div'); face.className='card-face-label';
    const v=document.createElement('span'); v.className='val';
    v.textContent=card.type==='event'?card.label:card.n;
    const s=document.createElement('span'); s.className='sub';
    s.textContent=card.type==='event'?'Event':card.r;
    face.appendChild(v); face.appendChild(s); centerCard.appendChild(face);
    void centerCard.offsetWidth;
    centerCard.classList.remove('played'); void centerCard.offsetWidth;
    centerCard.classList.add('played');
  }

  function updateUI(){
    renderHand(); renderBots();
    lastNumEl.textContent=lastNumber===0?'—':lastNumber;
    turnLbl.textContent=turn===0?'You':'Bot '+(turn===1?'A':'B');
    deckCnt.textContent = '∞';
    deckBadge.textContent = '∞';
    updateBanner();
    const myTurn=turn===0&&!gameOver;
    rollBtn.disabled=!myTurn||(playerCardPlayed&&!playerInEndgame);
    if(myTurn&&playerInEndgame){rollBtn.classList.add('action');}
    else{rollBtn.classList.remove('action');}
    if(myTurn&&!playerCardPlayed&&!playerInEndgame){
      const hasPlay=playerHand.some(c=>canPlay(c));
      if(!hasPlay&&playerHand.length>0) showForfeitBtns();
      else hideForfeitBtns();
    } else { hideForfeitBtns(); }
  }

  // ═══════════════════════════════════════════
  // CAN PLAY?
  // ═══════════════════════════════════════════
  function canPlay(card){
    if(card.type==='event') return lastNumber>0;
    return card.n>=lastNumber;
  }

  // ═══════════════════════════════════════════
  // PLAYER PLAYS A CARD
  // ═══════════════════════════════════════════
  function playerPlay(idx){
    if(turn!==0||gameOver||playerCardPlayed||playerInEndgame) return;
    const card=playerHand[idx];
    if(!canPlay(card)){
      const msg=`❌ Must play ${lastNumber} or higher — choose another card`;
      log(msg); setHint(msg,'error'); return;
    }
    playerHand.splice(idx,1);
    playCardSnd();
    playerCardPlayed=true;
    hideForfeitBtns();

    if(card.type==='event'){
      handleEvent(card,'player').then(()=>{ afterPlay(); });
    } else {
      lastNumber=card.n; showCenter(card);
      log(`✅ You played ${card.r} ${card.n}.`);
      if(card.n===9){nineActive=true;nineTurns=0;}
      afterPlay();
    }
    setDraw(false);
  }

  function afterPlay(){
    if(playerHand.length===0&&!playerInEndgame){
      playerInEndgame=true; playerCardPlayed=false;
      updateUI();
      log('👑 Hand empty! Roll a 6 and shout CROWN to win!');
      setHint('👑 Hand empty! Roll the dice — need a 6!','highlight');
      setTimeout(()=>{ playerCardPlayed=false; nextTurn(); },1400);
      return;
    }
    updateUI();
    setHint('✅ Card played! Moving to next player...','success');
    setTimeout(()=>{
      if(!gameOver&&turn===0&&playerCardPlayed){
        playerCardPlayed=false; nextTurn();
      }
    },1400);
  }

  // ═══════════════════════════════════════════
  // EVENT CARD HANDLERS
  // ═══════════════════════════════════════════
  async function handleEvent(card, who){
    showCenter(card);
    const e  = card.label;
    const myH= who==='player'?playerHand : who==='botA'?botAHand : botBHand;
    const nm = who==='player'?'You' : who==='botA'?'Bot A':'Bot B';

    // ── TRADE ──────────────────────────────────
    if(e==='Trade'){
      if(who==='player'){
        if(playerHand.length===0){ log('Trade: no cards to trade!'); toast('🔀 TRADE — no cards!'); return; }
        const targetHands=[{name:'Bot A',hand:botAHand},{name:'Bot B',hand:botBHand}].filter(t=>t.hand.length>0);
        if(!targetHands.length){ log('Trade: no targets have cards!'); toast('🔀 TRADE — no targets!'); return; }

        const tgtChoice = await showModal(
          '🔀 Trade',
          'Choose who to trade with',
          '',
          targetHands.map(t=>({label:`🤖 ${t.name} (${t.hand.length} cards)`}))
        );
        const target=targetHands[tgtChoice];

        const cardBtns=playerHand.map(c=>({
          label: c.type==='event' ? `${c.label} (Event)` : `${c.r} ${c.n}`
        }));
        const myChoice = await showModal(
          '🔀 Trade',
          `Trading with ${target.name} — pick your card to give`,
          '',
          cardBtns
        );

        const ti=Math.floor(Math.random()*target.hand.length);
        const given=playerHand.splice(myChoice,1)[0];
        const received=target.hand.splice(ti,1)[0];
        playerHand.push(received);
        target.hand.push(given);
        log(`🔀 Trade: gave ${given.type==='event'?given.label:given.r+' '+given.n} to ${target.name}, received ${received.type==='event'?received.label:received.r+' '+received.n}.`);
        toast('🔀 TRADE complete!');

      } else {
        const others=[{h:playerHand,n:'Player'},{h:who==='botA'?botBHand:botAHand,n:who==='botA'?'Bot B':'Bot A'}].filter(o=>o.h.length>0);
        if(!others.length||!myH.length) return;
        const opp=others[Math.floor(Math.random()*others.length)];
        const myWorst=myH.reduce((a,b)=>(a.n||0)<(b.n||0)?a:b);
        const ai=myH.indexOf(myWorst);
        const ti=Math.floor(Math.random()*opp.h.length);
        [myH[ai],opp.h[ti]]=[opp.h[ti],myH[ai]];
        log(`${nm} played Trade — swapped a card with ${opp.n}.`); toast('🔀 TRADE');
      }

    // ── SCOUT ──────────────────────────────────
    } else if (e === 'Scout') {
      const picks = [drawCard(myH), drawCard(myH)]; // temporarily into hand

      // Remove them back out of hand so we can choose
      myH.splice(myH.length - 2, 2);

      if (who === 'player') {
        const choice = await showModal(
          '🔍 Scout',
          'Secretly look at the top 2 cards — choose one to keep',
          `<div style="display:flex;gap:12px;justify-content:center;margin:14px 0">
            ${picks.map(c => `
              <div style="background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:12px;padding:12px 18px;font-weight:900;font-size:15px;">
                ${c.type === 'event' ? c.label : `${c.r.toUpperCase()} ${c.n}`}
              </div>`).join('')}
          </div>`,
          picks.map((c, i) => ({
            label: `${i === 0 ? '⬅️' : '➡️'} Keep: ${c.type === 'event' ? c.label : `${c.r} ${c.n}`}`
          }))
        );
        myH.push(picks[choice]);          // keep 1
        log('🔍 Scout: you kept a card.');
        toast('🔍 SCOUT');
        // the “returned” one is just discarded conceptually
      } else {
        picks.sort((a, b) => (b.n || 0) - (a.n || 0));
        myH.push(picks[0]);
        log(`${nm} Scout — took the better card.`);
        toast('🔍 SCOUT');
      }



    // ── SHIELD ──────────────────────────────────
    } else if(e==='Shield'){
      if(who==='player') playerSkip=true;
      else if(who==='botA') botASkip=true; else botBSkip=true;
      log(`${nm} played Shield — next turn will be skipped safely.`); toast('🛡️ SHIELD');

    // ── TWIST ──────────────────────────────────
    } else if(e==='Twist'){
      if(who==='player'){
        const players=[
          {label:'👤 You',   hand:'player'},
          {label:'🤖 Bot A', hand:'botA'},
          {label:'🤖 Bot B', hand:'botB'},
        ];
        const c1 = await showModal(
          '🌀 Twist',
          'Choose the FIRST player to swap',
          '',
          players.map(p=>({label:p.label}))
        );
        const remaining=players.filter((_,i)=>i!==c1);
        const c2raw = await showModal(
          '🌀 Twist',
          `Swap ${players[c1].label} with...`,
          '',
          remaining.map(p=>({label:p.label}))
        );
        const p1=players[c1];
        const p2=remaining[c2raw];
        const getHand=key=>key==='player'?playerHand:key==='botA'?botAHand:botBHand;
        const setHand=(key,newH)=>{
          if(key==='player'){playerHand.length=0;newH.forEach(c=>playerHand.push(c));}
          else if(key==='botA'){botAHand.length=0;newH.forEach(c=>botAHand.push(c));}
          else{botBHand.length=0;newH.forEach(c=>botBHand.push(c));}
        };
        const h1=[...getHand(p1.hand)], h2=[...getHand(p2.hand)];
        setHand(p1.hand,h2); setHand(p2.hand,h1);
        log(`🌀 Twist: ${p1.label} and ${p2.label} swapped hands!`); toast('🌀 TWIST — swapped!');

      } else {
        const ref=[
          {key:'player', h:playerHand, n:'Player'},
          {key:who==='botA'?'botB':'botA', h:who==='botA'?botBHand:botAHand, n:who==='botA'?'Bot B':'Bot A'}
        ];
        ref.sort((a,b)=>b.h.length-a.h.length);
        const target=ref[0];
        const tH=[...target.h], mH=[...myH];
        target.h.length=0; mH.forEach(c=>target.h.push(c));
        myH.length=0; tH.forEach(c=>myH.push(c));
        log(`${nm} Twist — swapped hands with ${target.n}!`); toast('🌀 TWIST');
      }

    // ── FATE ──────────────────────────────────
    } else if(e==='Fate'){
      const rp=Math.floor(Math.random()*6)+1;
      const ra=Math.floor(Math.random()*6)+1;
      const rb=Math.floor(Math.random()*6)+1;
      rollDie(false);

      const results=[
        {name:'You',   roll:rp, hand:playerHand},
        {name:'Bot A', roll:ra, hand:botAHand},
        {name:'Bot B', roll:rb, hand:botBHand},
      ];
      const mx=Math.max(rp,ra,rb);
      const mn=Math.min(rp,ra,rb);

      results.filter(r=>r.roll===mx&&r.hand.length>0).forEach(r=>{
        const idx=Math.floor(Math.random()*r.hand.length);
        const returned=r.hand.splice(idx,1)[0];
        deck.push(returned);
      });
      results.filter(r=>r.roll===mn&&r.roll!==mx).forEach(r=>{
        drawCard(r.hand); drawCard(r.hand);
      });

      const resultStr=results.map(r=>`${r.name}=${r.roll}`).join(', ');
      log(`🎲 Fate! ${resultStr}. High(${mx}) returns a card; low(${mn}) draws 2.`);
      toast(`🎲 FATE — ${resultStr}`);

      if(who==='player'){
        await showModal(
          '🎲 Fate Result',
          '',
          `<div style="font-size:16px;margin:10px 0">
            ${results.map(r=>`<p style="margin:6px 0;color:${r.roll===mx?'#ff9494':r.roll===mn&&r.roll!==mx?'#7dffaa':'#fff'}">
              ${r.name}: rolled <strong>${r.roll}</strong>
              ${r.roll===mx?' — returns 1 card 📤':''}
              ${r.roll===mn&&r.roll!==mx?' — draws 2 cards 📥':''}
            </p>`).join('')}
          </div>`,
          [{label:'OK', action:true}]
        );
      }

    // ── CROWNFALL ──────────────────────────────────
    } else if(e==='Crownfall'){
      if(lastNumber===0){
        log('Crownfall: no number to halve!'); toast('👑 CROWNFALL — no target'); return;
      }
      const old=lastNumber;
      lastNumber=Math.ceil(lastNumber/2);
      lastNumEl.textContent=lastNumber;
      log(`${nm} Crownfall — halved ${old} → ${lastNumber}!`); toast(`👑 CROWNFALL ${old} → ${lastNumber}`);
    }
  }

  // ═══════════════════════════════════════════
  // ROLL BUTTON
  // ═══════════════════════════════════════════
  rollBtn.addEventListener('click', ()=>{
    if(turn!==0||gameOver) return;
    if(playerCardPlayed&&!playerInEndgame) return;
    getAC(); rollBtn.disabled=true;
    const n=rollDie(false);

    setTimeout(()=>{
      if(playerInEndgame){
        if(n===6){ showCrownPrompt(); return; }
        else if(n===1){
          drawCard(playerHand); playerInEndgame=false;
          log('Rolled 1 — picked up a card and re-entered!');
          setHint('🃏 Picked up a card — play it next turn','highlight');
          updateUI(); setTimeout(()=>nextTurn(),1000);
        } else {
          log(`Rolled ${n} — keep rolling, need a 6!`);
          setHint(`🎲 Rolled ${n} — keep rolling, need a 6!`,'highlight');
          rollBtn.disabled=false; rollBtn.classList.add('action');
          updateUI(); setTimeout(()=>{ playerCardPlayed=false; nextTurn(); },1200);
        }
        return;
      }
      if(n===1){
        lastNumber=0; lastNumEl.textContent='—';
        if(nineActive){nineActive=false;nineTurns=0;}
        log('🎯 Rolled 1 — number reset! Play any card.');
        setHint('🎯 Number reset to 0 — play any card!','success');
        rollBtn.disabled=false; updateUI();
      } else if(n===6){
        playBad();
        log('😬 Rolled 6 — you miss your next turn!');
        setHint('😬 Rolled 6 — you miss your next turn!','error');
        updateUI(); setTimeout(()=>nextTurn(),1300);
      } else {
        drawCard(playerHand);
        log(`🎲 Rolled ${n} — drew a card.`);
        setHint('🃏 Card drawn — you can play it or forfeit','highlight');
        rollBtn.disabled=false; updateUI();
      }
    },800);
  });

  function showCrownPrompt(){
    const ov=document.createElement('div'); ov.className='modal-overlay';
    ov.innerHTML=`<div class="modal" style="text-align:center">
      <div style="font-size:64px;margin-bottom:8px">👑</div>
      <h2 style="color:#ffd77a">You rolled a 6!</h2>
      <p style="color:rgba(255,255,255,.82);margin:8px 0 24px">
        Shout <strong style="color:#ffd77a">CROWN</strong> out loud right now to win!
      </p>
      <div class="modal-btns">
        <button class="big-btn action" id="_cY">👑 CROWN! — I Win!</button>
        <button class="big-btn" id="_cN">😬 I forgot to say it...</button>
      </div></div>`;
    document.body.appendChild(ov);
    document.getElementById('_cY').addEventListener('click',()=>{
      ov.remove(); gameOver=true; playWin();
      endGame(true,'👑 CROWN! You Win!','You emptied your hand and rolled a 6!');
    });
    document.getElementById('_cN').addEventListener('click',()=>{
      ov.remove();
      log('No CROWN called — shout it next time!');
      setHint('😬 Forgot CROWN! Keep rolling next turn','error');
      rollBtn.disabled=false; rollBtn.classList.add('action');
      updateUI(); setTimeout(()=>{ playerCardPlayed=false; nextTurn(); },900);
    });
  }

  drawCardBtn.addEventListener('click',()=>{
    if(!canDraw||turn!==0||gameOver) return;
    drawCard(playerHand); setDraw(false);
    log('Drew a card.'); setHint('🃏 Card drawn — play it or use forfeit options','highlight'); updateUI();
  });

  // ═══════════════════════════════════════════
  // TURN ENGINE
  // ═══════════════════════════════════════════
  function nextTurn(){
    if(gameOver) return;
    if(nineActive){
      nineTurns++;
      if(nineTurns>=3){
        nineActive=false; nineTurns=0; lastNumber=0; lastNumEl.textContent='—';
        log('Full round after 9 — number resets!'); toast('🔄 Number reset after 9');
      }
    }
    turn=(turn+1)%3; playerCardPlayed=false; updateUI();

    if(turn===0){
      botBusy=false;
      if(playerSkip){
        playerSkip=false;
        log('Your turn is skipped (Shield).'); setHint('🛡️ Your turn skipped by Shield','error');
        setTimeout(()=>nextTurn(),900); return;
      }
      if(playerInEndgame){
        setHint('👑 Roll the dice — need a 6 to CROWN!','highlight');
        log('👑 Endgame! Roll a 6 and shout CROWN!');
        rollBtn.disabled=false; rollBtn.classList.add('action');
      } else {
        const hasPlay=playerHand.some(c=>canPlay(c));
        if(hasPlay) setHint('👆 Your turn — tap a card to play it','highlight');
        else{ setHint('⚠️ No playable cards — pick up or gamble!','error'); showForfeitBtns(); }
        log('Your turn!');
      }
      return;
    }

    if(botBusy) return;
    botBusy=true;
    const isA=turn===1;
    const name=isA?'Bot A':'Bot B';
    const bHand=isA?botAHand:botBHand;
    log(`${name} is thinking...`);

    setTimeout(async()=>{
      if(gameOver){botBusy=false; return;}

      if(isA?botASkip:botBSkip){
        if(isA) botASkip=false; else botBSkip=false;
        log(`${name} skipped (Shield).`); botBusy=false;
        setTimeout(()=>nextTurn(),700); return;
      }

      if(bHand.length===0){
        const inEnd=isA?botAInEndgame:botBInEndgame;
        if(inEnd){
          const r=rollDie(false);
          setTimeout(()=>{
            if(gameOver){botBusy=false;return;}
            if(r===6){
              gameOver=true; botBusy=false;
              endGame(false,`${name} Wins! 👑`,`${name} emptied their hand and rolled CROWN!`);
            } else if(r===1){
              drawCard(bHand);
              if(isA) botAInEndgame=false; else botBInEndgame=false;
              log(`${name} rolled 1 — picked up a card.`); botBusy=false;
              setTimeout(()=>nextTurn(),900);
            } else {
              log(`${name} rolled ${r} — needs a 6.`); botBusy=false;
              setTimeout(()=>nextTurn(),900);
            }
          },750); return;
        }
        if(isA) botAInEndgame=true; else botBInEndgame=true;
        log(`${name} hand empty — rolling for CROWN!`); botBusy=false;
        setTimeout(()=>nextTurn(),700); return;
      }

      const playable=bHand.filter(c=>canPlay(c));
      if(playable.length>0){
        let chosen;
        if(difficulty==='easy'){
          chosen=playable[Math.floor(Math.random()*playable.length)];
        } else if(difficulty==='medium'){
          const nums=playable.filter(c=>c.type==='number');
          const evs=playable.filter(c=>c.type==='event');
          chosen=(evs.length&&Math.random()<0.25)
            ? evs[Math.floor(Math.random()*evs.length)]
            : (nums.length?nums.reduce((a,b)=>a.n<b.n?a:b):playable[0]);
        } else {
          const nums=playable.filter(c=>c.type==='number');
          const evs=playable.filter(c=>c.type==='event');
          chosen=(evs.length&&Math.random()<0.45)
            ? evs[Math.floor(Math.random()*evs.length)]
            : (nums.length?nums.reduce((a,b)=>b.n>a.n?b:a):playable[0]);
        }
        bHand.splice(bHand.indexOf(chosen),1);
        playCardSnd();
        if(chosen.type==='event'){
          await handleEvent(chosen,isA?'botA':'botB');
        } else {
          lastNumber=chosen.n; showCenter(chosen);
          log(`${name} played ${chosen.r} ${chosen.n}.`);
          if(chosen.n===9){nineActive=true;nineTurns=0;}
        }
      } else {
        drawCard(bHand);
        log(`${name} couldn't play — drew a card.`);
      }

      updateUI(); botBusy=false;
      if(!gameOver) setTimeout(()=>nextTurn(),1100);
    },950);
  }

  // ═══════════════════════════════════════════
  // GAME OVER
  // ═══════════════════════════════════════════
  function endGame(win,title,sub){
    goIcon.textContent=win?'👑':'💀';
    goTitle.textContent=title;
    goTitle.className='gameover-title '+(win?'win':'lose');
    goSub.textContent=sub;
    goModal.classList.remove('hidden'); updateUI();
  }

});
