import { Text, View } from "@react-pdf/renderer";
import type { Project } from "@/types/resume";
import Section from "../Section";
import { styles } from "./styles";

type ProjectsProps = {
  projects: Project[];
};

export default function Projects({ projects }: ProjectsProps) {
  if (!projects.length) return null;

  return (
    <Section title="Projects">
      {projects.map((project) => (
        <View key={project.name} style={styles.item} wrap={false}>
          <Text style={styles.itemTitle}>{project.name}</Text>
          {project.summary ? (
            <Text style={styles.body}>{project.summary}</Text>
          ) : null}
          {project.bullets.map((bullet) => (
            <Text key={bullet} style={styles.bullet}>
              • {bullet}
            </Text>
          ))}
          {project.technologies?.length ? (
            <Text style={styles.itemMeta}>
              {project.technologies.join(" · ")}
            </Text>
          ) : null}
          {project.links?.length ? (
            <Text style={styles.itemMeta}>
              {project.links.map((link) => link.url).join("  ·  ")}
            </Text>
          ) : null}
        </View>
      ))}
    </Section>
  );
}
