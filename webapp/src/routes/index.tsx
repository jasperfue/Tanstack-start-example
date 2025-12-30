import { createFileRoute, useRouter, Link } from '@tanstack/react-router';
import { getFeatures, createFeature } from '../utils/mock-db';
import { createServerFn } from '@tanstack/react-start';
import { useState } from 'react';

// 1. Define Server Function
const fetchFeatures = createServerFn({ method: 'GET' }).handler(async () => {
  const data = await getFeatures();
  console.log('Fetching on server:', data.length);
  return data;
});

// NEW: Server Function for mutation
const addFeatureFn = createServerFn({ method: 'POST' })
  .inputValidator((title: string) => title)
  .handler(async ({ data: title }) => {
    console.log('Creating feature:', title);
    await createFeature(title);
  });

// 2. Configure Route
export const Route = createFileRoute('/')({
  loader: async () => await fetchFeatures(),
  component: FeatureBoard,
});

function FeatureBoard() {
  const features = Route.useLoaderData();
  const router = useRouter();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Feature Board</h1>

      <ul className="space-y-2">
        {features.map((feature) => (
          <Link
            preload="intent"
            to="/feature/$featureId"
            params={{ featureId: feature.id }}
            key={feature.id}
            className="border p-2 rounded flex justify-between"
          >
            <span>{feature.title}</span>
            <span className="font-bold">{feature.votes} votes</span>
          </Link>
        ))}
      </ul>

      {/* NEW: Simple Form */}
      <form
        className="mt-8 flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setIsLoading(true);
          if (!input) return;

          // Call Server Function directly
          await addFeatureFn({ data: input });

          // Clear input and refresh data
          setInput('');
          router.invalidate();
          setIsLoading(false);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="New feature name..."
          className="border p-2 flex-1 rounded"
        />
        <button
          type="submit"
          className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded"
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Add'}
        </button>
      </form>
    </div>
  );
}
