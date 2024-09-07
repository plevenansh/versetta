"use client"
import React, { useState, useEffect } from 'react';
import { trpc } from '@/trpc/client';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

interface CreateTeamFormProps {
  onTeamCreated: () => void;
}

const CreateTeamForm: React.FC<CreateTeamFormProps> = ({ onTeamCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentProvider, setPaymentProvider] = useState<'razorpay' | 'polar'>('razorpay');

  const router = useRouter();

  const initiateTeamCreationMutation = trpc.teams.initiateTeamCreation.useMutation();
  const completeTeamCreationMutation = trpc.teams.completeTeamCreation.useMutation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user');
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.workOsUserId) {
      alert('User not authenticated. Please log in and try again.');
      return;
    }
    try {
      const result = await initiateTeamCreationMutation.mutateAsync({
        name,
        description,
        workOsUserId: user.workOsUserId,
        paymentProvider,
      });

      if (paymentProvider === 'razorpay') {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          subscription_id: result.subscriptionId,
          name: 'Versetta',
          description: 'Prime Plan',
          handler: async function (response: any) {
            await completeTeamCreationMutation.mutateAsync({
              teamId: result.teamId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            alert('Team created and subscription activated successfully!');
            onTeamCreated();
            router.push('/dashboard');
          },
          prefill: {
            name: user.name,
            email: user.email,
          },
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();
      } else {
        // Implement Polar payment flow
        // After successful payment, call completeTeamCreationMutation
        // This is a placeholder for Polar implementation
        alert('Polar payment not implemented yet');
      }

    } catch (error) {
      console.error('Error creating team:', error);
      alert('Failed to create team. Please try again.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>No user data available</div>;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="max-w-md mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Team</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
           
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Team Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter team name"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Enter team description"
              />
            </div>

            <div>
              <label htmlFor="paymentProvider" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Provider
              </label>
              <select
                id="paymentProvider"
                value={paymentProvider}
                onChange={(e) => setPaymentProvider(e.target.value as 'razorpay' | 'polar')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="razorpay">Razorpay (India)</option>
                <option value="polar">Polar (International)</option>
              </select>
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Create Team and Subscribe
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateTeamForm;


// "use client"
// import React, { useState, useEffect } from 'react';
// import { trpc } from '@/trpc/client';

// interface CreateTeamFormProps {
//   onTeamCreated: () => void;
// }

// const CreateTeamForm: React.FC<CreateTeamFormProps> = ({ onTeamCreated }) => {
//   const [name, setName] = useState('');
//   const [description, setDescription] = useState('');
//   const [user, setUser] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const createTeamMutation = trpc.teams.createTeam.useMutation();

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const response = await fetch('/api/user');
//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
//         }
//         const userData = await response.json();
//         setUser(userData);
//       } catch (error) {
//         console.error('Error fetching user:', error);
//         setError(error instanceof Error ? error.message : 'An unknown error occurred');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUser();
//   }, []);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!user || !user.workOsUserId) {
//       alert('User not authenticated. Please log in and try again.');
//       return;
//     }
//     try {
//       await createTeamMutation.mutateAsync({
//         name,
//         description,
//         workOsUserId: user.workOsUserId,
//       });
//       setName('');
//       setDescription('');
//       alert('Team created successfully!');
//       onTeamCreated();
//     } catch (error) {
//       console.error('Error creating team:', error);
//       alert('Failed to create team. Please try again.');
//     }
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   if (!user) {
//     return <div>No user data available</div>;
//   }

//   return (
//     <div className="max-w-md mx-auto bg-white shadow-md rounded-lg overflow-hidden">
//       <div className="px-6 py-4">
//         <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Team</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
//               Team Name
//             </label>
//             <input
//               type="text"
//               id="name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter team name"
//             />
//           </div>
//           <div>
//             <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
//               Description
//             </label>
//             <textarea
//               id="description"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               rows={4}
//               placeholder="Enter team description"
//             />
//           </div>
//           <div>
//             <button
//               type="submit"
//               className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//             >
//               Create Team
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CreateTeamForm;