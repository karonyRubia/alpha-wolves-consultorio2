
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Patients from './components/Patients';
import MedicalRecords from './components/MedicalRecords';
import Secretary from './components/Secretary';
import MessageModal from './components/MessageModal';
import Agenda from './components/Agenda';
import Finances from './components/Finances';
import Settings from './components/Settings';
import { View, Patient, Appointment, FinancialRecord, AppSettings } from './types';
import { MOCK_PATIENTS, MOCK_APPOINTMENTS, MOCK_FINANCES } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  
  // App State with LocalStorage Persistence
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('alpha_patients');
    return saved ? JSON.parse(saved) : MOCK_PATIENTS;
  });
  
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('alpha_appointments');
    return saved ? JSON.parse(saved) : MOCK_APPOINTMENTS;
  });
  
  const [finances, setFinances] = useState<FinancialRecord[]>(() => {
    const saved = localStorage.getItem('alpha_finances');
    return saved ? JSON.parse(saved) : MOCK_FINANCES;
  });
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('alpha_settings');
    return saved ? JSON.parse(saved) : {
      clinicName: 'Alpha Wolves',
      doctorName: 'Dr',
      professionalRole: 'Administrador',
      whatsapp: '5511999999999',
      instagram: 'alphawolves',
      profileImage: 'https://picsum.photos/id/64/80/80',
      monthlyGoal: 5000
    };
  });

  const [messagingPatient, setMessagingPatient] = useState<Patient | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('alpha_patients', JSON.stringify(patients));
    localStorage.setItem('alpha_appointments', JSON.stringify(appointments));
    localStorage.setItem('alpha_finances', JSON.stringify(finances));
    localStorage.setItem('alpha_settings', JSON.stringify(settings));
  }, [patients, appointments, finances, settings]);

  // Handlers
  const addPatient = (p: Patient) => setPatients([...patients, { ...p, id: p.id || Date.now().toString(), history: p.history || [] }]);
  const deletePatient = (id: string) => setPatients(patients.filter(p => p.id !== id));
  const updatePatient = (updatedPatient: Patient) => {
    setPatients(patients.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };
  
  const addAppointment = (a: Appointment) => setAppointments([...appointments, { ...a, id: Date.now().toString() }]);
  const updateAppointment = (updated: Appointment) => {
    setAppointments(appointments.map(a => a.id === updated.id ? updated : a));
  };
  const cancelAppointment = (id: string) => setAppointments(appointments.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a));

  const addFinance = (f: FinancialRecord) => setFinances([...finances, { ...f, id: Date.now().toString() }]);
  const updateFinance = (updated: FinancialRecord) => {
    setFinances(finances.map(f => f.id === updated.id ? updated : f));
  };
  const deleteFinance = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro financeiro?')) {
      setFinances(finances.filter(f => f.id !== id));
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return (
          <Dashboard 
            patients={patients} 
            appointments={appointments} 
            finances={finances} 
            settings={settings}
            onUpdateSettings={setSettings}
            onUpdateAppointment={updateAppointment}
          />
        );
      case View.PATIENTS:
        return <Patients patients={patients} onAdd={addPatient} onDelete={deletePatient} onUpdate={updatePatient} onMessagePatient={setMessagingPatient} />;
      case View.PRONTUARIOS:
        return <MedicalRecords patients={patients} onUpdate={updatePatient} onAdd={addPatient} />;
      case View.AGENDA:
        return <Agenda appointments={appointments} patients={patients} onAdd={addAppointment} onUpdate={updateAppointment} onCancel={cancelAppointment} />;
      case View.FINANCES:
        return <Finances records={finances} onAdd={addFinance} onUpdate={updateFinance} onDelete={deleteFinance} />;
      case View.SECRETARY:
        return <Secretary patients={patients} appointments={appointments} doctorName={settings.doctorName} />;
      case View.SETTINGS:
        return <Settings settings={settings} onUpdate={setSettings} />;
      default:
        return <Dashboard patients={patients} appointments={appointments} finances={finances} settings={settings} onUpdateSettings={setSettings} onUpdateAppointment={updateAppointment} />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView} settings={settings}>
      <div className="h-full w-full max-w-7xl mx-auto">
        {renderContent()}
      </div>
      
      {messagingPatient && (
        <MessageModal 
          patient={messagingPatient} 
          onClose={() => setMessagingPatient(null)} 
          clinicName={settings.clinicName}
        />
      )}
    </Layout>
  );
};

export default App;
