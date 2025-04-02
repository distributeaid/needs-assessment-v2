import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FormattedResponse from "../FormattedResponse";

describe("FormattedResponse", () => {
  it("renders a basic string value", () => {
    render(<FormattedResponse value="Hello World" />);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });
});
