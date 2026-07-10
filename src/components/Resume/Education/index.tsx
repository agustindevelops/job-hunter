import { Text, View } from "@react-pdf/renderer";
import type { Education as EducationItem } from "@/types/profile";
import Section from "../Section";
import { formatDate } from "../utils";
import { styles } from "./styles";

type EducationProps = {
  education: EducationItem[];
};

export default function Education({ education }: EducationProps) {
  if (!education.length) return null;

  return (
    <Section title="Education">
      {education.map((item) => (
        <View
          key={`${item.school}-${item.degree ?? item.fieldOfStudy}`}
          style={styles.item}
          wrap={false}
        >
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>
              {item.school}
              {item.fieldOfStudy ? ` — ${item.fieldOfStudy}` : ""}
            </Text>
            {item.graduationDate ? (
              <Text style={styles.itemMeta}>
                {formatDate(item.graduationDate)}
              </Text>
            ) : null}
          </View>
          {item.degree ? <Text style={styles.body}>{item.degree}</Text> : null}
          {item.location ? (
            <Text style={styles.itemMeta}>{item.location}</Text>
          ) : null}
          {item.bullets?.map((bullet) => (
            <Text key={bullet} style={styles.bullet}>
              • {bullet}
            </Text>
          ))}
        </View>
      ))}
    </Section>
  );
}
