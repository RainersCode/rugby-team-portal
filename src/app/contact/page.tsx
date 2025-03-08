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
    <div className="min-h-screen bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative py-20 overflow-hidden bg-cover bg-center" style={{ backgroundImage: 'url("/fnx banner png.png")' }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative container-width mx-auto text-center">
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
            <div className="bg-card rounded-none p-8 shadow-lg border border-rugby-teal/20">
              <h2 className="text-2xl font-bold mb-6 text-rugby-teal">
                {contactTranslations[language].contactInfo}
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Phone className="w-6 h-6 text-rugby-teal" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-rugby-teal/90">
                      {contactTranslations[language].phone}
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
                      {contactTranslations[language].email}
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
                      {contactTranslations[language].location}
                    </h3>
                    <p className="text-muted-foreground">
                      123 Rugby Street, Sports City, SC 12345
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map or Additional Info */}
            <div className="bg-card rounded-none p-8 shadow-lg border border-rugby-teal/20">
              <h2 className="text-2xl font-bold mb-6 text-rugby-teal">
                {contactTranslations[language].trainingGround}
              </h2>
              <p className="text-muted-foreground mb-4">
                {contactTranslations[language].trainingGroundDesc}
              </p>
              <div className="aspect-video bg-muted rounded-none">
                {/* Add map or image here */}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card rounded-none p-8 shadow-lg border border-rugby-teal/20">
            <h2 className="text-2xl font-bold mb-6 text-rugby-teal">
              {contactTranslations[language].sendMessage}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2 text-rugby-teal/90"
                >
                  {contactTranslations[language].yourName}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-none border border-rugby-teal/20 bg-background focus:ring-2 focus:ring-rugby-teal focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2 text-rugby-teal/90"
                >
                  {contactTranslations[language].emailAddress}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-none border border-rugby-teal/20 bg-background focus:ring-2 focus:ring-rugby-teal focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium mb-2 text-rugby-teal/90"
                >
                  {contactTranslations[language].subject}
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-none border border-rugby-teal/20 bg-background focus:ring-2 focus:ring-rugby-teal focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-2 text-rugby-teal/90"
                >
                  {contactTranslations[language].message}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 rounded-none border border-rugby-teal/20 bg-background focus:ring-2 focus:ring-rugby-teal focus:border-transparent"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-rugby-teal hover:bg-rugby-teal/90 text-white font-semibold py-3 px-6 rounded-none transition-colors"
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
