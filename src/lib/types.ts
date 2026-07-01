export type User = {
  id: string;
  email: string;
  password: string;
  name: string;
  kennelName?: string;
  affix?: string;
  country?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  membership: "free" | "pro" | "elite";
  role?: "user" | "admin";
  createdAt: string;
};

export type AdminLog = {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  target?: string;
  details?: string;
  timestamp: string;
};

export type Dog = {
  id: string;
  certificateId: string;
  ownerId: string;
  name: string;
  callName?: string;
  breed: string;
  variant?: string;
  gender: "male" | "female";
  color: string;
  weight?: number;
  height?: number;
  dob: string;
  microchip?: string;
  registrationDate: string;
  sireId?: string;
  damId?: string;
  sireName?: string;
  damName?: string;
  kennelName?: string;
  breederName?: string;
  notes?: string;
  photo?: string;
  status: "active" | "deceased" | "transferred";
  titles?: string[];
  location?: string;
};

export type HealthRecord = {
  id: string;
  dogId: string;
  type: "vaccination" | "checkup" | "test" | "treatment" | "weight" | "other";
  title: string;
  date: string;
  vet?: string;
  notes?: string;
  attachmentUrl?: string;
};

export type Litter = {
  id: string;
  ownerId: string;
  sireId: string;
  damId: string;
  birthDate: string;
  puppyIds: string[];
  notes?: string;
};

export type Transfer = {
  id: string;
  dogId: string;
  fromUserId: string;
  toEmail: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  completedAt?: string;
  notes?: string;
};

export type Affix = {
  id: string;
  affixId: string;
  name: string;
  ownerId: string;
  ownerName: string;
  country: string;
  createdAt: string;
  status: "active" | "pending";
  description?: string;
  specialty?: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  date: string;
  tags: string[];
  cover: string;
  readTime: number;
};

export type Event = {
  id: string;
  title: string;
  date: string;
  location: string;
  city: string;
  country: string;
  type: "show" | "meetup" | "competition" | "expo";
  description: string;
  registered?: boolean;
};

export type MarketplaceListing = {
  id: string;
  type: "puppy" | "adult" | "stud" | "equipment";
  title: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  sellerId: string;
  sellerName: string;
  image: string;
  posted: string;
  pedigreeId?: string;
};
