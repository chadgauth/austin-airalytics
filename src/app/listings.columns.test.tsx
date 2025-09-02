import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { formatCurrency } from "./listings.columns";

describe("formatCurrency", () => {
  it('formats "$209.00" correctly and does not return N/A', () => {
    const { container } = render(formatCurrency("$209.00"));
    expect(container.textContent).not.toBe("N/A");
    expect(container.textContent).toContain("$");
  });

  it("returns N/A for null", () => {
    const { container } = render(formatCurrency(null));
    expect(container.textContent).toBe("N/A");
  });

  it("returns N/A for undefined", () => {
    const { container } = render(formatCurrency(undefined));
    expect(container.textContent).toBe("N/A");
  });

  it("formats number correctly", () => {
    const { container } = render(formatCurrency(209));
    expect(container.textContent).not.toBe("N/A");
    expect(container.textContent).toContain("$");
  });
});
