import { auth } from "@clerk/nextjs/server";

export default async function ArchivePage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Archive</h1>
      <p className="text-muted-foreground">
        This is a protected route. You are signed in as user: {userId}
      </p>
    </div>
  );
}
