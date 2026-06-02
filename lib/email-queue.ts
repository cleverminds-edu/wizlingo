import { prisma } from "@/lib/prisma";

// Email queue job interface
export interface EmailJob {
  id: string;
  to: string;
  subject: string;
  html: string;
  type: string;
  studentId: string;
  createdAt: Date;
  sentAt?: Date;
  status: "pending" | "sent" | "failed";
  retries: number;
  error?: string;
}

// In-memory queue for development
// In production, use Redis/Bull or a database job queue
class EmailQueueManager {
  private jobs: Map<string, EmailJob> = new Map();
  private processing = false;
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds

  async addJob(job: Omit<EmailJob, "id" | "createdAt" | "status" | "retries">): Promise<string> {
    const id = Math.random().toString(36).substring(7);
    const newJob: EmailJob = {
      ...job,
      id,
      createdAt: new Date(),
      status: "pending",
      retries: 0,
    };
    this.jobs.set(id, newJob);
    this.process();
    return id;
  }

  async getJob(id: string): Promise<EmailJob | undefined> {
    return this.jobs.get(id);
  }

  async getAllJobs(): Promise<EmailJob[]> {
    return Array.from(this.jobs.values());
  }

  async getPendingJobs(): Promise<EmailJob[]> {
    return Array.from(this.jobs.values()).filter((j) => j.status === "pending");
  }

  async getFailedJobs(): Promise<EmailJob[]> {
    return Array.from(this.jobs.values()).filter((j) => j.status === "failed");
  }

  async markAsSent(id: string): Promise<void> {
    const job = this.jobs.get(id);
    if (job) {
      job.status = "sent";
      job.sentAt = new Date();

      // Log to database
      try {
        await prisma.sentEmail.create({
          data: {
            studentId: job.studentId,
            type: job.type,
            recipientEmail: job.to,
            subject: job.subject,
            body: job.html,
            status: "sent",
          },
        });
      } catch (error) {
        console.error("Failed to log sent email to database:", error);
      }
    }
  }

  async markAsFailed(id: string, error: string): Promise<void> {
    const job = this.jobs.get(id);
    if (job) {
      job.retries++;
      if (job.retries >= this.maxRetries) {
        job.status = "failed";
        job.error = error;

        // Log to database
        try {
          await prisma.sentEmail.create({
            data: {
              studentId: job.studentId,
              type: job.type,
              recipientEmail: job.to,
              subject: job.subject,
              body: job.html,
              status: "failed",
              error: error,
            },
          });
        } catch (dbError) {
          console.error("Failed to log failed email to database:", dbError);
        }
      }
    }
  }

  async process(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    const pendingJobs = this.getPendingJobs();

    for (const job of pendingJobs) {
      try {
        // Simulate sending email
        await this.sendEmail(job);
        await this.markAsSent(job.id);
      } catch (error) {
        await this.markAsFailed(job.id, String(error));
      }
    }

    this.processing = false;

    // Schedule retry for failed jobs
    const failedJobs = await this.getFailedJobs();
    if (failedJobs.length > 0) {
      setTimeout(() => this.process(), this.retryDelay);
    }
  }

  private async sendEmail(job: EmailJob): Promise<void> {
    // TODO: Implement actual email sending here
    // For now, just log to console
    console.log(`[EmailQueue] Sending email to ${job.to}:`, {
      subject: job.subject,
      type: job.type,
    });

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  getQueueStats(): {
    total: number;
    pending: number;
    sent: number;
    failed: number;
  } {
    const jobs = Array.from(this.jobs.values());
    return {
      total: jobs.length,
      pending: jobs.filter((j) => j.status === "pending").length,
      sent: jobs.filter((j) => j.status === "sent").length,
      failed: jobs.filter((j) => j.status === "failed").length,
    };
  }

  clear(): void {
    this.jobs.clear();
  }
}

// Export singleton instance
export const emailQueue = new EmailQueueManager();

// Helper functions
export async function addEmailToQueue(
  to: string,
  subject: string,
  html: string,
  type: string,
  studentId: string
): Promise<string> {
  return emailQueue.addJob({
    to,
    subject,
    html,
    type,
    studentId,
  });
}

export async function getEmailJob(id: string): Promise<EmailJob | undefined> {
  return emailQueue.getJob(id);
}

export async function getAllEmailJobs(): Promise<EmailJob[]> {
  return emailQueue.getAllJobs();
}

export function getEmailQueueStats() {
  return emailQueue.getQueueStats();
}

export async function processQueue(): Promise<void> {
  return emailQueue.process();
}

export function clearQueue(): void {
  emailQueue.clear();
}
