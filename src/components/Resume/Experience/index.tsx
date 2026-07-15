import { Text, View } from "@react-pdf/renderer";
import type { Experience as ExperienceItem } from "@/types/profile";
import Section from "../Section";
import { formatDateRange } from "../utils";
import { styles } from "./styles";

type ExperienceProps = {
  experience: ExperienceItem[];
};

export default function Experience({ experience }: ExperienceProps) {
  if (!experience.length) return null;

  return (
    <Section title="Professional Experience">
      {experience.map((job, jobIndex) => (
        <View key={jobIndex} style={styles.item}>
          <View wrap={false} minPresenceAhead={48}>
            <View style={styles.itemHeader}>
              <Text style={styles.companyLine}>
                <Text style={styles.company}>{job.company}</Text>
                {job.location ? (
                  <Text style={styles.location}> - {job.location}</Text>
                ) : null}
              </Text>
              <Text style={styles.dates}>
                {formatDateRange(job.startDate, job.endDate, job.current)}
              </Text>
            </View>
            <Text style={styles.title}>{job.title}</Text>
            {job.summary ? <Text style={styles.body}>{job.summary}</Text> : null}
          </View>
          {job.bullets.map((bullet) => (
            <Text key={bullet.id} style={styles.bullet} wrap={false}>
              • {bullet.text}
            </Text>
          ))}
        </View>
      ))}
    </Section>
  );
}
