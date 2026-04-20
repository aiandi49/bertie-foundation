import React from "react";
import { motion } from "framer-motion";
import { Layout } from "../components/Layout";
import { BertieLogo } from "../components/BertieLogo";


export default function WhoIsBertie() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary-500/10 to-transparent rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.div
              className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/10 to-transparent rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [360, 180, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 py-16 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto text-center mb-16"
            >
              {/* Logo and Title */}
              <div className="flex flex-col items-center justify-center gap-16 mb-12">
                <h1 className="text-5xl md:text-6xl font-display font-bold text-[#003366] leading-tight">BERTIE FOUNDATION</h1>
                <div className="transform scale-125">
                  <BertieLogo />
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-[#003366] leading-tight">
                  Who is Bertie?
                </h2>
              </div>
            </motion.div>

            {/* Biography Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-4xl mx-auto p-6 md:p-8 rounded-xl shadow-xl relative overflow-hidden" style={{ backgroundColor: '#2563eb' }}
            >
              {/* Bertie's Image */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="w-full flex justify-center mb-6 md:float-right md:w-auto md:ml-8 md:mb-4"
              >
                <img
                  src="https://zubughdeldzdujuwtcyz.supabase.co/storage/v1/object/public/images/Headshot.jpg"
                  alt="Bertie Geneva Rogers"
                  className="w-48 h-48 md:w-48 md:h-48 object-cover rounded-xl shadow-lg border-4 border-white/20"
                />
              </motion.div>
              <div className="prose prose-invert max-w-none text-center md:text-left">
                {/* Early Life */}
                <div className="mb-6 md:mb-8">
                  <p className="text-gray-100 leading-relaxed text-base md:text-lg font-medium">
                    Bertie Geneva Rogers was born in the town of Andrews, South Carolina, USA on July 12, 1928
                    and was the oldest of 5 sisters. She was half African American and half Native American
                    (Chicora-Siouan Indians). Her first marriage welcomed 5 children and her second union
                    welcomed an additional 6 children for a total of 11. Her 10th child and final daughter
                    is the mother of Shy Rogers, the founder and CEO of
                    the BERTIE Foundation. This charity organization is named in honor of Shy's grandmother
                    Bertie Geneva Rogers.
                  </p>
                </div>

                {/* Education and Community */}
                <div className="mb-6 md:mb-8">
                  <p className="text-gray-100 leading-relaxed text-base md:text-lg font-medium">
                    She attended the Georgetown and Williamsburg Counties school systems and was a member of
                    Bethel AME Church in Conway, SC. She was also a member of the Mystic Order of Golden Eagles.
                  </p>
                </div>

                {/* Career and Later Life */}
                <div className="mb-6 md:mb-8">
                  <p className="text-gray-100 leading-relaxed text-base md:text-lg font-medium">
                    Bertie retired as a food dietician from Conway Medical Center after 43 years of service.
                    Her hobbies included playing the card game Spades and watching her stories. She departed
                    this life on Saturday, September 17, 2016 at 88 years old. Bertie was able to enjoy 5
                    generations of family.
                  </p>
                </div>

                {/* Legacy */}
                <div>
                  <p className="text-gray-100 leading-relaxed text-base md:text-lg font-medium">
                    At the time of her passing, Bertie left to cherish fond and loving memories of 4 sisters,
                    8 sons, 3 daughters, 38 grandchildren, 57 great grandchildren, several great-great
                    grandchildren and a host of nieces, nephews, in-laws, other relatives and friends. It is
                    with great honor that we at the BERTIE Foundation work to remember Bertie's legacy through
                    the values and inspiration she spread during her life.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
