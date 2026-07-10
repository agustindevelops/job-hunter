import { Text, View } from "@react-pdf/renderer";
import type { Profile } from "@/types/resume";
import { styles } from "./styles";

type HeaderProps = {
  profile: Profile;
};

export default function Header({ profile }: HeaderProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.name}>{profile.fullName}</Text>
      {profile.headline ? (
        <Text style={styles.title}>{profile.headline}</Text>
      ) : null}
    </View>
  );
}
