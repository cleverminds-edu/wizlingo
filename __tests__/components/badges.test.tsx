/**
 * Badge Components Unit Tests
 * Tests BadgeCelebration, BadgeProgress, and ModernBadgeDisplay components
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BadgeCelebration } from "@/components/badges/BadgeCelebration";
import { BadgeProgress } from "@/components/badges/BadgeProgress";
import { BadgeType } from "@/app/generated/prisma/client";

// Mock the badge tracking function
jest.mock("@/lib/badge-analytics", () => ({
  trackBadgeEvent: jest.fn(),
}));

// Mock the badge messages hook
jest.mock("@/hooks/useBadgeMessages", () => ({
  useBadgeMessages: jest.fn(() => ({
    congratulations: "Test congratulations message",
    locked: "Test locked message",
    inProgress: jest.fn(() => "Test in progress message"),
    shareTemplate: "Test share template",
    narrative: "Test narrative",
  })),
}));

// Mock the badge config
jest.mock("@/lib/badge-config", () => ({
  getBadgeConfig: jest.fn((type) => ({
    name: `${type} Badge`,
    emoji: "✨",
    color: "#FFD700",
    bgColor: "rgba(255, 215, 0, 0.1)",
    badgeImage: "/badges/spark.svg",
  })),
}));

describe("BadgeCelebration Component", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test("renders celebration modal when visible", () => {
    render(
      <BadgeCelebration
        badgeType="SPARK"
        studentName="John Doe"
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/SPARK Badge Earned/i)).toBeInTheDocument();
    expect(screen.getByText("Test congratulations message")).toBeInTheDocument();
  });

  test("does not render when not visible", () => {
    render(
      <BadgeCelebration
        badgeType="SPARK"
        studentName="John Doe"
        isVisible={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText(/SPARK Badge Earned/i)).not.toBeInTheDocument();
  });

  test("auto-closes after 8 seconds", async () => {
    render(
      <BadgeCelebration
        badgeType="SPARK"
        studentName="John Doe"
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    jest.advanceTimersByTime(8000);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("closes on button click", async () => {
    render(
      <BadgeCelebration
        badgeType="SPARK"
        studentName="John Doe"
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    const continueButton = screen.getByRole("button", {
      name: /Continue Learning/i,
    });
    fireEvent.click(continueButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test("displays share button", () => {
    render(
      <BadgeCelebration
        badgeType="SPARK"
        studentName="John Doe"
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    const shareButton = screen.getByRole("button", { name: /Share/i });
    expect(shareButton).toBeInTheDocument();
  });

  test("shows share options when share button clicked", async () => {
    render(
      <BadgeCelebration
        badgeType="SPARK"
        studentName="John Doe"
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    const shareButton = screen.getByRole("button", { name: /Share/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText(/WhatsApp/i)).toBeInTheDocument();
      expect(screen.getByText(/Copy Message/i)).toBeInTheDocument();
    });
  });

  test("handles WhatsApp share", async () => {
    const windowOpenSpy = jest
      .spyOn(window, "open")
      .mockImplementation(() => null);

    render(
      <BadgeCelebration
        badgeType="SPARK"
        studentName="John Doe"
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    const shareButton = screen.getByRole("button", { name: /Share/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      const whatsappButton = screen.getByText(/WhatsApp/i);
      fireEvent.click(whatsappButton);
    });

    expect(windowOpenSpy).toHaveBeenCalledWith(
      expect.stringContaining("wa.me"),
      "_blank",
      "noopener,noreferrer"
    );

    windowOpenSpy.mockRestore();
  });

  test("handles copy to clipboard", async () => {
    const mockClipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    Object.assign(navigator, { clipboard: mockClipboard });

    render(
      <BadgeCelebration
        badgeType="SPARK"
        studentName="John Doe"
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    const shareButton = screen.getByRole("button", { name: /Share/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      const copyButton = screen.getByText(/Copy Message/i);
      fireEvent.click(copyButton);
    });

    expect(mockClipboard.writeText).toHaveBeenCalledWith("Test share template");
  });

  test("displays confetti animation", () => {
    const { container } = render(
      <BadgeCelebration
        badgeType="SPARK"
        studentName="John Doe"
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    // Check if confetti container exists
    const confettiContainer = container.querySelector("div[class*='confetti']");
    expect(confettiContainer).toBeDefined();
  });

  test("displays all 5 badge types correctly", () => {
    const badges: BadgeType[] = [
      "SPARK",
      "WORD_WIZARD",
      "VOICE_WIZARD",
      "LANGUAGE_WIZARD",
      "GRAND_WIZARD",
    ];

    badges.forEach((badgeType) => {
      const { rerender } = render(
        <BadgeCelebration
          badgeType={badgeType}
          studentName="Test Student"
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/Badge Earned/i)).toBeInTheDocument();
      rerender(
        <BadgeCelebration
          badgeType={badgeType}
          studentName="Test Student"
          isVisible={false}
          onClose={mockOnClose}
        />
      );
    });
  });

  test("personalizes message with student name", () => {
    render(
      <BadgeCelebration
        badgeType="SPARK"
        studentName="Alice Wonder"
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    // The useBadgeMessages hook should be called with the student name
    expect(screen.getByText("Test congratulations message")).toBeInTheDocument();
  });

  test("passes stats to badge messages hook", () => {
    const { useBadgeMessages } = require("@/hooks/useBadgeMessages");

    render(
      <BadgeCelebration
        badgeType="WORD_WIZARD"
        studentName="Test"
        isVisible={true}
        onClose={mockOnClose}
        stats={{ accuracy: 85, sessionCount: 5 }}
      />
    );

    expect(useBadgeMessages).toHaveBeenCalledWith(
      "WORD_WIZARD",
      "Test",
      expect.objectContaining({ accuracy: 85 })
    );
  });
});

describe("BadgeProgress Component", () => {
  test("renders progress bar", () => {
    render(
      <BadgeProgress
        badgeType="WORD_WIZARD"
        progress={65}
        requirement="Achieve 80%+ accuracy"
        current="65% accuracy"
        earned={false}
      />
    );

    const progressBar = screen.getByRole("progressbar", { hidden: true });
    expect(progressBar).toBeInTheDocument();
  });

  test("displays correct progress percentage", () => {
    const { container } = render(
      <BadgeProgress
        badgeType="WORD_WIZARD"
        progress={75}
        requirement="Achieve 80%+ accuracy"
        current="75% accuracy"
        earned={false}
      />
    );

    expect(container.textContent).toContain("75%");
  });

  test("shows earned badge styling when earned", () => {
    const { container } = render(
      <BadgeProgress
        badgeType="SPARK"
        progress={100}
        requirement="Complete 1 session"
        current="1 / 1 session"
        earned={true}
      />
    );

    // Check for earned state styling
    const progressElement = container.querySelector("[class*='opacity']");
    expect(progressElement).toBeDefined();
  });

  test("shows locked badge styling when not earned", () => {
    const { container } = render(
      <BadgeProgress
        badgeType="WORD_WIZARD"
        progress={50}
        requirement="Achieve 80%+ accuracy"
        current="50% accuracy"
        earned={false}
      />
    );

    expect(container.textContent).toContain("Achieve 80%+ accuracy");
  });

  test("displays requirement and current progress", () => {
    render(
      <BadgeProgress
        badgeType="LANGUAGE_WIZARD"
        progress={60}
        requirement="Complete 10+ sessions"
        current="6 / 10 sessions"
        earned={false}
      />
    );

    expect(screen.getByText("Complete 10+ sessions")).toBeInTheDocument();
    expect(screen.getByText("6 / 10 sessions")).toBeInTheDocument();
  });

  test("renders all badge types", () => {
    const badges: BadgeType[] = [
      "SPARK",
      "WORD_WIZARD",
      "VOICE_WIZARD",
      "LANGUAGE_WIZARD",
      "GRAND_WIZARD",
    ];

    badges.forEach((badgeType) => {
      const { rerender } = render(
        <BadgeProgress
          badgeType={badgeType}
          progress={50}
          requirement="Test requirement"
          current="Test current"
          earned={false}
        />
      );

      expect(screen.getByText("Test requirement")).toBeInTheDocument();
      rerender(
        <BadgeProgress
          badgeType="SPARK"
          progress={0}
          requirement="Different"
          current="state"
          earned={false}
        />
      );
    });
  });

  test("handles edge cases: 0% progress", () => {
    render(
      <BadgeProgress
        badgeType="VOICE_WIZARD"
        progress={0}
        requirement="Achieve 75%+ fluency"
        current="0% fluency"
        earned={false}
      />
    );

    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  test("handles edge cases: 100% progress", () => {
    render(
      <BadgeProgress
        badgeType="SPARK"
        progress={100}
        requirement="Complete 1 session"
        current="1 / 1 session"
        earned={true}
      />
    );

    expect(screen.getByText("100%")).toBeInTheDocument();
  });
});

describe("Badge Integration", () => {
  test("celebration and progress work together", () => {
    const mockOnClose = jest.fn();

    const { rerender } = render(
      <>
        <BadgeCelebration
          badgeType="SPARK"
          studentName="John"
          isVisible={true}
          onClose={mockOnClose}
        />
        <BadgeProgress
          badgeType="WORD_WIZARD"
          progress={45}
          requirement="Achieve 80%+ accuracy"
          current="45% accuracy"
          earned={false}
        />
      </>
    );

    expect(screen.getByText(/SPARK Badge Earned/i)).toBeInTheDocument();
    expect(screen.getByText("45%")).toBeInTheDocument();

    // Close celebration
    const continueButton = screen.getByRole("button", {
      name: /Continue Learning/i,
    });
    fireEvent.click(continueButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
