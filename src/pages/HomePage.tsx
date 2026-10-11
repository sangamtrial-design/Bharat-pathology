import React, { useState } from 'react';
import { Hero } from '../components/Hero';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { Services } from '../components/Services';
import { HomeCollection } from '../components/HomeCollection';
import { HealthPackages } from '../components/HealthPackages';
import { TestCatalogue } from '../components/TestCatalogue';
import { ServiceAreas } from '../components/ServiceAreas';
import { OurLab } from '../components/OurLab';
import { BeforeTest } from '../components/BeforeTest';
import { PatientFeedback } from '../components/PatientFeedback';
import { Credentials } from '../components/Credentials';
import { FAQ } from '../components/FAQ';
import { PatientReports } from '../components/PatientReports';
import { BookingForm } from '../components/BookingForm';

export const HomePage: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<string>('');

  const handleSelectPackage = (packageDropdownValue: string) => {
    setSelectedPackage(packageDropdownValue);
  };

  return (
    <main id="main-content" tabIndex={-1} className="focus:outline-none">
      {/* 1. Hero with verified local imagery */}
      <Hero />

      {/* 2. Why Choose Us: 4 verifiable facts strip */}
      <WhyChooseUs />

      {/* 3. Services */}
      <Services />

      {/* 4. Home Collection overview */}
      <HomeCollection />

      {/* 5. Health Packages & comparison table */}
      <HealthPackages onSelectPackage={handleSelectPackage} />

      {/* 6. Comprehensive Test Catalogue (searchable & filterable) */}
      <TestCatalogue onSelectTest={handleSelectPackage} />

      {/* 7. Service Areas for Home Collection */}
      <ServiceAreas />

      {/* 8. Our Lab photos and equipment setup */}
      <OurLab />

      {/* 9. Before your test preparation guidelines */}
      <BeforeTest />

      {/* 10. Patient feedback: links directly to verified Google reviews */}
      <PatientFeedback />

      {/* 11. Lab information & credentials trust card (hidden if all empty) */}
      <Credentials />

      {/* 12. Frequently Asked Questions */}
      <FAQ />

      {/* 13. Reports: direct verified WhatsApp or printed counter delivery */}
      <PatientReports />

      {/* 14. Booking Request Form */}
      <BookingForm selectedPackageDropdown={selectedPackage} />
    </main>
  );
};
