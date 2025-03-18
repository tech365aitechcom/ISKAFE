import React from "react";

const Events = () => {
  const events = [
    {
      id: 1,
      date: { day: 3, month: "Mar" },
      type: "CHAMPIONS",
      title: "Champion's Night",
      location: "China",
    },
    {
      id: 2,
      date: { day: 3, month: "Mar" },
      type: "CHAMPIONS",
      title: "Champion's Night",
      location: "China",
    },
    {
      id: 3,
      date: { day: 4, month: "Mar" },
      type: "CHAMPIONS",
      title: "Champion's Night",
      location: "China",
    },
    {
      id: 4,
      date: { day: 4, month: "Mar" },
      type: "CHAMPIONS",
      title: "Champion's Night",
      location: "China",
    },
  ];

  return (
    <div
      className="bg-transparent w-full px-5 h-fit lg:px-40 py-20"
      id="events"
    >
      <div className="flex flex-col md:flex-row justify-between items-start mb-4 px-8">
        <div>
          <p className="text-white text-sm uppercase tracking-wide">
            LEARN MORE ABOUT
          </p>
          <h2 className="text-white text-4xl font-bold mt-2">
            Upcoming Events
          </h2>
          <p className="text-gray-300 text-sm mt-4">
            Looking to register to compete? Make sure you're logged in and then
            tap on the event.
          </p>
        </div>

        <div className="mt-4 md:mt-0">
          <button className="bg-red-600 text-white font-bold px-6 py-4 text-lg cursor-pointer rounded">
            View Full Calendar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-8 px-8">
        {events.map((event) => (
          <div key={event.id} className="flex">
            <div className="flex flex-col items-center mr-4">
              <span className="text-gray-400 text-3xl font-bold">
                {event.date.day}
              </span>
              <span className="text-gray-500">{event.date.month}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-white text-xs uppercase tracking-wide">
                {event.type}
              </span>
              <h3 className="text-white text-2xl font-bold mt-1">
                {event.title}
              </h3>
              <span className="text-gray-400 mt-1">{event.location}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;
