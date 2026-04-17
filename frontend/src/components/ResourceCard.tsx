import React from 'react';
import { Resource } from '../utils/types';
import { getCategoryColor } from '../utils/utils';

interface Props {
  resource: Resource;
}

export function ResourceCard({ resource }: Props) {
  return (
    <div className="bg-secondary-800 rounded-lg p-6 shadow-lg transition-transform hover:scale-105">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-display font-bold text-white">{resource.title}</h3>
        <span className={`${getCategoryColor(resource.category)} text-white text-sm px-3 py-1 rounded-full`}>
          {resource.category}
        </span>
      </div>
      <p className="text-gray-300 mb-6">{resource.description}</p>
      <a
        href={resource.link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
      >
        Access Resource
      </a>
    </div>
  );
}