import { createFileRoute } from '@tanstack/react-router';
import { getFeatures } from '../utils/mock-db';
import { createServerFn } from '@tanstack/react-start';

// 1. Define Server Function
const fetchFeatures = createServerFn({ method: 'GET' }).handler(async () => {
  const data = await getFeatures();
  console.log('Fetching on server:', data.length);
  return data;
});

// 2. Configure Route
export const Route = createFileRoute('/')({
  loader: async () => await fetchFeatures(),
  component: FeatureBoard,
});

function FeatureBoard() {
  // 3. Consume Data (Type-safe!)
  const features = Route.useLoaderData();

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Feature Board</h1>

      <ul className="space-y-2">
        {features.map((feature) => (
          <li
            key={feature.id}
            className="border p-2 rounded flex justify-between"
          >
            <span>{feature.title}</span>
            <span className="font-bold">{feature.votes} votes</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
