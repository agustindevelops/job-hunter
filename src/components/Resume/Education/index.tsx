import { Text, View } from "@react-pdf/renderer";
import { Fragment } from "react";
import type { Education as EducationItem } from "@/types/profile";
import Section from "../Section";
import { formatDate } from "../utils";
import { styles } from "./styles";

type EducationProps = {
  education: EducationItem[];
  spaced?: boolean;
};

export default function Education({
  education,
  spaced = true,
}: EducationProps) {
  if (!education.length) return null;

  return (
    <Section title="Education" spaced={spaced}>
      {education.map((item, itemIndex) => (
        <Fragment key={itemIndex}>
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
            <Text key={bullet.id} style={styles.bullet}>
              • {bullet.text}
            </Text>
          ))}
          {itemIndex < education.length - 1 ? (
            <View style={styles.itemSpacer} />
          ) : null}
        </Fragment>
      ))}
    </Section>
  );
}
