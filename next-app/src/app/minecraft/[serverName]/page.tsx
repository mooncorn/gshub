import ServerDashboard from './_components/server-dashboard';

export default function Page({ params }: { params: { serverName: string } }) {
  return (
    <div>
      <ServerDashboard serverName={params.serverName} />
    </div>
  );
}
