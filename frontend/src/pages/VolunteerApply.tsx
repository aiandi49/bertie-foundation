import { motion } from "framer-motion";
import { Layout } from "../components/Layout";
import { Heart, CheckCircle } from "lucide-react";
import { Button } from "../components/Button";
import { useState } from "react";
import { formService } from "../utils/formService";
import { trackEvent } from "../utils/analytics";

const INTEREST_OPTIONS = [
  "Youth Mentoring",
  "Community Events",
  "Fundraising",
  "Administrative Support",
  "Outreach & Advocacy",
  "Photography / Media",
];

const AVAILABILITY_OPTIONS = [
  "Weekday mornings",
  "Weekday evenings",
  "Weekends",
  "Flexible / On-call",
];

export default function VolunteerApply() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    availability: "",
    message: "",
  });
  const [interests, setInterests] = useState<string[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await formService.submitVolunteer({
        name: formData.name,
        email: formData.email,
        skills: [],
        interests,
        availability: formData.availability,
        message: formData.message,
      });

      trackEvent({ event_type: "volunteer_form", component: "VolunteerApply", action: "submit_success" });
      setSuccess(true);
      setFormData({ name: "", email: "", availability: "", message: "" });
      setInterests([]);
    } catch (err) {
      console.error("Error submitting volunteer application:", err);
      setError("There was an error submitting your application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="bg-white">
      <section className="relative bg-gradient-to-br from-primary-900 via-secondary-900 to-primary-800 py-24 px-4 overflow-hidden">
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-600/20 mb-4">
              <Heart className="w-7 h-7 text-primary-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Become a <span className="text-primary-400">Volunteer</span>
            </h1>
            <p className="text-gray-300 leading-relaxed">
              Tell us a bit about yourself and how you'd like to get involved. Our team reviews
              every application and will follow up within a few days.
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto bg-secondary-900/50 backdrop-blur-sm p-6 md:p-8 rounded-xl shadow-lg">
            {success ? (
              <motion.div
                className="p-8 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <CheckCircle className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Application Received!</h3>
                <p className="text-gray-300 mb-6">
                  Thank you for wanting to volunteer with us. We'll be in touch soon.
                </p>
                <Button onClick={() => setSuccess(false)} className="mt-4">
                  Submit Another Application
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 rounded-lg bg-primary-900 border border-secondary-700 text-white focus:outline-none focus:border-primary-500 transition-colors shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 rounded-lg bg-primary-900 border border-secondary-700 text-white focus:outline-none focus:border-primary-500 transition-colors shadow-sm"
                    required
                  />
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-300 mb-2">
                    What are you interested in? (select all that apply)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {INTEREST_OPTIONS.map((interest) => (
                      <label
                        key={interest}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-900 border border-secondary-700 text-gray-200 text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={interests.includes(interest)}
                          onChange={() => toggleInterest(interest)}
                          className="rounded border-secondary-600"
                        />
                        {interest}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="availability" className="block text-sm font-medium text-gray-300">
                    Availability
                  </label>
                  <select
                    id="availability"
                    name="availability"
                    required
                    value={formData.availability}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 rounded-lg bg-primary-900 border border-secondary-700 text-white focus:outline-none focus:border-primary-500 transition-colors appearance-none"
                  >
                    <option value="" disabled>
                      Select your availability
                    </option>
                    {AVAILABILITY_OPTIONS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300">
                    Anything else you'd like us to know?
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 rounded-lg bg-primary-900 border border-secondary-700 text-white focus:outline-none focus:border-primary-500 transition-colors"
                  ></textarea>
                </div>

                {error && <div className="text-red-400 text-sm">{error}</div>}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
