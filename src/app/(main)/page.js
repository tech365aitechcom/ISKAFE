import { Button } from '../../../components/ui/button'

const fighters = [
  { name: 'Tugruk Smith', record: '16–2', image: '/fighter.png' },
  { name: 'Eric Franks', record: '20–6', image: '/fighter.png' },
  { name: 'Alex Warner', record: '12–1', image: '/fighter.png' },
]

const events = [
  {
    title: 'Summer Showdown',
    date: 'June 14, 2025',
    image: '/fighter.png',
  },
  {
    title: 'Kickboxing Championship',
    date: 'August 14, 2025',
    image: '/fighter.png',
  },
  {
    title: 'Alex Warner',
    date: 'September, 2025',
    image: '/fighter.png',
  },
]

const media = [
  {
    title: 'Highlight Reel 2024',
    image: '/fighter.png',
  },
  {
    title: 'Behind the Gloves',
    image: '/fighter.png',
  },
  {
    title: 'Training Camp Secrets',
    image: '/fighter.png',
  },
]

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className='bg-transparent w-full flex flex-col md:flex-row lg:px-40'>
        <div className='flex-1 p-8 pt-16 pb-16 flex flex-col justify-center'>
          <h1 className='text-white font-bold text-4xl md:text-5xl uppercase tracking-wide'>
            COMBAT SPORTS
          </h1>
          <h2 className='text-red-500 font-bold text-4xl md:text-5xl uppercase tracking-wide mt-2'>
            CIRCUIT
          </h2>
          <p className='text-white text-xl mt-4 max-w-lg leading-relaxed'>
            Where Kickboxing, Muey Thai, and boxing champions are forged
          </p>

          <div className='mt-6 flex justify-between w-full'>
            <Button
              variant='destructive'
              size='lg'
              className='py-6 text-xl rounded'
            >
              Register Now
            </Button>
          </div>
        </div>
        <div className='flex-1 border-4 border-red-600 relative overflow-hidden w-[530px] h-[600px]'>
          <img
            src='/hero.png'
            alt='Kickboxer in white gloves'
            className='w-full h-full object-cover'
          />
          <div className='absolute inset-0 bg-gradient-to-r from-blue-900/30 to-red-600/30'></div>
          <div className='absolute bottom-6 left-0 right-0 flex justify-center space-x-2'>
            {[0, 1, 2, 3, 4].map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${
                  i === 0 ? 'bg-white' : 'bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Top Fighters Section */}
      <section className='bg-transparent w-full py-12 px-4 md:px-20'>
        <h2 className='text-white text-3xl md:text-4xl font-bold uppercase tracking-wide mb-10 container mx-auto'>
          Top Fighters
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-10 text-white'>
          {fighters.map((fighter, i) => (
            <div key={i} className='flex flex-col items-center text-center'>
              <img
                src={fighter.image}
                alt={fighter.name}
                className='w-full h-[300px] object-contain rounded-md'
              />
              <p className='text-xl font-semibold mt-4'>{fighter.name}</p>
              <p className='font-bold'>{fighter.record}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section
        id='events'
        className='bg-transparent w-full py-12 px-4 md:px-20'
      >
        <h2 className='text-white text-3xl md:text-4xl font-bold uppercase tracking-wide mb-10 container mx-auto'>
          Upcoming Events
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-10 text-white'>
          {events.map((event, i) => (
            <div key={i} className='flex flex-col items-center text-center'>
              <img
                src={event.image}
                alt={event.title}
                className='w-full h-[300px] object-contain rounded-md'
              />
              <p className='text-xl font-semibold mt-4'>{event.title}</p>
              <p className='font-bold'>{event.date}</p>
              <Button variant='destructive' size='sm' className='mt-2 rounded'>
                BUY TICKETS
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Media Section */}
      <section className='bg-transparent w-full py-12 px-4 md:px-20'>
        <h2 className='text-white text-3xl md:text-4xl font-bold uppercase tracking-wide mb-10 container mx-auto'>
          Latest Media
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-10 text-white'>
          {media.map((item, i) => (
            <div key={i} className='flex flex-col items-center'>
              <img
                src={item.image}
                alt={item.title}
                className='w-full h-[300px] object-contain rounded-md'
              />
              <p className='text-xl font-semibold mt-4'>{item.title}</p>
            </div>
          ))}
        </div>
      </section>
      <section className='bg-transparent w-full py-12 px-4 md:px-20'>
        <h2 className='text-white text-3xl md:text-4xl font-bold uppercase tracking-wide mb-10 container mx-auto'>
          Recent Event Results
        </h2>
        <div className='flex justify-evenly w-full'>
          <img
            src='/fighter.png'
            alt='Tugruk Smith'
            className=' h-[300px] object-contain rounded-md'
          />
          <div className='flex flex-col gap-4 justify-center text-white text-left '>
            <p className='text-2xl'>April 19,2025</p>
            <h2 className='text-5xl'>Professional Photography</h2>
            <p className='text-2xl'>
              Professional photographers capture combat sports action at a
              <br /> new venue at inticulate sports
            </p>
            <div className='w-full flex items-center justify-start mt-10'>
              <Button
                variant='destructive'
                size='lg'
                className='py-6 text-xl rounded '
              >
                Read More
              </Button>
            </div>
          </div>
        </div>
      </section>
      <section className='bg-transparent w-full py-12 px-4 md:px-20'>
        <h2 className='text-white text-3xl md:text-4xl font-bold uppercase tracking-wide mb-10 container mx-auto'>
          News Post
        </h2>
        <div className='flex justify-evenly w-full'>
          <div className='flex flex-col gap-4 justify-center text-white text-right '>
            <h2 className='text-5xl'>Kickboxing Championship</h2>
            <p className='text-2xl'>April 19,2025</p>
            <div className='w-full flex items-center justify-end mt-10'>
              <Button
                variant='destructive'
                size='lg'
                className='py-6 text-xl rounded '
              >
                Read More
              </Button>
            </div>
          </div>
          <img
            src='/fighter.png'
            alt='Tugruk Smith'
            className=' h-[300px] object-contain rounded-md'
          />
        </div>
      </section>
    </main>
  )
}
