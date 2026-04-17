import { create } from 'zustand';
import { Program, Opportunity, Resource } from './types';

interface StoreState {
  programs: Program[];
  opportunities: Opportunity[];
  resources: Resource[];
  setPrograms: (programs: Program[]) => void;
  setOpportunities: (opportunities: Opportunity[]) => void;
  setResources: (resources: Resource[]) => void;
}

export const useStore = create<StoreState>((set) => ({
  programs: [
    {
      id: '1',
      title: 'Youth Mentorship Program',
      description: 'Guide and inspire the next generation through one-on-one mentoring.',
      image: 'https://images.unsplash.com/photo-1571624436279-b272aff752b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      impact: 'Impacted 500+ youth in 2023',
      category: 'Education'
    },
    {
      id: '2',
      title: 'Community Garden Initiative',
      description: 'Help grow and maintain community gardens that provide fresh produce to local food banks.',
      image: 'https://images.unsplash.com/photo-15822137821ca-e0d53f98f2ca?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      impact: 'Donated 2,000 lbs of produce in 2023',
      category: 'Environment'
    },
    {
      id: '3',
      title: 'Elderly Care',
      description: 'Provide companionship and support to the elderly in our community.',
      image: 'https://images.unsplash.com/photo-1518507641759-5093984b3899?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      impact: 'Visited 100+ elderly in 2023',
      category: 'Social'
    },
    {
      id: '4',
      title: 'Education Support',
      description: 'Help students with their homework and provide tutoring in various subjects.',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      impact: 'Improved grades of 50+ students in 2023',
      category: 'Education'
    },
    {
      id: '5',
      title: 'Skills and Development',
      description: 'Help youth develop new skills to prepare them for the future.',
      image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      impact: 'Trained 100+ youth in 2023',
      category: 'Social'
    }
  ],
  opportunities: [
    {
      id: '1',
      title: 'Weekend Mentor',
      description: 'Spend 2-3 hours every weekend mentoring a youth in academic and life skills.',
      date: '2024-02-15',
      location: 'Various Locations',
      skills: ['Communication', 'Patience', 'Teaching'],
      commitment: '3 months minimum'
    },
    {
      id: '2',
      title: 'Garden Coordinator',
      description: 'Lead a team of volunteers in maintaining our community gardens.',
      date: '2024-02-20',
      location: 'Community Gardens',
      skills: ['Gardening', 'Leadership', 'Organization'],
      commitment: '6 months preferred'
    },
  ],
  resources: [
    {
      id: '1',
      title: 'Volunteer Handbook',
      description: 'Essential guide for new volunteers with policies and procedures.',
      category: 'Guides',
      link: '#'
    },
    {
      id: '2',
      title: 'Impact Report 2023',
      description: 'Annual report showcasing our community impact and achievements.',
      category: 'Reports',
      link: '#'
    },
  ],
  setPrograms: (programs) => set({ programs }),
  setOpportunities: (opportunities) => set({ opportunities }),
  setResources: (resources) => set({ resources }),
}));
