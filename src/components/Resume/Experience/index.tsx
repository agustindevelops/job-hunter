import { Text, View } from "@react-pdf/renderer";
import { Fragment } from "react";
import { normalizeThemeColor } from "@/lib/themeColor";
import type { Experience as ExperienceItem } from "@/types/profile";
import Section from "../Section";
import { formatDateRange } from "../utils";
import { createExperienceStyles } from "./styles";

type ExperienceProps = {
  experience: ExperienceItem[];
  themeColor?: string;
};

export default function Experience({
  experience,
  themeColor,
}: ExperienceProps) {
  if (!experience.length) return null;

  const styles = createExperienceStyles(normalizeThemeColor(themeColor));

  return (
    <Section title="Professional Experience">
      {experience.map((job, jobIndex) => (
        <Fragment key={jobIndex}>
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
          {job.bullets.map((bullet) => (
            <Text key={bullet.id} style={styles.bullet}>
              • {bullet.text}
            </Text>
          ))}
          <View style={styles.itemSpacer} />
        </Fragment>
      ))}
    </Section>
  );
}
