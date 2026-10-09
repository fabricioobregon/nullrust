import { repoKinds } from "@/lib/repos";
import { createRepo } from "@/app/actions";
import { requireProjectOwner } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function NewRepoPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const { project } = await requireProjectOwner(projectId);

  const action = createRepo.bind(null, projectId);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 space-y-8">
      <div>
        <a href={`/projects/${projectId}`} className="text-sm text-slate-500 hover:text-slate-700">
          &larr; {project.name}
        </a>
        <h1 className="mt-1 text-2xl font-semibold">Add a repo</h1>
        <p className="mt-1 text-slate-600">
          Add each repo that makes up this project &mdash; you can add more later as the project grows.
        </p>
      </div>

      <form action={action} className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">
            Repo name
          </label>
          <input
            id="name"
            name="name"
            required
            placeholder="e.g. checkout-api"
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-slate-700">Kind</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {repoKinds.map((kind, i) => (
              <label
                key={kind.key}
                className="flex cursor-pointer items-start gap-2 rounded-md border border-slate-300 px-3 py-2 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50"
              >
                <input
                  type="radio"
                  name="kind"
                  value={kind.key}
                  defaultChecked={i === 0}
                  className="mt-1 accent-indigo-600"
                />
                <span>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                    <span>{kind.icon}</span> {kind.title}
                  </span>
                  <span className="text-xs text-slate-500">{kind.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-500"
          >
            Add repo
          </button>
        </div>
      </form>
    </div>
  );
}
