import React, { useState } from 'react';

// ─── Data ───────────────────────────────────────────────────────────────────
// Everything below is plain data. Update names, roles, sub-items, bios, or add
// a `photo: '/path-or-url.jpg'` field per person whenever the Foundation wants
// to change the chart — no other code needs to change.
//
// NOTE: the bios below are drafted placeholders (role-based, written for this
// build) — nobody's personal history, hometown, or background is included
// because none was provided. Swap in real bios/photos whenever ready.

interface Person {
  roles: string[];
  bio: string;
  photo?: string;
}

const PEOPLE: Record<string, Person> = {
  'Shy Rogers': { roles: ['Founder', 'Chairman of the Board', 'CEO'], bio: "One of the Bertie Foundation's founding members, Shy Rogers chairs the Board and leads the organization as CEO. He drives the Foundation's presidential projects and helps bridge communication as the team's Thai interpreter." },
  'Peter Smith': { roles: ['Founder'], bio: 'A founding member of the Bertie Foundation, Peter helped lay the groundwork for the organization\u2019s mission from day one and continues to support its work in the community.' },
  'DonCosta Seawell': { roles: ['Founder', 'Advisor'], bio: 'A founding member of the Bertie Foundation, DonCosta (DC) serves as an advisor to the team, lending experience and perspective to the Foundation\u2019s ongoing decisions.' },
  'Big Mike': { roles: ['Founder'], bio: 'A founding member of the Bertie Foundation, Big Mike has been part of the team since its earliest days and continues to support its mission on the ground.' },
  'Nate Ross': { roles: ['Founder', 'Mentor'], bio: 'A founding member of the Bertie Foundation, Nathaniel (Nate) X Ross serves as mentor to the team, offering guidance and steady counsel as the organization grows.' },
  'Ms. Lee': { roles: ['Founder', 'Treasurer', 'CFO'], bio: 'A founding member of the Bertie Foundation, Ms. Lee (Lindiwe Ndlovu) serves as both Treasurer of the Board and CFO, overseeing the organization\u2019s finances, technology, fundraising, and audit functions.' },
  'Mr. Q': { roles: ['Founder'], bio: 'A founding member of the Bertie Foundation, Mr. Q has supported the organization\u2019s mission since its founding.' },
  'Wil': { roles: ['Founder'], bio: 'A founding member of the Bertie Foundation, Wil has been part of the team since the beginning and continues to contribute to its work.' },
  'Pat Patterson': { roles: ['Founder', 'Organizational Outreach Lead'], bio: 'A founding member of the Bertie Foundation, Pat leads Organizational Outreach \u2014 spotting new opportunities, championing passion projects, and driving the Foundation\u2019s Change for Change initiative.' },
  'Reggie Cuffy': { roles: ['Founder', 'Membership Lead'], bio: 'A founding member of the Bertie Foundation, Reggie leads Membership \u2014 running the member interview team and looking after member wellness and standards across the community.' },
  'CJ': { roles: ['Founder'], bio: 'A founding member of the Bertie Foundation, CJ has been part of the team since its earliest days.' },
  'Chicago': { roles: ['Founder'], bio: 'A founding member of the Bertie Foundation, Chicago has supported the organization\u2019s mission since it began.' },
  'Donte': { roles: ['Founder'], bio: 'A founding member of the Bertie Foundation, Donte has been part of the team since its founding and continues to support its work.' },
  'Nathaniel X Ross': { roles: ['Founder', 'Mentor'], bio: 'A founding member of the Bertie Foundation, Nathaniel (Nate) X Ross serves as mentor to the team, offering guidance and steady counsel as the organization grows.' },
  'DC Seawell': { roles: ['Founder', 'Advisor'], bio: 'A founding member of the Bertie Foundation, DonCosta (DC) Seawell serves as an advisor to the team, lending experience and perspective to the Foundation\u2019s ongoing decisions.' },
  'Rena Karcher': { roles: ['Secretary of the Board', 'VP / COO'], bio: 'Rena serves as Secretary of the Board and VP/COO, overseeing the Foundation\u2019s digital platforms, communications, and media.' },
  'Rich Strong': { roles: ['Program Director / Archivist'], bio: 'Rich leads process and template development for the Foundation, manages the team\u2019s Google Workspace, and keeps the official Foundation record as its archivist.' },
  'Al Hill': { roles: ['Field Administrator'], bio: 'Al leads field administration for the Foundation \u2014 coordinating the shopping and transportation teams and running post-visit evaluations.' },
  'Lindiwe Ndlovu (Ms. Lee)': { roles: ['Founder', 'Treasurer', 'CFO'], bio: 'A founding member of the Bertie Foundation, Ms. Lee (Lindiwe Ndlovu) serves as both Treasurer of the Board and CFO, overseeing the organization\u2019s finances, technology, fundraising, and audit functions.' },
};

const FOUNDERS = ['Shy Rogers', 'Peter Smith', 'DonCosta Seawell', 'Big Mike', 'Nate Ross', 'Ms. Lee', 'Mr. Q', 'Wil', 'Pat Patterson', 'Reggie Cuffy', 'CJ', 'Chicago', 'Donte'];

const MENTOR_ADVISOR = [
  { role: 'Mentor', name: 'Nathaniel X Ross' },
  { role: 'Advisor', name: 'DC Seawell' },
];

const BOARD = [
  { role: 'Chairman of the Board', name: 'Shy Rogers' },
  { role: 'Treasurer', name: 'Lindiwe Ndlovu (Ms. Lee)' },
  { role: 'Secretary', name: 'Rena Karcher' },
];

const DEPARTMENTS = [
  { title: 'CEO', name: 'Shy Rogers', subs: ['Presidential Projects', 'Thai Interpreter'] },
  { title: 'CFO', name: 'Ms. Lee', subs: ['Organizational Technologies', 'Audit Team', 'Fundraising Team'] },
  { title: 'VP/COO', name: 'Rena Karcher', subs: ['Digital Platform Lead', 'Communications', 'Media'] },
  { title: 'Program Dir./Archivist', name: 'Rich Strong', subs: ['Process Template Development', 'Google Workspace Lead', 'Records Archivist'] },
  { title: 'Membership Lead', name: 'Reggie Cuffy', subs: ['Member Interview Team', 'Member Wellness', 'Member Standards'] },
  { title: 'Field Administrator', name: 'Al Hill', subs: ['Shopping Lead', 'Transportation Lead', 'Post Visit Evaluation Lead'] },
  { title: 'Organizational Outreach', name: 'Pat Patterson', subs: ['New Opportunity Evaluation', 'Passion Projects', 'Change for Change'] },
];

const AVATAR_COLORS = ['#7a1620', '#2f5aa8', '#1595a0', '#8f1c26', '#22407c', '#c23b3b'];
function colorFor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}
function initials(name: string) {
  return name.replace(/\(.*?\)/g, '').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

type FontSize = 'sm' | 'md' | 'lg';

export default function OrgChartTab() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [size, setSize] = useState<FontSize>('md');
  const [activePerson, setActivePerson] = useState<string | null>(null);

  const activeData = activePerson ? PEOPLE[activePerson] : null;
  const activeDept = activePerson
    ? DEPARTMENTS.find((d) => d.name === activePerson || d.name === activeData?.alias)
    : null;

  return (
    <div className="bf-org" data-theme={theme} data-size={size} id="bfOrgRoot">
      <style>{CSS}</style>

      <div className="bf-toolbar">
        <div className="bf-toolgroup" role="group" aria-label="Text size">
          <button aria-pressed={size === 'sm'} onClick={() => setSize('sm')} title="Small text">A&minus;</button>
          <button aria-pressed={size === 'md'} onClick={() => setSize('md')} title="Default text">A</button>
          <button aria-pressed={size === 'lg'} onClick={() => setSize('lg')} title="Large text">A+</button>
        </div>
        <button
          className="bf-theme-btn"
          aria-pressed={theme === 'dark'}
          title="Toggle dark mode"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? '\u2600\ufe0f' : '\ud83c\udf19'}
        </button>
      </div>

      <div className="bf-header">
        <div className="bf-logo">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path d="M12 21s-7.5-4.6-10-9.3C0.3 8.1 2 4.5 5.6 4.1c2-.2 3.7.9 4.4 2.4.7-1.5 2.4-2.6 4.4-2.4C18 4.5 19.7 8.1 22 11.7 19.5 16.4 12 21 12 21z" fill="#c23b3b" />
            <path d="M12 21s-7.5-4.6-10-9.3C0.3 8.1 2 4.5 5.6 4.1c2-.2 3.7.9 4.4 2.4" stroke="#1595a0" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <div className="bf-title">
          <h1>THE BERTIE FOUNDATION</h1>
          <p>Organizational Structure &middot; Admin View &middot; Pattaya/Jomtien, Thailand</p>
        </div>
      </div>

      <div className="bf-body">
        {!activePerson ? (
          <div className="bf-grid">
            <div className="bf-side">
              <div className="bf-panel">
                <div className="bf-panel-head">Founders</div>
                <ul className="bf-list">
                  {FOUNDERS.map((name) => (
                    <li key={name}>
                      <button className="bf-person-btn" onClick={() => setActivePerson(name)}>
                        <span>{name}</span>
                        <span className="arrow">&rsaquo;</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bf-panel">
                <div className="bf-panel-head navy">Mentor / Advisor</div>
                <ul className="bf-list">
                  {MENTOR_ADVISOR.map((m) => (
                    <li key={m.name}>
                      <button className="bf-person-btn" onClick={() => setActivePerson(m.name)}>
                        <span>{m.name} <span style={{ opacity: 0.6, fontWeight: 500 }}>&mdash; {m.role}</span></span>
                        <span className="arrow">&rsaquo;</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bf-main">
              <div className="bf-board-wrap">
                <div className="bf-bar">Board of Directors</div>
                <div className="bf-connector for-board" aria-hidden="true">
                  <div className="bf-connector-row">{BOARD.map((b) => <span key={b.role} />)}</div>
                </div>
                <div className="bf-board-grid">
                  {BOARD.map((b) => (
                    <button key={b.role} className="bf-board-card" onClick={() => setActivePerson(b.name)}>
                      <div className="role">{b.role}</div>
                      <div className="name">{b.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="bf-bar">Administration &amp; Functional Areas</div>
                <div className="bf-connector for-admin" aria-hidden="true">
                  <div className="bf-connector-row">{DEPARTMENTS.map((d) => <span key={d.title} />)}</div>
                </div>
                <div className="bf-admin-grid">
                  {DEPARTMENTS.map((d) => (
                    <div className="bf-dept" key={d.title}>
                      <button className="bf-dept-head" onClick={() => setActivePerson(d.name)}>
                        <span className="title">{d.title}</span>
                        <span className="name">{d.name}</span>
                      </button>
                      <div className="bf-subs">
                        {d.subs.map((s) => (
                          <div className="bf-sub" key={s}>{s}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bf-bracket" aria-hidden="true">
                <svg viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0,0 C 30,10 70,10 100,0" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.35" />
                </svg>
              </div>

              <div className="bf-banner">
                <h2>General Members &middot; The Bertie Foundation Volunteer Community</h2>
                <p>Creating Lasting Impact &#10084; We Help Those In Need</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bf-profile">
            <button className="bf-profile-back" onClick={() => setActivePerson(null)}>&larr; Back to Org Chart</button>
            <div className="bf-profile-hero">
              <div className="bf-profile-photo" style={{ background: colorFor(activePerson) }}>
                {initials(activePerson)}
              </div>
              <div className="bf-profile-heading">
                <h2>{activeData?.alias || activePerson}</h2>
                <div className="bf-badges">
                  {activeData?.roles.map((r) => (
                    <span className="bf-badge" key={r}>{r}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="bf-profile-body">
              <div className="bf-profile-section">
                <h4>About</h4>
                <p className="bio">{activeData?.bio}</p>
              </div>
              {activeDept && (
                <div className="bf-profile-section">
                  <h4>Leads</h4>
                  <ul className="bf-profile-focus">
                    {activeDept.subs.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bf-footer">
        www.bertiefoundation.org &middot; info@bertiefoundation.org &middot; A 501(c)(3) Public Charity Registered in South Carolina, USA
      </div>
    </div>
  );
}

const CSS = `
.bf-org{
  --navy:#13224f; --navy-2:#1c2f6e; --burgundy:#7a1620; --burgundy-2:#8f1c26;
  --red:#c23b3b; --blue:#2f5aa8; --blue-dark:#22407c; --blue-pale:#eef2fb;
  --bg:#ffffff; --card:#ffffff; --ink:#132257; --ink-soft:#5a6690; --line:#dbe1f0;
  --shadow:0 10px 30px rgba(19,34,87,0.12); --fs:16px;
  max-width:1600px; margin:0 auto; background:var(--bg); color:var(--ink);
  border-radius:20px; box-shadow:0 24px 60px rgba(0,0,0,0.45); overflow:hidden;
  font-size:var(--fs); position:relative; font-family:'Inter',system-ui,-apple-system,sans-serif;
  transition:background .25s ease,color .25s ease;
}
.bf-org[data-theme="dark"]{ --bg:#0d1330; --card:#141c46; --ink:#eef1fb; --ink-soft:#aab4d6; --line:#2a3568; --blue-pale:#182552; }
.bf-org[data-size="sm"]{ --fs:14px; }
.bf-org[data-size="md"]{ --fs:16px; }
.bf-org[data-size="lg"]{ --fs:18px; }
.bf-org *{box-sizing:border-box;}
.bf-org button{font-family:inherit;cursor:pointer;}
.bf-toolbar{display:flex;justify-content:flex-end;align-items:center;gap:10px;padding:12px 20px;background:var(--card);border-bottom:1px solid var(--line);flex-wrap:wrap;}
.bf-toolgroup{display:flex;align-items:center;gap:6px;background:var(--blue-pale);border-radius:999px;padding:4px;}
.bf-toolgroup button{border:none;background:transparent;color:var(--ink);width:30px;height:30px;border-radius:999px;font-size:0.8em;font-weight:700;display:flex;align-items:center;justify-content:center;transition:background .15s ease;}
.bf-toolgroup button:hover{background:rgba(47,90,168,0.18);}
.bf-toolgroup button[aria-pressed="true"]{background:var(--blue);color:#fff;}
.bf-theme-btn{border:none;background:var(--blue-pale);color:var(--ink);width:34px;height:34px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:1em;}
.bf-theme-btn:hover{background:rgba(47,90,168,0.18);}
.bf-header{background:linear-gradient(135deg,var(--navy),var(--navy-2));color:#fff;padding:22px 28px;display:flex;align-items:center;gap:16px;}
.bf-logo{width:52px;height:52px;flex:none;border-radius:14px;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow);}
.bf-title h1{font-family:'Plus Jakarta Sans','Inter var',Inter,sans-serif;font-size:1.7em;margin:0;letter-spacing:0.01em;font-weight:800;}
.bf-title p{margin:4px 0 0;font-size:0.85em;color:#a9c1f2;font-weight:500;}
.bf-body{padding:26px;}
.bf-grid{display:grid;grid-template-columns:240px 1fr;gap:26px;align-items:start;}
.bf-side{display:flex;flex-direction:column;gap:16px;}
.bf-panel{background:var(--card);border-radius:12px;overflow:hidden;box-shadow:var(--shadow);border:1px solid var(--line);}
.bf-panel-head{background:linear-gradient(135deg,var(--burgundy),var(--burgundy-2));color:#fff;text-align:center;font-weight:800;letter-spacing:0.04em;padding:11px 10px;font-size:0.92em;text-transform:uppercase;}
.bf-panel-head.navy{background:linear-gradient(135deg,var(--navy),var(--navy-2));}
.bf-list{list-style:none;margin:0;padding:8px;display:flex;flex-direction:column;gap:6px;}
.bf-person-btn{width:100%;text-align:left;background:rgba(122,22,32,0.06);border:1px solid transparent;color:var(--ink);border-radius:8px;padding:9px 12px;font-size:0.92em;font-weight:600;display:flex;justify-content:space-between;align-items:center;gap:8px;transition:background .15s ease,border-color .15s ease,transform .1s ease;}
.bf-org[data-theme="dark"] .bf-person-btn{background:rgba(255,255,255,0.05);}
.bf-person-btn:hover{background:rgba(122,22,32,0.14);border-color:var(--burgundy);}
.bf-person-btn:active{transform:scale(0.98);}
.bf-person-btn .arrow{opacity:0;transition:opacity .15s ease;color:var(--burgundy);font-size:0.9em;}
.bf-person-btn:hover .arrow{opacity:1;}
.bf-main{display:flex;flex-direction:column;gap:22px;min-width:0;}
.bf-bar{background:linear-gradient(90deg,var(--red),#d85a5a);color:#fff;text-align:center;font-weight:800;letter-spacing:0.05em;padding:10px 14px;border-radius:10px;font-size:0.95em;text-transform:uppercase;box-shadow:0 6px 16px rgba(194,59,59,0.35);}
/* Connector: a horizontal spine plus a vertical drop centered over each
   column. Uses the SAME column count as the row it feeds, so the drops
   line up exactly. */
.bf-connector{position:relative;height:20px;margin-top:8px;}
.bf-connector::before{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:var(--ink-soft);opacity:.5;}
.bf-connector-row{display:grid;height:100%;}
.bf-connector-row span{display:block;width:2px;height:100%;background:var(--ink-soft);opacity:.5;justify-self:center;}
.bf-connector.for-board .bf-connector-row{grid-template-columns:repeat(3,1fr);}
.bf-connector.for-admin .bf-connector-row{grid-template-columns:repeat(7,1fr);}
.bf-board-wrap{position:relative;}
.bf-board-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;}
.bf-board-card{background:linear-gradient(160deg,var(--navy),var(--navy-2));color:#fff;border-radius:12px;padding:18px 14px;text-align:center;box-shadow:var(--shadow);border:none;width:100%;position:relative;transition:transform .15s ease,box-shadow .15s ease;}
.bf-board-card .role{font-family:'Plus Jakarta Sans','Inter var',Inter,sans-serif;font-size:1.08em;font-weight:700;margin-bottom:6px;}
.bf-board-card .name{color:#9fc1ff;font-size:0.95em;font-weight:600;}
.bf-board-card:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(19,34,87,0.28);}
.bf-admin-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:12px;}
.bf-dept{display:flex;flex-direction:column;gap:8px;position:relative;}
.bf-dept-head{background:linear-gradient(160deg,var(--blue),var(--blue-dark));color:#fff;border:none;border-radius:10px;padding:14px 10px;text-align:center;box-shadow:var(--shadow);display:flex;flex-direction:column;gap:4px;transition:transform .15s ease,box-shadow .15s ease;width:100%;}
.bf-dept-head:hover{transform:translateY(-2px);box-shadow:0 14px 26px rgba(19,34,87,0.3);}
.bf-dept-head .title{font-weight:800;font-size:0.86em;text-transform:uppercase;letter-spacing:0.02em;}
.bf-dept-head .name{font-size:0.86em;font-weight:600;color:#cfe0ff;}
.bf-subs{display:flex;flex-direction:column;gap:6px;justify-content:flex-start;}
.bf-sub{background:var(--navy);color:#dbe6ff;border-radius:8px;padding:10px 8px;text-align:center;font-size:0.78em;font-weight:600;line-height:1.25;box-shadow:0 3px 8px rgba(19,34,87,0.18);}
.bf-org[data-theme="dark"] .bf-sub{background:#0f1738;}
.bf-bracket{height:34px;position:relative;margin-top:4px;color:var(--ink-soft);}
.bf-bracket svg{width:100%;height:100%;display:block;}
.bf-banner{background:linear-gradient(135deg,var(--navy),var(--navy-2));color:#fff;border-radius:12px;padding:22px 20px;text-align:center;box-shadow:var(--shadow);border-bottom:4px solid var(--red);}
.bf-banner h2{font-family:'Plus Jakarta Sans','Inter var',Inter,sans-serif;margin:0 0 8px;font-size:1.3em;font-weight:800;letter-spacing:0.02em;}
.bf-banner p{margin:0;color:#bcd0ff;font-style:italic;font-size:0.95em;}
.bf-footer{background:var(--navy);color:#93a9df;text-align:center;font-size:0.78em;padding:12px;letter-spacing:0.02em;}
/* Full-page profile — replaces the chart view in place, not a popup */
.bf-profile{animation:bfFadeIn .2s ease;}
@keyframes bfFadeIn{ from{opacity:0;transform:translateY(6px);} to{opacity:1;transform:translateY(0);} }
.bf-profile-back{border:none;background:var(--blue-pale);color:var(--blue-dark);font-weight:700;font-size:0.9em;padding:9px 16px;border-radius:999px;margin-bottom:22px;display:inline-flex;align-items:center;gap:6px;}
.bf-org[data-theme="dark"] .bf-profile-back{color:#9fc1ff;}
.bf-profile-back:hover{background:rgba(47,90,168,0.18);}
.bf-profile-hero{display:flex;align-items:center;gap:28px;background:linear-gradient(135deg,var(--navy),var(--navy-2));border-radius:18px;padding:36px 32px;box-shadow:var(--shadow);color:#fff;margin-bottom:28px;}
.bf-profile-photo{width:132px;height:132px;flex:none;border-radius:999px;display:flex;align-items:center;justify-content:center;font-family:'Plus Jakarta Sans','Inter var',Inter,sans-serif;font-weight:700;font-size:2.6em;color:#fff;border:5px solid rgba(255,255,255,0.35);box-shadow:0 10px 28px rgba(0,0,0,0.35);}
.bf-profile-heading h2{font-family:'Plus Jakarta Sans','Inter var',Inter,sans-serif;font-size:2em;margin:0 0 12px;font-weight:800;}
.bf-profile-body{display:grid;grid-template-columns:1.6fr 1fr;gap:22px;align-items:start;}
.bf-profile-section{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:26px 28px;box-shadow:var(--shadow);}
.bf-profile-section h4{margin:0 0 14px;font-size:0.78em;text-transform:uppercase;letter-spacing:0.06em;font-weight:800;color:var(--blue-dark);}
.bf-org[data-theme="dark"] .bf-profile-section h4{color:#9fc1ff;}
.bf-profile-section p.bio{margin:0;font-size:1.02em;line-height:1.7;color:var(--ink);}
.bf-profile-focus{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;}
.bf-profile-focus li{background:var(--blue-pale);color:var(--blue-dark);font-size:0.85em;font-weight:700;padding:9px 12px;border-radius:10px;}
.bf-org[data-theme="dark"] .bf-profile-focus li{color:#9fc1ff;}
.bf-badges{display:flex;flex-wrap:wrap;gap:6px;}
.bf-badge{background:rgba(255,255,255,0.16);color:#fff;font-size:0.76em;font-weight:700;padding:5px 12px;border-radius:999px;text-transform:uppercase;letter-spacing:0.03em;}
@media (max-width:1180px){
  .bf-admin-grid{grid-template-columns:repeat(4,1fr);}
  /* Below this width the 7 departments wrap to two rows, so a single
     straight connector no longer maps to real column positions. */
  .bf-connector.for-admin{display:none;}
}
@media (max-width:980px){ .bf-grid{grid-template-columns:1fr;} .bf-side{order:2;} .bf-main{order:1;} }
@media (max-width:768px){
  .bf-board-grid{grid-template-columns:1fr;}
  .bf-admin-grid{grid-template-columns:1fr;gap:16px;}
  .bf-connector{display:none;}
  .bf-dept{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px;box-shadow:var(--shadow);}
  .bf-dept-head{box-shadow:none;}
  .bf-header{flex-direction:column;text-align:center;padding:22px 18px;}
  .bf-title h1{font-size:1.35em;} .bf-body{padding:18px 14px;} .bf-toolbar{justify-content:center;}
  .bf-profile-hero{flex-direction:column;text-align:center;padding:28px 20px;}
  .bf-profile-body{grid-template-columns:1fr;}
}
`;
