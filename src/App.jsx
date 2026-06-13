import React from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';

// Import views
import { LoginScreen } from './views/LoginScreen';
import { Dashboard } from './views/Dashboard';
import { SummaryView } from './views/SummaryView';
import { MedicationsView } from './views/MedicationsView';
import { DiseasesView } from './views/DiseasesView';
import { SurgeriesView } from './views/SurgeriesView';
import { ReportsView } from './views/ReportsView';
import { DocumentsView } from './views/DocumentsView';
import { InsuranceView } from './views/InsuranceView';
import { EmergencyView } from './views/EmergencyView';
import { IdentityView } from './views/IdentityView';
import { DoctorView } from './views/DoctorView';
import { HospitalView } from './views/HospitalView';
import { AccessControlView } from './views/AccessControlView';

export default function App() {
  const { user, view } = useApp();

  if (!user) {
    return <LoginScreen />;
  }

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard />;
      case 'summary':
        return <SummaryView />;
      case 'medications':
        return <MedicationsView />;
      case 'diseases':
        return <DiseasesView />;
      case 'surgeries':
        return <SurgeriesView />;
      case 'reports':
        return <ReportsView />;
      case 'documents':
        return <DocumentsView />;
      case 'insurance':
        return <InsuranceView />;
      case 'emergency':
        return <EmergencyView />;
      case 'identity':
        return <IdentityView />;
      case 'doctor_view':
        return <DoctorView />;
      case 'hospital_view':
        return <HospitalView />;
      case 'access_control':
        return <AccessControlView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex bg-gray-100 font-body min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin max-h-[calc(100vh-60px)] bg-gray-100">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
