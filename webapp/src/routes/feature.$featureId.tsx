import { createFileRoute, notFound } from '@tanstack/react-router';
import { getFeatureById } from '@/utils/mock-db.ts';
import { createServerFn } from '@tanstack/react-start';

const getFeatureOnServer = createServerFn({ method: 'GET' })
  .inputValidator((featureId: string) => featureId)
  .handler(({ data: featureId }) => {
    return getFeatureById(featureId);
  });

export const Route = createFileRoute('/feature/$featureId')({
  // notFound funktioniert Serverseitig gerade nicht mit ssr :(
  // Dafür existieren schon ein paar Issues: https://github.com/TanStack/router/issues/5960
  ssr: false,
  loader: async ({ params }) => {
    // Der Loader wird jetzt im Browser ausgeführt und deshalb muss die Datenbankabfrage über einen Server Function Aufruf erfolgen
    const feature = await getFeatureOnServer({ data: params.featureId });
    if (!feature) {
      throw notFound();
    }
    return feature;
  },
  notFoundComponent: () => <p>Dieses Feature existiert nicht.</p>,
  component: RouteComponent,
});

function RouteComponent() {
  const feature = Route.useLoaderData();
  return <h1>Detail: {feature.title}</h1>;
}
