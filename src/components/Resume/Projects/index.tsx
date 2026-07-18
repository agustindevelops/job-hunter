import { Text, View } from "@react-pdf/renderer";
import { Fragment } from "react";
import { normalizeThemeColor } from "@/lib/themeColor";
import type { Project } from "@/types/profile";
import Section from "../Section";
import { createProjectStyles } from "./styles";

type ProjectsProps = {
  projects: Project[];
  themeColor?: string;
};

function formatProjectLinks(links: NonNullable<Project["links"]>): string {
  return links
    .map((link) => link.url.trim())
    .filter(Boolean)
    .join(" · ");
}

export default function Projects({ projects, themeColor }: ProjectsProps) {
  if (!projects.length) return null;

  const styles = createProjectStyles(normalizeThemeColor(themeColor));

  return (
    <Section title="Projects">
      {projects.map((project, projectIndex) => {
        const linkLine = project.links?.length
          ? formatProjectLinks(project.links)
          : "";

        return (
          <Fragment key={projectIndex}>
            <Text style={styles.titleLine}>
              <Text style={styles.itemTitle}>{project.name}</Text>
              {linkLine ? (
                <>
                  <Text> - </Text>
                  <Text style={styles.link}>{linkLine}</Text>
                </>
              ) : null}
            </Text>
            {project.summary ? (
              <Text style={styles.body}>{project.summary}</Text>
            ) : null}
            {project.bullets.map((bullet) => (
              <Text key={bullet.id} style={styles.bullet}>
                • {bullet.text}
              </Text>
            ))}
            {project.technologies?.length ? (
              <Text style={styles.itemMeta}>
                {project.technologies.map((t) => t.text).join(" · ")}
              </Text>
            ) : null}
            <View style={styles.itemSpacer} />
          </Fragment>
        );
      })}
    </Section>
  );
}
