import { createFileRoute, useRouter, Link } from '@tanstack/react-router';
import { getFeatures, createFeature } from '../utils/mock-db';
import { createServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { z } from 'zod';

// UPDATED: Server Function with filtering logic
const fetchFeatures = createServerFn({ method: 'GET' })
  .inputValidator((search: string | undefined) => search) // Validate input
  .handler(async ({ data: search }) => {
    const data = await getFeatures();

    // Simulate DB filtering on the server
    if (search) {
      console.log(`Filtering by: ${search}`);
      return data.filter((f) =>
        f.title.toLowerCase().includes(search.toLowerCase()),
      );
    }

    console.log('Fetching all features');
    return data;
  });

// NEW: Server Function for mutation
const addFeatureFn = createServerFn({ method: 'POST' })
  .inputValidator((title: string) => title)
  .handler(async ({ data: title }) => {
    console.log('Creating feature:', title);
    await createFeature(title);
  });

const searchSchema = z.object({
  query: z.string().optional(),
});

// 2. Configure Route
export const Route = createFileRoute('/')({
  validateSearch: (search) => searchSchema.parse(search),
  loaderDeps: ({ search: { query } }) => ({ query }),
  loader: async ({ deps }) => await fetchFeatures({ data: deps.query }),
  component: FeatureBoard,
});

function FeatureBoard() {
  const features = Route.useLoaderData();
  const router = useRouter();

  const { query } = Route.useSearch();
  const navigate = Route.useNavigate();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Feature Board</h1>

      {/* NEW: Search Filter Input */}
      <div className="mb-6">
        <input
          value={query || ''}
          onChange={(e) => {
            // Update URL -> Triggers Loader -> Updates Data
            navigate({
              search: (prev) => ({ ...prev, query: e.target.value }),
              replace: true, // Don't stack history entries
            });
          }}
          placeholder="Filter features..."
          className="w-full border p-2 rounded bg-gray-50"
        />
      </div>

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
