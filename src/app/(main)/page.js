import Events from './_components/Events'
import Hero from './_components/Hero'
import Joinus from './_components/Joinus'
import Rankings from './_components/Rankings'
import VideosSections from './_components/VideoSections'

export default function Home() {
  return (
    <>
      <Hero />
      <Events />
      <VideosSections />
      <Joinus />
      <Rankings />
    </>
  )
}
