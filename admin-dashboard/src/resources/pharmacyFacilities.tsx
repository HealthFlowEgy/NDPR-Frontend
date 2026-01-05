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

const PharmacyFacilityFilter = (props: any) => (
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

export const PharmacyFacilityList = () => (
  <List filters={<PharmacyFacilityFilter />}>
    <Datagrid>
      <TextField source="facilityName" label="Pharmacy Name" />
      <TextField source="licenseNumber" label="License Number" />
      <TextField source="pharmacyType" label="Pharmacy Type" />
      <TextField source="city" label="City" />
      <TextField source="status" label="Status" />
      <BooleanField source="is24Hours" label="24 Hours" />
      <EditButton />
      <ShowButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const PharmacyFacilityEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="facilityName" label="Pharmacy Name" />
      <TextInput source="licenseNumber" label="License Number" />
      <SelectInput
        source="pharmacyType"
        label="Pharmacy Type"
        choices={[
          { id: 'Retail Pharmacy', name: 'Retail Pharmacy' },
          { id: 'Hospital Pharmacy', name: 'Hospital Pharmacy' },
          { id: 'Clinical Pharmacy', name: 'Clinical Pharmacy' },
          { id: 'Compounding Pharmacy', name: 'Compounding Pharmacy' },
          { id: 'Online Pharmacy', name: 'Online Pharmacy' },
        ]}
      />
      <TextInput source="address" label="Address" multiline />
      <TextInput source="city" label="City" />
      <TextInput source="phone" label="Phone" />
      <TextInput source="email" label="Email" />
      <TextInput source="operatingHours" label="Operating Hours" />
      <BooleanInput source="is24Hours" label="24 Hours Service" />
      <BooleanInput source="hasDelivery" label="Delivery Service" />
      <TextInput source="pharmacistInCharge" label="Pharmacist in Charge" />
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

export const PharmacyFacilityCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="facilityName" label="Pharmacy Name" required />
      <TextInput source="licenseNumber" label="License Number" required />
      <SelectInput
        source="pharmacyType"
        label="Pharmacy Type"
        required
        choices={[
          { id: 'Retail Pharmacy', name: 'Retail Pharmacy' },
          { id: 'Hospital Pharmacy', name: 'Hospital Pharmacy' },
          { id: 'Clinical Pharmacy', name: 'Clinical Pharmacy' },
          { id: 'Compounding Pharmacy', name: 'Compounding Pharmacy' },
          { id: 'Online Pharmacy', name: 'Online Pharmacy' },
        ]}
      />
      <TextInput source="address" label="Address" multiline required />
      <TextInput source="city" label="City" required />
      <TextInput source="phone" label="Phone" required />
      <TextInput source="email" label="Email" required />
      <TextInput source="operatingHours" label="Operating Hours" />
      <BooleanInput source="is24Hours" label="24 Hours Service" defaultValue={false} />
      <BooleanInput source="hasDelivery" label="Delivery Service" defaultValue={false} />
      <TextInput source="pharmacistInCharge" label="Pharmacist in Charge" />
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

export const PharmacyFacilityShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="facilityName" label="Pharmacy Name" />
      <TextField source="licenseNumber" label="License Number" />
      <TextField source="pharmacyType" label="Pharmacy Type" />
      <TextField source="address" label="Address" />
      <TextField source="city" label="City" />
      <TextField source="phone" label="Phone" />
      <EmailField source="email" label="Email" />
      <TextField source="operatingHours" label="Operating Hours" />
      <BooleanField source="is24Hours" label="24 Hours Service" />
      <BooleanField source="hasDelivery" label="Delivery Service" />
      <TextField source="pharmacistInCharge" label="Pharmacist in Charge" />
      <TextField source="status" label="Status" />
      <DateField source="osCreatedAt" label="Created At" />
      <DateField source="osUpdatedAt" label="Updated At" />
    </SimpleShowLayout>
  </Show>
);
