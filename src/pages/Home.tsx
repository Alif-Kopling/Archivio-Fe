import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";

import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

export default function Home() {
  const navigate = useNavigate();

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-16 md:py-24">
        <div className="inline-block max-w-2xl text-center justify-center">
          <span className={title({ color: "blue" })}>Archivio&nbsp;</span>
          <br />
          <span className={title()}>Digital Document Management.</span>
          <div className={subtitle({ class: "mt-4" })}>
            Store, manage, and access your important documents securely in one
            organized platform.
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <Button
            className="px-8 font-semibold"
            onPress={() => navigate("/login")}
          >
            Tap to login
          </Button>
        </div>
      </section>
    </DefaultLayout>
  );
}
