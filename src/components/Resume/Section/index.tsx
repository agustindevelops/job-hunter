import { Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { styles } from "./styles";

type SectionProps = {
  title: string;
  children: ReactNode;
};

export default function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}
