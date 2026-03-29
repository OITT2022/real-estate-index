import type { Metadata } from "next";
import { ProjectCard } from "@/components/project/project-card";
import { getPublishedProjects } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects — Real Estate Index",
  description: "Browse our real estate development projects.",
};

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  return (
    <main className="section">
      <div className="container">
        <p className="eyebrow">Real estate projects</p>
        <h1>Development Projects</h1>
        <p className="muted" style={{ marginBottom: 24 }}>
          Explore our curated selection of real estate developments.
        </p>

        {projects.length > 0 ? (
          <div className="grid grid-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <p className="muted">No projects available yet.</p>
        )}
      </div>
    </main>
  );
}
