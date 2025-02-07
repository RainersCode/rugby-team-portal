"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative py-20 bg-rugby-teal overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute transform rotate-45 left-1/4 top-1/4">
            <div className="w-96 h-96 rounded-full bg-rugby-yellow"></div>
          </div>
        </div>
        <div className="relative container-width mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Have questions about joining our rugby club? We'd love to hear from
            you. Reach out to us and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-width py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-card rounded-2xl p-8 shadow-lg border border-rugby-teal/20">
              <h2 className="text-2xl font-bold mb-6 text-rugby-teal">
                Contact Information
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Phone className="w-6 h-6 text-rugby-teal" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-rugby-teal/90">
                      Phone
                    </h3>
                    <p className="text-muted-foreground">
                      +1 (555) 123-4567
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Mail className="w-6 h-6 text-rugby-red" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-rugby-teal/90">
                      Email
                    </h3>
                    <p className="text-muted-foreground">
                      info@rugbyteam.com
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <MapPin className="w-6 h-6 text-rugby-yellow" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-rugby-teal/90">
                      Location
                    </h3>
                    <p className="text-muted-foreground">
                      123 Rugby Street, Sports City, SC 12345
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map or Additional Info */}
            <div className="bg-card rounded-2xl p-8 shadow-lg border border-rugby-teal/20">
              <h2 className="text-2xl font-bold mb-6 text-rugby-teal">
                Training Ground
              </h2>
              <p className="text-muted-foreground mb-4">
                Visit us during training hours to learn more about our club and watch the team in action.
              </p>
              <div className="aspect-video bg-muted rounded-lg">
                {/* Add map or image here */}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-rugby-teal/20">
            <h2 className="text-2xl font-bold mb-6 text-rugby-teal">
              Send us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2 text-rugby-teal/90"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-rugby-teal/20 bg-background focus:ring-2 focus:ring-rugby-teal focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2 text-rugby-teal/90"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-rugby-teal/20 bg-background focus:ring-2 focus:ring-rugby-teal focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium mb-2 text-rugby-teal/90"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-rugby-teal/20 bg-background focus:ring-2 focus:ring-rugby-teal focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-2 text-rugby-teal/90"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-rugby-teal/20 bg-background focus:ring-2 focus:ring-rugby-teal focus:border-transparent"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-rugby-teal hover:bg-rugby-teal/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                <Send className="w-5 h-5" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
