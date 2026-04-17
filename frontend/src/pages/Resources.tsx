import React from 'react';
import { useStore } from '../utils/store';
import { ResourceCard } from '../components/ResourceCard';
import { Layout } from '../components/Layout';

export default function Resources() {
  const { resources } = useStore();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-white mb-4">Resources</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Access helpful guides, reports, and materials to support your volunteer journey.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </div>
    </Layout>
  );
}