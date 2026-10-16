/* Calcolo delle quote nella successione legittima (senza testamento), codice civile artt. 565-586.
   Usato da quote-ereditarie.html e dai test. Frazioni esatte. */
(function (radice) {
  function mcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function F(n, d) { if (d === undefined) d = 1; if (d < 0) { n = -n; d = -d; } var g = mcd(n, d); return { n: n / g, d: d / g }; }
  function piu(a, b) { return F(a.n * b.d + b.n * a.d, a.d * b.d); }
  function meno(a, b) { return F(a.n * b.d - b.n * a.d, a.d * b.d); }
  function per(a, b) { return F(a.n * b.n, a.d * b.d); }
  function div(a, k) { return F(a.n, a.d * k); }
  function val(a) { return a.n / a.d; }
  function minore(a, b) { return a.n * b.d < b.n * a.d; }
  var UNO = F(1), ZERO = F(0);

  // una "stirpe": il chiamato oppure, se è morto prima o rinuncia, i suoi figli per rappresentazione (artt. 467-468)
  function stirpe(p, ruolo, etichetta) {
    var nome = (p.nome || '').trim() || etichetta;
    if (p.stato === 'vivo') return [{ nome: nome, ruolo: ruolo, frazione: UNO }];
    var n = Math.max(0, Math.floor(+p.disc || 0));
    if (!n) return null;
    var ruoloR = ruolo === 'figlio' ? 'nipote_retta' : 'nipote_fratello';
    var out = [];
    for (var i = 0; i < n; i++) out.push({ nome: 'Nipote ' + (n > 1 ? (i + 1) + ' ' : '') + '(figlio/a di ' + nome + ')', ruolo: ruoloR, frazione: F(1, n), rappr: nome, motivoRappr: p.stato === 'rinuncia' ? 'rinuncia' : 'premorto' });
    return out;
  }
  function stirpi(lista, ruolo, prefisso) { var out = []; (lista || []).forEach(function (p, i) { var s = stirpe(p, ruolo, prefisso + ' ' + (i + 1)); if (s) out.push(s); }); return out; }
  function assegna(eredi, stirpe, quota, art, spiega) { stirpe.forEach(function (e) { eredi.push({ nome: e.nome, ruolo: e.ruolo, frazione: per(quota, e.frazione), art: e.rappr ? art + ', 467-468' : art, spiega: e.rappr ? spiega + ' Subentra al posto di ' + e.rappr + ' (' + (e.motivoRappr === 'rinuncia' ? 'che ha rinunciato' : 'morto prima') + ') e ne divide la quota' + (e.frazione.d > 1 ? ' in parti uguali con fratelli e sorelle.' : '.') : spiega }); }); }

  // genitori e fratelli insieme (art. 571): per capi, i fratelli unilaterali valgono metà; agli ascendenti almeno "minimo"
  function genitoriFratelli(eredi, R, gen, FG, FU, minimo, artBase) {
    var u = gen.length * 2 + FG.length * 2 + FU.length;
    var quotaGen = gen.length ? F(R.n * gen.length * 2, R.d * u) : ZERO;
    if (gen.length && (FG.length || FU.length) && minore(quotaGen, minimo)) quotaGen = minimo;
    var resto = meno(R, quotaGen), uf = FG.length * 2 + FU.length;
    gen.forEach(function (g) { eredi.push({ nome: g, ruolo: 'genitore', frazione: div(quotaGen, gen.length), art: artBase, spiega: (FG.length || FU.length) ? 'Genitori e fratelli dividono per capi, ma ai genitori spetta comunque almeno ' + (minimo.n + '/' + minimo.d) + ' dell’eredità.' : (gen.length > 1 ? 'I genitori dividono in parti uguali.' : 'Unico genitore.') }); });
    FG.forEach(function (s) { assegna(eredi, s, F(resto.n * 2, resto.d * uf), artBase, 'Fratelli e sorelle dividono per capi.'); });
    FU.forEach(function (s) { assegna(eredi, s, F(resto.n, resto.d * uf), artBase.indexOf('570') >= 0 ? artBase : artBase + ', 570', 'Fratello o sorella solo per parte di padre o di madre: riceve la metà di un fratello germano.'); });
  }
  function nonni(eredi, R, np, nm, art) {
    var linee = (np > 0 ? 1 : 0) + (nm > 0 ? 1 : 0);
    [['paterno', np], ['materno', nm]].forEach(function (l) { for (var i = 0; i < l[1]; i++) eredi.push({ nome: 'Nonno/a ' + l[0] + (l[1] > 1 ? ' ' + (i + 1) : ''), ruolo: 'nonno', frazione: F(R.n, R.d * linee * l[1]), art: art, spiega: linee > 1 ? 'Metà dell’eredità (o della parte riservata agli ascendenti) va alla linea paterna, metà a quella materna.' : 'C’è una sola linea di ascendenti: riceve tutta la parte.' }); });
  }

  function calcola(S) {
    var eredi = [], casi = [];
    var coniuge = S.coniuge === 'si';
    var nomeConiuge = (S.nomeConiuge || '').trim() || 'Coniuge';
    var D = stirpi(S.figli, 'figlio', 'Figlio');
    if (D.length) {
      var R = UNO;
      if (coniuge) { var q = D.length === 1 ? F(1, 2) : F(1, 3); eredi.push({ nome: nomeConiuge, ruolo: 'coniuge', frazione: q, art: '581', spiega: D.length === 1 ? 'Con un solo figlio, al coniuge spetta la metà.' : 'Con due o più figli, al coniuge spetta un terzo.' }); R = meno(UNO, q); }
      D.forEach(function (s) { assegna(eredi, s, div(R, D.length), coniuge ? '581, 566' : '566', coniuge ? (D.length === 1 ? 'Il figlio riceve l’altra metà.' : 'I figli dividono in parti uguali i due terzi.') : 'I figli dividono l’eredità in parti uguali.'); });
      casi.push(coniuge ? 'coniuge e figli' : 'solo figli');
    } else {
      var gen = []; if (S.padre) gen.push('Padre'); if (S.madre) gen.push('Madre');
      var FG = stirpi(S.germani, 'fratello', 'Fratello/sorella'), FU = stirpi(S.unilaterali, 'fratello', 'Fratello/sorella unilaterale');
      var fr = FG.length + FU.length;
      var np = (!gen.length && !fr) ? Math.max(0, Math.min(2, +S.nonniP || 0)) : 0, nm = (!gen.length && !fr) ? Math.max(0, Math.min(2, +S.nonniM || 0)) : 0;
      if (coniuge) {
        if (!gen.length && !fr && !np && !nm) { eredi.push({ nome: nomeConiuge, ruolo: 'coniuge', frazione: UNO, art: '583', spiega: 'Senza figli, genitori, fratelli o ascendenti, il coniuge riceve tutta l’eredità.' }); casi.push('solo coniuge'); }
        else {
          eredi.push({ nome: nomeConiuge, ruolo: 'coniuge', frazione: F(2, 3), art: '582', spiega: 'Senza figli, al coniuge spettano due terzi; il resto va a genitori (o altri ascendenti) e fratelli.' });
          if (gen.length || fr) genitoriFratelli(eredi, F(1, 3), gen, FG, FU, F(1, 4), '582, 571');
          else nonni(eredi, F(1, 3), np, nm, '582, 569');
          casi.push('coniuge senza figli');
        }
      } else if (gen.length || fr) { genitoriFratelli(eredi, UNO, gen, FG, FU, F(1, 2), gen.length && fr ? '571' : gen.length ? '568' : '570'); casi.push('genitori e/o fratelli'); }
      else if (np || nm) { nonni(eredi, UNO, np, nm, '569'); casi.push('ascendenti'); }
      else if ((+S.altriN || 0) > 0) {
        var n = Math.floor(+S.altriN), g = Math.max(3, Math.min(6, +S.altriGrado || 3));
        for (var i = 0; i < n; i++) eredi.push({ nome: 'Parente di ' + g + '° grado ' + (n > 1 ? i + 1 : ''), ruolo: 'altro' + g, frazione: F(1, n), art: '572', spiega: 'Mancando coniuge, figli, genitori, fratelli e ascendenti, eredita il parente più vicino (fino al 6° grado); se sono più dello stesso grado, in parti uguali.' });
        casi.push('altri parenti');
      } else { eredi.push({ nome: 'Stato italiano', ruolo: 'stato', frazione: UNO, art: '586', spiega: 'Senza parenti entro il sesto grado l’eredità va allo Stato.' }); casi.push('Stato'); }
    }
    var somma = eredi.reduce(function (t, e) { return piu(t, e.frazione); }, ZERO);
    return { eredi: eredi, somma: somma, caso: casi.join(', ') };
  }

  // imposta di successione (D.Lgs. 346/1990, art. 7)
  function aliquota(ruolo, handicap) {
    var f;
    if (/^(coniuge|figlio|nipote_retta|genitore|nonno)$/.test(ruolo)) f = { al: 0.04, fr: 1000000, testo: '4% oltre 1.000.000 € (coniuge e parenti in linea retta)' };
    else if (ruolo === 'fratello') f = { al: 0.06, fr: 100000, testo: '6% oltre 100.000 € (fratelli e sorelle)' };
    else if (ruolo === 'nipote_fratello' || ruolo === 'altro3' || ruolo === 'altro4') f = { al: 0.06, fr: 0, testo: '6% senza franchigia (parenti fino al 4° grado)' };
    else if (ruolo === 'stato') f = { al: 0, fr: 0, testo: 'non dovuta' };
    else f = { al: 0.08, fr: 0, testo: '8% senza franchigia (altri parenti)' };
    if (handicap && f.al) { f = { al: f.al, fr: 1500000, testo: f.testo.replace(/oltre [\d.]+ €|senza franchigia/, 'oltre 1.500.000 € (disabilità grave, L. 104/1992)') }; }
    return f;
  }
  function imposta(e, valore, handicap) { var f = aliquota(e.ruolo, handicap), q = valore * val(e.frazione); return { quotaValore: q, franchigia: f.fr, aliquota: f.al, testo: f.testo, imposta: Math.max(0, Math.round((q - f.fr) * f.al)) }; }

  var M = { F: F, val: val, calcola: calcola, imposta: imposta, aliquota: aliquota, testo: function (f) { return f.d === 1 ? String(f.n) : f.n + '/' + f.d; } };
  if (typeof module !== 'undefined' && module.exports) module.exports = M; else radice.QuoteEreditarie = M;
})(this);
