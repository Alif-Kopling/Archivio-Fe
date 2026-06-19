import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { WelcomeGreeting } from "../WelcomeGreeting";

// Mock fetch for Wikipedia API
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ thumbnail: { source: "test-img.jpg" } }),
  }),
) as any;

describe("WelcomeGreeting", () => {
  it("renders the greeting with the user name", () => {
    render(<WelcomeGreeting userName="Alex" />);

    // Use a custom matcher because the text is split into many <span> elements
    const greetingText = screen.getByText((content, element) => {
      const hasText = (node: Element) =>
        node.textContent === "Good Morning, Alex." ||
        node.textContent === "Good Afternoon, Alex." ||
        node.textContent === "Good Evening, Alex." ||
        node.textContent === "Good Night, Alex.";
      const elementHasText = hasText(element as Element);
      const childrenDontHaveText = Array.from(element?.children || []).every(
        (child) => !hasText(child as Element),
      );

      return elementHasText && childrenDontHaveText;
    });

    expect(greetingText).toBeInTheDocument();
  });

  it("renders the quote author", () => {
    render(<WelcomeGreeting userName="Alex" />);
    // Check if at least one of the possible authors is rendered (or just the generic structure)
    // Since quotes are random, we can't be sure which author, but we can check the dash
    expect(screen.getByText(/—/i)).toBeInTheDocument();
  });
});
