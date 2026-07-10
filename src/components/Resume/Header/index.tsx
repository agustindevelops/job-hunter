import { Text, View } from "@react-pdf/renderer";
import type { Profile } from "@/types/resume";
import { styles } from "./styles";

type HeaderProps = {
  profile: Profile;
};

export default function Header({ profile }: HeaderProps) {
  const contact = [
    profile.location,
    profile.phone,
    profile.email,
    profile.portfolioUrl,
    profile.linkedinUrl,
    profile.githubUrl,
  ]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <View style={styles.root}>
      <Text style={styles.name}>{profile.fullName}</Text>
      {profile.headline ? (
        <Text style={styles.headline}>{profile.headline}</Text>
      ) : null}
      {contact ? <Text style={styles.contactRow}>{contact}</Text> : null}
    </View>
  );
}
