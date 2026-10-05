// Shapes returned by https://jsonplaceholder.typicode.com.
// Only the fields this app reads are typed; extra fields in responses are ignored.

export type Post = {
  id: number;
  userId: number;
  title: string;
  body: string;
};

export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  website: string;
  company: { name: string };
};

export type AuthorsById = Record<number, User>;
