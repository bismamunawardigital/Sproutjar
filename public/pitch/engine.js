/* Sproutjar payoff engine (prototype reference for Devin).
   Model, one month at a time:
     1. Interest is added to each balance: balance x monthly rate.
     2. The month's total payment covers each card's minimum first.
     3. Whatever is left goes to the focus card, chosen by payoff order.
   When a card clears, its minimum rolls into the same monthly total.
   Figures are estimates: no new spending, payments made in full, rates unchanged. */
(function (root) {
  var MAX_MONTHS = 600;

  function addMonths(start, n) { return new Date(start.getFullYear(), start.getMonth() + n, 1); }

  function focusOrder(cards, balances, order) {
    var open = cards.filter(function (c) { return balances[c.id] > 0.005; });
    return open.sort(function (a, b) {
      if (order === 'small') return balances[a.id] - balances[b.id];
      return b.rate - a.rate || balances[a.id] - balances[b.id];
    });
  }

  /* Pay one month from the given balances. Mutates balances. Returns per-card payments and interest. */
  function stepMonth(cards, balances, monthly, order) {
    var pays = {}, interest = {}, left = monthly;
    cards.forEach(function (c) {
      var i = balances[c.id] * (c.rate / 100);
      interest[c.id] = i; balances[c.id] += i; pays[c.id] = 0;
    });
    cards.forEach(function (c) {
      var p = Math.min(balances[c.id], c.min || 0, Math.max(left, 0));
      balances[c.id] -= p; pays[c.id] += p; left -= p;
    });
    focusOrder(cards, balances, order).forEach(function (c) {
      var p = Math.min(balances[c.id], Math.max(left, 0));
      balances[c.id] -= p; pays[c.id] += p; left -= p;
      if (balances[c.id] < 0.005) balances[c.id] = 0;
    });
    cards.forEach(function (c) { if (balances[c.id] < 0.005) balances[c.id] = 0; });
    return { pays: pays, interest: interest };
  }

  /* The whole plan. start = the current month; the first payment lands the month after. */
  function plan(opts) {
    var cards = opts.cards.filter(function (c) { return c.balance > 0; });
    var monthly = opts.monthly, order = opts.order || 'rate';
    var start = opts.start || new Date(2026, 10, 1);
    var balances = {}, perCard = {};
    cards.forEach(function (c) { balances[c.id] = c.balance; perCard[c.id] = { id: c.id, name: c.name, interest: 0, month: null, date: null }; });
    var first = null, months = 0, totalInterest = 0, totalPaid = 0;
    var firstInterest = cards.reduce(function (s, c) { return s + c.balance * c.rate / 100; }, 0);
    var sumMins = cards.reduce(function (s, c) { return s + (c.min || 0); }, 0);

    if (!cards.length) return { months: 0, totalInterest: 0, totalPaid: 0, never: false, payoffs: [], first: { pays: {}, interest: {} }, firstInterest: 0, sumMins: 0, date: start };
    if (monthly <= firstInterest) return { never: true, months: null, totalInterest: null, totalPaid: null, payoffs: [], first: null, firstInterest: firstInterest, sumMins: sumMins, date: null, monthly: monthly };

    while (months < MAX_MONTHS && cards.some(function (c) { return balances[c.id] > 0.005; })) {
      months += 1;
      /* firstMonthly: what actually goes to the cards this month, when a month goes sideways. */
      var s = stepMonth(cards, balances, (months === 1 && opts.firstMonthly != null) ? opts.firstMonthly : monthly, order);
      if (!first) first = s;
      cards.forEach(function (c) {
        perCard[c.id].interest += s.interest[c.id];
        totalInterest += s.interest[c.id];
        totalPaid += s.pays[c.id];
        if (balances[c.id] === 0 && perCard[c.id].month === null) {
          perCard[c.id].month = months; perCard[c.id].date = addMonths(start, months);
        }
      });
    }
    var payoffs = Object.keys(perCard).map(function (k) { return perCard[k]; }).sort(function (a, b) { return a.month - b.month; });
    return { never: false, months: months, totalInterest: totalInterest, totalPaid: totalPaid, payoffs: payoffs, first: first, firstInterest: firstInterest, sumMins: sumMins, date: addMonths(start, months), monthly: monthly };
  }

  /* Minimums only: the total of today's minimums keeps being paid, so cleared cards roll over. */
  function minimumsOnly(cards, start) {
    var sum = cards.filter(function (c) { return c.balance > 0; }).reduce(function (s, c) { return s + (c.min || 0); }, 0);
    return plan({ cards: cards, monthly: sum, order: 'rate', start: start });
  }

  function compareOrders(cards, monthly, start) {
    return { rate: plan({ cards: cards, monthly: monthly, order: 'rate', start: start }), small: plan({ cards: cards, monthly: monthly, order: 'small', start: start }) };
  }

  /* Cards whose minimum does not cover their own monthly interest. */
  function stuckCards(cards) {
    return cards.filter(function (c) { return c.balance > 0 && c.min > 0 && c.min <= c.balance * c.rate / 100; });
  }

  /* What to pay this month, per card, largest action first. */
  function thisMonth(cards, monthly, order, start, firstMonthly) {
    var p = plan({ cards: cards, monthly: monthly, order: order, start: start, firstMonthly: firstMonthly });
    if (p.never) return { never: true, focus: null, others: [] };
    var live = cards.filter(function (c) { return c.balance > 0; });
    var balances = {}; live.forEach(function (c) { balances[c.id] = c.balance; });
    var focus = focusOrder(live, balances, order)[0];
    return {
      never: false,
      focus: focus ? { card: focus, pay: p.first.pays[focus.id] } : null,
      others: live.filter(function (c) { return c !== focus; }).map(function (c) { return { card: c, pay: p.first.pays[c.id] }; })
    };
  }

  /* Interest implied by a statement reading. */
  function impliedInterest(lastBalance, paid, added, balanceNow) {
    return Math.max(0, balanceNow - (lastBalance - paid + added));
  }

  /* After the last card: reserve first, then jars, at the same monthly amount. */
  function jarSchedule(jars, monthly, debtFreeDate) {
    var cursor = 0, out = [];
    jars.forEach(function (j) {
      var need = Math.max(0, j.target - j.saved);
      var filled = cursor + need;
      out.push({ id: j.id, name: j.name, need: need, date: addMonths(debtFreeDate, Math.max(1, Math.ceil(filled / monthly))) });
      cursor = filled;
    });
    return out;
  }

  var api = { plan: plan, minimumsOnly: minimumsOnly, compareOrders: compareOrders, stuckCards: stuckCards, thisMonth: thisMonth, impliedInterest: impliedInterest, jarSchedule: jarSchedule, addMonths: addMonths };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.SJEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
