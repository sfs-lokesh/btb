export interface Pitch {
  _id: string;
  title: string;
  description: string;
  presenter: string;
  imageUrl: string;
  upvotes: string[]; // Array of user IDs who upvoted
  downvotes: string[]; // Array of user IDs who downvoted
  netScore: number;
  visible: boolean;
  category: string;
}

export interface Category {
  _id: string;
  name: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Freelancer' | 'Audience';
}
