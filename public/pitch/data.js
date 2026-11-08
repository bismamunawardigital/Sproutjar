/* Seed states and shared copy. "Layla" is invented demo data, not a real customer. */
(function () {
  var D = window.SJData = {};
  D.TODAY = new Date(2026, 10, 6);
  D.START = new Date(2026, 10, 1);
  D.PAYDAY_IN = 19;

  /* Set B, "What you actually do". Each answer points to a pattern (p) that picks the first four calls. */
  D.questions = [ { "q": "When your card statement arrives, you...", "a": [ "Open it straight away", "Open it when I feel ready", "Leave it as long as I can", "Pay it, and try not to think about it" ], "p": [ "stuck", "fade", "away", "carry" ] }, { "q": "When a money plan slips, what happens next?", "a": [ "I pay what I can and carry on", "I restart next month", "I go quiet for a while", "Family needed it more that month" ], "p": [ "stuck", "fade", "away", "carry" ] }, { "q": "Where does most of the pressure come from?", "a": [ "The interest", "Spending when I'm tired or stressed", "Not knowing where I stand", "Supporting family alongside the cards" ], "p": [ "stuck", "fade", "away", "carry" ] } ];

  D.countries = [
    { id: 'AE', name: 'United Arab Emirates', live: true },
    { id: 'SA', name: 'Saudi Arabia' }, { id: 'QA', name: 'Qatar' }, { id: 'KW', name: 'Kuwait' },
    { id: 'BH', name: 'Bahrain' }, { id: 'OM', name: 'Oman' }, { id: 'XX', name: 'Somewhere else' }
  ];

  D.kinds = ['Credit card', 'Buy now pay later', 'Personal loan', 'Overdraft'];

  D.agendas = [
    { id: 'gap', t: 'The gap between deciding and doing', m: 15, tech: 'GETTING UNSTUCK', d: 'Why a thing you meant to do did not happen, without keeping score.' },
    { id: 'stands', t: 'Where things actually stand', m: 20, tech: 'GETTING CLEAR', d: "What you owe, what it's costing you, and roughly when it's over." },
    { id: 'tuesday', t: 'An ordinary Tuesday, once this is over', m: 20, tech: 'LOOKING AHEAD', d: 'What a normal week actually looks like when the cards are gone.' },
    { id: 'who', t: 'Who else could take some of this', m: 20, tech: 'SHARING THE LOAD', d: 'Family, your bank, a reduced plan. Who you might ask, and how.' },
    { id: 'fine', t: 'The months that went fine', m: 10, tech: 'WHAT WORKS', d: 'What was different about them, so you can use it on purpose.' },
    { id: 'cost', t: 'What the interest is really costing you', m: 20, tech: 'GETTING CLEAR', d: 'The rent on the debt, in things you would actually want instead.' }
  ];

  D.script = [
    { w: 'ren', s: "Hi {name}. Last time you picked the grocery run, and it didn't move. No tally. I'm curious what that week was actually like." },
    { w: 'you', s: "Payday came and I did the big shop like always. I didn't even think about it." },
    { w: 'ren', s: "So you didn't break a decision. The old routine just ran. In September you said, if I can't do it properly there's no point starting. Is that in here somewhere?" },
    { w: 'you', s: "Maybe. If I can't move the whole shop, why bother." },
    { w: 'ren', s: "What's the smallest version that would still count?" },
    { w: 'you', s: 'Just the meat and fish. Leave those to Thursday.' },
    { w: 'ren', s: "That's small enough to actually happen. Want that to be the one thing, and we look at how it went next time?" }
  ];

  /* First proper talk: nothing to look back on yet. */
  D.scriptFirst = [
    { w: 'ren', s: "Hi {name}. Nothing to prepare. In your own words, where does this actually stand for you right now?" },
    { w: 'you', s: "I pay every month and the balance barely moves. I stopped opening the statements." },
    { w: 'ren', s: "That makes sense. Not looking is how a lot of people get through it. What would make looking feel a bit smaller?" },
    { w: 'you', s: "Maybe just doing it once, on a quiet morning." },
    { w: 'ren', s: "A quiet morning it is. Want that to be the one thing: open the latest statement on Sunday morning, and nothing else?" }
  ];

  D.helloScript = [
    "Hi {name}. I'm Ren. I've seen what you told me, and we're not doing numbers today.",
    "I just want to hear one thing. What made today the day you opened this?",
    "Thanks for saying that. That's enough for a first hello. I'll remember it."
  ];

  function laylaCards() {
    return [
      { id: 'adcb', name: 'ADCB Traveller', bank: 'ADCB', kind: 'Credit card', balance: 4800, rate: 3.25, min: 240, due: 28, stmt: 3, guess: ['the rate'], paid: 6200 },
      { id: 'enbd', name: 'Emirates NBD Platinum', bank: 'Emirates NBD', kind: 'Credit card', balance: 12400, rate: 3.29, min: 620, due: 10, stmt: 16, guess: [], paid: 17100 },
      { id: 'fab', name: 'FAB Titanium', bank: 'FAB', kind: 'Credit card', balance: 21900, rate: 3.49, min: 1095, due: 21, stmt: 27, guess: [], paid: 30100 }
    ];
  }
  function laylaTalks() {
    return [
      { id: 't6', date: '27 Oct', t: 'Who else could carry some of this', c: 'Ask Emirates NBD in writing what a reduced plan would look like', end: 'open', bal: 44200 },
      { id: 't5', date: '13 Oct', t: 'Payday to week three', c: 'Leave the grocery run to Thursday, not the day after payday', end: 'another', bal: 50300 },
      { id: 't4', date: '29 Sep', t: "The months this didn't happen", c: 'Pay ADCB the day salary lands, before anything else', end: 'done', bal: 61000 },
      { id: 't3', date: '15 Sep', t: "What you'd be uncomfortable for", c: '', end: 'nothing', bal: 70200 },
      { id: 't2', date: '1 Sep', t: "The last plan that didn't stick", c: 'Move the FAB card out of my wallet', end: 'done', bal: 78900 },
      { id: 't1', date: '18 Aug', t: 'Where this actually stands', c: 'Write down all three balances on Sunday morning', end: 'done', bal: 87645 }
    ];
  }

  function blank() {
    return {
      scn: 'fresh', signedIn: false, demo: false, name: '', country: 'AE', currency: 'AED',
      bill: { status: 'free', via: 'web' }, cards: [], cleared: [], monthly: 0, order: 'rate', take: 0, essentials: 0, obligations: 0, home: 0, payday: 25,
      monthlyMode: 'derived', windfall: '', jars: [], commitment: null, talks: [], beliefs: [], why: '', worked: '', story: '',
      paidOff: 0, chartStart: 0, reviewDue: false, reviews: 0, reviewEvery: 'payday', paidMonth: {}, firstCallSeen: false,
      minutesUsed: 0, reminders: { review: false, checkin: false, push: false, email: false }, lang: 'en',
      planTab: 'clearing', youTab: 'story', intent: '', quiet: false, typing: false, topic: 'stands', proposal: false, firstMonthly: null,
      ob: { a: [], name: '', country: 'AE', card: { kind: 'Credit card', name: '', bank: '', balance: '', rate: '', min: '' }, take: '', essentials: '', obligations: '', home: '', err: {} },
      stmt: { text: '', from: 'plan', found: null, err: '' }, form: {}, sideways: { why: '', amt: null }, call: null, review: {}, chat: [], end: {}
    };
  }

  function layla(extra) {
    var s = blank();
    Object.assign(s, {
      scn: 'layla', signedIn: true, name: 'Layla', cards: laylaCards(), monthly: 6500, order: 'rate',
      take: 18000, essentials: 8000, obligations: 1500, home: 2000, payday: 25, paidOff: 53400, chartStart: 87645,
      windfall: 'A bonus or a refund goes to the card I am working on, the day it lands.',
      why: 'So my mother never has to ask anyone for anything.',
      worked: "I stopped using two of the cards in March and I haven't touched them since.",
      story: 'Money was something the adults argued about after we went to bed.',
      jars: [{ id: 'buffer', name: 'One month buffer', saved: 2300, target: 11500 }, { id: 'eid', name: 'Eid gifts on purpose', saved: 750, target: 2000 }],
      commitment: { text: 'Ask Emirates NBD in writing what a reduced plan would look like', when: 'Friday evening', around: 'Around 3 Nov', state: 'due', talk: 't6' },
      talks: laylaTalks(), firstCallSeen: true, minutesUsed: 85, reviews: 2, topic: 'gap', proposal: true,
      beliefs: [
        { s: "If I can't do it properly there's no point starting.", d: '1 September' },
        { s: 'Saying no to my family costs more than the money does.', d: '27 October' },
        { s: 'I make a plan and it fades after a week or two.', d: '29 September' },
        { s: 'When money comes up, I go quiet and deal with it later.', d: '18 August' }
      ]
    }, extra || {});
    return s;
  }

  D.scenarios = {
    fresh: blank,
    layla: function () { return layla(); },
    review: function () { return layla({ scn: 'review', reviewDue: true }); },
    open: function () { return layla({ scn: 'open', commitment: Object.assign(layla().commitment, { state: 'open' }) }); },
    none: function () { return layla({ scn: 'none', commitment: null }); },
    building: function () { return layla({ scn: 'building', planTab: 'building' }); },
    nojar: function () { return layla({ scn: 'nojar', planTab: 'building', jars: [] }); },
    settings: function () { return layla({ scn: 'settings', youTab: 'numbers' }); },
    used: function () { return layla({ scn: 'used', minutesUsed: 300 }); },
    ending: function () { return layla({ scn: 'ending', bill: { status: 'ending', via: 'web' } }); },
    paid: function () { return layla({ scn: 'paid', bill: { status: 'paid', via: 'web' } }); },
    failed: function () { return layla({ scn: 'failed', bill: { status: 'failed', via: 'web' } }); },
    cancelled: function () { return layla({ scn: 'cancelled', bill: { status: 'cancelled', via: 'web' } }); },
    lapsed: function () { return layla({ scn: 'lapsed', bill: { status: 'lapsed', via: 'web' } }); },
    lowmin: function () { return layla({ scn: 'lowmin', minutesUsed: 280, bill: { status: 'paid', via: 'web' } }); },
    lowcall: function () { return layla({ scn: 'lowcall', minutesUsed: 297, bill: { status: 'paid', via: 'web' } }); },
    dayone: function () {
      var s = blank();
      return Object.assign(s, { scn: 'dayone', signedIn: true, name: 'Layla', monthly: 3000, order: 'rate', take: 14000, essentials: 9000, obligations: 2000, home: 0, chartStart: 12400,
        cards: [{ id: 'enbd', name: 'Emirates NBD Visa', bank: 'Emirates NBD', kind: 'Credit card', balance: 12400, rate: 3.29, min: 620, due: 10, stmt: 16, guess: ['the rate'], paid: 0 }],
        beliefs: [{ s: "I pay every month and the balance barely moves.", d: 'Today' }], why: '', worked: '', story: '' });
    },
    stuck: function () {
      var s = blank();
      return Object.assign(s, { scn: 'stuck', signedIn: true, name: 'Layla', monthly: 620, order: 'rate', take: 9000, essentials: 7380, obligations: 1000, home: 0, chartStart: 24000,
        cards: [{ id: 'visa', name: 'Emirates NBD Visa', bank: 'Emirates NBD', kind: 'Credit card', balance: 24000, rate: 2.99, min: 620, due: 10, stmt: 16, guess: [], paid: 0 }] });
    },
    last: function () {
      var s = layla();
      return Object.assign(s, { scn: 'last', cards: [Object.assign(laylaCards()[2], { balance: 3200, paid: 48800 })],
        cleared: [{ name: 'ADCB Traveller', paid: 11000, date: 'January 2027' }, { name: 'Emirates NBD Platinum', paid: 29500, date: 'March 2027' }], paidOff: 89300 });
    },
    free: function () {
      var s = layla();
      return Object.assign(s, { scn: 'free', cards: [], commitment: null, paidOff: 92500, planTab: 'building',
        cleared: [{ name: 'ADCB Traveller', paid: 11000, date: 'January 2027' }, { name: 'Emirates NBD Platinum', paid: 29500, date: 'March 2027' }, { name: 'FAB Titanium', paid: 52000, date: 'June 2027' }] });
    }
  };

  D.layla = layla;
  D.sampleStatement = 'Total Amount Due AED 12,400.00\nMinimum Amount Due AED 620.00\nFinance Charges AED 398.12\nNew Purchases AED 310.00\nPayments Received AED 1,500.00\nPayment Due Date 10 Dec 2026\nStatement Date 16 Nov 2026';
})();
