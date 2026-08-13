import type { Metadata } from "next";
import JobCard from "@/components/JobCard";
import { PageHead } from "@/components/States";
import { IconBolt, IconDiscover } from "@/components/Icons";
import { listJobs } from "@/server/repository";

export const metadata: Metadata = { title: "Discover Jobs" };

const FILTERS = ["All", "Above 90%", "Remote only", "Posted today", "₹20L+", "Saved"];

export default function Discover() {
  const jobs = listJobs("demo-user");

  return (
    <>
      <PageHead
        rail="Opportunity feed"
        title="Roles the agent surfaced for you"
        sub="Scored against your Career DNA, not against keywords. Ranked by fit, then by how fast the posting is moving."
        actions={
          <>
            <span className="chip"><span className="pulse" /> Scanning 41 sources</span>
            <button className="btn btn-quiet btn-sm"><IconBolt size={14} /> Autopilot rules</button>
          </>
        }
      />

      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f, i) => (
          <button
            key={f}
            className="chip flex-none transition-colors"
            style={i === 0
              ? { background: "var(--iris-soft)", color: "var(--iris)", borderColor: "var(--iris-line)" }
              : undefined}
          >
            {f}
          </button>
        ))}
        <span className="chip flex-none ml-auto hidden sm:inline-flex">
          <IconDiscover size={12} /> {jobs.length} roles
        </span>
      </div>

      <div className="stagger space-y-4">
        {jobs.map((j, i) => (
          <JobCard key={j.id} job={j} index={i} />
        ))}
      </div>

      <p className="caption mt-8 text-center">
        The agent keeps scanning while you are away. New matches appear here and in your notifications.
      </p>
    </>
  );
}
