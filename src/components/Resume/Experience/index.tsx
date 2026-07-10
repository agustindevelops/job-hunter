import { Text, View } from "@react-pdf/renderer";
import type { Experience as ExperienceItem } from "@/types/resume";
import Section from "../Section";
import { formatDateRange } from "../utils";
import { styles } from "./styles";

type ExperienceProps = {
  experience: ExperienceItem[];
};

export default function Experience({ experience }: ExperienceProps) {
  if (!experience.length) return null;

  return (
    <Section title="Experience">
      {experience.map((job) => (
        <View
          key={`${job.company}-${job.title}`}
          style={styles.item}
          wrap={false}
        >
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>
              {job.title} — {job.company}
            </Text>
            <Text style={styles.itemMeta}>
              {formatDateRange(job.startDate, job.endDate, job.current)}
            </Text>
          </View>
          {job.location ? (
            <Text style={styles.itemMeta}>{job.location}</Text>
          ) : null}
          {job.summary ? <Text style={styles.body}>{job.summary}</Text> : null}
          {job.bullets.map((bullet) => (
            <Text key={bullet} style={styles.bullet}>
              • {bullet}
            </Text>
          ))}
        </View>
      ))}
    </Section>
  );
}
