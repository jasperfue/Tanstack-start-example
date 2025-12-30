type Feature = {
  id: string;
  title: string;
  votes: number;
};

// Initial data
const features: Array<Feature> = [
  { id: '1', title: 'Dark Mode', votes: 5 },
  { id: '2', title: 'User Profiles', votes: 3 },
];

export async function getFeatures() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return features;
}

export async function createFeature(title: string) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const newFeature = {
    id: Math.random().toString(36).substring(7),
    title,
    votes: 0,
  };
  features.push(newFeature);
  return newFeature;
}

export async function getFeatureById(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return features.find((feature) => feature.id === id);
}
