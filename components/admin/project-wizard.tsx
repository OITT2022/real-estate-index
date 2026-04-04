"use client";

import { useState } from "react";

type Step = {
  number: number;
  label: string;
  description: string;
};

const STEPS: Step[] = [
  { number: 1, label: "General Info", description: "Project details and location" },
  { number: 2, label: "Media", description: "Images and documents" },
  { number: 3, label: "Structure", description: "Buildings, floors and units" },
  { number: 4, label: "Finish", description: "Review and update" },
];

type Props = {
  children: React.ReactNode[];
  initialStep?: number;
};

export function ProjectWizard({ children, initialStep = 1 }: Props) {
  const [activeStep, setActiveStep] = useState(initialStep);

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {/* Step indicator */}
      <div style={{ display: "flex", gap: 0, borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)" }}>
        {STEPS.map((step) => {
          const isActive = step.number === activeStep;
          const isCompleted = step.number < activeStep;
          return (
            <button
              key={step.number}
              type="button"
              onClick={() => setActiveStep(step.number)}
              style={{
                flex: 1,
                padding: "14px 12px",
                background: isActive ? "var(--accent)" : isCompleted ? "#f0fdf4" : "white",
                color: isActive ? "white" : "var(--fg)",
                border: "none",
                borderRight: step.number < 4 ? "1px solid var(--line)" : "none",
                cursor: "pointer",
                textAlign: "center",
                transition: "background 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{
                  width: 26, height: 26, borderRadius: "50%",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.8rem", fontWeight: 700,
                  background: isActive ? "rgba(255,255,255,0.25)" : isCompleted ? "#bbf7d0" : "var(--bg-alt)",
                  color: isActive ? "white" : isCompleted ? "#166534" : "var(--muted)",
                }}>
                  {isCompleted ? "✓" : step.number}
                </span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, lineHeight: 1.2 }}>{step.label}</div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.7, lineHeight: 1.2 }}>{step.description}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Step content */}
      {children[activeStep - 1]}

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          type="button"
          className="button-secondary"
          onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
          disabled={activeStep === 1}
          style={{ opacity: activeStep === 1 ? 0.4 : 1 }}
        >
          Previous
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          {activeStep < 4 && (
            <button
              type="button"
              className="button-primary"
              onClick={() => setActiveStep(Math.min(4, activeStep + 1))}
            >
              Next Step
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
