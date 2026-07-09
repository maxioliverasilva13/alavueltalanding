"use client";

import { Check } from "lucide-react";
import { colors } from "@/lib/colors";

export type Step = { key: string; label: string };

type Props = {
  steps: Step[];
  currentIndex: number;
};

export default function FormStepper({ steps, currentIndex }: Props) {
  return (
    <div className="flex w-full items-center gap-0">
      {steps.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <div key={step.key} className="flex flex-1 items-center last:flex-initial">
            <div className="flex flex-col items-center gap-1">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all"
                style={{
                  background: isCompleted || isCurrent ? colors.primary : "#F3F4F6",
                  color: isCompleted || isCurrent ? "#fff" : "#9CA3AF",
                }}
              >
                {isCompleted ? <Check size={12} /> : i + 1}
              </div>
              <span
                className="whitespace-nowrap text-[9px] font-semibold"
                style={{ color: isCompleted || isCurrent ? colors.primary : "#9CA3AF" }}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="mx-1.5 h-[2px] flex-1 rounded-full"
                style={{
                  background: i < currentIndex ? colors.primary : "#E5E7EB",
                  marginBottom: "1rem",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
