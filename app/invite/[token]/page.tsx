import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import InviteAcceptForm from './InviteAcceptForm';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function InviteAcceptPage({ params }: PageProps) {
  const { token } = await params;

  // Find the invite
  const invite = await db.teamInvite.findUnique({
    where: { token },
    include: {
      organization: {
        select: {
          name: true,
          logo: true,
        },
      },
      invitedBy: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Check if invite exists and is valid
  if (!invite) {
    notFound();
  }

  // Check if already accepted
  if (invite.status === 'ACCEPTED') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Invite Already Used
          </h1>
          <p className="text-slate-400 mb-6">
            This invite has already been accepted. If you&apos;re the one who accepted it, please log in.
          </p>
          <a
            href="/agent/login"
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Check if expired
  if (invite.status === 'EXPIRED' || new Date() > invite.expiresAt) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Invite Expired
          </h1>
          <p className="text-slate-400 mb-6">
            This invite link has expired. Please contact {invite.invitedBy.firstName} to request a new invite.
          </p>
        </div>
      </div>
    );
  }

  // Check if cancelled
  if (invite.status === 'CANCELLED') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Invite Cancelled
          </h1>
          <p className="text-slate-400 mb-6">
            This invite has been cancelled. Please contact the person who invited you for more information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <InviteAcceptForm
      token={token}
      invite={{
        email: invite.email,
        firstName: invite.firstName,
        lastName: invite.lastName,
        organizationName: invite.organization.name,
        invitedByName: `${invite.invitedBy.firstName} ${invite.invitedBy.lastName}`,
      }}
    />
  );
}
