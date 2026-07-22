import { Text } from "@react-pdf/renderer";
import type { SkillCategory } from "@/types/profile";
import Section from "../Section";
import { styles } from "./styles";

type SkillsProps = {
  skills: SkillCategory[];
  spaced?: boolean;
};

export default function Skills({ skills, spaced = true }: SkillsProps) {
  if (!skills.length) return null;

  return (
    <Section title="Skills" spaced={spaced}>
      {skills.map((group, index) => (
        <Text key={index} style={styles.row}>
          <Text style={styles.label}>{group.category}: </Text>
          {group.skills.map((s) => s.text).join(", ")}
        </Text>
      ))}
    </Section>
  );
}
