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
} from 'react-admin';

const ClinicFilter = (props: any) => (
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

export const ClinicList = () => (
  <List filters={<ClinicFilter />}>
    <Datagrid>
      <TextField source="facilityName" label="Facility Name" />
      <TextField source="licenseNumber" label="License Number" />
      <TextField source="facilityType" label="Facility Type" />
      <TextField source="city" label="City" />
      <TextField source="status" label="Status" />
      <EmailField source="email" label="Email" />
      <EditButton />
      <ShowButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const ClinicEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="facilityName" label="Facility Name" />
      <TextInput source="licenseNumber" label="License Number" />
      <SelectInput
        source="facilityType"
        label="Facility Type"
        choices={[
          { id: 'General Clinic', name: 'General Clinic' },
          { id: 'Specialist Clinic', name: 'Specialist Clinic' },
          { id: 'Dental Clinic', name: 'Dental Clinic' },
          { id: 'Eye Clinic', name: 'Eye Clinic' },
          { id: 'Pediatric Clinic', name: 'Pediatric Clinic' },
        ]}
      />
      <TextInput source="address" label="Address" multiline />
      <TextInput source="city" label="City" />
      <TextInput source="phone" label="Phone" />
      <TextInput source="email" label="Email" />
      <TextInput source="operatingHours" label="Operating Hours" />
      <TextInput source="capacity" label="Capacity" />
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

export const ClinicCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="facilityName" label="Facility Name" required />
      <TextInput source="licenseNumber" label="License Number" required />
      <SelectInput
        source="facilityType"
        label="Facility Type"
        required
        choices={[
          { id: 'General Clinic', name: 'General Clinic' },
          { id: 'Specialist Clinic', name: 'Specialist Clinic' },
          { id: 'Dental Clinic', name: 'Dental Clinic' },
          { id: 'Eye Clinic', name: 'Eye Clinic' },
          { id: 'Pediatric Clinic', name: 'Pediatric Clinic' },
        ]}
      />
      <TextInput source="address" label="Address" multiline required />
      <TextInput source="city" label="City" required />
      <TextInput source="phone" label="Phone" required />
      <TextInput source="email" label="Email" required />
      <TextInput source="operatingHours" label="Operating Hours" />
      <TextInput source="capacity" label="Capacity" />
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

export const ClinicShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="facilityName" label="Facility Name" />
      <TextField source="licenseNumber" label="License Number" />
      <TextField source="facilityType" label="Facility Type" />
      <TextField source="address" label="Address" />
      <TextField source="city" label="City" />
      <TextField source="phone" label="Phone" />
      <EmailField source="email" label="Email" />
      <TextField source="operatingHours" label="Operating Hours" />
      <TextField source="capacity" label="Capacity" />
      <TextField source="status" label="Status" />
      <DateField source="osCreatedAt" label="Created At" />
      <DateField source="osUpdatedAt" label="Updated At" />
    </SimpleShowLayout>
  </Show>
);
