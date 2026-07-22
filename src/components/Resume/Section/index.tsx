import { Text, View } from "@react-pdf/renderer";
import { Fragment, type ReactNode } from "react";
import { styles } from "./styles";

type SectionProps = {
  title: string;
  children: ReactNode;
  /** Space after the section. Omit on the last section to avoid a blank trailing PDF page. */
  spaced?: boolean;
};

export default function Section({
  title,
  children,
  spaced = true,
}: SectionProps) {
  return (
    <Fragment>
      <Text style={styles.title}>{title}</Text>
      {children}
      {spaced ? <View style={styles.spacer} /> : null}
    </Fragment>
  );
}
