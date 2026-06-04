"use client";

import { useState, useEffect } from "react";

interface EmailMetrics {
  sent: number;
  opened: number;
  openRate: number;
  clicked: number;
  clickRate: number;
  conversions: number;
  uniqueOpeners: number;
  uniqueClickers: number;
}

interface EmailReport {
  period: string;
  totalEmailsSent: number;
  totalOpens: number;
  totalClicks: number;
  totalConversions: number;
  topPerformingEmailTypes: Array<{
    type: string;
    openRate: number;
    clickRate: number;
  }>;
  topPerformingLinks: Array<{ link: string; clicks: number }>;
  parentEngagement: {
    activeParents: number;
    averageOpenRate: number;
    averageClickRate: number;
  };
  recommendations: string[];
}

export default function EmailAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<EmailReport | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/email-analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: new Date(dateRange.start),
          endDate: new Date(dateRange.end),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setReport(data);
      }
    } catch (error) {
      console.error("Error loading report:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !report) {
    return (
      <div style={styles.container}>
        <p style={{ textAlign: "center", padding: "40px" }}>
          Loading analytics...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.heading}>📧 Email Analytics Dashboard</h1>
        <p style={styles.subtitle}>
          Monitor the performance of parent email campaigns
        </p>
      </div>

      <div style={styles.dateRange}>
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) =>
            setDateRange({ ...dateRange, start: e.target.value })
          }
          style={styles.input}
        />
        <span style={styles.separator}>to</span>
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) =>
            setDateRange({ ...dateRange, end: e.target.value })
          }
          style={styles.input}
        />
        <button onClick={loadReport} style={styles.button}>
          Load Report
        </button>
      </div>

      <div style={styles.grid}>
        {/* Summary Cards */}
        <div style={styles.card}>
          <div style={styles.cardLabel}>Emails Sent</div>
          <div style={styles.cardValue}>{report.totalEmailsSent}</div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>Total Opens</div>
          <div style={styles.cardValue}>{report.totalOpens}</div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>Total Clicks</div>
          <div style={styles.cardValue}>{report.totalClicks}</div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>Referral Conversions</div>
          <div style={styles.cardValue}>{report.totalConversions}</div>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Engagement Metrics */}
        <div style={styles.card}>
          <div style={styles.cardLabel}>Active Parents</div>
          <div style={styles.cardValue}>
            {report.parentEngagement.activeParents}
          </div>
          <div style={styles.cardSubtext}>
            Avg Open Rate:{" "}
            {report.parentEngagement.averageOpenRate.toFixed(1)}%
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>Avg Click Rate</div>
          <div style={styles.cardValue}>
            {report.parentEngagement.averageClickRate.toFixed(1)}%
          </div>
          <div style={styles.cardSubtext}>
            Per email sent
          </div>
        </div>
      </div>

      {/* Top Performing Email Types */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📊 Top Performing Email Types</h2>
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <div style={{ flex: 2 }}>Email Type</div>
            <div style={{ flex: 1 }}>Open Rate</div>
            <div style={{ flex: 1 }}>Click Rate</div>
          </div>
          {report.topPerformingEmailTypes.map((type, idx) => (
            <div key={idx} style={styles.tableRow}>
              <div style={{ flex: 2 }}>{type.type}</div>
              <div style={{ flex: 1 }}>
                {type.openRate.toFixed(1)}%
              </div>
              <div style={{ flex: 1 }}>
                {type.clickRate.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Links */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🔗 Top Performing Links</h2>
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <div style={{ flex: 2 }}>Link Type</div>
            <div style={{ flex: 1 }}>Clicks</div>
          </div>
          {report.topPerformingLinks.map((link, idx) => (
            <div key={idx} style={styles.tableRow}>
              <div style={{ flex: 2 }}>{link.link}</div>
              <div style={{ flex: 1 }}>{link.clicks}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>💡 Recommendations</h2>
          <div style={styles.recommendations}>
            {report.recommendations.map((rec, idx) => (
              <div key={idx} style={styles.recommendation}>
                • {rec}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={styles.footer}>
        <p>Period: {report.period}</p>
        <p style={{ fontSize: "12px", color: "#999", marginTop: "10px" }}>
          Data updated every hour. Use this dashboard to optimize your email
          strategy.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px 20px",
    background: "#f5f5f5",
    minHeight: "100vh",
  },
  header: {
    maxWidth: "1200px",
    margin: "0 auto 40px",
  },
  heading: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#333",
    margin: "0 0 10px 0",
  },
  subtitle: {
    color: "#666",
    margin: 0,
  },
  dateRange: {
    maxWidth: "1200px",
    margin: "0 auto 30px",
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  input: {
    padding: "8px 12px",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    fontSize: "14px",
  },
  separator: {
    color: "#999",
  },
  button: {
    padding: "8px 24px",
    background: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
  },
  grid: {
    maxWidth: "1200px",
    margin: "0 auto 30px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "white",
    padding: "25px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  cardLabel: {
    color: "#999",
    fontSize: "12px",
    textTransform: "uppercase" as const,
    marginBottom: "10px",
    fontWeight: "600",
  },
  cardValue: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#667eea",
    margin: "10px 0",
  },
  cardSubtext: {
    fontSize: "12px",
    color: "#666",
    marginTop: "10px",
  },
  section: {
    maxWidth: "1200px",
    margin: "0 auto 30px",
    background: "white",
    padding: "25px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333",
    margin: "0 0 20px 0",
  },
  table: {
    width: "100%",
  },
  tableHeader: {
    display: "flex",
    background: "#f5f5f5",
    padding: "12px",
    borderRadius: "6px",
    fontWeight: "bold",
    color: "#333",
    fontSize: "14px",
    marginBottom: "10px",
  },
  tableRow: {
    display: "flex",
    padding: "12px",
    borderBottom: "1px solid #e0e0e0",
    alignItems: "center",
    fontSize: "14px",
    color: "#666",
  },
  recommendations: {
    background: "#f0f4ff",
    padding: "20px",
    borderRadius: "6px",
    borderLeft: "4px solid #667eea",
  },
  recommendation: {
    marginBottom: "12px",
    lineHeight: "1.6",
    color: "#333",
  },
  footer: {
    maxWidth: "1200px",
    margin: "40px auto 0",
    textAlign: "center" as const,
    color: "#999",
    fontSize: "14px",
  },
};
