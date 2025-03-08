"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Send, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Map from "@/components/features/Contact/Map";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(formData);
      setSubmitSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rugby-teal/5 dark:from-gray-900 dark:to-rugby-teal/10">
      {/* Hero Section */}
      <div className="relative py-24 overflow-hidden bg-cover bg-center" style={{ backgroundImage: 'url("/fnx banner png.png")' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-rugby-teal/80 to-rugby-teal-dark/80"></div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-10"></div>
        <div className="relative container-width mx-auto text-center z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in-up">
            {contactTranslations[language].getInTouch}
          </h1>
          <div className="w-20 h-1 bg-white mx-auto mt-6 mb-4 animate-fade-in"></div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-width py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-8 animate-fade-in-left">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border-l-4 border-rugby-teal transition-all duration-300 hover:shadow-xl">
              <h3 className="text-2xl font-semibold mb-6 text-rugby-teal border-b border-rugby-teal/20 pb-3">
                {contactTranslations[language].contactInfo}
              </h3>
              <div className="space-y-8">
                <div className="flex items-start space-x-5 group">
                  <div className="flex-shrink-0 p-3 bg-rugby-teal/10 rounded-full group-hover:bg-rugby-teal/20 transition-all duration-300">
                    <Phone className="w-6 h-6 text-rugby-teal" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-rugby-teal text-lg">
                      {contactTranslations[language].phone}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 group-hover:text-rugby-teal transition-colors duration-300">
                      +371 29113938
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-5 group">
                  <div className="flex-shrink-0 p-3 bg-rugby-teal/10 rounded-full group-hover:bg-rugby-teal/20 transition-all duration-300">
                    <Mail className="w-6 h-6 text-rugby-teal" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-rugby-teal text-lg">
                      {contactTranslations[language].email}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 group-hover:text-rugby-teal transition-colors duration-300">
                      rkfenikss@gmail.com
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-5 group">
                  <div className="flex-shrink-0 p-3 bg-rugby-teal/10 rounded-full group-hover:bg-rugby-teal/20 transition-all duration-300">
                    <MapPin className="w-6 h-6 text-rugby-teal" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-rugby-teal text-lg">
                      {contactTranslations[language].location}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 group-hover:text-rugby-teal transition-colors duration-300">
                      Kaimiņi, Brenguļi, Brenguļu pagasts, Valmieras novads, LV-4245
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border-l-4 border-rugby-teal transition-all duration-300 hover:shadow-xl">
              <h3 className="text-2xl font-semibold mb-6 text-rugby-teal border-b border-rugby-teal/20 pb-3">
                {contactTranslations[language].trainingGround}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {contactTranslations[language].trainingGroundDesc}
              </p>
              <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                <Map center={{ lat: 57.54624299315826, lng: 25.546570490001447 }} zoom={14} />
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border-l-4 border-rugby-teal transition-all duration-300 hover:shadow-xl animate-fade-in-right">
            <h3 className="text-2xl font-semibold mb-6 text-rugby-teal border-b border-rugby-teal/20 pb-3">
              {contactTranslations[language].sendMessage}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2 text-rugby-teal group-focus-within:text-rugby-teal-dark transition-colors duration-300"
                >
                  {contactTranslations[language].yourName}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-md border border-rugby-teal/20 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-rugby-teal focus:border-rugby-teal transition-all duration-300"
                  required
                />
              </div>
              <div className="group">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2 text-rugby-teal group-focus-within:text-rugby-teal-dark transition-colors duration-300"
                >
                  {contactTranslations[language].emailAddress}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-md border border-rugby-teal/20 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-rugby-teal focus:border-rugby-teal transition-all duration-300"
                  required
                />
              </div>
              <div className="group">
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium mb-2 text-rugby-teal group-focus-within:text-rugby-teal-dark transition-colors duration-300"
                >
                  {contactTranslations[language].subject}
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-md border border-rugby-teal/20 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-rugby-teal focus:border-rugby-teal transition-all duration-300"
                  required
                />
              </div>
              <div className="group">
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-2 text-rugby-teal group-focus-within:text-rugby-teal-dark transition-colors duration-300"
                >
                  {contactTranslations[language].message}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 rounded-md border border-rugby-teal/20 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-rugby-teal focus:border-rugby-teal transition-all duration-300"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rugby-teal to-rugby-teal-dark hover:from-rugby-teal-dark hover:to-rugby-teal text-white font-semibold py-3 px-6 rounded-md transition-all duration-300 relative overflow-hidden ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                } ${
                  submitSuccess ? "bg-green-500" : ""
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : submitSuccess ? (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Message Sent!
                  </div>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {contactTranslations[language].send}
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300 opacity-0 group-hover:opacity-100" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
