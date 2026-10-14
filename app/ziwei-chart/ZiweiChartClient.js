"use client";

import { useEffect, useState } from "react";
import { Lunar } from "lunar-javascript";
import { PLACES } from "@/lib/places";
import styles from "./ZiweiChart.module.css";
import { COPY } from "./ziweiCopy";
import ZiweiResult from "./ZiweiResult";

const YEARS = Array.from({ length: 2031 - 1920 }, (_, index) => 2030 - index);
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const MINUTES = Array.from({ length: 60 }, (_, minute) => minute);
function pad(value) {
  return String(value).padStart(2, "0");
}

function branchForHour(hour) {
  const branches = ["子", "丑", "丑", "寅", "寅", "卯", "卯", "辰", "辰", "巳", "巳", "午", "午", "未", "未", "申", "申", "酉", "酉", "戌", "戌", "亥", "亥", "子"];
  return branches[hour];
}

function defaultForm() {
  return {
    name: "",
    gender: "女",
    calendar: "solar",
    year: 1990,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    hourUnknown: false,
    country: "新加坡",
    city: "新加坡 Singapore",
    useTrueSolar: true,
  };
}

export default function ZiweiChartClient() {
  const [language, setLanguage] = useState("zh");
  const [form, setForm] = useState(defaultForm);
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const copy = COPY[language];

  useEffect(() => {
    if ((navigator.language || "").toLowerCase().startsWith("en")) {
      setLanguage("en");
    }
  }, []);


  function setField(key, value) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "country") {
        next.city = Object.keys(PLACES[value] || {})[0] || "";
      }
      return next;
    });
  }

  function buildPayload() {
    let year = Number(form.year);
    let month = Number(form.month);
    let day = Number(form.day);

    if (form.calendar === "lunar") {
      const solar = Lunar.fromYmd(year, month, day).getSolar();
      year = solar.getYear();
      month = solar.getMonth();
      day = solar.getDay();
    }

    const place = PLACES[form.country]?.[form.city] || [1.35, 103.82, 8];

    return {
      name: form.name.trim(),
      gender: form.gender,
      year,
      month,
      day,
      hour: Number(form.hour),
      minute: Number(form.minute),
      hourUnknown: form.hourUnknown,
      latitude: place[0],
      longitude: place[1],
      tzHours: place[2],
      birthplace: form.city,
      calendarInput: form.calendar,
      useTrueSolar: form.useTrueSolar && !form.hourUnknown,
    };
  }

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (form.hourUnknown) {
      setError(copy.unknownNote);
      return;
    }

    setLoading(true);
    setChart(null);

    try {
      const response = await fetch("/api/ziwei-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to create chart.");
      setChart(payload.chart);
      setTimeout(() => {
        document.getElementById("ziwei-result")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 80);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="/">
          <img src="/brand-logo.png" alt="壶中天机" />
          <span>
            <b>壶中天机</b>
            <small>HUZHONG TIANJI</small>
          </span>
        </a>
        <nav className={styles.navM>
          <a href="/">{copy.navHome}</a>
          <a className={styles.navActive} href="/ziwei-chart">紫微 ZI WEI</a>
          <a href="/pan">{copy.navPan}</a>
          <a href="/tools">{copy.navTools}</a>
          <a href="/articles">{copy.navArticles}</a>
        </nav>
        <div className={styles.language}>
          <button
            type="button"
            className={language === "zh" ? styles.languageActive : ""}
            onClick={() => setLanguage("zh")}
          >
            中文
          </button>
          <button
            type="button"
            className={language === "en" ? styles.languageActive : ""}
            onClick={() => setLanguage("en")}
          >
            EN
          </button>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroAura} aria-hidden="true" />
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>{copy.kicker}</p>
          <h1>
            {copy.titleLead}
            <span>{copy.titleAccent}</span>
          </h1>
          <p className={styles.intro}>{copy.intro}</p>
          <div className={styles.trustRow}>
            <span>✦ {copy.free}</span>
            <span>✦ {copy.rules}</span>
            <span>✦ {copy.private}</span>
          </div>
        </div>

        <form className={styles.formCard} onSubmit={submit}>
          <div className={styles.formHeading}>
            <div>
              <span className={styles.formSeal}>紫<br />微</span>
            </div>
            <div>
              <h2>{copy.formTitle}</h2>
              <p>{copy.formSub}</p>
            </div>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.fieldWide}>
              <span>{copy.name}</span>
              <input
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                placeholder={copy.namePh}
              />
            </label>

            <label>
              <span>{copy.gender}</span>
              <select
                value={form.gender}
                onChange={(event) => setField("gender", event.target.value)}
              >
                <option value="女">{copy.female}</option>
                <option value="男">{copy.male}</option>
              </select>
            </label>

            <label>
              <span>{copy.calendar}</span>
              <select
                value={form.calendar}
                onChange={(event) => setField("calendar", event.target.value)}
              >
                <option value="solar">{copy.solar}</option>
                <option value="lunar">{copy.lunar}</option>
              </select>
            </label>

            <label>
              <span>{copy.year}</span>
              <select
                value={form.year}
                onChange={(event) => setField("year", event.target.value)}
              >
                {YEARS.map((year) => <option key={year}>{year}</option>)}
              </select>
            </label>

            <label>
              <span>{copy.month}</span>
              <select
                value={form.month}
                onChange={(event) => setField("month", event.target.value)}
              >
                {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                  <option key={month}>{month}</option>
                ))}
              </select>
            </label>

            <label>
              <span>{copy.day}</span>
              <select
                value={form.day}
                onChange={(event) => setField("day", event.target.value)}
              >
                {Array.from(
                  { length: form.calendar === "lunar" ? 30 : 31 },
                  (_, index) => index + 1
                ).map((day) => <option key={day}>{day}</option>)}
              </select>
            </label>

            <label>
              <span>{copy.hour}</span>
              <select
                value={form.hour}
                disabled={form.hourUnknown}
                onChange={(event) => setField("hour", event.target.value)}
              >
                {HOURS.map((hour) => (
                  <option key={hour} value={hour}>
                    {pad(hour)}:00 · {branchForHour(hour)}时
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>{copy.minute}</span>
              <select
                value={form.minute}
                disabled={form.hourUnknown}
                onChange={(event) => setField("minute", event.target.value)}
              >
                {MINUTES.map((minute) => (
                  <option key={minute} value={minute}>{pad(minute)}</option>
                ))}
              </select>
            </label>

            <label>
              <span>{copy.country}</span>
              <select
                value={form.country}
                onChange={(event) => setField("country", event.target.value)}
              >
                {Object.keys(PLACES).map((country) => (
                  <option key={country}>{country}</option>
                ))}
              </select>
            </label>

            <label className={styles.fieldWide}>
              <span>{copy.city}</span>
              <select
                value={form.city}
                onChange={(event) => setField("city", event.target.value)}
              >
                {Object.keys(PLACES[form.country] || {}).map((city) => (
                  <option key={city}>{city}</option>
                ))}
              </select>
            </label>
          </div>

          {form.calendar === "lunar" && (
            <p className={styles.fieldNote}>{copy.lunarNote}</p>
          )}

          <div className={styles.switches}>
            <label>
              <input
                type="checkbox"
                checked={form.hourUnknown}
                onChange={(event) => setField("hourUnknown", event.target.checked)}
              />
              <span>{copy.unknown}</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.useTrueSolar}
                disabled={form.hourUnknown}
                onChange={(event) => setField("useTrueSolar", event.target.checked)}
              />
              <span>{copy.trueSolar}</span>
            </label>
          </div>

          {form.hourUnknown && <p className={styles.warning}>{copy.unknownNote}</p>}
          {error && (
            <div className={styles.errorBox} role="alert">
              <b>{copy.errorTitle}</b>
              <span>{error}</span>
            </div>
          )}

          <button
            className={styles.submit}
            type="submit"
            disabled={loading || form.hourUnknown}
          >
            {loading ? copy.calculating : copy.submit}
            <span aria-hidden="true">→</span>
          </button>
          <p className={styles.privacy}>{copy.privacy}</p>
        </form>
      </section>

      <section className={styles.features}>
        <div className={styles.sectionHeading}>
          <p className={styles.kicker}>CLEAR CHART · CLEAR BASIS</p>
          <h2>{copy.whatTitle}</h2>
          <p>{copy.whatSub}</p>
        </div>
        <div className={styles.featureGrid}>
          <article>
            <span>01</span>
            <h3>{copy.factTitle}</h3>
            <p>{copy.factText}</p>
          </article>
          <article>
            <span>02</span>
            <h3>{copy.palaceTitle}</h3>
            <p>{copy.palaceText}</p>
          </article>
          <article>
            <span>03</span>
            <h3>{copy.timeTitle}</h3>
            <p>{copy.timeText}</p>
          </article>
        </div>
      </section>

      {chart && (
        <ZiweiResult
          chart={chart}
          language={language}
          copy={copy}
          onReset={() => {
            setChart(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      <section className={styles.method}>
        <div className={styles.sectionHeading}>
          <p className={styles.kicker}>{copy.methodKicker}</p>
          <h2>{copy.methodTitle}</h2>
          <p>{copy.methodText}</p>
        </div>
        <div className={styles.methodGrid}>
          <article><span>壹</span><p>{copy.method1}</p></article>
          <article><span>贰</span><p>{copy.method2}</p></article>
          <article><span>叁</span><p>{copy.method3}</p></article>
        </div>
      </section>

      <section className={styles.faq}>
        <div className={styles.sectionHeading}>
          <p className={styles.kicker}>FAQ</p>
          <h2>{copy.faqTitle}</h2>
        </div>
        {[
          [copy.faq1q, copy.faq1a],
          [copy.faq2q, copy.faq2a],
          [copy.faq3q, copy.faq3a],
          [copy.faq4q, copy.faq4a],
        ].map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>

      <footer className={styles.footer}>
        <img src="/brand-logo.png" alt="壶中天机" />
        <p>{copy.footer}</p>
        <div>
          <a href="/privacy.html">Privacy</a>
          <a href="/terms.html">Terms</a>
          <a href="https://wa.me/6580148899" target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        </div>
      </footer>
    </main>
  );
}
