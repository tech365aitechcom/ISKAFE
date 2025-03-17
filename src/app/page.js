import Image from "next/image";
import Hero from "./sections/Hero";
import Events from "./sections/Events";
import Joinus from "./sections/Joinus";
import Rankings from "./sections/Rankings";
import VideoSections from "./sections/VideoSections";

export default function Home() {
  return (
    <>
      <Hero />
      <Events />
      <VideoSections />
      <Joinus />
      <Rankings />
    </>
  );
}
