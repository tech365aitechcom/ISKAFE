import React from "react";
import { Crown } from "lucide-react";

const PromoteOrganizationUI = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="w-full bg-purple-900 py-6 px-8 text-center">
        <h1 className="text-2xl font-bold mb-1">PROMOTE YOUR ORGANIZATION</h1>
        <p className="text-sm text-gray-300">
          Premium Trainers/Facility Owners promote your brand/organization to
          the Fight Platform, with rich details about your fighters, coaches,
          and staff.
        </p>
      </div>

      {/* Premium Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-purple-900/30 rounded-lg p-6 flex justify-between items-center mb-12">
          <div className="flex items-center">
            <div>
              <div className="flex items-center">
                <h2 className="text-xl font-bold mr-2">Go Premium</h2>
                <Crown size={20} className="text-yellow-500" />
              </div>
              <p className="text-sm text-gray-300 max-w-md mt-1">
                It is a 1-time payment that gives you a year of exposure on the
                Fight Platform. This is not a subscription; it's your choice if
                you want to purchase the next year.
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold mb-2">$24.99</div>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded text-sm">
              Promote Yourself
            </button>
          </div>
        </div>

        {/* What You Get Section */}
        <div className="relative mb-16 pl-12 border-l-2 border-blue-500">
          <div className="absolute left-0 top-0 w-8 h-8 bg-blue-500 rounded-full -ml-4 flex items-center justify-center">
            <div className="w-3 h-3 bg-blue-200 rounded-full"></div>
          </div>
          <h2 className="text-2xl font-bold text-blue-400 mb-4">
            What you get
          </h2>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>Get noticed when we put you on the home page.</li>
            <li>
              Get a blue crown icon Fighters Profile near your premium Facility
              Profile.
            </li>
            <li>
              Your fighters' profiles automatically display their affiliation
              with your facility.
            </li>
            <li>You can link to your fighters' and coaches from the web.</li>
          </ul>
          <div className="absolute bottom-0 right-0 text-xs text-gray-500 max-w-xs">
            Join the Fight to become a more credentialed and trustworthy
            organization for interested parties including fighters.
          </div>
        </div>

        {/* Organization Display */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-purple-900/20 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4">In-app Promotion</h3>
            <p className="text-sm text-gray-300 mb-4">
              All fighters, coaches, promoters, and staff directly in an
              audience of interested fighters and fans through fight Platform
              profiles.
            </p>
            <div className="flex items-center">
              <div className="bg-black/50 p-2 rounded-lg mr-4">
                <img
                  src="/api/placeholder/80/80"
                  alt="Logo"
                  className="w-20 h-20"
                />
              </div>
              <div>
                <div className="text-yellow-500 text-sm mb-1">GOLD</div>
                <div className="font-bold mb-1">Rising Fight Association</div>
                <div className="text-xs text-gray-400">Los Gatos, CA</div>
                <div className="text-xs text-gray-400 mt-2">
                  123 5th Ave, Suite 5539
                </div>
                <div className="text-xs text-gray-400">University, CA</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-400">
              <p className="mb-1">About:</p>
              <p>
                Rising Fight Association is a premier Mixed Martial Arts
                training academy located in the heart of uptown California. Our
                instructors are professional fighters with a combined fighting
                record exceeding 100 victories across regional, national, and
                international competitions. We offer comprehensive personal
                training to martial arts enthusiasts of every skill level, from
                beginner to advanced.
              </p>
            </div>
          </div>

          <div className="bg-purple-900/20 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4">
              Trainer Affiliates in Tournaments
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              Your fighters and fighter coaches are registered to compete in
              Fight Platform tournaments.
            </p>
            <div className="mt-4">
              <img
                src="/api/placeholder/280/140"
                alt="Fighter"
                className="w-full rounded-lg"
              />
            </div>
            <h3 className="text-lg font-bold mt-8 mb-4">
              Trainers and Fighters
            </h3>
            <div className="mt-4">
              <img
                src="/api/placeholder/280/80"
                alt="Fighter"
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Affiliate Rank Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-purple-900/20 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4">
              Trainer Affiliates in Ranks
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              Your fighters listen as automatically coming from affiliated gym
              (your facility).
            </p>
            <div className="flex justify-around mt-8">
              <div className="bg-blue-900/50 p-4 rounded-lg text-center w-24">
                <div className="bg-blue-600 w-12 h-12 rounded-lg mx-auto mb-2"></div>
                <div className="text-xs font-bold">Eric Fowlks</div>
                <div className="text-xs text-gray-400">Pro MMA</div>
                <div className="text-xs font-bold text-yellow-500">Rank #1</div>
                <div className="text-xs text-gray-400">Division: Super</div>
                <div className="text-xs text-gray-400">Bantam</div>
              </div>
              <div className="text-2xl font-bold flex items-center">VS</div>
              <div className="bg-red-900/50 p-4 rounded-lg text-center w-24">
                <div className="bg-red-600 w-12 h-12 rounded-lg mx-auto mb-2"></div>
                <div className="text-xs font-bold">Viper Williams</div>
                <div className="text-xs text-gray-400">Amateur</div>
                <div className="text-xs font-bold text-yellow-500">
                  Rank # 6
                </div>
                <div className="text-xs text-gray-400">Record: 6-0-0</div>
                <div className="text-xs text-gray-400">Spring / Dust</div>
              </div>
            </div>
          </div>

          <div className="bg-purple-900/20 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4">
              Trainer Affiliates in Profiles
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              A fighter's profile automatically linkage each member of the
              entire Gym (link).
            </p>
            <div className="mt-4 flex justify-between">
              <div>
                <img
                  src="/api/placeholder/120/120"
                  alt="Profile"
                  className="w-32 h-32 rounded-lg"
                />
              </div>
              <div className="text-right">
                <button className="border border-white text-white px-4 py-1 text-xs rounded">
                  Edit Profile
                </button>
                <h4 className="text-lg font-bold mt-4">Marie Doe</h4>
                <div className="text-xs text-gray-400">Age: 28</div>
                <div className="text-xs text-gray-400">Gender: M</div>
                <div className="text-xs text-gray-400">Gilroy, CA, USA</div>
                <div className="text-xs text-gray-400">Phone: +1-000000</div>
                <div className="text-xs text-gray-400">marie@gmail.com</div>
                <div className="text-xs text-yellow-500 mt-1">
                  Affiliate: «Local Beach strength Association»
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoteOrganizationUI;
