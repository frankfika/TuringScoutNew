"use client";

import { useState } from "react";

const types = ["project", "opportunity", "free_credits", "github_repo", "agent", "bounty", "creator_content", "correction", "risk_report", "sponsored_interest"];

export function SubmitForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: payload.url,
        type: payload.type,
        note: payload.note,
        contactEmail: payload.contactEmail,
        socialHandle: payload.socialHandle,
        contentUrl: payload.contentUrl,
        publicCreditOptIn: payload.publicCreditOptIn === "on",
        website: payload.website,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setStatus("error");
      setMessage(data.error ?? "Submission failed.");
      return;
    }

    setStatus("success");
    setMessage(`Received. Submission id: ${data.submissionId}`);
    form.reset();
  }

  return (
    <form onSubmit={onSubmit} className="glass rounded-[34px] p-6 md:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Public URL" name="url" type="url" required placeholder="https://example.com/offer" />
        <label className="block"><span className="text-sm font-black">Type</span><select name="type" required className="mt-2 w-full rounded-2xl border border-ink/10 bg-white/65 px-4 py-3 outline-none focus:border-moss">{types.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}</select></label>
        <Field label="Contact email (private)" name="contactEmail" type="email" placeholder="optional@example.com" />
        <Field label="Public handle" name="socialHandle" placeholder="@alice" />
        <Field label="Creator/content URL" name="contentUrl" type="url" placeholder="https://..." />
        <label className="flex items-center gap-3 rounded-2xl bg-white/45 px-4 py-3"><input name="publicCreditOptIn" type="checkbox" /> <span className="font-semibold">Opt in to public scout/creator credit after review</span></label>
      </div>
      <label className="mt-5 block"><span className="text-sm font-black">Note</span><textarea name="note" rows={5} className="mt-2 w-full rounded-2xl border border-ink/10 bg-white/65 px-4 py-3 outline-none focus:border-moss" placeholder="What should we know? Official source, risk, correction, or creator context." /></label>
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <button disabled={status === "loading"} className="mt-6 rounded-full bg-ink px-6 py-4 font-black text-sand transition hover:-translate-y-1 hover:bg-moss disabled:opacity-60">
        {status === "loading" ? "Submitting..." : "Submit for review"}
      </button>
      {message ? <p className={`mt-4 rounded-2xl p-4 text-sm font-semibold ${status === "error" ? "bg-red-100 text-red-900" : "bg-emerald-100 text-emerald-900"}`}>{message}</p> : null}
    </form>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  const { label, ...inputProps } = props;
  return <label className="block"><span className="text-sm font-black">{label}</span><input {...inputProps} className="mt-2 w-full rounded-2xl border border-ink/10 bg-white/65 px-4 py-3 outline-none focus:border-moss" /></label>;
}
