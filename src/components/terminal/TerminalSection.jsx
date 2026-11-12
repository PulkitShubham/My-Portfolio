import SectionHeading from "../ui/SectionHeading";
import Terminal from "./Terminal";

export default function TerminalSection() {
  return (
    <section id="terminal" className="relative py-28 md:py-40">
      <div className="container-x">
        <SectionHeading
          index="07"
          label="Terminal"
          title="Prefer the command line?"
          desc="Everything on this site, one command away. Start with help, try projects --ml, or see what happens with sudo."
        />
        <Terminal />
      </div>
    </section>
  );
}
