import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ProjectCard } from "@/components/project/project-card";
import { getPublishedProjects } from "@/lib/site-data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("projectsTitle"),
    description: t("projectsDescription"),
  };
}

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("projects");
  const tNav = await getTranslations("nav");

  const projects = await getPublishedProjects();

  return (
    <main>
      <div className="page-hero">
        <div className="container">
          <div className="page-hero-breadcrumb">
            <Link href="/">{tNav("home")}</Link>
            <span>/</span>
            <span>{tNav("projects")}</span>
          </div>
          <h1>{t("pageTitle")}</h1>
          <p>{t("pageIntro")}</p>
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
            <p className="muted" style={{ textAlign: "center" }}>{t("empty")}</p>
          )}
        </div>
      </section>
    </main>
  );
}
