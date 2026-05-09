import type { Metadata } from "next";
import Link from "next/link";
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
    <main>
      <div className="page-hero">
        <div className="container">
          <div className="page-hero-breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Projects</span>
          </div>
          <h1>Development Projects</h1>
          <p>Explore our curated selection of real estate developments.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {projects.length > 0 ? (
            <div className="grid grid-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <p className="muted" style={{ textAlign: "center" }}>No projects available yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}
