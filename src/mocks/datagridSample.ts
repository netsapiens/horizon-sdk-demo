/** Sample rows for the DatagridTemplate example on the Component Showcase. */
export interface SampleUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
}

export const DATAGRID_SAMPLE_USERS: SampleUser[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'User',
    status: 'Inactive',
  },
  {
    id: 4,
    name: 'Alice Williams',
    email: 'alice@example.com',
    role: 'Editor',
    status: 'Active',
  },
  {
    id: 5,
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    role: 'User',
    status: 'Active',
  },
  // Rows 6+ exist so the showcase pages: with only one page of rows every
  // pagination control renders disabled, which reads as "pagination is missing".
  {
    id: 6,
    name: 'Dana Scully',
    email: 'dana@example.com',
    role: 'Admin',
    status: 'Active',
  },
  {
    id: 7,
    name: 'Evan Wright',
    email: 'evan@example.com',
    role: 'User',
    status: 'Inactive',
  },
  {
    id: 8,
    name: 'Fiona Chen',
    email: 'fiona@example.com',
    role: 'Editor',
    status: 'Active',
  },
  {
    id: 9,
    name: 'Gabriel Ortiz',
    email: 'gabriel@example.com',
    role: 'User',
    status: 'Active',
  },
  {
    id: 10,
    name: 'Hannah Patel',
    email: 'hannah@example.com',
    role: 'User',
    status: 'Inactive',
  },
  {
    id: 11,
    name: 'Ibrahim Khan',
    email: 'ibrahim@example.com',
    role: 'Editor',
    status: 'Active',
  },
  {
    id: 12,
    name: 'Julia Moreau',
    email: 'julia@example.com',
    role: 'User',
    status: 'Active',
  },
];
