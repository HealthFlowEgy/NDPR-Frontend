import {
  List,
  Datagrid,
  TextField,
  EmailField,
  Edit,
  SimpleForm,
  TextInput,
  Create,
  SelectInput,
  Show,
  SimpleShowLayout,
  DateField,
  EditButton,
  ShowButton,
  DeleteButton,
  Filter,
  BooleanField,
  BooleanInput,
} from 'react-admin';

const LaboratoryFilter = (props: any) => (
  <Filter {...props}>
    <TextInput label="Search" source="q" alwaysOn />
    <TextInput label="Name" source="facilityName" />
    <TextInput label="City" source="city" />
    <SelectInput
      label="Status"
      source="status"
      choices={[
        { id: 'Active', name: 'Active' },
        { id: 'Inactive', name: 'Inactive' },
        { id: 'Suspended', name: 'Suspended' },
      ]}
    />
  </Filter>
);

export const LaboratoryList = () => (
  <List filters={<LaboratoryFilter />}>
    <Datagrid>
      <TextField source="facilityName" label="Facility Name" />
      <TextField source="licenseNumber" label="License Number" />
      <TextField source="labType" label="Lab Type" />
      <TextField source="city" label="City" />
      <TextField source="status" label="Status" />
      <BooleanField source="accredited" label="Accredited" />
      <EditButton />
      <ShowButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const LaboratoryEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="facilityName" label="Facility Name" />
      <TextInput source="licenseNumber" label="License Number" />
      <SelectInput
        source="labType"
        label="Lab Type"
        choices={[
          { id: 'Clinical Laboratory', name: 'Clinical Laboratory' },
          { id: 'Pathology Lab', name: 'Pathology Lab' },
          { id: 'Diagnostic Lab', name: 'Diagnostic Lab' },
          { id: 'Research Lab', name: 'Research Lab' },
          { id: 'Blood Bank', name: 'Blood Bank' },
        ]}
      />
      <TextInput source="address" label="Address" multiline />
      <TextInput source="city" label="City" />
      <TextInput source="phone" label="Phone" />
      <TextInput source="email" label="Email" />
      <TextInput source="operatingHours" label="Operating Hours" />
      <TextInput source="servicesOffered" label="Services Offered" multiline />
      <BooleanInput source="accredited" label="Accredited" />
      <TextInput source="accreditationBody" label="Accreditation Body" />
      <SelectInput
        source="status"
        label="Status"
        choices={[
          { id: 'Active', name: 'Active' },
          { id: 'Inactive', name: 'Inactive' },
          { id: 'Suspended', name: 'Suspended' },
        ]}
      />
    </SimpleForm>
  </Edit>
);

export const LaboratoryCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="facilityName" label="Facility Name" required />
      <TextInput source="licenseNumber" label="License Number" required />
      <SelectInput
        source="labType"
        label="Lab Type"
        required
        choices={[
          { id: 'Clinical Laboratory', name: 'Clinical Laboratory' },
          { id: 'Pathology Lab', name: 'Pathology Lab' },
          { id: 'Diagnostic Lab', name: 'Diagnostic Lab' },
          { id: 'Research Lab', name: 'Research Lab' },
          { id: 'Blood Bank', name: 'Blood Bank' },
        ]}
      />
      <TextInput source="address" label="Address" multiline required />
      <TextInput source="city" label="City" required />
      <TextInput source="phone" label="Phone" required />
      <TextInput source="email" label="Email" required />
      <TextInput source="operatingHours" label="Operating Hours" />
      <TextInput source="servicesOffered" label="Services Offered" multiline />
      <BooleanInput source="accredited" label="Accredited" defaultValue={false} />
      <TextInput source="accreditationBody" label="Accreditation Body" />
      <SelectInput
        source="status"
        label="Status"
        defaultValue="Active"
        choices={[
          { id: 'Active', name: 'Active' },
          { id: 'Inactive', name: 'Inactive' },
          { id: 'Suspended', name: 'Suspended' },
        ]}
      />
    </SimpleForm>
  </Create>
);

export const LaboratoryShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="facilityName" label="Facility Name" />
      <TextField source="licenseNumber" label="License Number" />
      <TextField source="labType" label="Lab Type" />
      <TextField source="address" label="Address" />
      <TextField source="city" label="City" />
      <TextField source="phone" label="Phone" />
      <EmailField source="email" label="Email" />
      <TextField source="operatingHours" label="Operating Hours" />
      <TextField source="servicesOffered" label="Services Offered" />
      <BooleanField source="accredited" label="Accredited" />
      <TextField source="accreditationBody" label="Accreditation Body" />
      <TextField source="status" label="Status" />
      <DateField source="osCreatedAt" label="Created At" />
      <DateField source="osUpdatedAt" label="Updated At" />
    </SimpleShowLayout>
  </Show>
);
