import { Link, Text, View } from "@react-pdf/renderer";
import { Fragment, type ReactNode } from "react";
import { normalizeThemeColor } from "@/lib/themeColor";
import type { Profile } from "@/types/profile";
import { GitHubIcon, LinkedInIcon, PortfolioIcon } from "./icons";
import { createSubheaderStyles } from "./styles";

type SubheaderProps = {
  profile: Profile;
};

type ProfileLink = {
  key: string;
  href: string;
  label: string;
  icon: ReactNode;
};

function formatLocation(profile: Profile) {
  const parts = [profile.city, profile.state].filter(Boolean);
  if (!parts.length && !profile.zipcode) return "";
  const cityState = parts.join(", ");
  return [cityState, profile.zipcode].filter(Boolean).join(" ");
}

function normalizeHref(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function buildProfileLinks(profile: Profile, primary: string): ProfileLink[] {
  const links: ProfileLink[] = [];

  if (profile.linkedinUrl?.trim()) {
    links.push({
      key: "linkedin",
      href: normalizeHref(profile.linkedinUrl),
      label: "LinkedIn",
      icon: <LinkedInIcon color={primary} />,
    });
  }
  if (profile.githubUrl?.trim()) {
    links.push({
      key: "github",
      href: normalizeHref(profile.githubUrl),
      label: "GitHub",
      icon: <GitHubIcon />,
    });
  }
  if (profile.portfolioUrl?.trim()) {
    links.push({
      key: "portfolio",
      href: normalizeHref(profile.portfolioUrl),
      label: "Portfolio",
      icon: <PortfolioIcon color={primary} />,
    });
  }

  return links;
}

export default function Subheader({ profile }: SubheaderProps) {
  const primary = normalizeThemeColor(profile.themeColor);
  const styles = createSubheaderStyles(primary);
  const contactItems = [
    profile.phone,
    profile.email,
    formatLocation(profile),
  ].filter(Boolean) as string[];
  const profileLinks = buildProfileLinks(profile, primary);

  if (!contactItems.length && !profileLinks.length) return null;

  return (
    <Fragment>
      <View style={styles.root}>
        {contactItems.length > 0 ? (
          <View style={styles.row}>
            {contactItems.map((item, index) => (
              <View key={item} style={styles.item}>
                {index > 0 ? <View style={styles.dot} /> : null}
                <Text style={styles.text}>{item}</Text>
              </View>
            ))}
          </View>
        ) : null}
        {profileLinks.length > 0 ? (
          <View style={styles.linksRow}>
            {profileLinks.map((link, index) => (
              <View key={link.key} style={styles.item}>
                {index > 0 ? <View style={styles.dot} /> : null}
                <Link src={link.href} style={styles.link}>
                  {link.icon}
                  <Text style={styles.linkLabel}>{link.label}</Text>
                </Link>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      <View style={styles.spacer} />
    </Fragment>
  );
}
