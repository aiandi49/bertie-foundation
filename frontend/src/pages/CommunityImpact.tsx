import React from "react";
import { Layout } from "../components/Layout";
import { CommunityDashboard } from "../components/CommunityDashboard";

export default function CommunityImpact() {
  return (
    <Layout>
      {/* Community Dashboard Section */}
      <section className="bg-secondary-950 py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(147,51,234,0.1),transparent)] opacity-70" />
        <div className="container mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-12 text-center">
            Our Community Impact
          </h2>
          <CommunityDashboard />
        </div>
      </section>
    </Layout>
  );
}
