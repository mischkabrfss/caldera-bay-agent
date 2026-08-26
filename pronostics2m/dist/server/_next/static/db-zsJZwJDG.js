import{env as e}from"cloudflare:workers";function t(){return{...process.env,...e}}var n=class extends Error{constructor(){super(`La base de données n’est pas encore branchée sur ce site.`),this.name=`DatabaseUnavailableError`}},r=[`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,`CREATE TABLE IF NOT EXISTS vip_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    monthly_price INTEGER NOT NULL,
    lifetime_price INTEGER NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    active INTEGER NOT NULL DEFAULT 1
  )`,`CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    vip_product_id INTEGER NOT NULL,
    vip_type TEXT NOT NULL,
    plan TEXT NOT NULL,
    status TEXT NOT NULL,
    amount INTEGER NOT NULL DEFAULT 0,
    start_date TEXT,
    end_date TEXT,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    stripe_session_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    subscription_id INTEGER,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'eur',
    status TEXT NOT NULL,
    stripe_reference TEXT,
    label TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,`CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vip_type TEXT NOT NULL,
    prediction_type TEXT NOT NULL,
    match_date TEXT NOT NULL,
    sport TEXT NOT NULL DEFAULT 'Football',
    competition TEXT NOT NULL DEFAULT '',
    match_label TEXT NOT NULL DEFAULT '',
    kick_off TEXT NOT NULL DEFAULT '',
    bet TEXT NOT NULL DEFAULT '',
    player TEXT NOT NULL DEFAULT '',
    odds REAL NOT NULL DEFAULT 0,
    confidence INTEGER NOT NULL DEFAULT 3,
    analysis TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft',
    published_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,`CREATE TABLE IF NOT EXISTS prediction_legs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prediction_id INTEGER NOT NULL,
    position INTEGER NOT NULL DEFAULT 1,
    match_label TEXT NOT NULL DEFAULT '',
    bet TEXT NOT NULL DEFAULT '',
    odds REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'upcoming'
  )`,`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,`CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions (user_id)`,`CREATE INDEX IF NOT EXISTS idx_predictions_lookup ON predictions (vip_type, status, match_date)`,`CREATE INDEX IF NOT EXISTS idx_legs_prediction ON prediction_legs (prediction_id)`],i=[{slug:`safe`,name:`VIP SAFE`,type:`safe`,monthly_price:19999,lifetime_price:89989,description:`1 pronostic Safe par jour, 1 montante par jour, analyses et historique.`},{slug:`premium`,name:`VIP PREMIUM`,type:`premium`,monthly_price:4999,lifetime_price:44999,description:`Pronostics buteurs, combinés du jour, analyses et historique.`},{slug:`grosse-cote`,name:`VIP GROSSE COTE`,type:`grosse_cote`,monthly_price:29989,lifetime_price:109949,description:`1 grosse cote par jour, cote totale supérieure à 30, analyse détaillée.`}],a=null;async function o(e){for(let t of r)await e.prepare(t).run();for(let t of i)await e.prepare(`INSERT INTO vip_products (slug, name, type, monthly_price, lifetime_price, description, active)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, 1)
         ON CONFLICT(slug) DO UPDATE SET
           name = excluded.name,
           type = excluded.type,
           monthly_price = excluded.monthly_price,
           lifetime_price = excluded.lifetime_price,
           description = excluded.description`).bind(t.slug,t.name,t.type,t.monthly_price,t.lifetime_price,t.description).run();return e}function s(){let e=t().DB;return e?(a||=o(e).catch(e=>{throw a=null,e}),a):(a=null,Promise.reject(new n))}async function c(){try{return await s()}catch(e){if(e instanceof n)return null;throw e}}export{s as n,c as r,t};