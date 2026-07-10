import { Document, Page } from "@react-pdf/renderer";
import type { ResumeProfile } from "@/types/resume";
import Education from "./Education";
import Experience from "./Experience";
import Header from "./Header";
import Projects from "./Projects";
import Skills from "./Skills";
import Subheader from "./Subheader";
import { styles } from "./styles";

type ResumeProps = {
  data: ResumeProfile;
};

export default function Resume({ data }: ResumeProps) {
  const { profile, experience, projects, education, skills } = data;

  return (
    <Document title={`${profile.fullName} — Resume`} author={profile.fullName}>
      <Page size="LETTER" style={styles.page}>
        <Header profile={profile} />
        <Subheader profile={profile} />
        <Experience experience={experience} />
        <Projects projects={projects} />
        <Education education={education} />
        <Skills skills={skills} />
      </Page>
    </Document>
  );
}
