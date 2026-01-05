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

const RadiologyCenterFilter = (props: any) => (
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

export const RadiologyCenterList = () => (
  <List filters={<RadiologyCenterFilter />}>
    <Datagrid>
      <TextField source="facilityName" label="Facility Name" />
      <TextField source="licenseNumber" label="License Number" />
      <TextField source="centerType" label="Center Type" />
      <TextField source="city" label="City" />
      <TextField source="status" label="Status" />
      <BooleanField source="hasMRI" label="MRI" />
      <BooleanField source="hasCT" label="CT Scan" />
      <EditButton />
      <ShowButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const RadiologyCenterEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="facilityName" label="Facility Name" />
      <TextInput source="licenseNumber" label="License Number" />
      <SelectInput
        source="centerType"
        label="Center Type"
        choices={[
          { id: 'Diagnostic Imaging Center', name: 'Diagnostic Imaging Center' },
          { id: 'MRI Center', name: 'MRI Center' },
          { id: 'CT Scan Center', name: 'CT Scan Center' },
          { id: 'X-Ray Center', name: 'X-Ray Center' },
          { id: 'Ultrasound Center', name: 'Ultrasound Center' },
          { id: 'Nuclear Medicine Center', name: 'Nuclear Medicine Center' },
        ]}
      />
      <TextInput source="address" label="Address" multiline />
      <TextInput source="city" label="City" />
      <TextInput source="phone" label="Phone" />
      <TextInput source="email" label="Email" />
      <TextInput source="operatingHours" label="Operating Hours" />
      <BooleanInput source="hasMRI" label="Has MRI" />
      <BooleanInput source="hasCT" label="Has CT Scan" />
      <BooleanInput source="hasXRay" label="Has X-Ray" />
      <BooleanInput source="hasUltrasound" label="Has Ultrasound" />
      <BooleanInput source="hasMammography" label="Has Mammography" />
      <TextInput source="radiologistInCharge" label="Radiologist in Charge" />
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

export const RadiologyCenterCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="facilityName" label="Facility Name" required />
      <TextInput source="licenseNumber" label="License Number" required />
      <SelectInput
        source="centerType"
        label="Center Type"
        required
        choices={[
          { id: 'Diagnostic Imaging Center', name: 'Diagnostic Imaging Center' },
          { id: 'MRI Center', name: 'MRI Center' },
          { id: 'CT Scan Center', name: 'CT Scan Center' },
          { id: 'X-Ray Center', name: 'X-Ray Center' },
          { id: 'Ultrasound Center', name: 'Ultrasound Center' },
          { id: 'Nuclear Medicine Center', name: 'Nuclear Medicine Center' },
        ]}
      />
      <TextInput source="address" label="Address" multiline required />
      <TextInput source="city" label="City" required />
      <TextInput source="phone" label="Phone" required />
      <TextInput source="email" label="Email" required />
      <TextInput source="operatingHours" label="Operating Hours" />
      <BooleanInput source="hasMRI" label="Has MRI" defaultValue={false} />
      <BooleanInput source="hasCT" label="Has CT Scan" defaultValue={false} />
      <BooleanInput source="hasXRay" label="Has X-Ray" defaultValue={true} />
      <BooleanInput source="hasUltrasound" label="Has Ultrasound" defaultValue={false} />
      <BooleanInput source="hasMammography" label="Has Mammography" defaultValue={false} />
      <TextInput source="radiologistInCharge" label="Radiologist in Charge" />
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

export const RadiologyCenterShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="facilityName" label="Facility Name" />
      <TextField source="licenseNumber" label="License Number" />
      <TextField source="centerType" label="Center Type" />
      <TextField source="address" label="Address" />
      <TextField source="city" label="City" />
      <TextField source="phone" label="Phone" />
      <EmailField source="email" label="Email" />
      <TextField source="operatingHours" label="Operating Hours" />
      <BooleanField source="hasMRI" label="Has MRI" />
      <BooleanField source="hasCT" label="Has CT Scan" />
      <BooleanField source="hasXRay" label="Has X-Ray" />
      <BooleanField source="hasUltrasound" label="Has Ultrasound" />
      <BooleanField source="hasMammography" label="Has Mammography" />
      <TextField source="radiologistInCharge" label="Radiologist in Charge" />
      <TextField source="status" label="Status" />
      <DateField source="osCreatedAt" label="Created At" />
      <DateField source="osUpdatedAt" label="Updated At" />
    </SimpleShowLayout>
  </Show>
);
