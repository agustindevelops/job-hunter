import { Text, View } from "@react-pdf/renderer";
import { Fragment, type ReactNode } from "react";
import { styles } from "./styles";

type SectionProps = {
  title: string;
  children: ReactNode;
};

export default function Section({ title, children }: SectionProps) {
  return (
    <Fragment>
      <Text style={styles.title}>{title}</Text>
      {children}
      <View style={styles.spacer} />
    </Fragment>
  );
}
