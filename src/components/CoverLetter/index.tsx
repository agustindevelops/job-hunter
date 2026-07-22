import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { Profile } from "@/types/profile";
import "./fonts";
import { styles } from "./styles";

type CoverLetterProps = {
  profile: Profile;
  coverLetter: string;
  /** Employer / company for the salutation. */
  companyName?: string;
};

function paragraphsFromBody(body: string): string[] {
  return body
    .trim()
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\n/g, " ").trim())
    .filter(Boolean);
}

function formatLocation(profile: Profile): string {
  const parts = [profile.city, profile.state].filter(Boolean);
  const cityState = parts.join(", ");
  return [cityState, profile.zipcode].filter(Boolean).join(" ");
}

function formatToday(): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

function salutationFor(companyName?: string): string {
  const company = companyName?.trim();
  if (company) return `Dear ${company},`;
  return "Dear Hiring Team,";
}

const CLOSING_THANK_YOU =
  "Thank you for your consideration for this position.";

export default function CoverLetter({
  profile,
  coverLetter,
  companyName,
}: CoverLetterProps) {
  const paragraphs = paragraphsFromBody(coverLetter);
  const contactLines = [
    profile.email,
    profile.phone,
    formatLocation(profile),
  ].filter(Boolean) as string[];

  return (
    <Document
      title={`${profile.fullName} — Cover Letter`}
      author={profile.fullName}
    >
      <Page size="LETTER" style={styles.page}>
        <View style={styles.senderBlock}>
          <Text style={styles.senderName}>{profile.fullName}</Text>
          {contactLines.map((line) => (
            <Text key={line} style={styles.senderLine}>
              {line}
            </Text>
          ))}
        </View>

        <Text style={styles.date}>{formatToday()}</Text>

        <Text style={styles.salutation}>{salutationFor(companyName)}</Text>

        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, index) => (
            <Text key={index} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))
        ) : (
          <Text style={styles.empty}>No cover letter yet.</Text>
        )}

        {paragraphs.length > 0 ? (
          <Text style={styles.paragraph}>{CLOSING_THANK_YOU}</Text>
        ) : null}

        <View style={styles.signOff}>
          <Text style={styles.closing}>Sincerely,</Text>
          <Text style={styles.signature}>{profile.fullName}</Text>
        </View>
      </Page>
    </Document>
  );
}
