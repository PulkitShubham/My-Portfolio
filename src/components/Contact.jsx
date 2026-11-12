import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import emailjs from "@emailjs/browser";
import { FiArrowUpRight, FiCheck, FiAlertTriangle, FiLoader } from "react-icons/fi";
import { emailConfig, socials } from "../data/content";
import SplitText from "./ui/SplitText";
import Magnetic from "./ui/Magnetic";

const ease = [0.22, 1, 0.36, 1];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Field({ label, name, type = "text", textarea, error }) {
  const Tag = textarea ? "textarea" : "input";
  return (
    <div className="relative">
      <Tag
        id={name}
        name={name}
        type={textarea ? undefined : type}
        rows={textarea ? 4 : undefined}
        placeholder=" "
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`peer w-full resize-none border-b bg-transparent pb-3 pt-7 text-lg outline-none transition-colors ${
          error ? "border-red-400" : "border-line focus:border-accent"
        }`}
      />
      <label
        htmlFor={name}
        className="pointer-events-none absolute left-0 top-7 origin-left text-lg text-muted transition-all duration-300 peer-focus:top-0 peer-focus:scale-75 peer-focus:text-accent-fg peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:scale-75"
      >
        {label}
      </label>
      {/* Animated underline */}
      <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-500 peer-focus:scale-x-100" />
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${name}-error`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-2 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function Toast({ toast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="glass fixed bottom-6 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-3 rounded-2xl px-5 py-4 shadow-2xl"
        >
          <span
            className={`grid h-8 w-8 place-items-center rounded-full ${
              toast.type === "success" ? "bg-accent text-on-accent" : "bg-red-500/20 text-red-400"
            }`}
          >
            {toast.type === "success" ? <FiCheck /> : <FiAlertTriangle />}
          </span>
          <span className="text-sm">{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Contact() {
  const form = useRef(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent
  const [toast, setToast] = useState(null);

  const notify = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const submit = async (e) => {
    e.preventDefault();
    const data = new FormData(form.current);
    const name = String(data.get("from_name") ?? "").trim();
    const email = String(data.get("email_id") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const next = {};
    if (!name) next.from_name = "Please tell me your name.";
    if (!EMAIL_RE.test(email)) next.email_id = "That email doesn't look right.";
    if (message.length < 10) next.message = "A few more words, please (10+ characters).";
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus("sending");
    try {
      await emailjs.sendForm(emailConfig.serviceId, emailConfig.templateId, form.current, {
        publicKey: emailConfig.publicKey,
      });
      form.current.reset();
      setStatus("sent");
      notify("success", "Message sent. I'll get back to you soon.");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("idle");
      notify("error", "Something went wrong. Please try again later.");
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden py-28 md:py-40">
      <div className="container-x">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-6 font-mono text-xs uppercase tracking-[0.25em] text-accent-fg"
            >
              08 — Get in touch
            </motion.p>
            <h2 className="font-display text-6xl font-bold uppercase leading-[0.9] tracking-tighter md:text-8xl">
              <SplitText text="Let's work" className="block" />
              <SplitText text="together." className="block" partClassName="text-gradient" delay={0.2} />
            </h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="mt-8 max-w-md text-lg text-muted"
            >
              Have a role, a project or just want to say hi? My inbox is always open.
            </motion.p>

            <ul className="mt-10 space-y-1">
              {socials.map((s, i) => (
                <motion.li
                  key={s.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.08, ease }}
                >
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between border-b border-line py-4 font-display text-xl transition-colors hover:text-accent-fg"
                  >
                    <span className="transition-transform duration-300 group-hover:translate-x-3">{s.name}</span>
                    <FiArrowUpRight className="transition-transform duration-300 group-hover:rotate-45" />
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>

          <motion.form
            ref={form}
            onSubmit={submit}
            noValidate
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, ease }}
            className="flex flex-col gap-8 rounded-3xl border border-line bg-surface/70 p-6 backdrop-blur-sm md:p-10"
          >
            <Field label="Your name" name="from_name" error={errors.from_name} />
            <Field label="Your email" name="email_id" type="email" error={errors.email_id} />
            <Field label="Your message" name="message" textarea error={errors.message} />

            <Magnetic className="self-start">
              <button
                type="submit"
                disabled={status === "sending"}
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-accent px-8 py-4 font-medium text-on-accent disabled:opacity-70"
              >
                <span className="absolute inset-0 translate-y-full rounded-full bg-white transition-transform duration-500 ease-out group-hover:translate-y-0" />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={status}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="relative flex items-center gap-2"
                  >
                    {status === "sending" && (
                      <>
                        <FiLoader className="animate-spin" /> Sending
                      </>
                    )}
                    {status === "sent" && (
                      <>
                        <FiCheck /> Sent
                      </>
                    )}
                    {status === "idle" && (
                      <>
                        Send message <FiArrowUpRight className="transition-transform duration-300 group-hover:rotate-45" />
                      </>
                    )}
                  </motion.span>
                </AnimatePresence>
              </button>
            </Magnetic>
          </motion.form>
        </div>
      </div>
      <Toast toast={toast} />
    </section>
  );
}
