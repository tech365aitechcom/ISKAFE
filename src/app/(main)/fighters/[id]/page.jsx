import React from 'react'

const FighterProfile = () => {
  return (
    <div className='bg-gray-900 text-white min-h-screen p-6'>
      <div className='max-w-4xl mx-auto'>
        {/* Header Section with Fighter Details */}
        <div className='flex space-x-6 mb-6'>
          {/* Fighter Image */}
          <div className='w-64 h-64 bg-gray-800 rounded-lg overflow-hidden'>
            <img
              src='/api/placeholder/256/256'
              alt='Eric Franks'
              className='w-full h-full object-cover'
            />
          </div>

          {/* Fighter Info */}
          <div className='flex-1'>
            <div className='flex justify-between items-start mb-4'>
              <div>
                <h1 className='text-3xl font-bold'>ERIC FRANKS</h1>
                <p className='text-gray-400 text-sm'>loosescrew187</p>
              </div>
            </div>

            {/* Fighter Stats Grid */}
            <div className='grid grid-cols-3 gap-4 text-sm'>
              <div>
                <span className='text-gray-400 block'>Record (Summary)</span>
                <p className='font-semibold'>29-6-0</p>
              </div>
              <div>
                <span className='text-gray-400 block'>Height</span>
                <p className='font-semibold'>5'9"</p>
              </div>
              <div>
                <span className='text-gray-400 block'>Weight</span>
                <p className='font-semibold'>145 LBS</p>
              </div>
              <div>
                <span className='text-gray-400 block'>Age</span>
                <p className='font-semibold'>38</p>
              </div>
              <div>
                <span className='text-gray-400 block'>Gender</span>
                <p className='font-semibold'>Male</p>
              </div>
              <div>
                <span className='text-gray-400 block'>Weight Class</span>
                <p className='font-semibold'>Lightweight</p>
              </div>
              <div className='col-span-2'>
                <span className='text-gray-400 block'>Location</span>
                <p className='font-semibold'>Gilroy, CA, USA</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className='flex space-x-4 mt-4 text-sm'>
              <div className='mb-2'>
                <span className='text-gray-400'>Phone: </span>
                <span>+1 555-123-4567</span>
              </div>
              <div>
                <span className='text-gray-400'>Email: </span>
                <span>name@example.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gym Info */}
        <div className='bg-gray-800 p-4 rounded-lg mb-6'>
          <h2 className='text-lg font-semibold mb-2'>Gym Information</h2>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='text-gray-400 block'>Primary Gym / Club</span>
              <p>Top Strike Combat Club</p>
            </div>
            <div>
              <span className='text-gray-400 block'>Coach Name</span>
              <p>Coach Mike Sanderson</p>
            </div>
            <div className='col-span-2'>
              <span className='text-gray-400 block'>
                Secondary Affiliations
              </span>
              <p>3Rican Couture</p>
            </div>
          </div>
        </div>

        {/* Compliance Status */}
        <div className='bg-gray-800 p-4 rounded-lg mb-6'>
          <h2 className='text-lg font-semibold mb-2'>Compliance</h2>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='text-gray-400 block'>Suspension Status</span>
              <p className='text-green-400'>No Active Suspension</p>
            </div>
            <div>
              <span className='text-gray-400 block'>
                Medical / License Status
              </span>
              <p className='text-green-400'>Med Form Submitted</p>
            </div>
          </div>
        </div>

        {/* About Fighter Biography */}
        <div className='bg-gray-800 p-4 rounded-lg mb-6'>
          <h2 className='text-lg font-semibold mb-3'>About Fighter</h2>
          <p className='text-sm text-gray-300 leading-relaxed'>
            February 2022 - Johnny Davis is a Former 2x World Kickboxing
            Champion and now Global V.P. of Operations and Promotions for
            International Kickboxing Federation (IKF)...IKF CEO Ms. Toni Fossum.
            He is also President: IKF Point Muay Thai (PMT), Point Kickboxing
            (PKB), and Point Boxing Sparring Circuit (PBSC). Additionally, he's
            owner and President of www.AKPLive.com a Pay Per View Streaming
            Company with partner Mr. Derrick Rhems and has other business
            entities. Johnny Morris Davis (born July 15, 1962) is an American
            former kickboxer who competed in the welterweight and middleweight
            divisions. Nicknamed "Superfoof".
          </p>
        </div>

        {/* Record Overview */}
        <div className='mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Record Overview</h2>
          <div className='bg-gray-800 p-6 rounded-lg'>
            <div className='text-center mb-4'>
              <p className='text-3xl font-bold text-yellow-400'>29-6-0</p>
              <p className='text-gray-400'>Total Win-Loss-Draw Record</p>
            </div>
          </div>
        </div>

        {/* Record Breakdown */}
        <div className='mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Record Breakdown</h2>
          <div className='grid grid-cols-2 gap-6'>
            {/* Wins Section */}
            <div className='bg-gradient-to-r from-green-900 to-green-700 p-6 rounded-lg'>
              <h3 className='text-xl font-semibold text-center mb-2'>
                Wins (Official)
              </h3>
              <p className='text-4xl font-bold text-center mb-4'>29</p>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span>By Decision:</span>
                  <span className='font-semibold'>18</span>
                </div>
                <div className='flex justify-between'>
                  <span>By Stoppage:</span>
                  <span className='font-semibold'>11</span>
                </div>
              </div>
            </div>

            {/* Losses Section */}
            <div className='bg-gradient-to-r from-red-900 to-red-700 p-6 rounded-lg'>
              <h3 className='text-xl font-semibold text-center mb-2'>
                Losses (Official)
              </h3>
              <p className='text-4xl font-bold text-center mb-4'>6</p>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span>By Decision:</span>
                  <span className='font-semibold'>4</span>
                </div>
                <div className='flex justify-between'>
                  <span>By Stoppage:</span>
                  <span className='font-semibold'>2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Semi-Contact Record */}
          <div className='mt-4 bg-gray-800 p-4 rounded-lg'>
            <h3 className='text-lg font-semibold mb-2'>Semi-Contact Record</h3>
            <p className='text-xl font-bold'>0 bouts</p>
            <p className='text-gray-400 text-sm'>
              Total semi-contact experience
            </p>
          </div>

          {/* Purported Record */}
          <div className='mt-4 bg-gray-800 p-4 rounded-lg'>
            <h3 className='text-lg font-semibold mb-2'>
              Purported Record (Self-Claimed)
            </h3>
            <p className='text-xl font-bold'>32-7-1</p>
            <p className='text-gray-400 text-sm'>
              Self-declared record not yet verified
            </p>
          </div>
        </div>

        {/* Achievements */}
        <div className='mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Achievements</h2>
          <div className='bg-gray-800 p-4 rounded-lg'>
            <div className='space-y-3'>
              <div className='flex items-center space-x-3'>
                <div className='w-2 h-2 bg-yellow-400 rounded-full'></div>
                <span>Top Lightweight Fighter</span>
              </div>
              <div className='flex items-center space-x-3'>
                <div className='w-2 h-2 bg-yellow-400 rounded-full'></div>
                <span>Fastest KO - 0:23</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rankings */}
        <div className='mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Rankings</h2>
          <div className='grid grid-cols-2 gap-4'>
            <div className='bg-gray-800 p-4 rounded-lg text-center'>
              <h3 className='text-lg font-semibold mb-2'>National Rank</h3>
              <p className='text-3xl font-bold text-yellow-400'>#4</p>
              <p className='text-gray-400 text-sm'>
                IKF national ranking by weight class
              </p>
            </div>
            <div className='bg-gray-800 p-4 rounded-lg text-center'>
              <h3 className='text-lg font-semibold mb-2'>Global Rank</h3>
              <p className='text-3xl font-bold text-blue-400'>#18</p>
              <p className='text-gray-400 text-sm'>Global placement</p>
            </div>
          </div>
        </div>

        {/* Training Info */}
        <div className='mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Training Info</h2>
          <div className='bg-gray-800 p-4 rounded-lg'>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-gray-400 block'>Training Experience</span>
                <p className='font-semibold'>12 years</p>
              </div>
              <div>
                <span className='text-gray-400 block'>Martial Arts Belts</span>
                <p className='font-semibold'>Red Prajoud</p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className='mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Social Media</h2>
          <div className='bg-gray-800 p-4 rounded-lg'>
            <div className='flex space-x-6'>
              <a
                href='https://instagram.com/...'
                className='text-blue-400 hover:text-blue-300'
              >
                Instagram
              </a>
              <a
                href='https://youtube.com/...'
                className='text-red-400 hover:text-red-300'
              >
                YouTube
              </a>
              <a
                href='https://facebook.com/...'
                className='text-blue-500 hover:text-blue-400'
              >
                Facebook
              </a>
            </div>
          </div>
        </div>

        {/* Fight History */}
        <div className='mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Fight History</h2>
          <div className='bg-gray-800 rounded-lg overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='bg-gray-700'>
                  <tr>
                    <th className='px-4 py-3 text-left'>Date</th>
                    <th className='px-4 py-3 text-left'>Event</th>
                    <th className='px-4 py-3 text-left'>Opponent</th>
                    <th className='px-4 py-3 text-left'>Method</th>
                    <th className='px-4 py-3 text-left'>Result</th>
                    <th className='px-4 py-3 text-left'>Round</th>
                    <th className='px-4 py-3 text-left'>Time</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-700'>
                  <tr className='hover:bg-gray-700'>
                    <td className='px-4 py-3'>Mar 2024</td>
                    <td className='px-4 py-3'>Leon Strike</td>
                    <td className='px-4 py-3'>John Smith</td>
                    <td className='px-4 py-3'>Decision (Unanimous)</td>
                    <td className='px-4 py-3'>
                      <span className='bg-green-600 text-white px-2 py-1 rounded text-xs'>
                        WIN
                      </span>
                    </td>
                    <td className='px-4 py-3'>3</td>
                    <td className='px-4 py-3'>5:00</td>
                  </tr>
                  <tr className='hover:bg-gray-700'>
                    <td className='px-4 py-3'>Jan 2024</td>
                    <td className='px-4 py-3'>Jason Harris</td>
                    <td className='px-4 py-3'>Mike Johnson</td>
                    <td className='px-4 py-3'>TKO (Punches)</td>
                    <td className='px-4 py-3'>
                      <span className='bg-green-600 text-white px-2 py-1 rounded text-xs'>
                        WIN
                      </span>
                    </td>
                    <td className='px-4 py-3'>2</td>
                    <td className='px-4 py-3'>3:42</td>
                  </tr>
                  <tr className='hover:bg-gray-700'>
                    <td className='px-4 py-3'>Jul 2023</td>
                    <td className='px-4 py-3'>Tony Wolfpack</td>
                    <td className='px-4 py-3'>Alex Rodriguez</td>
                    <td className='px-4 py-3'>Decision (Split)</td>
                    <td className='px-4 py-3'>
                      <span className='bg-red-600 text-white px-2 py-1 rounded text-xs'>
                        LOSS
                      </span>
                    </td>
                    <td className='px-4 py-3'>3</td>
                    <td className='px-4 py-3'>5:00</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* <div className='p-4 bg-gray-700 text-center'>
              <button className='bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors'>
                View All Bouts
              </button>
            </div> */}
          </div>
        </div>

        {/* Media Gallery */}
        <div className='mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Media Gallery</h2>
          <div className='bg-gray-800 p-4 rounded-lg'>
            <div className='mb-4'>
              <h3 className='text-lg font-semibold mb-3'>Images Gallery</h3>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div className='aspect-square bg-gray-700 rounded-lg overflow-hidden'>
                  <img
                    src='/api/placeholder/200/200'
                    alt='Fighter image 1'
                    className='w-full h-full object-cover hover:opacity-80 transition-opacity cursor-pointer'
                  />
                </div>
                <div className='aspect-square bg-gray-700 rounded-lg overflow-hidden'>
                  <img
                    src='/api/placeholder/200/200'
                    alt='Fighter image 2'
                    className='w-full h-full object-cover hover:opacity-80 transition-opacity cursor-pointer'
                  />
                </div>
                <div className='aspect-square bg-gray-700 rounded-lg overflow-hidden'>
                  <img
                    src='/api/placeholder/200/200'
                    alt='Fighter image 3'
                    className='w-full h-full object-cover hover:opacity-80 transition-opacity cursor-pointer'
                  />
                </div>
                <div className='aspect-square bg-gray-700 rounded-lg overflow-hidden'>
                  <img
                    src='/api/placeholder/200/200'
                    alt='Fighter image 4'
                    className='w-full h-full object-cover hover:opacity-80 transition-opacity cursor-pointer'
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className='text-lg font-semibold mb-3'>Video Embeds</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='bg-gray-700 rounded-lg p-4 text-center'>
                  <div className='aspect-video bg-gray-600 rounded mb-2 flex items-center justify-center'>
                    <span className='text-gray-400'>No Video Found</span>
                  </div>
                  <p className='text-sm text-gray-400'>Training Footage</p>
                </div>
                <div className='bg-gray-700 rounded-lg p-4 text-center'>
                  <div className='aspect-video bg-gray-600 rounded mb-2 flex items-center justify-center'>
                    <span className='text-gray-400'>No Video Found</span>
                  </div>
                  <p className='text-sm text-gray-400'>Fight Highlights</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FighterProfile
