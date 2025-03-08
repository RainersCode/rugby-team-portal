"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext"

const contactTranslations = {
  en: {
    getInTouch: "Get in Touch",
    contactInfo: "Contact Information",
    phone: "Phone",
    email: "Email",
    location: "Location",
    trainingGround: "Training Ground",
    trainingGroundDesc: "Visit us during training hours to learn more about our club and watch the team in action.",
    sendMessage: "Send us a Message",
    yourName: "Your Name",
    emailAddress: "Email Address",
    subject: "Subject",
    message: "Message",
    send: "Send Message"
  },
  lv: {
    getInTouch: "Sazinies ar Mums",
    contactInfo: "Kontaktinformācija",
    phone: "Tālrunis",
    email: "E-pasts",
    location: "Atrašanās vieta",
    trainingGround: "Treniņu Laukums",
    trainingGroundDesc: "Apmeklē mūs treniņu laikā, lai uzzinātu vairāk par mūsu klubu un vērotu komandu darbībā.",
    sendMessage: "Sūti mums Ziņu",
    yourName: "Tavs Vārds",
    emailAddress: "E-pasta Adrese",
    subject: "Temats",
    message: "Ziņa",
    send: "Sūtīt Ziņu"
  }
};

export default function ContactPage() {
  const { language } = useLanguage();
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
    <div className="min-h-screen bg-gradient-to-b from-white to-rugby-teal/5 dark:from-gray-900 dark:to-rugby-teal/10">
      {/* Hero Section */}
      <div className="relative py-20 overflow-hidden bg-cover bg-center" style={{ backgroundImage: 'url("/fnx banner png.png")' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-rugby-teal/80 to-rugby-teal-dark/80"></div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-10"></div>
        <div className="relative container-width mx-auto text-center z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {contactTranslations[language].getInTouch}
          </h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-width py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-rugby-teal/20 to-rugby-teal/30 p-6 rounded-none shadow-md backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-6 text-rugby-teal border-b border-white/20 pb-2">
                {contactTranslations[language].contactInfo}
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Phone className="w-6 h-6 text-rugby-teal" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-rugby-teal">
                      {contactTranslations[language].phone}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      +371 29113938
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Mail className="w-6 h-6 text-rugby-teal" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-rugby-teal">
                      {contactTranslations[language].email}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      rkfenikss@gmail.com
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <MapPin className="w-6 h-6 text-rugby-teal" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-rugby-teal">
                      {contactTranslations[language].location}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      "Lukstiņi", Bērzaines pagasts, Valmieras novads, LV-4208
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map or Additional Info */}
            <div className="bg-gradient-to-br from-rugby-teal/20 to-rugby-teal/30 p-6 rounded-none shadow-md backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-6 text-rugby-teal border-b border-white/20 pb-2">
                {contactTranslations[language].trainingGround}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {contactTranslations[language].trainingGroundDesc}
              </p>
              <div className="aspect-video bg-white/50 dark:bg-gray-800/50 rounded-none">
                {/* Add map or image here */}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gradient-to-br from-rugby-teal/20 to-rugby-teal/30 p-6 rounded-none shadow-md backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-6 text-rugby-teal border-b border-white/20 pb-2">
              {contactTranslations[language].sendMessage}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2 text-rugby-teal"
                >
                  {contactTranslations[language].yourName}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-none border border-rugby-teal/20 bg-white/80 dark:bg-gray-800/80 focus:ring-1 focus:ring-rugby-teal focus:border-rugby-teal"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2 text-rugby-teal"
                >
                  {contactTranslations[language].emailAddress}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-none border border-rugby-teal/20 bg-white/80 dark:bg-gray-800/80 focus:ring-1 focus:ring-rugby-teal focus:border-rugby-teal"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium mb-2 text-rugby-teal"
                >
                  {contactTranslations[language].subject}
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-none border border-rugby-teal/20 bg-white/80 dark:bg-gray-800/80 focus:ring-1 focus:ring-rugby-teal focus:border-rugby-teal"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-2 text-rugby-teal"
                >
                  {contactTranslations[language].message}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 rounded-none border border-rugby-teal/20 bg-white/80 dark:bg-gray-800/80 focus:ring-1 focus:ring-rugby-teal focus:border-rugby-teal"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rugby-teal to-rugby-teal-dark hover:from-rugby-teal-dark hover:to-rugby-teal text-white font-semibold py-3 px-6 rounded-none transition-all duration-300"
              >
                <Send className="w-5 h-5" />
                {contactTranslations[language].send}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
