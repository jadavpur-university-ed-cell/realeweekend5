import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events | E-Weekend 9.0",
  description:
    "Discover a plethora of exciting events at E-Weekend 9.0 by JU E-Cell.",
};

export default function EventsLayout({ children, }: {  children: React.ReactNode; }) {
  return (
    <>
      {children}
    </>
  );
}