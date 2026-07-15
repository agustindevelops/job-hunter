import { Text, View } from "@react-pdf/renderer";
import { Fragment } from "react";
import type { Profile } from "@/types/profile";
import { styles } from "./styles";

type SubheaderProps = {
  profile: Profile;
};

function formatLocation(profile: Profile) {
  const parts = [profile.city, profile.state].filter(Boolean);
  if (!parts.length && !profile.zipcode) return "";
  const cityState = parts.join(", ");
  return [cityState, profile.zipcode].filter(Boolean).join(" ");
}

export default function Subheader({ profile }: SubheaderProps) {
  const items = [profile.phone, profile.email, formatLocation(profile)].filter(
    Boolean,
  ) as string[];

  if (!items.length) return null;

  return (
    <Fragment>
      <View style={styles.root}>
        <View style={styles.row}>
          {items.map((item, index) => (
            <View key={index} style={styles.item}>
              {index > 0 ? <View style={styles.dot} /> : null}
              <Text style={styles.text}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.spacer} />
    </Fragment>
  );
}
