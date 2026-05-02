import { PageIntro } from "@/components/PageIntro";
import { SubmitForm } from "@/components/SubmitForm";

export default function SubmitPage() {
  return (
    <>
      <PageIntro eyebrow="Submit / correct" title="Send a source, proof, correction, or risk report." description="Submission is optional and always reviewed. TuringScout should keep working through source registry and evidence intake even without user submissions." />
      <section className="container-shell pb-16"><SubmitForm /></section>
    </>
  );
}
