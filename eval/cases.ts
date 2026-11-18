import type { TaskPriority } from "../src/lib/types";

/**
 * Expected due date, expressed relative to whenever the eval actually runs —
 * never a hardcoded calendar date, so the eval never goes stale.
 *
 * - `null`            → the AI should return dueDate: null (no date was mentioned)
 * - `{ days }`        → expected on that many days from today; time not checked
 *                        (the phrase doesn't give a specific time)
 * - `{ days, hour, minute }` → expected on that day AND at that exact local time
 */
export type ExpectedDueDate = null | { days: number; hour?: number; minute?: number };

export type EvalCase = {
  id: string;
  phrase: string;
  expectedPriority: TaskPriority;
  /** Pass if the parsed title contains ANY of these (case-insensitive). */
  expectedTitleKeywords: string[];
  expectedDueDate: ExpectedDueDate;
};

export const cases: EvalCase[] = [
  {
    id: "dentist-tomorrow-3pm",
    phrase: "Call the dentist tomorrow at 3pm, high priority",
    expectedPriority: "HIGH",
    expectedTitleKeywords: ["dentist"],
    expectedDueDate: { days: 1, hour: 15, minute: 0 },
  },
  {
    id: "buy-milk",
    phrase: "Buy milk",
    expectedPriority: "MEDIUM",
    expectedTitleKeywords: ["milk"],
    expectedDueDate: null,
  },
  {
    id: "expense-report-eod",
    phrase: "Submit the expense report by end of day, it's low priority",
    expectedPriority: "LOW",
    expectedTitleKeywords: ["expense", "report"],
    expectedDueDate: { days: 0 },
  },
  {
    id: "car-insurance-3-days",
    phrase: "Renew the car insurance in 3 days, medium priority",
    expectedPriority: "MEDIUM",
    expectedTitleKeywords: ["insurance"],
    expectedDueDate: { days: 3 },
  },
  {
    id: "email-client-urgent",
    phrase: "Email the client about the proposal, urgent",
    expectedPriority: "HIGH",
    expectedTitleKeywords: ["client", "proposal", "email"],
    expectedDueDate: null,
  },
  {
    id: "water-plants",
    phrase: "Water the plants",
    expectedPriority: "MEDIUM",
    expectedTitleKeywords: ["plant"],
    expectedDueDate: null,
  },
  {
    id: "dry-cleaning-tomorrow",
    phrase: "Pick up dry cleaning tomorrow morning",
    expectedPriority: "MEDIUM",
    expectedTitleKeywords: ["dry cleaning", "cleaning"],
    expectedDueDate: { days: 1 },
  },
  {
    id: "pay-rent-5-days",
    phrase: "Pay rent in 5 days, high priority",
    expectedPriority: "HIGH",
    expectedTitleKeywords: ["rent"],
    expectedDueDate: { days: 5 },
  },
  {
    id: "dentist-followup-7-days",
    phrase: "Schedule a dentist follow-up in 7 days",
    expectedPriority: "MEDIUM",
    expectedTitleKeywords: ["dentist"],
    expectedDueDate: { days: 7 },
  },
  {
    id: "organize-garage-low",
    phrase: "Low priority: organize the garage sometime, no rush",
    expectedPriority: "LOW",
    expectedTitleKeywords: ["garage"],
    expectedDueDate: null,
  },
  {
    id: "call-mom-tonight-8",
    phrase: "Call mom tonight at 8",
    expectedPriority: "MEDIUM",
    expectedTitleKeywords: ["mom"],
    expectedDueDate: { days: 0, hour: 20, minute: 0 },
  },
  {
    id: "slides-9am-meeting-tomorrow",
    phrase: "Prepare slides for the 9am meeting tomorrow, high priority",
    expectedPriority: "HIGH",
    expectedTitleKeywords: ["slides", "meeting"],
    expectedDueDate: { days: 1, hour: 9, minute: 0 },
  },
  {
    id: "read-chapter-4-days",
    phrase: "Finish reading chapter 5 in 4 days, medium priority",
    expectedPriority: "MEDIUM",
    expectedTitleKeywords: ["chapter", "read"],
    expectedDueDate: { days: 4 },
  },
];
