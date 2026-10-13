import React, { useMemo, useRef, useState } from "react";
import { RotateCw, Plus, X, Sparkles, PartyPopper } from "lucide-react";

const starterNames = [
  "Siddhant", "Anant", "Jeelu", "Amey", "Sagar B",
  "Renuka", "Rahul", "Radha", "Archana", "Shubham",
  "Sagar N", "Namrata", "Sunil", "Pravlika","Rohit"
];
const colors = [
  "#f04452", "#ff8b22", "#ffd52e", "#91d94b", "#22ad72",
  "#2dbbb9", "#39c7ed", "#4384f4", "#5556df", "#963ce6",
  "#bd69ed", "#ed61c4", "#e63e91", "#f078b7", "#f35c70"
];

function Wheel({ names, rotation, spinning }) {
  const slice = 360 / Math.max(names.length, 1);
  const gradient = useMemo(() => {
    if (!names.length) return "#48216a";
    return `conic-gradient(${names.map((_, i) =>
      `${colors[i % colors.length]} ${i * slice}deg ${(i + 1) * slice}deg`
    ).join(", ")})`;
  }, [names, slice]);

  return (
    <div className="wheel-stage">
      <div className="pointer" aria-hidden="true" />
      <div
        className={`wheel ${spinning ? "wheel-spinning" : ""}`}
        style={{ background: gradient, transform: `rotate(${rotation}deg)` }}
        role="img"
        aria-label={`Spin wheel with ${names.length} names: ${names.join(", ")}`}
      >
        {names.map((name, i) => (
          <div
            className="wheel-label"
            key={`${name}-${i}`}
            style={{
              transform: `translate(-50%, -50%) rotate(${i * slice + slice / 2}deg) translateY(calc(var(--wheel-size) * -0.345)) rotate(90deg)`,
              color: i % 3 === 0 ? "#fff" : "#28113e"
            }}
          >
            <span>{name}</span>
          </div>
        ))}
        <div className="wheel-rim" aria-hidden="true" />
        <div className="wheel-center" aria-hidden="true"><span>✦</span></div>
      </div>
    </div>
  );
}

export default function App() {
  const [names, setNames] = useState(starterNames);
  const [newName, setNewName] = useState("");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState("");
  const [notice, setNotice] = useState("");
  const spinTimer = useRef(null);

  function addName(event) {
    event.preventDefault();
    const clean = newName.trim();
    if (!clean) return;
    if (names.length >= 15) {
      setNotice("You can add up to 15 names.");
      return;
    }
    if (names.some(n => n.toLowerCase() === clean.toLowerCase())) {
      setNotice("That name is already on the wheel.");
      return;
    }
    setNames(current => [...current, clean]);
    setNewName("");
    setNotice("");
    setWinner("");
  }

  function removeName(index) {
    if (spinning) return;
    setNames(current => current.filter((_, i) => i !== index));
    setWinner("");
    setNotice("");
  }

  function spinWheel() {
    if (spinning || names.length < 2) {
      if (names.length < 2) setNotice("Add at least 2 names before spinning.");
      return;
    }
    setSpinning(true);
    setWinner("");
    setNotice("");
    // Select the winning slice first, then animate the wheel to that slice.
    const selectedIndex = Math.floor(Math.random() * names.length);
    const slice = 360 / names.length;
    const targetMod = (360 - (selectedIndex * slice + slice / 2)) % 360;
    const currentMod = ((rotation % 360) + 360) % 360;
    const extra = (targetMod - currentMod + 360) % 360;
    const nextRotation = rotation + 360 * (6 + Math.floor(Math.random() * 3)) + extra;
    setRotation(nextRotation);
    spinTimer.current = setTimeout(() => {
      setSpinning(false);
      setWinner(names[selectedIndex]);
    }, 4300);
  }

  function resetWheel() {
    if (spinning) return;
    setNames(starterNames);
    setNewName("");
    setWinner("");
    setNotice("");
    setRotation(0);
  }

  return (
    <main className="page-shell">
      <div className="festive-glow glow-one" aria-hidden="true" />
      <div className="festive-glow glow-two" aria-hidden="true" />
      <header className="hero">
        <div className="eyebrow"><Sparkles size={16} /> DIWALI CELEBRATION <Sparkles size={16} /></div>
        <h1>Find the Host for <span>Diwali</span></h1>
        <p>Spin the wheel and let fate decide!</p>
      </header>

      <section className="main-layout" aria-label="Diwali host picker">
        <div className="game-panel">
          <Wheel names={names} rotation={rotation} spinning={spinning} />
          <button className="spin-button" onClick={spinWheel} disabled={spinning || names.length < 2}>
            <RotateCw size={23} className={spinning ? "spin-icon" : ""} />
            {spinning ? "SPINNING..." : "SPIN"}
          </button>
          {winner && (
            <div className="winner-card" role="status" aria-live="polite">
              <PartyPopper size={25} />
              <div><span>Our Diwali host is</span><strong>{winner}!</strong></div>
              <span className="winner-sparkle">✨</span>
            </div>
          )}
          {notice && <p className="notice" role="status">{notice}</p>}
          <p className="fairness-note">Every name gets an equal chance. Good luck! 🪔</p>
        </div>

        <aside className="names-panel">
          <div className="panel-heading">
            <div><span className="mini-label">YOUR GUEST LIST</span><h2>Who's hosting?</h2></div>
            <span className="count">{names.length}/15</span>
          </div>
          <form className="add-form" onSubmit={addName}>
            <label className="sr-only" htmlFor="new-name">Add a name</label>
            <input
              id="new-name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Enter a name..."
              maxLength={28}
              disabled={names.length >= 15 || spinning}
            />
            <button type="submit" aria-label="Add name" disabled={names.length >= 15 || spinning || !newName.trim()}><Plus size={21} /></button>
          </form>
          <p className="helper-text">Add up to 15 people. Remove anyone with the × button.</p>
          <ul className="name-list">
            {names.map((name, i) => (
              <li key={`${name}-${i}`}>
                <span className="name-dot" style={{ background: colors[i % colors.length] }} />
                <span className="name-text">{name}</span>
                <button className="remove-button" onClick={() => removeName(i)} disabled={spinning} aria-label={`Remove ${name}`} title={`Remove ${name}`}><X size={16} /></button>
              </li>
            ))}
          </ul>
          <button className="reset-button" onClick={resetWheel} disabled={spinning}>Reset starter names</button>
        </aside>
      </section>
      <footer>Made with <span>♥</span> for a bright and happy Diwali</footer>
    </main>
  );
}