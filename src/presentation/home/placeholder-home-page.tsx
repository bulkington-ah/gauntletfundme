import type { JSX } from "react";

const layerNames = [
  "presentation",
  "application",
  "domain",
  "infrastructure",
] as const;

export function PlaceholderHomePage(): JSX.Element {
  return (
    <main
      style={{
        alignItems: "center",
        display: "grid",
        minHeight: "100vh",
        padding: "48px 24px",
      }}
    >
      <section
        style={{
          backgroundColor: "rgba(255, 252, 248, 0.88)",
          border: "1px solid rgba(30, 29, 26, 0.08)",
          borderRadius: "28px",
          boxShadow: "0 24px 80px rgba(52, 44, 33, 0.08)",
          maxWidth: "720px",
          padding: "40px",
          width: "100%",
        }}
      >
        <p
          style={{
            fontSize: "0.85rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          Task 001 scaffold
        </p>
        <h1
          style={{
            fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
            lineHeight: 1,
            margin: "16px 0",
          }}
        >
          GoFundMe V2
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            lineHeight: 1.6,
            margin: 0,
            maxWidth: "56ch",
          }}
        >
          The application shell is in place. Product behavior will be added in
          later tasks through the modular monolith layers below.
        </p>
        <ul
          style={{
            display: "grid",
            gap: "12px",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            listStyle: "none",
            margin: "32px 0 0",
            padding: 0,
          }}
        >
          {layerNames.map((layerName) => (
            <li
              key={layerName}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "18px",
                padding: "18px 20px",
              }}
            >
              <strong>{layerName}</strong>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
