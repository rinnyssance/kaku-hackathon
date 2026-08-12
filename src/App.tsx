import { useEffect, useMemo, useState } from "react";
import { contentById, kanjiContent } from "../shared/content";
import type { MasteryItem, ReviewRecommendation, Skill } from "../shared/contracts";
import { PracticeCanvas } from "./PracticeCanvas";
import { checkHealth, fetchRecommendation, type EngineStatus } from "./lib/api";
import { createInitialMastery, readMastery, STORAGE_KEY, updateMastery } from "./lib/mastery";

type View = "home" | "recognition" | "reading" | "writing" | "review" | "path";

const guidedViews: View[] = ["recognition", "reading", "writing", "review", "path"];

function App() {
  const [view, setView] = useState<View>("home");
  const [mastery, setMastery] = useState<MasteryItem[]>(readMastery);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [retries, setRetries] = useState(0);
  const [guided, setGuided] = useState(false);
  const [guidedStep, setGuidedStep] = useState(0);
  const [engineStatus, setEngineStatus] = useState<EngineStatus>("waking");
  const [recommendation, setRecommendation] = useState<ReviewRecommendation | null>(null);

  const content = kanjiContent[currentIndex % kanjiContent.length];
  const currentMastery = mastery.find((item) => item.kanjiId === content.id)!;

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(mastery)), [mastery]);

  useEffect(() => {
    const controller = new AbortController();
    let attempts = 0;
    const wake = async () => {
      attempts += 1;
      try {
        if (await checkHealth(controller.signal)) {
          setEngineStatus("online");
          return;
        }
      } catch {
        if (controller.signal.aborted) return;
      }
      if (attempts < 6) window.setTimeout(wake, 5000);
      else setEngineStatus("offline");
    };
    wake();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (view !== "review") return;
    fetchRecommendation(mastery).then(setRecommendation);
  }, [mastery, view]);

  const assessedCount = mastery.reduce((total, item) => total + Object.values(item.assessed).filter(Boolean).length, 0);
  const averageMastery = useMemo(() => {
    const scores = mastery.flatMap((item) => (["recognition", "reading", "writing"] as Skill[])
      .filter((skill) => item.assessed[skill]).map((skill) => item.mastery[skill]));
    return scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  }, [mastery]);

  const record = (skill: Skill, correct: boolean, hintsUsed = 0) => {
    setMastery((items) => updateMastery(items, content.id, skill, { correct, retries, hintsUsed }));
    setRetries((value) => correct ? 0 : value + 1);
  };

  const advance = () => {
    setFeedback(null);
    setCurrentIndex((index) => (index + 1) % kanjiContent.length);
    if (guided) {
      const nextStep = guidedStep + 1;
      setGuidedStep(nextStep);
      setView(guidedViews[nextStep] ?? "home");
    }
  };

  const startGuided = () => {
    setGuided(true);
    setGuidedStep(0);
    setCurrentIndex(0);
    setFeedback(null);
    setView("recognition");
  };

  const resetDemo = () => {
    const initial = createInitialMastery();
    setMastery(initial);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    setCurrentIndex(0);
    setFeedback(null);
    setRecommendation(null);
    setGuided(false);
    setGuidedStep(0);
    setView("home");
  };

  const recognitionReverse = currentIndex % 2 === 1;
  const recognitionOptions = recognitionReverse
    ? [content.character, ...kanjiContent.filter((item) => item.id !== content.id).slice(0, 3).map((item) => item.character)]
    : [content.meaning, ...content.distractorMeanings];
  const readingOptions = [content.vocabulary.reading, ...content.distractorReadings];

  const answer = (skill: Skill, choice: string, expected: string) => {
    const correct = choice === expected;
    record(skill, correct);
    setFeedback(correct ? "That’s right. The connection is getting stronger." : `Not quite. The answer is ${expected}. Try again or continue.`);
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <button className="brand" onClick={() => setView("home")} aria-label="Kaku home">
          <span className="brand-mark">書</span>
          <span><strong>Kaku</strong><small>Recognize. Read. Write.</small></span>
        </button>
        <nav aria-label="Primary navigation">
          <button onClick={() => setView("home")}>Study</button>
          <button onClick={() => setView("path")}>The Path</button>
          <button onClick={() => setView("review")}>Review</button>
        </nav>
        <button className="reset-button" onClick={resetDemo}>Reset demo</button>
      </header>

      <div className={`engine-banner ${engineStatus}`}>
        <span className="status-dot" />
        {engineStatus === "online" ? "Adaptive review online via Render" : engineStatus === "waking" ? "Review engine waking — local guidance is ready" : "Local review engine active"}
      </div>

      {guided && view !== "home" && (
        <div className="guided-progress" aria-label="Guided demo progress">
          {guidedViews.map((step, index) => <span key={step} className={index <= guidedStep ? "complete" : ""}>{index + 1}</span>)}
          <p>{guidedStep + 1} of 5 · {guidedViews[guidedStep]}</p>
        </div>
      )}

      <main>
        {view === "home" && (
          <section className="home-view">
            <div className="start-card">
              <img className="start-logo" src="/kaku-logo.jpeg" alt="Kaku Japanese literacy trainer" />
              <div className="start-copy">
                <div className="eyebrow">JLPT N5 · Practice session</div>
                <h1>Ready to practice?</h1>
                <p>Recognize, read, and write kanji in one short guided session—or choose a skill below.</p>
                <button className="primary-button start-guided" onClick={startGuided}>Start guided session <span>→</span></button>
              </div>
            </div>
            <div className="practice-menu">
              <div className="practice-menu-heading">
                <div><div className="eyebrow">Quick practice</div><h2>Choose a skill</h2></div>
                <div className="session-summary"><span><strong>{assessedCount}</strong> assessed</span><span><strong>{averageMastery || "—"}</strong> mastery</span></div>
              </div>
              <div className="mode-list">
                <button onClick={() => setView("recognition")}><span>漢</span><strong>Learn</strong><small>Recognize meaning</small><b>→</b></button>
                <button onClick={() => setView("reading")}><span>読</span><strong>Read</strong><small>Use real vocabulary</small><b>→</b></button>
                <button className="featured" onClick={() => setView("writing")}><span>筆</span><strong>Write</strong><small>Produce from memory</small><b>→</b></button>
                <button onClick={() => setView("review")}><span>復</span><strong>Review</strong><small>Strengthen weak skills</small><b>→</b></button>
              </div>
            </div>
          </section>
        )}

        {(view === "recognition" || view === "reading") && (
          <section className="study-layout">
            <div className="scroll-card">
              <div className="scroll-cap" />
              <div className="eyebrow">{view === "recognition" ? "Recognition" : "Reading in context"}</div>
              {view === "recognition" ? (
                <>
                  <div className="hero-kanji">{recognitionReverse ? content.meaning : content.character}</div>
                  <h2>{recognitionReverse ? "Which kanji matches this meaning?" : "What does this mean?"}</h2>
                  <div className="answer-grid">
                    {recognitionOptions.map((option) => <button key={option} onClick={() => answer("recognition", option, recognitionReverse ? content.character : content.meaning)}>{option}</button>)}
                  </div>
                </>
              ) : (
                <>
                  <div className="vocabulary-word">{content.vocabulary.word}</div>
                  <p className="vocabulary-meaning">{content.vocabulary.meaning}</p>
                  <h2>How is this word read?</h2>
                  <div className="answer-grid reading-grid">
                    {readingOptions.map((option) => <button key={option} onClick={() => answer("reading", option, content.vocabulary.reading)}>{option}</button>)}
                  </div>
                </>
              )}
              <div className="scroll-cap bottom" />
            </div>
            <aside className="context-panel">
              <span className="mini-kanji">{content.character}</span>
              <h3>{content.meaning}</h3>
              <p>{content.reading} · {content.vocabulary.word}</p>
              <MasteryBars item={currentMastery} />
              {feedback && <div className="feedback-card">{feedback}</div>}
              {feedback && <button className="primary-button full-width" onClick={advance}>Continue →</button>}
            </aside>
          </section>
        )}

        {view === "writing" && (
          <section className="study-layout writing-layout">
            <div className="paper-card">
              <div className="eyebrow">Practice Paper</div>
              <h2>Write “{content.meaning}” from memory</h2>
              <PracticeCanvas content={content} onResult={(result, hintsUsed) => {
                record("writing", result.correct, hintsUsed);
                setFeedback(result.message);
              }} />
            </div>
            <aside className="context-panel">
              <span className="validation-badge">{content.referenceStrokes ? "Full stroke validation" : "Stroke-count practice"}</span>
              <h3>Honest feedback, not fake precision.</h3>
              <p>Kaku compares count, order, start regions, and dominant direction for the showcase characters 山, 川, and 人.</p>
              <div className="vocab-connection"><small>Vocabulary connection</small><strong>{content.vocabulary.word}</strong><span>{content.vocabulary.reading} · {content.vocabulary.meaning}</span></div>
              {feedback && <button className="primary-button full-width" onClick={advance}>Continue →</button>}
            </aside>
          </section>
        )}

        {view === "review" && (
          <section className="review-view">
            <div className="review-heading"><div><div className="eyebrow">Explainable adaptive review</div><h1>Your next best step</h1></div><div className={`engine-pill ${recommendation?.source ?? "local"}`}>{recommendation?.source === "render" ? "Powered by Render" : "Instant local fallback"}</div></div>
            {recommendation ? <ReviewCard recommendation={recommendation} mastery={mastery} onPractice={() => {
              const index = kanjiContent.findIndex((item) => item.id === recommendation.kanjiId);
              setCurrentIndex(Math.max(0, index));
              if (guided) { setGuidedStep(4); setView("path"); } else setView(recommendation.skill);
            }} /> : <div className="loading-card">Reading your mastery signals…</div>}
            <div className="how-it-works"><h2>How Kaku adapts</h2><div><span>1</span><p><strong>Separate signals</strong>Recognition, reading, and writing never collapse into one score.</p></div><div><span>2</span><p><strong>Recent evidence</strong>Errors and hints increase review priority.</p></div><div><span>3</span><p><strong>Clear reason</strong>The learner always knows why an item returned.</p></div></div>
          </section>
        )}

        {view === "path" && <PathView mastery={mastery} onSelect={(index) => { setCurrentIndex(index); setView("recognition"); }} onFinish={() => { setGuided(false); setView("home"); }} guided={guided} />}
      </main>
      <footer><span>KAKU · Major League Hacking MVP</span><span>Built for real literacy, not streaks.</span></footer>
    </div>
  );
}

function MasteryBars({ item }: { item: MasteryItem }) {
  return <div className="mastery-bars">{(["recognition", "reading", "writing"] as Skill[]).map((skill) => <div key={skill}><label><span>{skill}</span><b>{item.assessed[skill] ? `${item.mastery[skill]}%` : "Not assessed"}</b></label><i><em style={{ width: item.assessed[skill] ? `${item.mastery[skill]}%` : "0%" }} /></i></div>)}</div>;
}

function ReviewCard({ recommendation, mastery, onPractice }: { recommendation: ReviewRecommendation; mastery: MasteryItem[]; onPractice: () => void }) {
  const content = contentById.get(recommendation.kanjiId)!;
  const item = mastery.find((entry) => entry.kanjiId === recommendation.kanjiId)!;
  return <div className="review-card"><div className="review-kanji">{content.character}</div><div className="review-copy"><span className="needs-review">Needs review · {recommendation.skill}</span><h2>{content.meaning}</h2><p>{recommendation.reason}</p><MasteryBars item={item} /><button className="primary-button" onClick={onPractice}>{`Practice ${recommendation.skill}`} →</button></div></div>;
}

function PathView({ mastery, onSelect, onFinish, guided }: { mastery: MasteryItem[]; onSelect: (index: number) => void; onFinish: () => void; guided: boolean }) {
  return <section className="path-view"><div className="path-copy"><div className="eyebrow">The Path · JLPT N5</div><h1>Literacy is a journey,<br />not a spreadsheet.</h1><p>Each node holds three connected skills. Open any kanji to strengthen its weakest connection.</p>{guided && <button className="primary-button" onClick={onFinish}>Finish guided demo</button>}</div><div className="path-map"><svg viewBox="0 0 500 610" role="presentation"><path d="M70 550 C190 520 105 420 260 390 S390 280 250 235 S145 110 360 62" fill="none" stroke="#d8d0c5" strokeWidth="18" strokeLinecap="round" /><path d="M70 550 C190 520 105 420 260 390 S390 280 250 235 S145 110 360 62" fill="none" stroke="#e9572e" strokeWidth="4" strokeDasharray="8 15" strokeLinecap="round" /></svg>{kanjiContent.map((content, index) => { const positions = [[12,87],[31,76],[22,64],[52,61],[74,50],[58,41],[32,36],[25,24],[50,18],[72,20],[68,8],[43,5]]; const item = mastery[index]; const assessed = Object.values(item.assessed).filter(Boolean).length; return <button key={content.id} className={`path-node ${assessed ? "active" : ""}`} style={{ left: `${positions[index][0]}%`, top: `${positions[index][1]}%` }} onClick={() => onSelect(index)}><span>{content.character}</span><small>{assessed}/3</small></button>; })}<div className="n5-marker">N5</div></div></section>;
}

export default App;
