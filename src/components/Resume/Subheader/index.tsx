import { Text, View } from "@react-pdf/renderer";
import type { Profile } from "@/types/resume";
import { styles } from "./styles";

type SubheaderProps = {
  profile: Profile;
};

export default function Subheader({ profile }: SubheaderProps) {
  if (!profile.summary) return null;

  return (
    <View style={styles.root}>
      <Text style={styles.summary}>{profile.summary}</Text>
    </View>
  );
}
