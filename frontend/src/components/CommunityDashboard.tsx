import React, { useEffect, useState, useCallback, useRef, useMemo, type FC } from "react";
import { motion, HTMLMotionProps, Variants } from "framer-motion";

type MotionDivProps = HTMLMotionProps<"div">;
type MotionButtonProps = HTMLMotionProps<"button">;
type MotionImageProps = HTMLMotionProps<"img">;
type MotionAnchorProps = HTMLMotionProps<"a">;
import { SearchAndFilter } from "./SearchAndFilter";
import { DonationSection } from "./DonationSection";
import { Users, Award, Clock, BookOpen, TrendingUp, DollarSign, Heart, Target, Star, ArrowUp, ArrowDown, Trophy } from "lucide-react";
import { trackEvent, ANALYTICS_EVENTS } from "../utils/analytics";
import { apiClient } from "app";

// Animation variants
const fadeInVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerVariants: Variants = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1 }
};

interface SuccessStory {
  id: string;
  title: string;
  story: string;
  program: string;
  impact: string;
  name: string;
  email: string;
  image_url?: string;
  tags: string[];
}

interface ProgramImpact {
  program_name: string;
  beneficiaries: number;
  success_rate: number;
  key_achievement: string;
}

interface CommunityStats {
  total_stories: number;
  total_volunteers: number;
  active_programs: number;
  total_hours: number;
  total_beneficiaries: number;
  avg_satisfaction: number;
  funds_raised: number;
  program_distribution: Record<string, number>;
  program_impacts: ProgramImpact[];
  recent_stories: SuccessStory[];
}

// Define metrics outside the component to avoid hook order issues
const metrics = [
  { 
    icon: Users,
    label: "Active Volunteers",
    value: (stats: CommunityStats) => stats.total_volunteers.toLocaleString(),
    trendKey: "volunteers_growth",
    trendLabel: "vs last month",
    detail: "Making positive change daily"
  },
  { 
    icon: Heart,
    label: "Lives Impacted",
    value: (stats: CommunityStats) => stats.total_beneficiaries.toLocaleString(),
    trendKey: "beneficiaries_growth",
    trendLabel: "vs last month",
    detail: "Direct community support"
  },
  { 
    icon: DollarSign,
    label: "Funds Raised",
    value: (stats: CommunityStats) => `$${stats.funds_raised.toLocaleString()}`,
    trendKey: "funds_growth",
    trendLabel: "vs last month",
    detail: "Supporting our programs"
  },
  { 
    icon: Star,
    label: "Satisfaction Rate",
    value: (stats: CommunityStats) => `${stats.avg_satisfaction}/5`,
    trendKey: "satisfaction_growth",
    trendLabel: "vs last month",
    detail: "Community feedback"
  },
  { 
    icon: Award,
    label: "Success Stories",
    value: (stats: CommunityStats) => stats.total_stories.toLocaleString(),
    detail: "Shared experiences"
  },
  { 
    icon: BookOpen,
    label: "Active Programs",
    value: (stats: CommunityStats) => stats.active_programs.toLocaleString(),
    detail: "Diverse initiatives"
  },
  { 
    icon: Clock,
    label: "Volunteer Hours",
    value: (stats: CommunityStats) => stats.total_hours.toLocaleString(),
    detail: "Dedicated service time"
  },
  { 
    icon: Target,
    label: "Success Rate",
    value: (stats: CommunityStats) => `${Math.round(stats.program_impacts.reduce((acc, curr) => acc + curr.success_rate, 0) / stats.program_impacts.length * 100)}%`,
    detail: "Program effectiveness"
  }
];

export const CommunityDashboard: FC = () => {
  // All hooks must be at the top level
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [sectionLoading, setSectionLoading] = useState({
    metrics: true,
    impacts: true,
    stories: true
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [trends, setTrends] = useState<Record<string, number>>({
    volunteers_growth: 15,
    beneficiaries_growth: 22,
    funds_growth: 18,
    satisfaction_growth: 5
  });

  // Refs
  const intervalRef = useRef<NodeJS.Timeout>();

  // Memoized values must be at the top level
  const availableTags = useMemo(() => {
    if (!stats?.recent_stories) return [];
    const tags = new Set<string>();
    stats.recent_stories.forEach(story => {
      story.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [stats?.recent_stories]);

  const availablePrograms = useMemo(() => {
    if (!stats?.program_distribution) return [];
    return Object.keys(stats.program_distribution);
  }, [stats?.program_distribution]);

  // Filtered stories memo
  const filteredStories = useMemo(() => {
    if (!stats?.recent_stories) return [];
    
    return stats.recent_stories.filter(story => {
      const matchesSearch = searchTerm === "" ||
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.story.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.impact.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTags = selectedTags.length === 0 ||
        selectedTags.every(tag => story.tags.includes(tag));

      const matchesProgram = selectedProgram === "" ||
        story.program === selectedProgram;

      return matchesSearch && matchesTags && matchesProgram;
    });
  }, [stats?.recent_stories, searchTerm, selectedTags, selectedProgram]);

  // Fetch stats callback
  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      setSectionLoading({ metrics: true, impacts: true, stories: true });

      const response = await apiClient.get_community_stats();
      const data = await response.json();

      // Simulate staggered loading for better UX
      setTimeout(() => setSectionLoading(prev => ({ ...prev, metrics: false })), 500);
      setTimeout(() => setSectionLoading(prev => ({ ...prev, impacts: false })), 1000);
      setTimeout(() => setSectionLoading(prev => ({ ...prev, stories: false })), 1500);

      setStats(data);
      setRetryCount(0);
    } catch (error) {
      console.error("Error fetching community stats:", error);
      setError("Failed to load community data. Please try again.");
      
      // Implement exponential backoff for retries
      if (retryCount < 3) {
        const timeout = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchStats();
        }, timeout);
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  const handleTagSelect = useCallback((tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
    trackEvent({
      event_type: ANALYTICS_EVENTS.USER_INTERACTION.BUTTON_CLICK,
      component: "community_dashboard",
      action: "tag_select",
      metadata: { tag }
    });
  }, []);

  const handleProgramSelect = useCallback((program: string) => {
    setSelectedProgram(program);
    trackEvent({
      event_type: ANALYTICS_EVENTS.USER_INTERACTION.BUTTON_CLICK,
      component: "community_dashboard",
      action: "program_select",
      metadata: { program }
    });
  }, []);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (term) {
      trackEvent({
        event_type: ANALYTICS_EVENTS.USER_INTERACTION.BUTTON_CLICK,
        component: "community_dashboard",
        action: "search_term",
        metadata: { term }
      });
    }
  }, []);

  const handleCTAClick = useCallback((action: string) => {
    trackEvent({
      event_type: ANALYTICS_EVENTS.USER_INTERACTION.BUTTON_CLICK,
      component: "community_dashboard",
      action: "cta_click",
      metadata: { action }
    });
  }, []);

  const handleMetricHover = useCallback((metricName: string) => {
    trackEvent({
      event_type: ANALYTICS_EVENTS.IMPACT.VIEW,
      component: "community_dashboard",
      action: "metric_hover",
      metadata: { metric: metricName }
    });
  }, []);

  const handleProgramClick = useCallback((programName: string) => {
    trackEvent({
      event_type: ANALYTICS_EVENTS.USER_INTERACTION.BUTTON_CLICK,
      component: "community_dashboard",
      action: "program_click",
      metadata: { program: programName }
    });
  }, []);

  const handleStoryClick = useCallback((storyTitle: string) => {
    trackEvent({
      event_type: ANALYTICS_EVENTS.TESTIMONIAL.VIEW,
      component: "community_dashboard",
      action: "story_click",
      metadata: { title: storyTitle }
    });
  }, []);

  // Function to animate number from 0 to target
  const animateValue = (start: number, end: number, duration: number, setValue: (value: number) => void) => {
    const startTime = Date.now();
    const update = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setValue(Math.floor(progress * (end - start) + start));

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    requestAnimationFrame(update);
  };

  // Real-time updates simulation with smooth transitions
  useEffect(() => {
    if (!stats) return;

    const updateInterval = 8000; // Longer interval for less frequent updates
    const animationDuration = 2000; // Duration for smooth number transitions

    intervalRef.current = setInterval(() => {
      const newStats = {
        total_volunteers: stats.total_volunteers + Math.floor(Math.random() * 2 + 1),
        total_beneficiaries: stats.total_beneficiaries + Math.floor(Math.random() * 3 + 2),
        funds_raised: stats.funds_raised + Math.floor(Math.random() * 50 + 50),
        total_hours: stats.total_hours + Math.floor(Math.random() * 5 + 5)
      };

      // Animate each metric smoothly
      Object.entries(newStats).forEach(([key, value]) => {
        animateValue(
          stats[key as keyof typeof newStats],
          value,
          animationDuration,
          (newValue) => {
            setStats(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                [key]: newValue
              };
            });
          }
        );
      });

      // Update the actual stats after animation
      setTimeout(() => {
        setStats(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            ...newStats
          };
        });
      }, animationDuration);
    }, updateInterval);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [stats]);

  // Track initial view and fetch stats
  useEffect(() => {
    trackEvent({
      event_type: ANALYTICS_EVENTS.NAVIGATION.PAGE_VIEW,
      component: "community_dashboard",
      action: "initial_load",
      metadata: {}
    });
    fetchStats();
  }, [fetchStats]);

  // Error UI
  if (error) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-48 space-y-4"
        initial="hidden"
        animate="visible"
        variants={fadeInVariants}
      >
        <div className="text-red-400 text-lg font-medium">{error}</div>
        <motion.button
          className="px-6 py-2 bg-primary-500 text-white rounded-lg font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setRetryCount(0);
            fetchStats();
          }}
        >
          Retry
        </motion.button>
      </motion.div>
    );
  }

  // Initial loading state
  if (loading && !stats) {
    return (
      <motion.div
        className="flex justify-center items-center h-48"
        initial="hidden"
        animate="visible"
        variants={fadeInVariants}
      >
        <motion.div 
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-400"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    );
  }

  // Skeleton loading components
  const MetricSkeleton = () => (
    <div className="bg-secondary-800/50 backdrop-blur p-6 rounded-xl shadow-lg animate-pulse">
      <div className="flex items-center justify-center mb-4">
        <div className="w-8 h-8 bg-primary-400/20 rounded-full" />
      </div>
      <div className="space-y-3">
        <div className="h-6 bg-primary-400/20 rounded w-24 mx-auto" />
        <div className="h-4 bg-primary-400/20 rounded w-32 mx-auto" />
        <div className="h-3 bg-primary-400/20 rounded w-28 mx-auto" />
      </div>
    </div>
  );

  const ImpactSkeleton = () => (
    <div className="bg-secondary-700/50 p-4 rounded-lg animate-pulse">
      <div className="h-6 bg-primary-400/20 rounded w-3/4 mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-primary-400/20 rounded w-full" />
        <div className="h-4 bg-primary-400/20 rounded w-2/3" />
        <div className="h-4 bg-primary-400/20 rounded w-5/6" />
      </div>
    </div>
  );

  const StorySkeleton = () => (
    <div className="bg-secondary-800/50 backdrop-blur p-6 rounded-xl shadow-lg animate-pulse">
      <div className="h-48 bg-primary-400/20 rounded-lg mb-4" />
      <div className="space-y-3">
        <div className="h-6 bg-primary-400/20 rounded w-3/4" />
        <div className="h-4 bg-primary-400/20 rounded w-full" />
        <div className="h-4 bg-primary-400/20 rounded w-5/6" />
        <div className="flex gap-2">
          <div className="h-6 bg-primary-400/20 rounded w-16" />
          <div className="h-6 bg-primary-400/20 rounded w-16" />
        </div>
      </div>
    </div>
  );

  if (!stats) return null;

  // Define render functions after all hooks and callbacks
  const renderMetricsGrid = () => {
    if (!stats) return null;
    if (sectionLoading.metrics) {
      return Array(8).fill(0).map((_, index) => (
        <MetricSkeleton key={index} />
      ));
    }

    return metrics.map((metric, index) => {
      const Icon = metric.icon;
      return (
        <motion.div
          key={index}
          className="bg-secondary-800/50 backdrop-blur p-6 rounded-xl shadow-lg"
          variants={scaleVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3, delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          onHoverStart={() => handleMetricHover(metric.label)}
          role="article"
          aria-label={`${metric.label} metric`}
        >
          <div className="flex items-center justify-center mb-4">
            <Icon className="text-primary-400" size={32} aria-hidden="true" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">{metric.value(stats)}</div>
            <div className="text-gray-400 font-medium mb-1">{metric.label}</div>
            {metric.trendKey && trends[metric.trendKey] !== undefined && (
              <div 
                className={`text-sm flex items-center justify-center gap-1 mb-2
                            ${trends[metric.trendKey] > 0 ? 'text-green-400' : 'text-red-400'}`}
                role="status"
                aria-label={`${trends[metric.trendKey] > 0 ? 'Increased' : 'Decreased'} by ${Math.abs(trends[metric.trendKey])}% ${metric.trendLabel}`}
              >
                {trends[metric.trendKey] > 0 ? (
                  <ArrowUp className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <ArrowDown className="w-4 h-4" aria-hidden="true" />
                )}
                <span>{Math.abs(trends[metric.trendKey])}%</span>
                <span className="text-gray-500 ml-1">{metric.trendLabel}</span>
              </div>
            )}
            <div className="text-sm text-gray-500">{metric.detail}</div>
          </div>
        </motion.div>
      );
    });
  };

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <motion.div
        className="text-center space-y-8 mb-12 relative py-16"
        initial="hidden"
        animate="visible"
        variants={fadeInVariants}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-secondary-800 to-primary-500/20 blur-3xl -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        <div className="flex justify-center mb-8">
          <motion.img
            src="/images/community-donation.png"
            alt="Bertie Foundation"
            className="h-24 w-auto"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
          Become a <span className="text-primary-400">Hero</span> Today
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
          Join our vibrant community of changemakers where every volunteer, donor, and supporter plays a vital role in creating lasting impact. Together, we're building stronger communities, empowering individuals, and fostering positive change that resonates for generations to come.
        </p>
        <div className="flex justify-center gap-8 mt-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-16 h-16 mx-auto mb-2 bg-primary-500/20 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-primary-400" />
            </div>
            <div className="text-sm text-gray-400">Support</div>
          </motion.div>
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-16 h-16 mx-auto mb-2 bg-primary-500/20 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-primary-400" />
            </div>
            <div className="text-sm text-gray-400">Community</div>
          </motion.div>
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="w-16 h-16 mx-auto mb-2 bg-primary-500/20 rounded-full flex items-center justify-center">
              <Target className="w-8 h-8 text-primary-400" />
            </div>
            <div className="text-sm text-gray-400">Impact</div>
          </motion.div>
        </div>
        <motion.div
          className="flex justify-center gap-4 mt-8"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          <motion.a
            href="#volunteer"
            onClick={() => handleCTAClick("volunteer")}
            className="px-8 py-4 bg-primary-500 text-white rounded-lg font-medium text-lg hover:bg-primary-600 transition-all duration-200 shadow-lg shadow-primary-500/20"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Become a Volunteer
          </motion.a>
          <motion.a
            href="#programs"
            onClick={() => handleCTAClick("programs")}
            className="px-8 py-4 bg-secondary-700 text-white rounded-lg font-medium text-lg hover:bg-secondary-600 transition-all duration-200 shadow-lg shadow-secondary-700/20"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore Programs
          </motion.a>
        </motion.div>
      </motion.div>
      {/* Search and Filters */}
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        selectedTags={selectedTags}
        onTagSelect={handleTagSelect}
        selectedProgram={selectedProgram}
        onProgramSelect={handleProgramSelect}
        availableTags={availableTags}
        availablePrograms={availablePrograms}
      />
      {/* Metrics Grid */}
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        role="region"
        aria-label="Community Metrics"
      >
        {renderMetricsGrid()}
      </div>

      {/* Program Impacts */}
      <div className="bg-secondary-800/50 backdrop-blur p-6 rounded-xl shadow-lg mb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Target className="text-primary-400" />
            <h3 className="text-xl font-semibold text-white">Program Impacts & Achievements</h3>
          </div>
          <motion.button
            className="px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg font-medium hover:bg-primary-500/30 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              trackEvent({
                event_type: ANALYTICS_EVENTS.USER_INTERACTION.BUTTON_CLICK,
                component: "community_dashboard",
                action: "view_all_impacts",
                metadata: {}
              });
            }}
          >
            View All Impacts
          </motion.button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Program Impact Cards */}
          {stats.program_impacts.map((impact, index) => (
            <div
              key={index}
              className="bg-secondary-700/50 p-4 rounded-lg transform hover:scale-105 transition-all duration-300"
            >
              <h4 className="text-lg font-semibold text-white mb-3">{impact.program_name}</h4>
              <div className="space-y-2 relative">
                <div className="absolute -top-2 -right-2 bg-primary-500/20 text-primary-400 px-2 py-1 rounded-full text-xs font-medium">
                  Updated
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Beneficiaries</span>
                  <span className="text-primary-400">{impact.beneficiaries.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Success Rate</span>
                  <span className="text-primary-400">{Math.round(impact.success_rate * 100)}%</span>
                </div>
                <div className="mt-3 text-sm text-yellow-400 font-medium">
                  {impact.key_achievement}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Impact Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Key Achievements */}
          <div className="bg-secondary-700/30 p-6 rounded-lg col-span-1">
            <h4 className="text-lg font-semibold text-white mb-4">Key Achievements</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary-500/20 rounded-lg">
                  <Trophy className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <div className="font-medium text-white">Education Initiative</div>
                  <p className="text-sm text-gray-400">Improved graduation rates by 35% through mentoring programs</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary-500/20 rounded-lg">
                  <Heart className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <div className="font-medium text-white">Community Support</div>
                  <p className="text-sm text-gray-400">Provided 50,000+ meals to families in need</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <div className="font-medium text-white">Youth Development</div>
                  <p className="text-sm text-gray-400">200+ youth placed in career development programs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Growth */}
          <div className="bg-secondary-700/30 p-6 rounded-lg col-span-1">
            <h4 className="text-lg font-semibold text-white mb-4">Impact Growth</h4>
            <div className="space-y-4">
              {Object.entries(trends).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 capitalize">{key.replace(/_/g, " ")}</span>
                    <span className="text-primary-400">+{value}%</span>
                  </div>
                  <div className="h-2 bg-secondary-600 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Goals */}
          <div className="bg-secondary-700/30 p-6 rounded-lg col-span-1">
            <h4 className="text-lg font-semibold text-white mb-4">Monthly Goals</h4>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Volunteer Hours</span>
                  <span className="text-primary-400">85% Complete</span>
                </div>
                <div className="h-2 bg-secondary-600 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary-400"
                    initial={{ width: 0 }}
                    animate={{ width: "85%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Target: 5,000 hours</p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">New Volunteers</span>
                  <span className="text-primary-400">92% Complete</span>
                </div>
                <div className="h-2 bg-secondary-600 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary-400"
                    initial={{ width: 0 }}
                    animate={{ width: "92%" }}
                    transition={{ duration: 1, delay: 0.6 }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Target: 100 new volunteers</p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Fundraising</span>
                  <span className="text-primary-400">78% Complete</span>
                </div>
                <div className="h-2 bg-secondary-600 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary-400"
                    initial={{ width: 0 }}
                    animate={{ width: "78%" }}
                    transition={{ duration: 1, delay: 0.7 }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Target: $50,000</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Donation Section */}
      <DonationSection />

      {/* Program Distribution */}
      <div className="bg-secondary-800/50 backdrop-blur p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="text-primary-400" />
          Program Impact Distribution
        </h3>
        <div className="space-y-4">
          {Object.entries(stats.program_distribution).map(([program, count]) => (
            <div key={program} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300 capitalize">
                  {program.replace(/-/g, " ")}
                </span>
                <span className="text-primary-400">{count} stories</span>
              </div>
              <div className="h-2 bg-secondary-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-400 transition-all duration-500"
                  style={{
                    width: `${(count / Math.max(...Object.values(stats.program_distribution))) * 100}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Success Stories */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-white mb-6">Recent Success Stories</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story, index) => (
            <div
              key={index}
              className="bg-secondary-800/50 backdrop-blur p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              {story.image_url && (
                <img
                  src={story.image_url}
                  alt={story.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <h4 className="text-lg font-semibold text-white mb-2">{story.title}</h4>
              <p className="text-gray-400 text-sm mb-4 line-clamp-3">{story.story}</p>
              <div className="space-y-2">
                <div className="text-primary-400 font-medium">{story.name}</div>
                <div className="text-sm text-gray-500 capitalize">{story.program.replace(/-/g, " ")}</div>
                <div className="text-sm text-primary-300">{story.impact}</div>
                {story.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {story.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded-md text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
