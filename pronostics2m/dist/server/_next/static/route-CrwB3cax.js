import{n as e}from"./db-zsJZwJDG.js";import{t}from"./admin-WW0dAtMc.js";import{t as n}from"./http-B-BDBxzq.js";import{t as r}from"./predictionInput-u-rVLYEq.js";async function i(i,{params:a}){if(!await t())return n(i,`/connexion`);let{id:o}=await a,s=Number(o);if(!Number.isInteger(s))return n(i,`/admin/pronostics`);let c=r(await i.formData());if(`error`in c)return n(i,`/admin/pronostics/${s}?erreur=${encodeURIComponent(c.error)}`);let l=await e();await l.prepare(`UPDATE predictions SET
         vip_type = ?2, prediction_type = ?3, match_date = ?4, sport = ?5, competition = ?6,
         match_label = ?7, kick_off = ?8, bet = ?9, player = ?10, odds = ?11, confidence = ?12,
         analysis = ?13, status = ?14,
         published_at = CASE
           WHEN ?14 = 'draft' THEN published_at
           WHEN published_at IS NULL THEN datetime('now')
           ELSE published_at END,
         updated_at = datetime('now')
       WHERE id = ?1`).bind(s,c.vip_type,c.prediction_type,c.match_date,c.sport,c.competition,c.match_label,c.kick_off,c.bet,c.player,c.odds,c.confidence,c.analysis,c.status).run(),await l.prepare(`DELETE FROM prediction_legs WHERE prediction_id = ?1`).bind(s).run();for(let[e,t]of c.legs.entries())await l.prepare(`INSERT INTO prediction_legs (prediction_id, position, match_label, bet, odds, status)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)`).bind(s,e+1,t.match_label,t.bet,t.odds,t.status).run();return n(i,`/admin/pronostics?ok=Pronostic%20mis%20%C3%A0%20jour.`)}export{i as POST};