import { Text } from "@react-pdf/renderer";
import type { SkillCategory } from "@/types/profile";
import Section from "../Section";
import { styles } from "./styles";

type SkillsProps = {
  skills: SkillCategory[];
};

export default function Skills({ skills }: SkillsProps) {
  if (!skills.length) return null;

  return (
    <Section title="Skills">
      {skills.map((group) => (
        <Text key={group.category} style={styles.row}>
          <Text style={styles.label}>{group.category}: </Text>
          {group.skills.join(", ")}
        </Text>
      ))}
    </Section>
  );
}
