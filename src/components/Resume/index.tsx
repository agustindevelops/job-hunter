import { Document, Page } from "@react-pdf/renderer";
import type { ProfileBundle } from "@/types/profile";
import Education from "./Education";
import Experience from "./Experience";
import Header from "./Header";
import Projects from "./Projects";
import Skills from "./Skills";
import Subheader from "./Subheader";
import { styles } from "./styles";

type ResumeProps = {
  data: ProfileBundle;
};

export default function Resume({ data }: ResumeProps) {
  const { profile, experience, projects, education, skills } = data;

  const showExperience = experience.length > 0;
  const showProjects = projects.length > 0;
  const showSkills = skills.length > 0;
  const showEducation = education.length > 0;
  const lastSection = showEducation
    ? "education"
    : showSkills
      ? "skills"
      : showProjects
        ? "projects"
        : showExperience
          ? "experience"
          : null;

  return (
    <Document title={`${profile.fullName} — Resume`} author={profile.fullName}>
      <Page size="LETTER" style={styles.page}>
        <Header profile={profile} />
        <Subheader profile={profile} />
        {showExperience ? (
          <Experience
            experience={experience}
            themeColor={profile.themeColor}
            spaced={lastSection !== "experience"}
          />
        ) : null}
        {showProjects ? (
          <Projects
            projects={projects}
            themeColor={profile.themeColor}
            spaced={lastSection !== "projects"}
          />
        ) : null}
        {showSkills ? (
          <Skills skills={skills} spaced={lastSection !== "skills"} />
        ) : null}
        {showEducation ? (
          <Education
            education={education}
            spaced={lastSection !== "education"}
          />
        ) : null}
      </Page>
    </Document>
  );
}
