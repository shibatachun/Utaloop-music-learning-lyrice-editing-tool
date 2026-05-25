import { autoAlignLyrics } from "@/lib/alignment";

export type AlignmentJob = {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  createdAt: string;
  result?: ReturnType<typeof autoAlignLyrics>;
};

const jobs = new Map<string, AlignmentJob>();

export function saveAlignmentJob(job: AlignmentJob) {
  jobs.set(job.id, job);
}

export function getAlignmentJob(id: string) {
  return jobs.get(id);
}
