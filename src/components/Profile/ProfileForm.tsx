"use client";

import type { ReactNode } from "react";
import {
  useFieldArray,
  type Control,
  type UseFormRegister,
  type UseFormReturn,
} from "react-hook-form";
import Button from "@/components/Button";
import {
  LinkListField,
  StringListField,
} from "@/components/Profile/StringListField";
import { BENEFIT_TYPES } from "@/db/benefitTypes";
import {
  fieldClassName,
  growingTextareaClassName,
  labelClassName,
} from "@/lib/formStyles";
import {
  createEmptyAchievement,
  createEmptyEducation,
  createEmptyExperience,
  createEmptyFaq,
  createEmptyProject,
  createEmptySkillCategory,
  PREFERRED_LOCATION_TYPES,
  type ProfileFormValues,
} from "@/lib/profileForm";

type ProfileFormProps = {
  form: UseFormReturn<ProfileFormValues>;
  onSubmit: (values: ProfileFormValues) => void | Promise<void>;
  saving: boolean;
  /** Ideal-job preferences — profile page only. */
  showIdealJobPreferences?: boolean;
};

function Section({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 border-t border-zinc-200 pt-6 first:border-t-0 first:pt-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
          <p className="mt-1 text-sm text-zinc-500">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ItemCard({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-zinc-200 bg-zinc-50/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-zinc-800">{title}</h3>
        <Button type="button" variant="secondary" onClick={onRemove}>
          Remove
        </Button>
      </div>
      {children}
    </div>
  );
}

function ContactFields({
  register,
}: {
  register: UseFormRegister<ProfileFormValues>;
}) {
  return (
    <>
      <div>
        <label htmlFor="fullName" className={labelClassName}>
          Full name
        </label>
        <input
          id="fullName"
          type="text"
          className={fieldClassName}
          placeholder="Jane Doe"
          {...register("fullName", { required: true })}
        />
      </div>

      <div>
        <label htmlFor="headline" className={labelClassName}>
          Headline
        </label>
        <input
          id="headline"
          type="text"
          className={fieldClassName}
          placeholder="Full Stack Web Developer"
          {...register("headline")}
        />
      </div>

      <div>
        <label htmlFor="summary" className={labelClassName}>
          Summary
        </label>
        <textarea
          id="summary"
          rows={4}
          className={fieldClassName}
          placeholder="A short professional summary…"
          {...register("summary")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelClassName}>
            Email
          </label>
          <input
            id="email"
            type="email"
            className={fieldClassName}
            placeholder="you@example.com"
            {...register("contact.email")}
          />
        </div>
        <div>
          <label htmlFor="phone" className={labelClassName}>
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            className={fieldClassName}
            placeholder="(555) 123-4567"
            {...register("contact.phone")}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="city" className={labelClassName}>
            City
          </label>
          <input
            id="city"
            type="text"
            className={fieldClassName}
            placeholder="Austin"
            {...register("contact.city")}
          />
        </div>
        <div>
          <label htmlFor="state" className={labelClassName}>
            State
          </label>
          <input
            id="state"
            type="text"
            className={fieldClassName}
            placeholder="TX"
            {...register("contact.state")}
          />
        </div>
        <div>
          <label htmlFor="zipcode" className={labelClassName}>
            Zip code
          </label>
          <input
            id="zipcode"
            type="text"
            className={fieldClassName}
            placeholder="78701"
            {...register("contact.zipcode")}
          />
        </div>
      </div>

      <div>
        <label htmlFor="portfolioUrl" className={labelClassName}>
          Portfolio URL
        </label>
        <input
          id="portfolioUrl"
          type="text"
          inputMode="url"
          autoComplete="url"
          className={fieldClassName}
          placeholder="www.yoursite.com"
          {...register("contact.portfolioUrl")}
        />
      </div>

      <div>
        <label htmlFor="linkedinUrl" className={labelClassName}>
          LinkedIn URL
        </label>
        <input
          id="linkedinUrl"
          type="text"
          inputMode="url"
          autoComplete="url"
          className={fieldClassName}
          placeholder="www.linkedin.com/in/you"
          {...register("contact.linkedinUrl")}
        />
      </div>

      <div>
        <label htmlFor="githubUrl" className={labelClassName}>
          GitHub URL
        </label>
        <input
          id="githubUrl"
          type="text"
          inputMode="url"
          autoComplete="url"
          className={fieldClassName}
          placeholder="www.github.com/you"
          {...register("contact.githubUrl")}
        />
      </div>
    </>
  );
}

function ExperienceFields({
  control,
  register,
  index,
}: {
  control: Control<ProfileFormValues>;
  register: UseFormRegister<ProfileFormValues>;
  index: number;
}) {
  return (
    <>
      <input
        type="hidden"
        {...register(`experiences.${index}.entityId`, {
          setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)),
        })}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClassName}>Company</label>
          <input
            className={fieldClassName}
            {...register(`experiences.${index}.company`)}
          />
        </div>
        <div>
          <label className={labelClassName}>Title</label>
          <input
            className={fieldClassName}
            {...register(`experiences.${index}.title`)}
          />
        </div>
      </div>
      <div>
        <label className={labelClassName}>Location</label>
        <input
          className={fieldClassName}
          {...register(`experiences.${index}.location`)}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClassName}>Start (YYYY-MM)</label>
          <input
            className={fieldClassName}
            placeholder="2022-05"
            {...register(`experiences.${index}.startDate`)}
          />
        </div>
        <div>
          <label className={labelClassName}>End (YYYY-MM)</label>
          <input
            className={fieldClassName}
            placeholder="2024-01"
            {...register(`experiences.${index}.endDate`)}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-zinc-700">
        <input
          type="checkbox"
          className="rounded border-zinc-300"
          {...register(`experiences.${index}.current`)}
        />
        Current role
      </label>
      <div>
        <label className={labelClassName}>Summary</label>
        <textarea
          rows={2}
          className={fieldClassName}
          {...register(`experiences.${index}.summary`)}
        />
      </div>
      <StringListField
        control={control}
        name={`experiences.${index}.bullets`}
        label="Bullets"
        placeholder="Led development of…"
      />
      <StringListField
        control={control}
        name={`experiences.${index}.technologies`}
        label="Technologies"
        placeholder="Next.js"
      />
      <StringListField
        control={control}
        name={`experiences.${index}.tags`}
        label="Tags"
        placeholder="full_stack"
      />
    </>
  );
}

export default function ProfileForm({
  form,
  onSubmit,
  saving,
  showIdealJobPreferences = false,
}: ProfileFormProps) {
  const { register, control, handleSubmit, watch, setValue } = form;
  const preferredBenefitNames = watch("preferredBenefitNames");

  const experiences = useFieldArray({ control, name: "experiences" });
  const projects = useFieldArray({ control, name: "projects" });
  const education = useFieldArray({ control, name: "education" });
  const skillCategories = useFieldArray({ control, name: "skillCategories" });
  const achievements = useFieldArray({ control, name: "achievements" });
  const faqs = useFieldArray({ control, name: "faqs" });

  return (
    <form
      className="flex w-full flex-col gap-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Section
        title="Contact info"
        description="Basic details shown at the top of your resume."
      >
        <ContactFields register={register} />
      </Section>

      <Section
        title="Cover letter / blurb"
        description="Markdown blurb stored on your master application."
      >
        <div>
          <label htmlFor="coverLetter" className={labelClassName}>
            Cover letter
          </label>
          <textarea
            id="coverLetter"
            rows={5}
            className={growingTextareaClassName}
            placeholder="A reusable personal blurb or cover letter draft…"
            {...register("coverLetter")}
          />
        </div>
      </Section>

      <Section
        title="Target roles"
        description="Roles you are aiming for when applying."
      >
        <StringListField
          control={control}
          name="targetRoles"
          label="Roles"
          placeholder="Full Stack Web Developer"
        />
      </Section>

      {showIdealJobPreferences ? (
        <Section
          title="Ideal job"
          description="What you want next — used to score job fit when you apply."
        >
          <div>
            <label htmlFor="idealJobDescription" className={labelClassName}>
              What does your ideal job consist of?
            </label>
            <textarea
              id="idealJobDescription"
              rows={4}
              className={growingTextareaClassName}
              placeholder="e.g. Senior full-stack role on a small product team, ownership of features end-to-end, mostly remote…"
              {...register("idealJobDescription")}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="preferredLocationType"
                className={labelClassName}
              >
                Preferred location type
              </label>
              <select
                id="preferredLocationType"
                className={fieldClassName}
                {...register("preferredLocationType")}
              >
                {PREFERRED_LOCATION_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="salaryMinExpectation"
                className={labelClassName}
              >
                Minimum salary (annual USD)
              </label>
              <input
                id="salaryMinExpectation"
                type="number"
                min={0}
                step={1000}
                className={fieldClassName}
                placeholder="120000"
                {...register("salaryMinExpectation")}
              />
            </div>
          </div>
          <div>
            <p className={labelClassName}>Benefits you care about</p>
            <div className="mt-1 grid gap-2 sm:grid-cols-2">
              {BENEFIT_TYPES.map((benefit) => {
                const checked = preferredBenefitNames.includes(benefit.name);
                return (
                  <label
                    key={benefit.name}
                    className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-zinc-300"
                      checked={checked}
                      onChange={() => {
                        const next = checked
                          ? preferredBenefitNames.filter(
                              (name) => name !== benefit.name,
                            )
                          : [...preferredBenefitNames, benefit.name];
                        setValue("preferredBenefitNames", next, {
                          shouldDirty: true,
                        });
                      }}
                    />
                    {benefit.label}
                  </label>
                );
              })}
            </div>
          </div>
        </Section>
      ) : null}

      <Section
        title="Experience"
        description="Work history attached to your master application."
        action={
          <Button
            type="button"
            variant="secondary"
            onClick={() => experiences.append(createEmptyExperience())}
          >
            Add
          </Button>
        }
      >
        {experiences.fields.length === 0 ? (
          <p className="text-sm text-zinc-500">No experience entries yet.</p>
        ) : (
          experiences.fields.map((field, index) => (
            <ItemCard
              key={field.id}
              title={`Experience ${index + 1}`}
              onRemove={() => experiences.remove(index)}
            >
              <ExperienceFields
                control={control}
                register={register}
                index={index}
              />
            </ItemCard>
          ))
        )}
      </Section>

      <Section
        title="Projects"
        description="Projects attached to your master application."
        action={
          <Button
            type="button"
            variant="secondary"
            onClick={() => projects.append(createEmptyProject())}
          >
            Add
          </Button>
        }
      >
        {projects.fields.length === 0 ? (
          <p className="text-sm text-zinc-500">No projects yet.</p>
        ) : (
          projects.fields.map((field, index) => (
            <ItemCard
              key={field.id}
              title={`Project ${index + 1}`}
              onRemove={() => projects.remove(index)}
            >
              <input
                type="hidden"
                {...register(`projects.${index}.entityId`, {
                  setValueAs: (v) =>
                    v === "" || v == null ? undefined : Number(v),
                })}
              />
              <div>
                <label className={labelClassName}>Name</label>
                <input
                  className={fieldClassName}
                  {...register(`projects.${index}.name`)}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClassName}>Type</label>
                  <input
                    className={fieldClassName}
                    placeholder="personal, professional…"
                    {...register(`projects.${index}.type`)}
                  />
                </div>
                <div>
                  <label className={labelClassName}>Status</label>
                  <input
                    className={fieldClassName}
                    placeholder="live, archived…"
                    {...register(`projects.${index}.status`)}
                  />
                </div>
              </div>
              <div>
                <label className={labelClassName}>Summary</label>
                <textarea
                  rows={2}
                  className={fieldClassName}
                  {...register(`projects.${index}.summary`)}
                />
              </div>
              <StringListField
                control={control}
                name={`projects.${index}.bullets`}
                label="Bullets"
                placeholder="Built a…"
              />
              <StringListField
                control={control}
                name={`projects.${index}.technologies`}
                label="Technologies"
                placeholder="React"
              />
              <LinkListField
                control={control}
                name={`projects.${index}.links`}
              />
              <StringListField
                control={control}
                name={`projects.${index}.tags`}
                label="Tags"
                placeholder="open_source"
              />
            </ItemCard>
          ))
        )}
      </Section>

      <Section
        title="Education"
        description="Schools and degrees on your master application."
        action={
          <Button
            type="button"
            variant="secondary"
            onClick={() => education.append(createEmptyEducation())}
          >
            Add
          </Button>
        }
      >
        {education.fields.length === 0 ? (
          <p className="text-sm text-zinc-500">No education entries yet.</p>
        ) : (
          education.fields.map((field, index) => (
            <ItemCard
              key={field.id}
              title={`Education ${index + 1}`}
              onRemove={() => education.remove(index)}
            >
              <input
                type="hidden"
                {...register(`education.${index}.entityId`, {
                  setValueAs: (v) =>
                    v === "" || v == null ? undefined : Number(v),
                })}
              />
              <div>
                <label className={labelClassName}>School</label>
                <input
                  className={fieldClassName}
                  {...register(`education.${index}.school`)}
                />
              </div>
              <div>
                <label className={labelClassName}>Location</label>
                <input
                  className={fieldClassName}
                  {...register(`education.${index}.location`)}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClassName}>Degree</label>
                  <input
                    className={fieldClassName}
                    {...register(`education.${index}.degree`)}
                  />
                </div>
                <div>
                  <label className={labelClassName}>Field of study</label>
                  <input
                    className={fieldClassName}
                    {...register(`education.${index}.fieldOfStudy`)}
                  />
                </div>
              </div>
              <div>
                <label className={labelClassName}>Graduation (YYYY-MM)</label>
                <input
                  className={fieldClassName}
                  placeholder="2020-05"
                  {...register(`education.${index}.graduationDate`)}
                />
              </div>
              <StringListField
                control={control}
                name={`education.${index}.coursework`}
                label="Coursework"
                placeholder="Data Structures"
              />
              <StringListField
                control={control}
                name={`education.${index}.bullets`}
                label="Bullets"
                placeholder="Completed…"
              />
              <StringListField
                control={control}
                name={`education.${index}.tags`}
                label="Tags"
                placeholder="computer_science"
              />
            </ItemCard>
          ))
        )}
      </Section>

      <Section
        title="Skills"
        description="Skill categories on your master application."
        action={
          <Button
            type="button"
            variant="secondary"
            onClick={() => skillCategories.append(createEmptySkillCategory())}
          >
            Add
          </Button>
        }
      >
        {skillCategories.fields.length === 0 ? (
          <p className="text-sm text-zinc-500">No skill categories yet.</p>
        ) : (
          skillCategories.fields.map((field, index) => (
            <ItemCard
              key={field.id}
              title={`Category ${index + 1}`}
              onRemove={() => skillCategories.remove(index)}
            >
              <input
                type="hidden"
                {...register(`skillCategories.${index}.entityId`, {
                  setValueAs: (v) =>
                    v === "" || v == null ? undefined : Number(v),
                })}
              />
              <div>
                <label className={labelClassName}>Category</label>
                <input
                  className={fieldClassName}
                  placeholder="Frontend, Backend…"
                  {...register(`skillCategories.${index}.category`)}
                />
              </div>
              <StringListField
                control={control}
                name={`skillCategories.${index}.skills`}
                label="Skills"
                placeholder="TypeScript"
              />
              <StringListField
                control={control}
                name={`skillCategories.${index}.tags`}
                label="Tags"
                placeholder="frontend"
              />
            </ItemCard>
          ))
        )}
      </Section>

      <Section
        title="Achievements"
        description="Highlights attached to your master application."
        action={
          <Button
            type="button"
            variant="secondary"
            onClick={() => achievements.append(createEmptyAchievement())}
          >
            Add
          </Button>
        }
      >
        {achievements.fields.length === 0 ? (
          <p className="text-sm text-zinc-500">No achievements yet.</p>
        ) : (
          achievements.fields.map((field, index) => (
            <ItemCard
              key={field.id}
              title={`Achievement ${index + 1}`}
              onRemove={() => achievements.remove(index)}
            >
              <input
                type="hidden"
                {...register(`achievements.${index}.entityId`, {
                  setValueAs: (v) =>
                    v === "" || v == null ? undefined : Number(v),
                })}
              />
              <div>
                <label className={labelClassName}>Title</label>
                <input
                  className={fieldClassName}
                  {...register(`achievements.${index}.title`)}
                />
              </div>
              <div>
                <label className={labelClassName}>Description</label>
                <textarea
                  rows={3}
                  className={fieldClassName}
                  {...register(`achievements.${index}.description`)}
                />
              </div>
              <div>
                <label className={labelClassName}>Related to</label>
                <input
                  className={fieldClassName}
                  placeholder="Company, project, or experience"
                  {...register(`achievements.${index}.relatedTo`)}
                />
              </div>
              <StringListField
                control={control}
                name={`achievements.${index}.tags`}
                label="Tags"
                placeholder="leadership"
              />
            </ItemCard>
          ))
        )}
      </Section>

      <Section
        title="FAQs"
        description="Reusable Q&A for applications (markdown answers)."
        action={
          <Button
            type="button"
            variant="secondary"
            onClick={() => faqs.append(createEmptyFaq())}
          >
            Add
          </Button>
        }
      >
        {faqs.fields.length === 0 ? (
          <p className="text-sm text-zinc-500">No FAQs yet.</p>
        ) : (
          faqs.fields.map((field, index) => (
            <ItemCard
              key={field.id}
              title={`FAQ ${index + 1}`}
              onRemove={() => faqs.remove(index)}
            >
              <input
                type="hidden"
                {...register(`faqs.${index}.entityId`, {
                  setValueAs: (v) =>
                    v === "" || v == null ? undefined : Number(v),
                })}
              />
              <div>
                <label className={labelClassName}>Question</label>
                <input
                  className={fieldClassName}
                  {...register(`faqs.${index}.question`)}
                />
              </div>
              <div>
                <label className={labelClassName}>Answer</label>
                <textarea
                  rows={4}
                  className={fieldClassName}
                  {...register(`faqs.${index}.answer`)}
                />
              </div>
            </ItemCard>
          ))
        )}
      </Section>

      <div className="sticky bottom-0 border-t border-zinc-200 bg-zinc-100 py-3">
        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          {saving ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
