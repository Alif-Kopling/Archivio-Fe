import { title } from "@/components/primitives";

export default function StaffDashboard() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-lg text-center justify-center">
        <h1 className={title()}>Staff Dashboard</h1>
        <p className="text-default-500 mt-4">Welcome to the staff dashboard</p>
      </div>
    </section>
  );
}
