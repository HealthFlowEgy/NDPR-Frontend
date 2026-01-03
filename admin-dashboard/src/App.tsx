import React from 'react';
import { Admin, Resource, ListGuesser, EditGuesser, ShowGuesser } from 'react-admin';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import BusinessIcon from '@mui/icons-material/Business';
import sunbirdRcDataProvider from './sunbirdRcDataProvider';

function App() {
  return (
    <Admin
      dataProvider={sunbirdRcDataProvider}
      title="HealthFlow Admin Dashboard"
    >
      <Resource
        name="Doctor"
        list={ListGuesser}
        edit={EditGuesser}
        show={ShowGuesser}
        icon={LocalHospitalIcon}
        options={{ label: 'Doctors' }}
      />
      <Resource
        name="Nurse"
        list={ListGuesser}
        edit={EditGuesser}
        show={ShowGuesser}
        icon={MedicalServicesIcon}
        options={{ label: 'Nurses' }}
      />
      <Resource
        name="Pharmacist"
        list={ListGuesser}
        edit={EditGuesser}
        show={ShowGuesser}
        icon={LocalPharmacyIcon}
        options={{ label: 'Pharmacists' }}
      />
      <Resource
        name="HealthFacility"
        list={ListGuesser}
        edit={EditGuesser}
        show={ShowGuesser}
        icon={BusinessIcon}
        options={{ label: 'Health Facilities' }}
      />
    </Admin>
  );
}

export default App;
