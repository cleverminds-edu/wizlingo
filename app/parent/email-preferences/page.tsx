"use client";

import { useState, useEffect } from "react";
import { prisma } from "@/lib/prisma";

interface EmailPreferences {
  frequency: string;
  badgeEarned: boolean;
  weeklyProgress: boolean;
  monthlyMilestone: boolean;
  schoolRanking: boolean;
  sendTime: string;
  timezone: string;
}

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Asia/Bangalore", label: "Bangalore (IST)" },
  { value: "Asia/Delhi", label: "Delhi (IST)" },
  { value: "Asia/Mumbai", label: "Mumbai (IST)" },
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "US Eastern" },
  { value: "Europe/London", label: "UK (GMT)" },
];

const SEND_TIMES = [
  { value: "6pm", label: "6:00 PM (Evening)" },
  { value: "7pm", label: "7:00 PM" },
  { value: "8pm", label: "8:00 PM (Night)" },
  { value: "9pm", label: "9:00 PM" },
];

export default function EmailPreferencesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<EmailPreferences>({
    frequency: "immediate",
    badgeEarned: true,
    weeklyProgress: true,
    monthlyMilestone: true,
    schoolRanking: true,
    sendTime: "6pm",
    timezone: "Asia/Kolkata",
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    // Get token from URL
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    setToken(t);

    // Load preferences if token is provided
    if (t) {
      loadPreferences(t);
    } else {
      setLoading(false);
    }
  }, []);

  const loadPreferences = async (token: string) => {
    try {
      const response = await fetch(`/api/parent/email-preferences/${token}`);
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
      setMessage({
        type: "error",
        text: "Could not load your preferences. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token) {
      setMessage({
        type: "error",
        text: "No token provided. Please use the link from your email.",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        `/api/parent/email-preferences/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(preferences),
        }
      );

      if (response.ok) {
        setMessage({
          type: "success",
          text: "✓ Your email preferences have been saved!",
        });
      } else {
        setMessage({
          type: "error",
          text: "Could not save preferences. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      setMessage({
        type: "error",
        text: "An error occurred. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <p>Loading your preferences...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>📧 Email Preferences</h1>
        <p style={styles.subtitle}>
          Manage how you receive updates about your child's progress on WizLingo
        </p>

        {message && (
          <div
            style={{
              ...styles.message,
              background:
                message.type === "success" ? "#dcfce7" : "#fee2e2",
              color:
                message.type === "success" ? "#15803d" : "#991b1b",
              border:
                message.type === "success"
                  ? "1px solid #86efac"
                  : "1px solid #fca5a5",
            }}
          >
            {message.text}
          </div>
        )}

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📬 Email Frequency</h2>
          <div style={styles.radioGroup}>
            {[
              { value: "immediate", label: "Immediately when earned" },
              { value: "daily", label: "Daily summary" },
              { value: "weekly", label: "Weekly summary" },
            ].map((option) => (
              <label key={option.value} style={styles.radioLabel}>
                <input
                  type="radio"
                  name="frequency"
                  value={option.value}
                  checked={preferences.frequency === option.value}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      frequency: e.target.value,
                    })
                  }
                  style={styles.radioInput}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📨 Email Types</h2>
          <p style={styles.sectionDesc}>
            Choose which types of emails you'd like to receive:
          </p>

          {[
            {
              key: "badgeEarned",
              label: "🎉 Badge Earned",
              desc: "Get notified when your child earns a new badge",
            },
            {
              key: "weeklyProgress",
              label: "📊 Weekly Progress",
              desc: "Receive a weekly summary of learning progress",
            },
            {
              key: "monthlyMilestone",
              label: "🏆 Monthly Milestones",
              desc: "Celebrate major achievements each month",
            },
            {
              key: "schoolRanking",
              label: "🏫 School Rankings",
              desc: "See how your school is performing",
            },
          ].map((item) => (
            <label key={item.key} style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={
                  preferences[item.key as keyof EmailPreferences] as boolean
                }
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    [item.key]: e.target.checked,
                  })
                }
                style={styles.checkboxInput}
              />
              <div>
                <strong>{item.label}</strong>
                <div style={styles.checkboxDesc}>{item.desc}</div>
              </div>
            </label>
          ))}
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>⏰ Preferred Send Time</h2>
          <div style={styles.formGroup}>
            <label style={styles.label}>Time of Day:</label>
            <select
              value={preferences.sendTime}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  sendTime: e.target.value,
                })
              }
              style={styles.select}
            >
              {SEND_TIMES.map((time) => (
                <option key={time.value} value={time.value}>
                  {time.label}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Timezone:</label>
            <select
              value={preferences.timezone}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  timezone: e.target.value,
                })
              }
              style={styles.select}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              ...styles.button,
              ...styles.buttonPrimary,
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>

        <p style={styles.footer}>
          We respect your preferences and will only send emails you want to
          receive. You can change these settings anytime.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f5f5f5",
    padding: "40px 20px",
  },
  card: {
    maxWidth: "600px",
    margin: "0 auto",
    background: "white",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  heading: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#333",
    margin: "0 0 10px 0",
  },
  subtitle: {
    color: "#666",
    marginBottom: "30px",
  },
  message: {
    padding: "15px",
    borderRadius: "6px",
    marginBottom: "20px",
    fontWeight: "500",
  },
  section: {
    marginBottom: "30px",
    paddingBottom: "30px",
    borderBottom: "1px solid #e0e0e0",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "15px",
  },
  sectionDesc: {
    color: "#666",
    fontSize: "14px",
    marginBottom: "15px",
  },
  radioGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    padding: "10px",
    borderRadius: "6px",
    transition: "background 0.2s",
    fontSize: "14px",
  },
  radioInput: {
    marginRight: "12px",
    cursor: "pointer",
    width: "18px",
    height: "18px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "flex-start",
    cursor: "pointer",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "12px",
    fontSize: "14px",
  },
  checkboxInput: {
    marginRight: "12px",
    marginTop: "4px",
    cursor: "pointer",
    width: "18px",
    height: "18px",
  },
  checkboxDesc: {
    fontSize: "12px",
    color: "#666",
    marginTop: "4px",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontWeight: "500",
    marginBottom: "8px",
    color: "#333",
    fontSize: "14px",
  },
  select: {
    width: "100%",
    padding: "10px",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "inherit",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    marginTop: "30px",
  },
  button: {
    padding: "12px 24px",
    borderRadius: "6px",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s",
  },
  buttonPrimary: {
    background: "#667eea",
    color: "white",
    flex: 1,
  },
  footer: {
    textAlign: "center" as const,
    color: "#999",
    fontSize: "12px",
    marginTop: "30px",
  },
};
