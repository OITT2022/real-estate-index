import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Project, ProjectImage } from "@prisma/client";

type ProjectWithImages = Project & {
  images: ProjectImage[];
  _count: { properties: number };
};

export function ProjectCard({ project }: { project: ProjectWithImages }) {
  const t = useTranslations("project");
  const primaryImage = project.images.find((img) => img.isPrimary) ?? project.images[0];

  return (
    <article className="property-card">
      <Link href={`/projects/${project.slug}`}>
        {primaryImage ? (
          <img src={primaryImage.url} alt={primaryImage.altText ?? project.title} className="property-card-image" />
        ) : (
          <div className="property-image-placeholder" />
        )}
        <div className="property-card-body">
          <p className="eyebrow">{project.city}</p>
          <h3>{project.title}</h3>
          <p className="muted">{project.developerName}</p>
          <div className="property-meta-row">
            {project._count.properties > 0 && <span>{project._count.properties} {t("units")}</span>}
            {project.totalUnits && <span>{project.totalUnits} {t("total")}</span>}
            {project.completionDate && <span>{project.completionDate}</span>}
          </div>
        </div>
      </Link>
    </article>
  );
}
