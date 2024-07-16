// 'use client';

// import { trpc } from '@/trpc/client';

// export default function Home() {
//   const users = trpc.users.getAll.useQuery();
//   const projects = trpc.projects.getAll.useQuery();

//   if (users.isLoading || projects.isLoading) return <div>Loading...</div>;
//   if (users.error || projects.error) return <div>An error occurred</div>;

//   return (






//     // <div>
//     //   <h1>Users</h1>
//     //   <ul>
//     //     {users.data?.map(user => (
//     //       <li key={user.id}>{user.name}</li>
//     //     ))}
//     //   </ul>
//     //   <h1>Projects</h1>
//     //   <ul>
//     //     {projects.data?.map(project => (
//     //       <li key={project.id}>{project.title}</li>
//     //     ))}
//     //   </ul>
//     // </div>
//   );
// }
'use client';

import Dashboard from '@/components/Dashboard';
import { trpc } from '@/trpc/client';
import '../styles/globals.css'

export default function HomePage() {
  const { data: projects, isLoading: projectsLoading } = trpc.projects.getAll.useQuery();
  //const { data: tasks, isLoading: tasksLoading } = trpc.tasks.getAll.useQuery();

  if (projectsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Dashboard projects={projects}/>
  );
}
